---
layout: post
title:  'Spring Web MVC + WebClient: How they work together'
date:   2023-04-03 20:29:35 +0100
author: stefan
image:  'https://i.imgur.com/l2QPLfV.jpg'
featured: true
tags:   [spring, webmvc]
tags_color: '#5caa22'
---

Spring Web MVC runs on a blocking stack, following the *one thread per request* philosophy. I have already written a [detailed post]({{ site.baseurl }}{% post_url 2023-03-19-spring-webmvc-servlet-threading %}) which visualizes the inner workings and threading model of Spring Web with the help of step-by-step animations.

In the old days before Spring Webflux this meant that IO requests (like REST calls) where also blocking and handled by the same thread which processed all the request relevant compute steps. This was done by using Spring's `RestTemplate`, which is now in [maintenance mode](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#rest-resttemplate) and, to quote the Spring docs:

> with only requests for minor changes and bugs to be accepted. Please, consider using the WebClient instead.

[WebClient](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-client) is however part of Spring Webflux and thereby non-blocking. So why should we use WebClient for Spring Web applications, if those are inherently blocking by nature?

From a technical point of view there is no clear benefit unless you plan to migrate your legacy application to a reactive stack over time. But in the long term, all new HTTPClient features will only be added to WebClient and not to RestTemplate anymore. Therefore, WebClient is more future proof.

## 1. The Integration Visualized

Let's first remember how blocking IO calls are handled when using RestTemplate:

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-rest-template.js' | prepend: site.baseurl }}">
</motion-canvas-player>

The animation visualized the SpringBoot default behavior. Even though SpringBoot does not provide an auto-configured `RestTemplate` bean, it does provide a `RestTemplateBuilder` bean. With that builder, it is very easy to create a new RestTemplate, which could look like the following:

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

This RestTemplate will use a `PoolingHttpClientConnectionManager` by default which is why the example in the animation uses a pre-filled HTTP connection pool instead of creating new connections on the fly as needed.

To summarize the example, whenever the main worker thread needs to make an HTTP request, RestTemplate uses an existing HTTP connection from the pool. The thread has to wait for a result (or timeout) from the connection before moving on.

Now let's have a look at how things are different if we use WebClient instead:

<motion-canvas-player 
    src="{{ '/js/animation/spring-webmvc/spring-web-client.js' | prepend: site.baseurl }}">
</motion-canvas-player>


## 2. Example Setup

Combining Spring Web MVC and WebClient on a code level is pretty straight forward to get started, although, it is admittedly not intuitive at first:

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
  implementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

You simply have to add both, Web and Webflux as dependencies. This will start Spring in the "classic" Web MVC stack with Tomcat as servlet container as we discussed in the [dedicated Web MVC post]({{ site.baseurl }}{% post_url 2023-03-19-spring-webmvc-servlet-threading %}#spring-rest-template ). At the same time, this will also provide features from Webflux like `WebClient`. Just like with RestTemplate, there is no auto-configured WebClient bean provided by default. A minimal configuration to create one can look as follows:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfiguration {

    @Bean
    public WebClient webClient() {
        return WebClient.create();
    }

}
```

Also just like with RestTemplate, [WebClient requires an actual Http client library](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-client). Built-in support exists for:
- [Reactor Netty](https://github.com/reactor/reactor-netty)
- [Jetty Reactive HttpClient](https://github.com/jetty-project/jetty-reactive-httpclient)
- [JDK HttpClient](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html)
- [Apache HttpComponents](https://hc.apache.org/index.html)

The main difference to RestTemplate's supported libraries is that OkHttp is not supported in favour of Jetty's Reactive HttpClient.

By default, WebClient will use Reactor Netty's EventLoop based HTTP client implementation. But this can easily be changed to, for example, Jetty:

```java
@Bean
public WebClient webClient() {
  return WebClient
          .builder()
          .clientConnector(new JettyClientHttpConnector())
          .build();
}
```

The final thing to keep in mind when using Spring Web MVC with Webflux's WebClient is that resources for incoming and outgoing requests can not be shared. Even if the same library is used (e.g. Jetty Servlet Container and Jetty Reactive HttpClient), the server part will not be reactive and will therefore use blocking servlets while the client is reactive. Therefore, threads and connection pools cannot be used for both.

If you are running on a fully non-blocking, reactive stack, resource sharing is possible. So watch out fo that blog post.

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
