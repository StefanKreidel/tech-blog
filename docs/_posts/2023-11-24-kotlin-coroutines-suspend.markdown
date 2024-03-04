---
layout: post
title: "Suspending Code Execution with Kotlin Coroutines"
description: "Using JVM threads efficiently can be difficult, especially if your application has blocking / waiting operations. This post explains how Kotlin Coroutines can be used to free a thread of a blocking task instead of waiting and how this can even lead to parallel code execution."
date: 2024-03-04 10:00:00 +0100
author: stefan
image: 'https://i.imgur.com/s2BiOCg.jpg'
featured: true
tags: [Kotlin, Coroutines]
tags_color: '#f07010'
---

**Kotlin Coroutines** are known as a *thread-like* mechanism with none of the overheads native JVM threads bring with them. In the [previous post]({{ site.baseurl }}{% post_url 2023-10-13-kotlin-coroutines-async %}), we discussed how that behavior can be utilized for concurrent, async code execution.

However, concurrent code execution is just a side effect of the inherent nature of coroutines, namely the possibility to **suspend the execution of a function** and thereby freeing the executor thread to work on something else.

In this post, we will mainly answer three questions:
1. How can the suspension of code increase resource utilization and thereby performance / throughout?
2. Which trick does Kotlin use to achieve this with just one function modifier?
3. How can that translate to concurrent code execution?

We already touched some of the mechanisms in the aforementioned, previous post. In this post, we will explore the details and discuss some very important concepts you need to understand to use coroutines efficiently.


## 1. Reactive Programming rethought

