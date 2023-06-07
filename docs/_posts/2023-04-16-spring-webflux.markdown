---
layout: post
title:  'Spring WebFlux Visualized: Threading and EventLoops'
date:   2023-04-16 09:10:00 +0100
author: stefan
image:  'https://i.imgur.com/eODIUMc.jpg'
featured: true
tags:   [Spring, WebFlux]
tags_color: '#16afd0'
---

Reactive programming, like many other programming paradigms, is quite easy to grasp but at the same time difficult to fully understand.

Imagine going into a Café and ordering your favorite caffeinated beverage. After placing the order, you could wait around, maybe have a look at the busy street outside, until the barista finished your coffee. Or, right after ordering, you could pick up your phone, answer an email and check up on your next meeting, all the while being ready to *react* to the barista calling your name. As I said, it is easy to grasp the concept and understand, which one can be more efficient if implemented correctly, but it is not so easy to understand, how this is achieved behind the facade of a framework, such as [Spring](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html).

Now, this post will not be focused on reactive programming in general. Other sites and blogs have already done so splendidly. I will focus on how this is integrated in and hidden behind Spring and do so in a fun and easy to understand way. So yes, **there will be animations** ahead.

## 1. What it means to be Reactive

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-1-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player>

The animation visualizes fully reactive event handling. The `EventHandler` (this is not what they are called in Spring) reacts to two scenarios. The first one is the *arrival of a new request*, visualized as a `RequestEvent`. The second is the *completion of some kind of processing step*.

Both of these event types can happen at any time. If the EventHandler happens to by free, the event is picked up and handled immediately. If it is busy however, the event is queued until the handler is free again.

**One important notice however**: The EventHandler is usually the one actually processing the event. It is not just handed over somewhere else. The above animation is still true but not in the typical scenario. The two instances where it actually behaves as shown in the animation is when some blocking operation (such as IO) is performed or when the work is manually handed over to another thread by the programmer to e.g. achieve parallel compute. I chose this representation for the opening animation to show how just one EventHandler can "handle" multiple requests at the same time, if reactiveness is implemented correctly.

Even though this concept alone is the easy part, I find it helpful to have a good understanding of the basics before trying to dive deeper. And as I promised, the reactive programming paradigm does not sound all that complicated on that level. However, there is a lot of **complicated things** hidden underneath which is, in my opinion, definitely **worth understanding** if you want to start optimizing your Spring-WebFlux performance or throughput.

## 2. How Threads are used to achieve Reactiveness

