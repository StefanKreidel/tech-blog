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

## default integration of servers in spring web-mvc

<motion-canvas-player 
    src="{{ '/js/animation/spring-servlet-container.js' | prepend: site.baseurl }}">
</motion-canvas-player >

- small explanation on how everything is working together
- web is blocking -> tomcat and jetty work on blocking servlets

### what is blocking (and vs non blocking)

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
