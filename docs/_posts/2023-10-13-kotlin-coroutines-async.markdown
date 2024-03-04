---
layout: post
title: "Using Kotlin Coroutines for Parallel and Concurrent Compute"
description: "Besides implementing non-blocking applications, Kotlin Coroutines can also easily be used for parallel or concurrent compute of code. This post not only explains how it can be done, but also how it is implemented on JVM level."
date: 2023-10-02 14:30:00 +0100
author: stefan
image: 'https://i.imgur.com/wSP5nzb.png'
featured: true
tags: [Kotlin, Coroutines]
tags_color: '#f07010'
---

**Kotlin Coroutines** are known as a *thread-like* mechanism with none of the overheads native JVM threads bring with them. In the [previous post]({{ site.baseurl }}{% post_url 2023-10-06-kotlin-coroutines %}), we explored how coroutines are actually something completely different but still behave like threads.

But if they behave like threads, they should also provide the same features, namely:
- **Offloading blocking operations** (e.g. access to filesystem, database, external API) from the main thread to prevent freezing the application.
- **Executing code concurrently** to increase performance on multi-threaded CPUs.

This post will only explore the latter, by explaining how code can be *dispatched* to multiple thread pools and which features there are in addition to plain, old JVM threads. We will also discuss how all of this is achieved on the JVM by taking a closer look at the Kotlin compiler.


## 1. Concurrency vs. Parallelism vs. Non-Blocking

Before diving in, let me quickly explain why concurrency, parallelism and non-blocking are not the same. When we speak about **non-blocking** behavior we refer to the opposite of blocking behavior (duh, I know). A system is blocked, if it is forced to wait for some kind of event, like the arrival of a HTTP response or a file being found on the filesystem. Without treating these situations in a special way, the application would be frozen, unable to react to any kind of user input.

