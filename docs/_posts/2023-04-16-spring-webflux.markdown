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
    src="{{ '/js/animation/spring-webflux/spring-webflux-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player>

The animation visualizes fully reactive event handling. The `EventHandler` (this is not what they are called in Spring) reacts to two scenarios. The first one is the *arrival of a new request*, visualized as a `RequestEvent`. The second is the *completion of some kind of processing step*.

Both of these event types can happen at any time. If the EventHandler happens to by free, the event is picked up and handled immediately. If it is busy however, the event is queued until the handler is free again.

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

Among a lot of other "magic" things, on startup, Spring starts an embedded Netty webserver. The main difference compared to the other servers supported by Spring is that **Netty does not work on Servlets**, which dispatch incoming requests ready to be picked up by a worker thread (I have already written a detailed [post]({{ site.baseurl }}{% post_url 2023-03-19-spring-webmvc-servlet-threading %}) discussing how that works internally), but on **EventLoop**s.

#### Netty EventLoop's

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
