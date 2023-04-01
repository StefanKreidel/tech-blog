---
layout: post
title:  'Spring Web MVC Visualized: Threading and Servelts'
date:   2023-03-19 13:30:35 +0100
author: stefan
image:  'https://i.imgur.com/etilIS6.jpg'
featured: true
tags:   [spring, webmvc]
tags_color: '#5caa22'
---

SpringBoot can be a very tricky thing to understand and use properly. At first glance, it may seem straight forward which has definitely helped SpringBoot gain widespread adoption. However, as you dive deeper into the internal architecture you will start to realize that it becomes quite complex and the corresponding documentation becomes rather long.

Spring Web MVC is definitely a prime example on how nitty and gritty the details can get. And while the classic MVC stack already seems kind of dated with all the hype reactive frameworks currently receive, it is still used widely.

But how does Spring MVC actually handle threading? Where do servlet containers come into play? And how can you start optimizing when you reached the resource limit of an auto-configured application.

## A common understanding of Requests and Processing

<motion-canvas-player 
    src="{{ '/js/animation/spring-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player >

The above animation does two things really well: it introduces the terms `requests` and `processing` while completely ignoring how Spring actually works internally. This simplification is technically not wrong. Spring MVC does accept incoming requests, keeps them in a queue ready to be processed and upon completion answers the request by sending some kind of response the the client. But you already knew that. You are here because you want to understand how all of this is actually done and hidden by Spring.

In the case of SpringBoot, it's lifecycle builds on a set of "magical" conventions which automatically configures, instantiates and manages all the beans and executors necessary for your application to run.

Take for example the following minimal setup:

```gradle
// build.gradle.kts
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
}
```

```java
// Application.java
@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
```

Running this application does a lot fo things upon startup (e.g. the aforementioned bean management). It does however also start an embedded web server.

Notice that for this post we chose spring-boot-starter-**web**. This means that we are running on a blocking stack and the embedded server is actually a servlet container. With SpringBoot we have the choice between multiple containers like [Apache Tomcat](https://tomcat.apache.org/) (the default), [JBoss Undertow](https://undertow.io/) or [Eclipse Jetty](https://www.eclipse.org/jetty/).

This tells us that managing incoming connections and requests is not done by Spring itself but rather by the servlet container.

## Embedded Servlet Container

<motion-canvas-player
    src="{{ '/js/animation/spring-servlet-container.js' | prepend: site.baseurl }}">
</motion-canvas-player >

Upon startup, SpringBoot (amongst other things) starts the embedded servlet container. By default this will be Tomcat but it can easily be replaced by configuring the dependencies accordingly:

```gradle
// build.gradle.kts
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web") {
    exclude(module="spring-boot-starter-tomcat")
  }
  implementation("org.springframework.boot:spring-boot-starter-undertow")
}
```

As mentioned, the servlet container is used to handle incoming requests. It accepts new HTTP connections and subsequent requests. New requests will be added to a queue ready to be processed. A central servlet, the _dispatcher servlet_, handle scheduling of request processing and "hands requests over". The HTTP connection is kept open until the requests has been processed or a specified timeout has been reached.

Each servlet container has [different properties and defaults](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#appendix.application-properties.server) for connection and request queues.

| Servlet Container | Connection Limits | Request Queue |
| :---------------: | ----------------- | ------------- |
| Tomcat | can be set via `server.tomcat.max-connections`;<br />the default is 8192 | can be set via `server.tomcat.accept-count`;<br />the default is 100 |
| Jetty | has no limit;<br />new connections are only allowed until request queue is full | can be set via `server.jetty.threads.max-queue-capacity`;<br />the default is computed based on number of processing threads |
| Undertow | has no limit;<br />new connections are only allowed until I/O threads are saturated | Undertow does not work on a request queue but on I/O threads. A new request can only be processed if at least one I/O thread is free.<br /><br />can be set via `server.undertow.threads.io`;<br />default is equal to the number of available processors |

## Spring Web MVC: Model, View and Controller

Now that we have an understanding of how incoming requests are handled and processed by Spring in tandem with a servlet container, it is time to shed some light on the acronym MVC, which of course stands for _Model-View-Controller_.

<motion-canvas-player 
    src="{{ '/js/animation/spring-mvc.js' | prepend: site.baseurl }}">
</motion-canvas-player >

Now this might not look familiar if you have only ever implemented REST APIs. Spring Web MVC implements three integral parts:
- The _**C**ontroller_ which executes our business logic and returns the response in form of a _**M**odel_. The latter is different form nowadays somewhat classical JSON payloads.
- The view resolver determines the correct _**V**iew_ to render for each request.
- The view renderer then renders the view with input provided by the _**M**odel_.

In this scenario we return a fully server-side rendered HTML document. The aforementioned view renderer is not a standard Spring component but Spring provides good integrations for some common rendering frameworks such as [Thymeleaf](https://www.thymeleaf.org), [FreeMarker](https://freemarker.apache.org) or [JSP](https://www.oracle.com/java/technologies/jspt.html).

Moving on, we will not focus on the Model and View parts of MVC any longer and will instead dive deeper into how Spring supports parallel execution of multiple requests (the parts previously summarized as _Controller_ and _business logic_).

## Spring Web: The Blocking Stack

Spring Web is implemented around a blocking philosophy. This means that a single thread will process one specific request. Each compute step is executed on that thread and for each blocking I/O request (e.g. database call), the thread will idle and wait for the blocking operation to finish.

This is high-level explanation and will be explained in more detail in an upcoming post. For now, the important part is that regardless of the servlet container, we only have a finite pool of threads. As long as some a free, we can process new requests. As soon as all threads are busy, we introduce back-pressure. In the case of Tomcat or Jetty, we start filling the request queue. In the case of Undertow, we start denying new requests.

<motion-canvas-player 
    src="{{ '/js/animation/spring-servlet-container.js' | prepend: site.baseurl }}">
</motion-canvas-player >

just a general overview (another post)

### what are servlets, servlet-api and servlet containers

just a very short overview (another post)

## tomcat

## jetty

## undertow

- threads and blocking https://undertow.io/undertow-docs/undertow-docs-2.1.0/index.html#xnio-workers

## call 3rd party

- rest template (old way) https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate
- on pooling https://9to5answer.com/springs-resttemplate-default-connection-pool
- and https://medium.com/@yannic.luyckx/resttemplate-and-connection-pool-617ebd924f68

- webclient on servlet stack
  - https://stackoverflow.com/questions/65597396/correct-dependencies-to-use-when-using-webclient-with-spring-mvc
  - and https://www.baeldung.com/spring-5-webclient
  - not perfect as some servlet context and mdc stuff can be lost as the use different threads: http://ttddyy.github.io/mdc-with-webclient-in-webmvc/




## what about netty

reference to other [post]({{ site.baseurl }}{% post_url 2023-03-18-my-first-blog-post %})

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