The amazing people over at [Baeldung](https://www.baeldung.com/cs/reactive-programming) explain **reactive programming** to be
> a declarative programming paradigm that is based on the idea of asynchronous event processing and data streams.

While this is true and probably the most high-level definition possible, it does not really explain the *reactive* part. Therefore, if I had to explain reactive programming in one sentence, I would say that it is **a programming paradigm where a thread does not actively wait for asynchronous events (such as the completion of a blocking operation) but rather reacts to the arrival of said events.**

Think of going to your favorite café (I will judge you if it is Starbucks) and ordering that beverage you cannot start the morning without. You place your order and now it takes some time for your drink to be ready. The way most code was written before reactive programming was for you to periodically ask the barista if your order was already finished. The longer you wait in between asking, the longer the delay between your drink being finished and you realizing that. The more often you ask, the more distracted you are from checking your emails in the meantime.

Now this is obviously not how cafés work, least of all Starbucks. They will inform you when your drink is ready. You only have to listen passively and then react. All the while, you can read your emails undisturbed and therefore be more productive. And with that, you already understand the basic principles behind reactive programming. **Instead of actively waiting for an event, you are just passively ready but can fully focus on something else in the meantime.**

<motion-canvas-player 
    src="{{ '/js/animation/coroutines/coroutines-4-reactive-events.js' | prepend: site.baseurl }}" >
</motion-canvas-player>

The animation visualizes how when ever a task is blocking, the thread is not waiting around but rather returns to its' thread pool, ready to pick up other tasks. Eventually the blocked task is ready to be resumed and we **react** to that **event** by picking it up as soon as an available thread is free. That way, we achieve a level of parallelism without multiple threads.

## 2. A long Way to come

Because the idea sounds so obvious, it is not at all new. [Java NIO](https://docs.oracle.com/en/java/javase/15/core/java-nio.html) brings **N**on-blocking **I/O** to the JVM by processing an OS input stream in a reactive way. [Netty's Event Loops](https://netty.io/wiki/user-guide-for-4.x.html) utilize Java NIO for reactive communication via web sockets (like HTTP over TCP). Once reactive events reach the outer borders of your JVM based application, reactive libraries such as [ReactiveX](https://reactivex.io), [RxJava](https://github.com/ReactiveX/RxJava) or [Spring's Webflux](https://docs.spring.io/spring-framework/reference/web/webflux.html) based on [project reactor](https://projectreactor.io) take over to minimize the amount of resources (mainly threads) required, to handle such reactive events.

All of these reactive libraries have one thing in common: they work on *publisher / observer* patterns or *reactive streams*. Pseudo-code for that could look as follows:

```java
val result = httpPublisher
  .subscribeOn(Worker.DEFAULT)
  .onNext { item -> /* something useful */}
  .zipWith(databasePublisher) { first, second -> /* combine two reactive results */ }
  .onError { throwable -> /* errors anywhere in the chain will be caught here */ }
  .onComplete { /* maybe finish a transaction */ }
  .await()
```

Of course this is subjective but who actually thinks this is easier to understand or even read than plain old, imperative syntax like:

```java
val webResponse = httpClient.get(/*..*/).doUsefulStuff()
val dbResponse = runCatching { repo.get(/*..*/) }.getOrNull()

val result = merge(webResponse, dbResponse)
```

Kotlin Coroutines does two things very differently compared to reactive libraries. First, it works differently under the hood. Second, it achieves all this while **keeping the imperative syntax**, which is so easy to read.

## 3. `suspend`ing some Work

While the second example above is easier to read, it has one major disadvantage. `httpClient.get()` loads a web resource which is asynchronous by nature, meaning we do not know how long it will take until the response (or error or timeout) arrives. Therefore, the main thread executing our code can do nothing but wait. If only we could tell the thread to do something else in the meantime.

The ugly syntax (sorry) of our pseudo-reactive code achieves just that. All we have written are callback-style functions which react to the result being passed through the reactive function-chain. This means that the thread will only resume work on our code once the **item** in `.onNext { item -> ...}` is actually available (in the happy flow) or when the **throwable** in `.onError { throwable -> ...}` is caught.

Enter Kotlin Coroutines, which achieve the same result as our pseudo-reactive stream with none of the syntax boiler code (at least from a consumer point of view). All we have to do is to make the `.get()` functions for the HTTP and database connections **suspendable**.

```java
// inside the HttpClient class
suspend fun get(/*..*/): Response?
```

This really is 95% of what most engineers have to do to get the best of both worlds. But every *"Kotlin Coroutines getting started"* tutorial teaches you this in the first minute. And if Google's search engine is to be trusted, that is not what you are here for.

You want to know what the other 5% are. Maybe you have heard about coroutine `context` and `scope` or you found a library which does not have it's own coroutine extension and you want to know how to **manually suspend a coroutine**. And maybe you even want to understand **how this actually works on the JVM**. Then you have come to the right place. We will cover it bit by bit.

## 4. What do Worker Threads do while Code is suspended?

Well, in the most basic terms, threads can do "whatever" in the meantime. In more technical terms, the thread is no longer bound to any code and is therefore either disposed by the JVM or returns to its' thread-pool, ready to execute other pieces of code.

Let's take a look at the following piece of code:
```java
// Yes, the function names are meant to be funny.
// I hope I never see such names in your code!
suspend fun somethingCool(): SecretClass {
  val stuff = executeCoolStuff()         // 1
  val transformed = letsTransform(stuff) // 2

  return transformed.mapToResult()       // 3
}
```

We made the function suspendable with the `suspend` modifier. The function furthermore executes three other functions. If any of these functions (let's say `// 2`) triggers a suspension, our function and its' entire call stack are suspended and unbound from the executing thread. As soon the piece of code that triggerd the suspension is ready to continue execution, a thread will pick up the work and resume execution exactly where it was left off (`// 3` in our example).

This implies two things. First, the thread that was unbound can do other useful stuff instead of waiting for `// 2` to receive its' blocking result. Second, some clever piece of code has to execute the suspend and resume triggers, because **code never works magically**.

### How to Suspend a Couroutine

Let's consider the following completable future which blocks execution until the result is available:

```java
val future = CompletableFuture.supplyAsync {
  Thread.sleep(1000)
  return@supplyAsync "blocking result"
}
```

If you execute this with `future.get()`, the thread is blocked while waiting for exactly one second. This is of course not ideal. But how do we tell the JVM that the thread does not have to wait around? How can we wrap this in a coroutine which suspends execution while waiting and thereby frees up the thread?

```java
@OptIn(ExperimentalCoroutinesApi::class)
suspend fun <T> CompletionStage<T>.awaitSuspending(): T {
  val future = this.toCompletableFuture()

  return suspendCancellableCoroutine { continuation -> // 1
    continuation.resume(future.get()) { throwable ->   // 2
      log.error("future could not be executed because `${throwable.message}`")
    }
  }
}
```

This extension function does exactly that. In `// 1` it actively tells the JVM to suspend execution. In `// 2` we register a continuation callback which tells the JVM that the suspended function is ready to be picked up again. By supplying `future.get()`, we provide what blocking operation that will trigger the callback upon completion.

### How to bring this into your Framework

With that knowledge you can already wrap **any** blocking operation into a suspendable one. However, in most scenarios this is not necessary at all. Most if not all frameworks and libraries which handle blocking execution already either have a coroutine compatible implementation or at least extension libraries which wrap the blocking execution into a coroutine, similarly to our code above.

Always use those standard implementations if possible. If none do exist, you can now write your own. But be careful: **most async or blocking operations require handling of a multitude of exceptions or edge cases**. The code example above does e.g. not check if suspension is even necessary (the future could already have completed at that point) and does not handle cancellation events. Take this as a starting point only!

# 5. What is Next?

So far we only scratched the surface on how to execute code asynchronously or even concurrently on the [last post]({{ site.baseurl }}{% post_url 2023-10-13-kotlin-coroutines-async %}) and how to suspend a blocking operation manually in this post. What is still missing is:

- *Coroutine Scope* to handle inheritance aka one coroutine calling the next
- *Coroutine Context* to provide execution context and configuration
- *Coroutine Dispatchers* to offload execution to different thread (pools)

Look out for these subsequent posts in the upcoming weeks.

#### Wait, I want the Source Code!

As always, it is available on [GitHub](https://github.com/StefanKreidel/blog-example-projects/tree/main/kotlin-coroutines/src/main/kotlin/suspend).


<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