[Spring supports multiple, non-blocking web servers](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-server-choice), which fall into two categories: *non-blocking servlet containers* like [Apache Tomcat](https://tomcat.apache.org/), [Eclipse Jetty](https://www.eclipse.org/jetty/) and other [Servlet 3.1+ containers](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#threading-model), and *non-servlet runtimes* such as [Netty](https://netty.io) and [JBoss Undertow](https://undertow.io/).

The Spring Framework itself [does not have support](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-server-choice) for starting a server automatically. Spring Boot on the other hand (yes, those are two different things) has a WebFlux starter which automatically starts Netty by default. The reason is that out of all the aforementioned servers, only Netty was implemented to be non-blocking from the ground up. So unless you have a good reason for choosing one of the other servers, **I would strongly recommend sticking with Netty**. Because of that, the following deep-dive will mainly focus on Netty's EventLoop implementation to explain how Spring achieves reactiveness.

#### Getting started with WebFlux and Netty

As with most things Spring Boot, configuring and starting a reactive, WebFlux based application is very simple:

```groovy
// build.gradle.kts
plugins {
  java
  id("org.springframework.boot") version "3.0.5"
  id("io.spring.dependency-management") version "1.1.0"
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyWebfluxApplication {

  public static void main(String[] args) {
    SpringApplication.run(MyWebfluxApplication.class, args);
  }

}
```

Among a lot of other "magic" things, on startup, Spring starts an embedded Netty webserver. The main difference compared to the other servers supported by Spring is that **Netty does not work on Servlets**, which dispatch incoming requests ready to be picked up by a worker thread (I have already written a detailed [post]({{ site.baseurl }}{% post_url 2023-03-19-spring-webmvc-servlet-threading %}) discussing how that works internally), but on `EventLoop`s.

#### Netty EventLoop's

EventLoop is at it's most basic just a fancy name for a **non-blocking IO thread**, based on [Java NIO](https://docs.oracle.com/en/java/javase/15/core/java-nio.html). So technically speaking, it is not all that much different from a worker thread we already know from "classic" Spring Web. The important difference becomes more obvious once we understand how EventLoops behave.

Typically, a couple of EventLoops are running at all time, managed by an `EventLoopGroup`. Each EventLoop handles a number of `SocketChannel`s, through which requests can be accepted (on the server side) or made (on the client side). Whenever a new SocketChannel is created, it is bound to one EventLoop exactly and this binding cannot be changed anymore. This is the first big difference compared to Spring Web: **Sockets are continuously bound to the same EventLoop** (and thereby thread). This means that a blocked EventLoop causes queuing of incoming requests, event if another EventLoop is free.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-2-socket-binding.js' | prepend: site.baseurl }}">
</motion-canvas-player>

The animation neatly shows how EventLoop 1 is busy for quiet some time while processing the first request. And even though two more EventLoops are mostly available, the requests incoming via SocketChannel 1 cannot be processed until the bound EventLoop is free again. In practice this is usually not a problem as long as a single client does not create too many requests via the same socket channel.

This nicely brings us along to the next unique behavior: compared to normal worker threads, **EventLoops must be kept running at all time**. As SocketChannels cannot be re-bound to another EventLoop, stopping the latter would effectively starve those SocketChannels (meaning that no further requests could be processed).

Lastly, because all EventLoops have to be kept running at all times and because there is a big resource overhead for switching contexts of running, native Java threads, it is strongly recommended to only ever have **as many EventLoops as there are available processors**. This recommendation has one caveat however, which we will discuss later when talking about [blocking operations](#4-blocking-non-reactive-operations).

#### EventLoop Resource Handling

The core of reactive programming defines, that **instead of waiting for blocking operation to finish, threads do other things in the meantime and pick up the response after the operation completed**. This implies two things. First, parts of a request can be handled by multiple threads (contrary to Spring Web, which operates under the one-thread-per-request philosophy). This alone explains why **scoped beans do not exist in Spring WebFlux**: they cannot be bound to the thread handling the request, as the thread can change. That is why WebFlux introduces the `SubscriberContext`. Second, a lightweight mechanism for saturating threads with work from different contexts is required. And with this, we are finally at the core of how reactive programming is achieved in the case of Spring WebFlux.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-3-blocking.js' | prepend: site.baseurl }}">
</motion-canvas-player>

Each incoming request is picked up by the EventLoop of the corresponding SocketChannel via the inbound `ChannelHandler`. The EventLoop then executes all compute steps defined in code (represented by the `Service` in the animation) until a blocking operation like a network call or filesystem access is reached (represented by the `Client` in the animation). The request context is now "handed over" (more on that later) and a callback function is registered. With that, the EventLoop is free again, ready to handle other requests or tasks. The animation demonstrates this when EventLoop 1 hands the first request over to the Client and is then free to process another request.

Once the blocking operation has finished, the callback function is executed. This results in a new `Task` which is being added to the `ScheduledTaskQueue`. The next free EventLoop picks up this task and performs further computation steps. In the animation we can see that even though the request in question was originally handled by EventLoop 1, the remaining work is being handled by EventLoop 3. This process is repeated until the request is fully handled and a response can be sent.

## 3. Blocking Operations

Let's summarize what we have learned so far:
- In Spring WebFlux, requests are handled by EventLoops. **EventLoops are basically just threads** with the addition that they have to run at all times and they typically only handle chunks of a request (and thereby switch contexts often) which requires a lightweight mechanism for saturating the EventLoops with work.
- Until blocking operations are introduced, **Spring WebFlux's EventLoops behave very similar to Spring Web's Worker Threads**.
- Once a blocking operation is reached, **EventLoops do not wait around** for the operation to be finished but hand over the execution context and are then free to process other request chunks (called Tasks by WebFlux).

As described in the introduction, the main paradigm behind reactive programming is to *react to work needing execution*. Now the obvious question is: **How does Spring WebFlux accomplish that EventLoops do not wait around for blocking stuff**?

The genius yet underwhelming answer is that it "just works" when the library performing the blocking operation is implemented reactively, which on the other hand means, that it simply does not work in case it is not written reactively; at least not without manual effort on your end. So lets discuss the easy, "it just works" part first by looking at WebFlux's WebClient implementation as a guiding example (and yes, I stole Apple's infamous quote here on purpose).

#### WebFlux WebClient

Let's take a look at the following minimal GitHub client implementation in Spring WebFlux:

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
We have a very simple `Controller` class handling one endpoint which lists all Github repositories for a specified organization. It does so by calling a custom `GitHubAccess` service.

```java
package com.devblog.springtest.github;

import com.devblog.springtest.github.model.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import java.util.Comparator;

@Service
public class GitHubAccess {

  private final WebClient webClient;

  public GitHubAccess() {
    this.webClient = WebClient.builder().baseUrl("https://api.github.com").build();
  }

  public Mono<List<Repository>> getReposFor(String organization) {
    return webClient.get()
        .uri("/orgs/{organization}/repos", organization)
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<List<Repository>>() {})
        doOnNext(list -> list.sort(Comparator.comparing(Repository::getName)));
  }

}
```
This service uses a basic `WebClient` to retrieve the `Repository`s and then sorts them by name. The reason I chose `Mono<List>` instead of `Flux` as return type is twofold. First, we do not really need a Flux here as GitHub does not stream the individual repositories one after another (they are all returned as a single JSON array) and we also do not really do anything with the repositories (the `sort` is a List operation). Second, having just one Mono simplifies the following a lot ;)

