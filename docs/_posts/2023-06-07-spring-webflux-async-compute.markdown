---
layout: post
title:  'Spring WebFlux: Executing Code in Parallel'
date:   2023-06-07 20:10:00 +0100
author: stefan
image:  'https://i.imgur.com/RaDaUGL.jpg'
featured: true
tags:   [Spring, WebFlux]
tags_color: '#16afd0'
---

Reactive programming is first and foremost centered around non-blocking code which, instead of waiting for blocking operations to finish, reacts to such an operation to finish while executing other logic in the meantime. In other words, our threads are always kept busy doing actual work instead of waiting.

This allows for a very high throughput of parallel requests in a framework such as Spring WebFlux with only very few worker threads, the so called EventLoops. I have explained and visualized that in detail in my prior [Spring WebFlux post]({{ site.baseurl }}{% post_url 2023-04-16-spring-webflux %}).

However, I see one question arise quite often: can WebFlux also be used to achieve **parallel compute** and not just **parallel wait** efficiently?<br/>
The answer is: **Yes, it can be used**. But not necessarily very efficient, at least not from a code style point of view. Still interested? Then let's dig in.


## 1. Blocking, Sequential Compute

There are two aspects when it comes to parallelism in Spring WebFlux. One is **handling multiple requests in parallel** and that is what non-blocking, reactive programming definitely supports. An EventLoop which is not blocked by IO can process another request (or at least a chunk) while waiting for the prior request's blocking operation to finish. But what about **executing multiple compute steps of the same request in parallel**?

Typically, Spring Web has relied on Java's `CompletableFuture`s for asynchronous compute. But with Spring WebFlux, we can utilize the power of functional programming if we want to (yes, this is subjective but if you are already writing reactive WebFlux publisher-subscriber-zip-map-consumer code, we can easily utilize it to achieve parallelism as well). However, WebFlux or the underlying project-reactor were never intended to replace Java's mechanisms for parallelization, hence it only provides benefits in certain situations (will be discussed at the very end).

Let's go back to our initial WebClient example from [the aforementioned WebFlux post]({{ site.baseurl }}{% post_url 2023-04-16-spring-webflux %}#3-blocking-operations) and adjust it slightly.

We had the following controller:

```java
package com.devblog.springtest.controller;

import com.devblog.springtest.github.GitHubAccess;
import com.devblog.springtest.github.model.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

@RestController
public class GitHubController {

  private final GitHubAccess gitHubAccess;

  public GitHubController(@Autowired GitHubAccess gitHubAccess) {
    this.gitHubAccess = gitHubAccess;
  }

  @GetMapping("github/orga/{organization}/repos")
  public Mono<List<Repository>> repositories(@PathVariable("organization") String organization) {
    return gitHubAccess.getReposFor(organization).log();
  }

}
```

This controller utilized the following service:

```java
package com.devblog.springtest.github;

import com.devblog.springtest.github.model.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

@Service
public class GitHubAccess {

  private final WebClient webClient;

  public GitHubAccess() {
    this.webClient = WebClient.builder().baseUrl("https://api.github.com").build();
  }

  // now a Flux instead of Mono<List>
  public Flux<Repository> getReposFor(String organization) {
    return webClient.get()
        .uri("/orgs/{organization}/repos", organization)
        .retrieve()
        .bodyToFlux(Repository.class);
  }

}
```

Let's say we want to execute some complex, long running stuff on each `Repository`. For the purpose of demonstration, let me introduce some waiting time.

```java
public Flux<Repository> getReposFor(String organization) {
  return webClient.get()
      .uri("/orgs/{organization}/repos", organization)
      .retrieve()
      .bodyToFlux(Repository.class)
      .doOnNext(this::complexTask);
}

private void complexTask(Repository repo) {
  repo.setName(repo.getName().toUpperCase(Locale.ROOT));
  try {
    Thread.sleep(100);
  } catch (InterruptedException e) {
    throw new RuntimeException(e);
  }
}
```

