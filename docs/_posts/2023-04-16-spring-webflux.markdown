---
layout: post
title:  'Spring Webflux Visualized: Threading and EventLoops'
date:   2023-04-16 09:10:00 +0100
author: stefan
image:  'https://i.imgur.com/eODIUMc.jpg'
featured: true
tags:   [Spring, Webflux]
tags_color: '#16afd0'
---

Reactive programming, like many other programming paradigms, is quite easy to grasp but at the same time difficult to fully understand.

Imagine going into a Café and ordering your favorite caffeinated beverage. After placing the order, you could wait around, maybe have a look at the busy street outside, until the barista finished your coffee. Or, right after ordering, you could pick up your phone, answer an email and check up on your next meeting, all the while being ready to *react* to the barista calling your name. As I said, it is easy to grasp the concept and understand, which one can be more efficient if implemented correctly, but it is not so easy to understand, how this is achieved behind the facade of a framework, such as [Spring](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html).

Now, this post will not be focused on reactive programming in general. Other sites and blogs have already done so splendidly. I will focus on how this is integrated in and hidden behind Spring and do so in a fun and easy to understand way. So yes, **there will be animations** ahead.

## 1. What it means to be Reactive

<motion-canvas-player 
    src="{{ '/js/animation/spring-webflux/spring-webflux-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player>

The animation visualizes fully reactive event handling. The `EventHandler` (this is not what they are called in Spring) reacts to two scenarios. The first one is the *arrival of a new request*, visualized as a `RequestEvent`. The second is the *completion of some kind of processing step*.

Both of these event types can happen at any time. If the EventHandler happens to by free, the event is picked up and handled immediately. If it is busy however, the event is queued until the handler is free again.

Even though this concept alone is the easy part, I find it helpful to have a good understanding of the basics before trying to dive deeper. And as I promised, the reactive programming paradigm does not sound all that complicated on that level. However, there is a lot of **complicated things** hidden underneath which is, in my opinion, definitely **worth understanding** if you want to start optimizing your Spring-Webflux performance or throughput.

## EventLoop as core

quick disclosure before we begin: only applies to webflux on netty

- how they work
  - heavy weight, have to run continuously
  - more event-loops does not help --> if blocking

#### netty

#### non blocking servlet container

quick explanation but deserves its own post

## what on blocking operations

- reactive library (like webclient) with resource sharing if possible
- if non exist: delegate to dedicated resources (but that does not scale well; still better than blocking event loop) (compare to undertow)

## non-blocking vs parallel compute

- can be done (flux run on different schedular)
- io schedular vs parallel schedular





## Info

- netty event loops: 
  - cannot be set via spring properties (it is a netty env variable)
  - default = max(#cores, 4)
  - reactor.netty.ioWorkerCount
  - https://github.com/reactor/reactor-netty/blob/203c67979fb534d86ca0b7aa20d7f03c95d63854/reactor-netty-core/src/main/java/reactor/netty/ReactorNetty.java#L86-L90

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