##### WebClient - Basic Implementation

You might have seen that the controller has a `.log()` method at the end of it's method chain. This activates reactor logs which very easily show you which part of the reactive operation is done on which EventLoop or Thread. Lets take a look at the logs after calling `http://localhost:8080/github/orga/spring-projects/repos`:

```
[           main] c.d.s.SpringtestApplication     : Starting SpringtestApplication using Java 17.0.6 with PID 3110 (…)
[           main] c.d.s.SpringtestApplication     : No active profile set, falling back to 1 default profile: "default"
[           main] o.s.b.w.e.netty.NettyWebServer  : Netty started on port 8080
[           main] c.d.s.SpringtestApplication     : Started SpringtestApplication in 0.723 seconds (process running for 0.866)
[ctor-http-nio-2] reactor.Mono.PeekFuseable.1     : onSubscribe([Fuseable] FluxPeekFuseable.PeekFuseableSubscriber)
[ctor-http-nio-2] reactor.Mono.PeekFuseable.1     : request(unbounded)
[ctor-http-nio-4] reactor.Mono.PeekFuseable.1     : onNext([…])
[ctor-http-nio-4] reactor.Mono.PeekFuseable.1     : onComplete()
```

The very first thing in each log entry is the name of the thread executing the log (and thereby logic). We can see two typ of threads. `main` is just Spring's main thread used for bootstrapping the application and initiating "the rest". Then we see two different instances of `reactor-http-nio` threads. These are the aforementioned EventLoops.

So why are two active for handling just one request? The answer to that already explains how WebClient is implemented, how it executes pre- and post-blocking-request logic and how it "waits" for the blocking part to complete.

WebClient also uses Spring's EventLoops to execute logic and is by default configured to [share EventLoop resources with the server part](https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html#webflux-client-builder-reactor-resources). So incoming and outgoing requests are handled by the same EventLoopGroup. The first two log entries are executed on EventLoop 2 before the blocking HTTP operation occurs. Then, once the HTTP operation completes, the callback function is executed, a new Task is created and EventLoop 4 takes over. It first executes the `onNext` which sorts our repositories by name before completing the reactive stream with `onComplete`.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-4-webclient.js' | prepend: site.baseurl }}">
</motion-canvas-player>
<br/>
Now one problem might become obvious: using a very limited number of EventLoops to handle many requests only works and scales efficiently, if all blocking operations are implemented reactively. Because if they are not, some EventLoops will get stuck waiting eventually which in a best case scenario introduces an upper limit the the requests our application can handle (with a lot of under-utilization) or in the worst case escalates quickly as more EventLoops are stuck waiting, more incoming requests are stuck before they are handled until all task queues are full and requests start being dropped. So this obviously sounds bad! How do we fix it? 


## 4. Blocking, non-reactive Operations

Blocking, non-reactive operations are such, which require the calling thread to wait until the operation completes.

Take for example the following controller:

```java
package com.devblog.springtest.controller;

import com.devblog.springtest.filesystem.FileSystemAccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FileAccessController {

  private final FileSystemAccess fileSystemAccess;

  public FileAccessController(@Autowired FileSystemAccess fileSystemAccess) {
    this.fileSystemAccess = fileSystemAccess;
  }

  @GetMapping("/file")
  public Mono<String> readFile() {
    return fileSystemAccess.readFromFile().log();
  }

}
```

which calls the following `FileSystemAccess` service:

```java
package com.devblog.springtest.filesystem;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

@Service
public class FileSystemAccess {

  private final Logger log = LoggerFactory.getLogger(FileSystemAccess.class);

  public Mono<String> readFromFile() {
    return Mono.fromCallable(() -> readFrom("test.txt"));
  }

  private String readFrom(String fileName) throws IOException {
    // located in src/main/resources
    InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName);
    StringBuilder stringBuilder = new StringBuilder();

    log.info("read from file");
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
      String line;
      while ((line = reader.readLine()) != null) {
        stringBuilder.append(line).append("\n");
      }
    }

    return stringBuilder.toString();
  }

}
```

