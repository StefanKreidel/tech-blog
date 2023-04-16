---
layout: post
title:  'Spring Web MVC Visualized: Threading and Servelts'
date:   2023-03-19 13:30:35 +0100
author: stefan
image:  'https://i.imgur.com/N1XPmMN.jpg'
featured: true
tags:   [Spring, WebMVC]
tags_color: '#5caa22'
---

SpringBoot can be a very tricky thing to understand and use properly. At first glance, it may seem straight forward which has definitely helped SpringBoot gain widespread adoption. However, as you dive deeper into the internal architecture you will start to realize that it becomes quite complex and the corresponding documentation becomes rather long.

Spring Web MVC is definitely a prime example on how nitty and gritty the details can get. And while the classic MVC stack already seems kind of dated with all the hype reactive frameworks currently receive, it is still used widely.

But how does Spring MVC actually work on the inside? How does it handle threading? Where do servlet containers come into play? And how can you start optimizing when you reach the resource limit of an auto-configured application.

## 1. A common understanding of Requests and Processing

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player>

The above animation does two things really well: it introduces the terms `requests` and `processing` while completely ignoring how Spring actually works internally. **This simplification is technically not wrong**. Spring MVC does accept incoming requests, keeps them in a queue ready to be processed and upon completion answers the request by sending some kind of response the the client. But you already knew that. You are here because you want to understand how all of this is actually done and hidden by Spring.

In the case of SpringBoot, it's lifecycle builds on a set of "magical" conventions which automatically configure, instantiate and manage all the beans and executors necessary for your application to run.