Treating this situation as to not freeze the application is what is referred to as non-blocking. This means that it has nothing to do with speeding up the underlying process but rather preventing the application from needlessly waiting. Instead, it should be busy working on additional user input and only pick up that HTTP response or found file once it is returned. If non-blocking is implemented in a way that the code never waits but only reacts to completion events, the code is additionally *reactive*. The most common Kotlin way to achieve this is with *suspend* functions. We will cover that in the next post. In Java, one of the best known frameworks is [Project Reactor](https://projectreactor.io/docs) and its best known implementation, [Spring WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html). I have already written a [detailed post]({{ site.baseurl }}{% post_url 2023-04-16-spring-webflux %}) about the latter.

<motion-canvas-player 
    src="{{ '/js/animation/coroutines/coroutines-3-async-reactive.js' | prepend: site.baseurl }}" >
</motion-canvas-player>

Even though there are no performance improvements as compared to a blocking implementation, the important difference is that the thread is not blocked while waiting. In a multi-user workload, other requests could be processed by the same thread in parallel, thus increasing throughput and scaling potential.

**Parallelism** on the other hand refers to doing multiple things at once. This would of course also be the case if on piece of code is waiting, while another is executed in parallel. But if non-blocking is a thing, you can imagine that parallel-waiting is not an optimal solution. And in fact, it has a big overhead because we would still be blocking an expensive, native JMV thread. It just would not also freeze the application at the same time.

So if this situation should be implemented with non-blocking mechanisms, executing multiple pieces of code at the same time finally explains what **concurrency** is. Examples would be to process multiple user requests at the same time or to split the complex mutation of a long collection into multiple smaller chunks and processing them in parallel.

<motion-canvas-player 
    src="{{ '/js/animation/coroutines/coroutines-3-async-concurrent.js' | prepend: site.baseurl }}" >
</motion-canvas-player>

The difference now is that both functions are defined to be executed concurrently. As soon as the main thread reaches the point where the two functions are called, the execution is dispatched to worker threads. This speeds up execution in multi-threaded systems.

As these mechanisms differ rather drastically, they are also implemented in a different way by Kotlin Coroutines. We will now explore, how parallelism is achieved.


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

Take this function which calculates the n'th Fibonacci number. If this function has to be executed multiple times, we can easily compute that concurrently:

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


## 3. JMV Threads are still Relevant

As mentioned in the previous post, coroutines are for the most part just a clever trick of the Kotlin Compiler. It can split up work into multiple smaller chunks and hand them over to a thread for actual computation. This means that JVM threads are still the only "bridge" between code and its execution on a CPU.

For concurrent compute, that "trick" is not so clever. It only works if you tell the compiler to do so. This is done with the `async()` or `launch()` functions. The former is preferred if you are interested in the code-block's response whereas the latter is preferable if you are only interested in the completion event.

```java
// with async()
val result: Deferred<String> = async {
  delay(100)
  "Completed async()"
}

val asyncJob: Job = result.job
log.info("Cancelled async(): ${asyncJob.isCancelled}")
log.info(result.await())

// with launch()
val job: Job = launch {
  delay(100)
  log.info("Completed launch()")
}

log.info("Cancelled launch(): ${job.isCancelled}")
job.join()
```

`async()` returns a `Deferred` object which will eventually provide you with the result. `launch()` on the other hand returns a coroutine `Job` which can either be cancelled or waited for. If you take a closer look, `Deferred` also holds an instance of the coroutines job, so do not use `launch()` just because you need to cancel a coroutine.<br/>
The output for both is the same. The difference is that with `launch()` you have access to the coroutines result (if there is any).

```
19:24:18.382 [main @coroutine#1] -- Cancelled async(): false
19:24:18.488 [main @coroutine#1] -- Completed async()
19:24:18.489 [main @coroutine#1] -- Cancelled launch(): false
19:24:18.590 [main @coroutine#3] -- Completed launch()
```

## 4. Dispatching to different Threads

In the example above, everything was still executed on the *main* thread. For the `launch()` case you can see that the complete-message was logged from within the async coroutine which is why the log context is *@coroutine#3* whereas everything else had a context of *@coroutine#1*. Coroutine #2 is "invisible" in that example. It was used for computing the code of the `async()` coroutine but had no log output of its own.

If we want to execute code in parallel, this does not really help us. One thread (*main* in this case) cannot do two things at once. The default behavior of coroutines is to actively **tell the compiler whenever we need a piece of code to be executed on a separate thread**:

```java
async(Dispatchers.Default) { fibonacci(1_000_000_000) }
```

The `Default` dispatcher is intended for async computation. This dispatcher is backed by a pool of worker threads. By [default](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/src/scheduling/Dispatcher.kt), coroutines create as many [worker threads](https://github.com/Kotlin/kotlinx.coroutines/blob/2a580dfda516dff197c400669cceebc78bfb647a/kotlinx-coroutines-core/jvm/src/scheduling/Tasks.kt#L33-L37) as there are logical processors (but at least two). If needed, you can override this with the `kotlinx.coroutines.scheduler.core.pool.size` system property. This is however not recommended. It will not speed up your work anymore, because an n-core CPU can already be saturated with n threads.

If your threads are however waiting, then use the `IO` dispatcher instead:

```java
async(Dispatchers.IO) { delay(1000) }
```

This dispatcher is by default backed by a pool of 64 [IO threads](https://github.com/Kotlin/kotlinx.coroutines/blob/2a580dfda516dff197c400669cceebc78bfb647a/kotlinx-coroutines-core/jvm/src/scheduling/Dispatcher.kt#L62-L65). This can also be overridden with a system property, called `kotlinx.coroutines.io.parallelism`. Contrary to worker threads, this can actually make sense in some cases.

IO threads are specifically intended to be blocked and to wait around. They should be used whenever a underlying blocking operation cannot be implemented in a non-blocking way. If you have many, parallel blocking tasks, consider increasing the number if IO threads.

But if we turn this reasoning around, this also means that **we do not need to use the IO dispatcher, if an external call is already non-blocking**. Examples might by Netty's WebClient or WebFlux's Mono/Flux, which both use non-blocking event-loops. Kotlin coroutines provide mapper functions which automatically suspend the calling coroutine when such a function is called. This means that worker threads do not have to wait for completion and can do other things in the meantime, which in turn means that IO threads are not needed (but also do not hurt).

## 5. Limiting Parallelism

Consider the following example:

```java
getKeys()
  .map { key ->
    async(Dispatchers.Default) { hashKey(key) }
  }
  .awaitAll()

private fun getKeys(): List<String> {
  return (1..100).map {
    Random(it).toString()
  }
}

private suspend fun hashKey(key: String): String {
  delay(100)
  return key.hashCode().toString()
}
```

First, `getKeys()` is called and returns 100 random numbers. Then, for each of those numbers, an asynchronous coroutine is launched to compute the number's hash code. The computation is simulated to take some time by using the `delay()` function.

In this example, all 100 hash codes are computed at the same time. Sometimes this might not be the desired solution. You may want parallelism to increase performance but you do not want to saturate the system's capability to 100%. In coroutines, we have two way to limit parallelism, each specially designed for it's use-case.

### Limited Concurrency

First, let's remember how concurrency differs from parallelism. The former refers to computing code at the same time and only works on multi threaded systems. The latter refers to "something happening in parallel". This usually means waiting for blocking operations.

Now, limiting concurrency can easily be done by limiting the amount of threads the system can use to compute concurrent tasks.

```java
getKeys()
  .map { key ->
    // limit concurrent computation
    async(Dispatchers.Default.limitedParallelism(2)) { hashKey(key) }
  }
  .awaitAll()
```

The `limitedParallelism()` provides a view on the underlying thread pool, virtually limiting it to the provided number. But this only works for actual **concurrent tasks**, which need a thread for the entirety of their computation. This in turn means that it **does not work for suspending coroutines**.

### Limited Parallelism

In our example, we simulate a long running task by `delay`'ing the response. This suspends the function and resumes after the provided time in milliseconds. This however means that just a single thread could easily handle 100,000 of those calls. This is usually the case for HTTP requests with non-blocking libraries like Netty's WebClient.

If we want to limit those, we need to limit the amount of parallel coroutines instead of the number of threads backing them. This can be done with [Coroutine Semaphors](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-semaphore/).

```java
val coroutineLimiter = Semaphore(10)

getKeys()
  .map { key ->
    async(Dispatchers.Default) {
      // limit the number of concurrent coroutines
      coroutineLimiter.withPermit { hashKey(key) }
    }
  }
  .awaitAll()
```

The `Semaphor#withPermit()` function only allows a maximum number of coroutines to be started. If the limit is reached, all subsequent coroutines are paused (suspended) before execution. As soon as one of the executing coroutines completes, another paused one can start. Notice the word **complete**. If a executing coroutine suspends, it still blocks the semaphore, guaranteeing that no additional coroutines are started.


## 6. Can `flow()` be used for Concurrent Compute?

The short answer is **NO**!

The long answer would involve an explanation on what flows are actually intended for. This will be the topic of another post, but the short gist it:<br/>
Flows are intended to process multiple, subsequent coroutines in a stream-like manner. You might have even stumbled upon `channelFlow`. But that is intended as buffer between multiple (yet still subsequent) coroutine producers and consumers.

An example would be to read from an input stream and store each event in a database. The input stream defines its own speed and the database has a limit on how fast it can store new values. ChannelFlow allows to buffer events between producer and consumer to better handle quick peaks in throughput.


## 7. Summary

In this post we have discussed how Kotlin Coroutines can easily be used for parallel and concurrent execution. We also discoverd what the difference between those are and how to limit parallelism as well as concurrency. We finally briefly touched flows and explained, why they are not intended for any kind of parallelism.

The **next post** will be on suspending coroutines. It has already been [released]({{ site.baseurl }}{% post_url 2023-11-24-kotlin-coroutines-suspend %}).


#### Wait, I want the Source Code!

Feel free to check it out on [GitHub](https://github.com/StefanKreidel/blog-example-projects/tree/main/kotlin-coroutines/src/main/kotlin/parallel).



<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