The service uses `java.io` explicitly instead of the newer, non-blocking `java.nio`. Obviously, you should never do that in a non-blocking environment (or ever for that matter, NIO is just better) but this is the easiest way to force a traditional, blocking operation into Spring WebFlux.

Now our Mono publisher created in the `readFromFile()` method is executed on one of the EventLoops. This is easily verifiable by reading the logs:
```
[ctor-http-nio-2] reactor.Mono.Callable.1   : | onSubscribe([Fuseable] MonoCallable.MonoCallableSubscription)
[ctor-http-nio-2] reactor.Mono.Callable.1   : | request(unbounded)
[ctor-http-nio-2] c.d.s.f.FileSystemAccess  : read from file
[ctor-http-nio-2] reactor.Mono.Callable.1   : | onNext(Hello, I am a test file!)
[ctor-http-nio-2] reactor.Mono.Callable.1   : | onComplete()
```
This EventLoop will be blocked during the entire filesystem access, even though it is just waiting for the operating system to return a response. This is not good for all the reasons mentioned before. But how could we improve that?

The first thing that might come to mind is simply increasing the number of EventLoops, similar to how we increase the number of worker threads in Spring Web. To do so, we just need to provide the following [Netty environment variable](https://github.com/reactor/reactor-netty/blob/203c67979fb534d86ca0b7aa20d7f03c95d63854/reactor-netty-core/src/main/java/reactor/netty/ReactorNetty.java#L86-L90): `reactor.netty.ioWorkerCount=20` to increase the EventLoop count to 20.<br/>
**Attention:** This is not a Spring property so it cannot be set in the `application.yaml` or `application.properties` file, it needs to be an environment variable (`-Dreactor.netty.ioWorkerCount=20`).

**But you should not do that!**<br/>
EventLoop threads are very expensive and the underlying Java threads have a very high cost for context switching. The better approach is to create a dedicated `Scheduler` for blocking operations, backed by lightweight threads intended to be used for waiting.<br/>
This means that you should always stick to the default number of EventLoops which is [equal to the number of processors available but at least 4](https://github.com/reactor/reactor-netty/blob/683a4c4bc290124ce0ddf31dde5c796f31138b71/reactor-netty-core/src/main/java/reactor/netty/ReactorNetty.java#L86-L90).

To do so, adjust the `readFromFile` method in the `FileSystemAccess` service as follows:

```java
public Mono<String> readFromFile() {
  return Mono
      .fromCallable(() -> readFrom("test.txt"))
      .publishOn(Schedulers.boundedElastic());
}
```

In the logs, we can now observe that the context is switched by publishing our Mono on a bounded elastic scheduler (which in turn unblocks the EventLoop):

```
[ctor-http-nio-2] reactor.Mono.SubscribeOnCallable.1  : | onSubscribe([Fuseable] FluxSubscribeOnCallable.CallableSubscribeOnSubscription)
[ctor-http-nio-2] reactor.Mono.SubscribeOnCallable.1  : | request(unbounded)
[  myIOThreads-1] c.d.s.filesystem.FileSystemAccess   : read from file
[  myIOThreads-1] reactor.Mono.SubscribeOnCallable.1  : | onNext(Hello, I am a test file!)
[  myIOThreads-1] reactor.Mono.SubscribeOnCallable.1  : | onComplete()
```

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-5-bounded-elastic.js' | prepend: site.baseurl }}">
</motion-canvas-player>
<br/>
The reason this is more efficient than using more EventLoops for blocking operations is that the bounded-elastic threads are more lightweight and intended to be used for blocking operations. The animation nicely visualizes how the context is switched before the `BufferedReader` is executed and how the EventLoop is free again immediately.

The only thing you have to be careful about is that the subsequent processing is also executed on the bounded-elastic thread. This can be seen in the animation and the logs alike.<br/>
This is not ideal for heavy compute steps as the bounded-elastic threads are intended for that. In case more complex compute steps are executed on the result of the blocking operation, it can make sense to switch context yet again with `.publishOn(Schedulers.parallel())` to use WebFlux's default threads intended for compute (note, these are also not the EventLoops).


## 5. Non-Blocking vs. Asynchronous Compute

Speaking of `Schedulers.parallel()`, so far we have only touched on one main aspect of Spring WebFlux: non-blocking, reactive programming. WebFlux does however also provide easy yet powerful mechanisms for implementing *parallel, asynchronous compute*.

"*What's the big deal*" you might ask. "*Isn't non-blocking already providing parallelism?*"

If you are interested, the follow me along to my [next post]({{ site.baseurl }}{% post_url 2023-06-07-spring-webflux-async-compute %}), where I explain how this can be achieved and why you ultimately shouldn't try that in most cases.

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