Take for example the following minimal setup:

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
  implementation("org.springframework.boot:spring-boot-starter-web")
}
```

```java
// Application.java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
```

Running this application does a lot of things upon startup (e.g. the aforementioned bean management). It does however also start an embedded web server.

Notice that for this post we chose spring-boot-starter-**web**. This means that we are running on a blocking stack and the embedded server is actually a servlet container. With SpringBoot we have the choice between multiple containers like [Apache Tomcat](https://tomcat.apache.org/) (the default), [JBoss Undertow](https://undertow.io/) or [Eclipse Jetty](https://www.eclipse.org/jetty/).

This tells us that managing incoming connections and requests is not done by Spring itself but rather by the servlet container.

## 2. Embedded Servlet Container

<motion-canvas-player
    src="{{ '/js/animation/spring-webmvc/spring-servlet-container.js' | prepend: site.baseurl }}">
</motion-canvas-player>

Upon startup, SpringBoot (amongst other things) starts the embedded servlet container. By default this will be Tomcat but it can easily be replaced with e.g. Jetty by configuring the dependencies accordingly:

```groovy
// build.gradle.kts
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web") {
    exclude(module="spring-boot-starter-tomcat")
  }
  implementation("org.springframework.boot:spring-boot-starter-jetty")
}
```

As mentioned, the servlet container is used to handle incoming requests. It accepts new HTTP connections and subsequent requests. New requests will be added to a queue ready to be processed. A central servlet, the _dispatcher servlet_, handle scheduling of request processing and "hands requests over". The HTTP connection is kept open until the requests has been processed or a specified timeout has been reached.

Each servlet container has [different properties and defaults](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#appendix.application-properties.server) for connection and request queues.

| Servlet Container | Connection Limit | Request Queue |
| :---------------: | ----------------- | ------------- |
| Tomcat | can be set via `server.tomcat.max-connections`;<br />the default is 8192 | can be set via `server.tomcat.accept-count`;<br />the default is 100 |
| Jetty | has no limit;<br />new connections are only allowed until request queue is full | can be set via `server.jetty.threads.max-queue-capacity`;<br />the default is computed based on number of processing threads |
| Undertow | has no limit;<br />new connections are only allowed until I/O threads are saturated | Undertow does not work on a request queue but on I/O threads. A new request can only be processed if at least one I/O thread is free. More on that in the [Undertow section](#undertow-is-a-little-different)<br /><br />can be set via `server.undertow.threads.io`;<br />default is equal to the number of available processors |

## 3. Spring Web MVC: Model, View and Controller

Now that we have an understanding of how incoming requests are handled and processed by Spring in tandem with a servlet container, it is time to shed some light on the acronym MVC, which of course stands for _Model-View-Controller_.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-mvc.js' | prepend: site.baseurl }}">
</motion-canvas-player>

This might not look familiar if you have only ever implemented REST APIs. Spring Web MVC implements three integral parts:
- The _**C**ontroller_ which executes our business logic and returns the response in form of a _**M**odel_. The latter is different form nowadays somewhat classical JSON payloads.
- The view resolver determines the correct _**V**iew_ to render for each request.
- The view renderer then renders the view with input provided by the _**M**odel_.

In this scenario we return a fully server-side rendered HTML document. The aforementioned view renderer is not a standard Spring component but Spring provides good integrations for some common rendering frameworks such as [Thymeleaf](https://www.thymeleaf.org), [FreeMarker](https://freemarker.apache.org) or [JSP](https://www.oracle.com/java/technologies/jspt.html).

Moving on, we will not focus on the Model and View parts of MVC any longer and will instead dive deeper into how Spring supports parallel execution of multiple requests (the parts previously summarized as _controller_ and _business logic_).

## 4. Spring Web: The Blocking Stack

**Spring Web is implemented around a blocking philosophy**. This means that a single thread will process one specific request. Each compute step is executed on that thread and for each blocking I/O request (e.g. database call), the thread will idle and wait for the blocking operation to finish.

This is high-level explanation and will be explained in more detail later. For now, the important part is that regardless of the servlet container, **we only have a finite pool of threads**. As long as some are free, we can process new requests. As soon as all threads are busy, we introduce back-pressure. In the case of Tomcat or Jetty, we start filling the request queue. In the case of Undertow, we start denying new requests.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-threads.js' | prepend: site.baseurl }}">
</motion-canvas-player>

The animation visualizes how a request is handled by one thread exactly. Two operations occur which keep the thread busy. The first is a **database access**. Our thread initiates the communication and then waits to be notified by the database adapter that the response is available. During this time, **the thread** has nothing else to do and **can only wait**.

After the `UserService` finished loading data from the database, our code defines that further process steps have to be executed by the `GreetService`. This time the thread actually has to do some kind of computation. After some time we are ready to send our response and the thread is free to process new requests again.

Furthermore, this example also visualizes another phenomenon. As soon as all threads are 100% busy handling requests our response time will start to increase. New requests have to be queued or even declined instead of being processed immediately. The problem is that all threads are idling a lot while waiting for the database. If we could use those threads to do other stuff in the meantime, we would be able to handle many more requests without needing more threads. But this is a topic for another post. For now, let's shed some light on how the different servlet container [thread pools can be configured](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#appendix.application-properties.server) in order to increase the number of parallel requests we can handle.

| Servlet Container | Parameter | Defaults |
| :---------------: | ----------------- | ------------- |
| Tomcat | `server.tomcat.threads.min-spare` and `server.tomcat.threads.max` | Minimum is number of processors (but at least 10) by default. |
| Jetty | `server.jetty.threads.min` and `server.jetty.threads.max` | Minimum is 8 by default. |
| Undertow | `server.undertow.threads.io` | Twice the number of processors by default. |

#### Undertow is a Little Different

Instead of a request queue, [undertow has two separate thread pools](https://undertow.io/undertow-docs/undertow-docs-2.1.0/index.html#xnio-workers): one for *I/O threads* and one for *core threads* (called worker threads by Spring). Contrary to their names, **IO threads** are used to **perform non-blocking, compute tasks** (e.g. executing the actual business logic) whereas **core threads are used for blocking tasks** (e.g. database access or outgoing servlet requests).

Before calling a blocking operation, the execution context is handed over to a core thread. This means that the IO thread is now able to process different tasks such as accepting a new incoming request. As soon as the blocking operation is complete, Undertow's main worker instance (called the XNIO Worker) is informed and a free IO thread picks up the work.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-threads-undertow.js' | prepend: site.baseurl }}">
</motion-canvas-player>

This way of switching threads for blocking tasks can improve the responsiveness and resource utilization of our application. If all requests require the same amount of blocking operations, then this will not improve things at all. Compared to Tomcat, we just increased the number of threads and split them in two groups. If however our application processes multiple different types of requests with some needing a lot of compute steps while others rely on many blocking operations, then the pools can be used efficiently.

Moving blocking operations to core threads keeps the IO threads free to process requests which need more compute steps. If we reach the core-thread-pool limit, only the requests with lots of blocking operations will slow down, the compute intense ones can still be processed (although this has its limits as well).

The IO and core threads can be configured via the `server.undertow.threads.io` and `server.undertow.threads.worker` properties respectively (remember, Spring calls undertow core threads *worker threads*).

| Property | Default |
| -------- | ------- |
| `server.undertow.threads.io` | Twice the number of available processors. |
| `server.undertow.threads.worker` | 8 times the number of IO threads. |

## 5. Blocking Tasks and Outgoing Requests

So far we only briefly touched on the topic of blocking tasks. Multiple operations fall into this category, like:
- **Calling another service** via its API. In most cases today this is done via a REST interface but other mechanisms exist. They all have in common that they rely on HTTP connections which are blocking by nature.
- **Accessing a database**. This is done via a database-specific interface driver (e.g. JDBC driver) and in many cases is also implemented in a blocking way. Newer, non-blocking drivers exist but more on them in another post.
- **File system access**. Here we rely on APIs provided by the operating system and, you guessed it, they are also mostly blocking.

In all of these examples, we leave the Spring context via an adapter or interface and our main thread (or Undertow core thread) waits for a response.

#### Spring REST Template

[RestTemplate](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate) provides an abstraction over low-level HTTP client libraries and was the standard for accessing REST APIs in the old days before non-blocking, reactive communication became part of Spring. It is now in [maintenance mode](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate) and Spring recommends using the newer, non-blocking [WebClient](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-client) instead.

For now we stick with the RestTemplate however as this post is centered around Spring Web and is therefore blocking anyways.

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-rest-template.js' | prepend: site.baseurl }}">
</motion-canvas-player>

The animation shows how our Spring RestTemplate uses a `HTTPConnection` from a pool of connections to make HTTP requests. This is the SpringBoot default but can also be done differently.

It is rather difficult to piece together all necessary information on how Spring and SpringBoot (do not make the mistake of thinking of them as the same thing) auto-configure the connections and connection pools the RestTemplate will use.

##### Spring

Spring (without Boot) **does not provide a pre-configured RestTemplate bean**. It has to be instantiated manually. The RestTemplate class [provides multiple constructors](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate-create) which allow you to configure the type of HTTP connection to be used.

The default constructor uses [JDK](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html)'s `java.net.HttpURLConnection`. A new connection is created for each request and subsequently closed again. The connections are not reused or pooled on any way.

```java
RestTemplate template = new RestTemplate();
```

You can easily switch to a different HTTP library by passing a corresponding factory to the template's constructor, like:

```java
RestTemplate template = new RestTemplate(new HttpComponentsClientHttpRequestFactory());
```
This example uses Apaches HttpComponents as client library which does implement connection pooling.

In addition to the aforementioned [JDK](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html) default, the following libraries are also supported by Spring, all of which use connection pooling:
- [Apache HttpComponents](https://hc.apache.org) (see the example above)
- [Reactor Netty](https://github.com/reactor/reactor-netty)
- [OkHttp](https://square.github.io/okhttp/)

##### SpringBoot

Just like Spring, [SpringBoot does also not provide an auto-configured RestTemplate bean](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#io.rest-client.resttemplate). It does however provide an auto-configured `RestTemplateBuilder` bean which can be used to easily create new RestTemplate beans. A minimal example can look like:

```java
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfiguration {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder restTemplateBuilder) {
        return restTemplateBuilder.build();
    }

}
```

Under the hood, this RestTemplate will use a `PoolingHttpClientConnectionManager` which in turn uses Apache's HttpComponents with two important properties:
- `defaultMaxPerRoute` is set to 5. This means that only 5 parallel HTTP connections to the same host are allowed. The setting can be overridden with the `http.maxConnections` property.
- `maxTotal` is set to 10 and will therefore only allow a maximum of 10 parallel HTTP connection in total. This setting cannot be changed directly, it is always double that of defaultMaxPerRoute.

Therefore, no matter which servlet container you choose, you have to make sure that you configure the connection pool properly.


#### A Word on Spring WebClient

As mentioned before, `RestTemplate` is already in maintenance mode and [Spring recommends](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate) using `WebClient` instead. The latter is part of Spring Webflux and therefore non-blocking. So why and how should we use WebClient for Spring Web applications then?

The answer to this is [just one click away]({{ site.baseurl }}{% post_url 2023-04-04-spring-webmvc-with-webclient %}), in another post!


## 6. What about Netty

Okay, this post is already very long. I tried to cover all relevant information in one place so you and I do not have to jump back and forth between multiple posts and sources. I did briefly mention Netty but did not really explain what it is.

Netty is a non-blocking server (not a servlet container) which in the case of Spring can only be used with Spring Webflux. So again, stay tuned for that post ;)

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
