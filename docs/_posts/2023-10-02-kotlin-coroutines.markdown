---
layout: post
title: "Kotlin Coroutines are not Threads. So why do they behave as such?"
description: "Some descriptions"
date: 2023-10-02 14:30:00 +0100
author: stefan
image: 'https://i.imgur.com/tTknCXP.jpg'
featured: true
tags: [Kotlin, Coroutines]
tags_color: '#f07010'
---

**Kotlin Coroutines** are often described to be like **lightweight threads** with all of their benefits (parallel compute, non blocking behavior) while having non of their downsides (initialization time, CPU and memory utilization). This explanation is very much correct except for the fact, that they are not *like* threads. They just behave as such but are actually something completely different.

This is the first post in a series, which will eventually cover Coroutines in all of their nitty, gritty details. If you are genrally interested or are currently facing a problem which you just cannot understand, you came to the right place! So let us take a closer look by, of course, first covering the basics.


## 1. What is wrong with Threads?

Standard threads in Java are so called **native threads**. These threads are backed by actual operating system threads. This means that each individual thread is very efficient, as it is very *close* to the actual threading happening on CPU level. But it also means that they are very expensive to create, as not only *virtual* things have to happen on the JVM but the OS has to create a native thread.

*TODO*: animation

For that reason, many frameworks do not create threads on the fly when they are needed but instead create a reusable thread pool upon startup. This slows startup time down but also keeps the threads handy and avoids hick-ups whenever some work is dispatched to a thread.

### Handing Work over to Threads

Threads are used for two things:
- To execute code in **parallel**. This only makes sense in multi threaded systems. On single threaded systems, both would be executed in parallel but exactly half as fast.
- To **unblock** another thread. The most common use-case is when an application's main lifecycle or UI should not be blocked (become unresponsive) while executing other code or waiting around for blocking operations (e.g. loading a file from storage). This also makes sense on single threaded systems as the work each thread executes is cut into small chunks by the OS and executed bit by bit with a scheduling strategy like round robin.

In both cases, threads work well until a certain limit. In a massively parallel system with hundreds of executions and blocking operations happening in parallel, just **increasing the number of threads will introduce more and more overhead**. This in turn **limits you in how you can write code**. You have to be careful with the amount of parallel work you introduce. At a certain point it could make more sense to **enqueue work** (this will become important later, so remember it), instead of starting more threads.

But what if there was a world in which you would not have to worry about such things? What if you could just start something like a thread whenever a piece of code is asynchronous by nature or needs to be blocked until the file system, external service, database, ... responds?

## 2. Coroutines to the Rescue

Kotlin's [Coroutines](https://kotlinlang.org/docs/coroutines-guide.html) promise to be just that. They **provide all the benefits** of parallelizing or offloading blocking work from the main thread but **without any of the same downsides**. You can easily start 100,000 coroutines without the JVM thinking about it twice.

```java
log.info("Heating up...")

runBlocking {
  repeat(100_000) {
    launch {
      delay(1000)
    }
  }
  log.info("Created 100,000 coroutines!")
}

log.info("Completed.")
```

```
19:02:49.421 [main] INFO Efficiency -- Heating up...
19:02:49.552 [main @coroutine#1] INFO Efficiency -- Created 100,000 coroutines!
19:02:50.759 [main] INFO Efficiency -- Completed.
```

It took just over 100 milliseconds to create all 100,000 coroutines. Then they all waited around for a second (very fancy way of simulating blocking operations, I know) before being automatically disposed.

### The Power of clever Code

In the most basic terms, **coroutines have nothing to do with threads**. They are no alternative to threads nor a different implementation (on JVM level). They are just a **different way of working with threads**.

The same native threads are used for coroutines with all of the aforementioned downsides. But only a very small number is used. By default, coroutines create as many worker threads as there are logical processors (but at least two) and 64 IO threads (for blocking operations).

The work each coroutine has to execute is then cut into small pieces. These cuts are made at places where the code is **suspendable**, meaning there is a break in execution. Whenever work is suspended, the coroutine is offloaded from its thread, freeing the thread up for other work. When execution can resume, it is assigned to one of the available threads.

*TODO*: animation

This of course implies two things:
- Coroutines are not magic! 100,000 execution tasks cannot be performed any faster than without coroutines. That is still limited by the computation power of your CPU.
- 100,000 parallel, mainly blocking operations can easily be handled by coroutines without taking any care of how threading and scheduling is handled.

### Where does this leave us?

And with that we are already at the conclusion for this post. Coroutines are first and foremost a **clever trick of the Kotlin compiler**. It cuts suspendable code into small chunks and takes care of handing those chucks over to available threads and offloading them when possible. And of course they also provide a very clean and easy syntax at the same time.

In the upcoming posts, we will cover how parallel compute and suspendable, blocking operations are handled by Kotlin, how you can leverage that in your own project and explain some of the more complicated situations and syntax oddities.

The very **next post** will be about using coroutines for parallel compute. It should be published within a week.


## structure

- What coroutines are, how they work
- parallel compute
- suspending blocking operations
- suspend vs scope vs context
- when to use which dispatcher -> how to create more threads
- channels
- suspend your own code
- integrate into you own future implementation

## Knowledge

- coroutines can be launched from within a coroutine scope
- outer most scope is either global scope, runBlocking or something provided by framework (android, spring, micronaut)
- pass scope to other function -> 
  - `fun name() = coroutineScope { ... }`
  - `launch(coroutineScope) { ... }`
- suspend functions can be suspended
  - not every scoped function needs to be suspendable
- launch {} and async {} always use default dispatcher (defined by framework)
- only switch if necessary
  - main for UI stuff
  - IO for blocking stuff
- blocking function needs to be suspendable
- rule of thumb
  - suspendable chain for code that has blocking operations or async compute
    -> wrap on outer scope
  - non-suspendable for everything else


- IO dispatcher: only if the code is not already non blocking
  -> main -> io -> netty event loop makes no sense
  -> main -> io -> direkt, blocking file access makes sense