Now let's take a look at the logs:

```
T16:44:41.040+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onSubscribe(FluxPeek.PeekSubscriber)
T16:44:41.041+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : request(1)
T16:44:41.954+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@c71fdda)
T16:44:41.962+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : request(127)
T16:44:42.064+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@48c306dd)
T16:44:42.167+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@1828f276)
T16:44:42.291+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@7dfb3f93)
// ... 24 additional repositories
T16:44:44.962+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@1de026a8)
T16:44:45.069+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onNext(com.devblog.springtest.github.model.Repository@2e6cfd)
T16:44:45.075+02:00  [ctor-http-nio-2] reactor.Flux.Peek.1  : onComplete()
```

As you can see, each `onNext()` operation takes roughly 100ms and they are all executed sequentially.

## 2. Blocking, Parallel Compute

Now let's introduce parallelism by only changing the `getReposFor` method:

```java
  public Flux<Repository> getReposFor(String organization) {
    return webClient.get()
        .uri("/orgs/{organization}/repos", organization)
        .retrieve()
        .bodyToFlux(Repository.class)
        .parallel()
        .runOn(Schedulers.parallel())
        .doOnNext(this::complexTask)
        .sequential(); // keep in original order; has to be last to allow for parallelism
  }
```

And let's take a look at the logs again:

```
T16:55:23.641+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onSubscribe(ParallelMergeSequential.MergeSequentialMain)
T16:55:23.642+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : request(1)
T16:55:24.281+02:00  [     parallel-1] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@5a84ba3)
T16:55:24.282+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : request(127)
T16:55:24.282+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@5ca4acba)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@3f35216f)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@1d69e02d)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@42c7126a)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@3b7fa7f4)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@2d57c7ad)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@7f6d22a2)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@5433b67)
T16:55:24.283+02:00  [ctor-http-nio-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@43c57c3c)
T16:55:24.381+02:00  [     parallel-2] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@64731117)
T16:55:24.383+02:00  [     parallel-3] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@6afe9631)
T16:55:24.384+02:00  [     parallel-1] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@5a909a02)
T16:55:24.387+02:00  [     parallel-1] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@34e78949)
// ... a couple missing repositories
T16:55:24.499+02:00  [     parallel-6] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@3644c839)
T16:55:24.499+02:00  [     parallel-6] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@53ad5ce6)
T16:55:24.499+02:00  [     parallel-6] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@4e8616d3)
T16:55:24.499+02:00  [     parallel-6] reactor.Flux.ParallelMergeSequential.3  : onNext(com.devblog.springtest.github.model.Repository@2aa23fd)
T16:55:24.499+02:00  [     parallel-6] reactor.Flux.ParallelMergeSequential.3  : onComplete()
```

Now we can see a couple of things:
- Almost all tasks are executed in parallel.
- WebFlux first uses the EventLoops (reactor-http-nio) threads.
- Afterwards, additional parallel-threads are used.
- There is a 110ms gap in between the logs before the comment and after because all available threads were busy executing our simulated task so a couple of repositories were queued and processed once threads were free again.

#### Monos and Parallelism

So far we have only parallelized a Flux. While helpful, most of you will also work with Monos, so how can we get parallelism into those?

```java
public Mono<Object> parallelMonos() {
  Mono<Object> mono1 = getMono(1);
  Mono<Object> mono2 = getMono(2);

  return Flux
      .concat(mono1, mono1)
      .parallel()
      .runOn(Schedulers.parallel())
      .reduce((a, b) -> Stream.of(a, b).collect(Collectors.toList()));
}
```

The trick is to convert your Monos into a Flux and then introduce parallelism just like before. The big downside however is that you loose type safety in case the Monos are of a different type.<br/>
And that is also the limitation mentioned at the beginning of this post. WebFlux **can** be used to implement asynchronous, parallel compute but unless you have a Flux of a well defined type, you should think twice if this will help you and is still easy to understand later on.
