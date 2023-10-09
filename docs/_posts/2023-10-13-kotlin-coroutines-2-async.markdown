---
layout: post
title: "Using Kotlin Coroutines for Parallel Compute in multi-threaded Systems"
description: "Besides implementing non-blocking applications, Kotlin Coroutines can also easily be used for asynchronous, parallel compute of code. This post not only explains how it can be done, but also how it is implemented on JVM level."
date: 2023-10-02 14:30:00 +0100
author: stefan
image: 'https://i.imgur.com/tTknCXP.jpg'
featured: true
tags: [Kotlin, Coroutines]
tags_color: '#f07010'
---

**Kotlin Coroutines** are known as a *thread-like* mechanism with none of the overheads native JVM threads bring with them. In the [previous post]({{ site.baseurl }}{% post_url 2023-10-06-kotlin-coroutines-1 %}), we explored how coroutines are actually something completely different but still behave like threads.

But if they behave like threads, they should also provide the same features, namely:
- **Offloading blocking operations** (e.g. access to filesystem, database, external API) from the main thread to prevent freezing the application.
- **Executing code in parallel** to increase performance on multi-threaded CPUs.

This post will only explore the latter, by explaining how code can be *dispatched* to multiple thread pools and which features there are in addition to plain, old JVM threads. We will also discuss how all of this is achieved on the JVM by taking a closer look at the Kotlin compiler.


## 1. Parallelism vs. Non-Blocking

Before diving in, let me quickly explain why parallelism and non-blocking are not the same. When we speak about *non-blocking* behavior we refer to the opposite of blocking behavior (duh, I know). A system is blocked, if it is forced to wait for some kind of event, like the arrival of a HTTP response or a file being found on the filesystem. Without treating these situations in a special way, the application would be frozen, unable to react to any kind of user input.

Treating this situation as to not freeze the application is what is referred to as non-blocking. This means that it has nothing to do with speeding up the underlying process but rather preventing the application from needlessly waiting. Instead, it should be busy reacting to additional user input and only pick up that HTTP response or found file once it is returned. If non-blocking is implemented in a way that the code never waits but only reacts to completion events, the code is additionally *reactive*. One of the most common frameworks which enable this is [Spring WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html), which I have already written a [detailed post]({{ site.baseurl }}{% post_url 2023-04-16-spring-webflux %}) about.

*TODO*: animation on non-blocking

*Parallelism* on the other hand refers to doing multiple things at once. This would of course also be the case if on piece of code is waiting, while another is executed in parallel. But if non-blocking is a thing, you can imagine that parallel-waiting is not optimal solution. And in fact, it has a big overhead because we would still be blocking an expensive, native JMV thread. It just would not also freeze the application at the same time.

So if this situation should be implemented with non-blocking mechanisms, then parallelism should of course be used to execute multiple pieces of code at the same time. Examples would be to process multiple user requests at the same time or to split the complex mutation of a long collection into multiple smaller chunks and processing them in parallel.

*TODO*: animation on parallelism

As the two mechanisms differ rather drastically, they are also implemented in a different way by Kotlin Coroutines. We will now explore, how parallelism is achieved.


## 2. To by `async()`

Okay, this bog post about coroutines has had suspiciously little code until now, so let us change that:

```java
fun fibonacci(iterations: Int): Long {
  var f1 = 0L
  var f2 = 1L

  log.info("Calculating $iterations fibonacci iterations")

  repeat(iterations) {
    val sum = f1 + f2
    f1 = f2
    f2 = sum
  }

  return f2
}
```

Take this function which calculates the n'th Fibonacci number. If this function has to be executed multiple times, we can easily compute in parallel:

```java
// sequential
measureTimeMillis {
  fibonacci(1_000_000_000)
  fibonacci(1_000_000_001)
}.apply {
  log.info("Sync took $this ms")
}

// parallel
measureTimeMillis {
  val first = async(Dispatchers.Default) { fibonacci(1_000_000_000) }
  val second = async(Dispatchers.Default) { fibonacci(1_000_000_001) }

  awaitAll(first, second)
}.apply {
  log.info("Async took $this ms")
}
```

The response times reflect that perfectly:

```
// sequential
21:01:16.954 [main] -- Calculating 1000000000 fibonacci iterations
21:01:17.274 [main] -- Calculating 1000000001 fibonacci iterations
21:01:17.594 [main] -- Sync took 641 ms

// parallel
21:01:17.599 [DefaultDispatcher-worker-1 @coroutine#2] -- Calculating 1000000000 fibonacci iterations
21:01:17.600 [DefaultDispatcher-worker-2 @coroutine#3] -- Calculating 1000000001 fibonacci iterations
21:01:17.921 [main @coroutine#1] -- Async took 324 ms
```

This code is simplified here, you can find the full example on [GitHub] TODO.

Code that should be executed asynchronously can easily be offloaded to another thread-pool by using the `async()` function. But was this post not about coroutines? Why are we now talking about thread pools again?


## 3. JMV Theads are still relevant




<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
