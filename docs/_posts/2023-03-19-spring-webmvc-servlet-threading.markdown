---
layout: post
title:  'Spring Web MVC Visualized: Threading and Servelts'
date:   2023-03-19 13:30:35 +0100
author: stefan
image:  'https://i.imgur.com/8odFj6K.jpg'
featured: true
tags:   [spring, webmvc]
tags_color: '#5caa22'
---

here goes a small introduction

## spring server and client

My first test video:

<motion-canvas-player 
    src="{{ '/js/animation/spring-lifecycle.js' | prepend: site.baseurl }}" 
    auto="true">
</motion-canvas-player >

- spring has a lifecycle
- manages beans and has a lot of helpers
- lots of abstractions
- does not implement a web server -> uses tomcat, jetty, undertow or netty (last not for mvc)

## default integration of servers in spring web-mvc

- small explanation on how everything is working together
- web is blocking -> tomcat and jetty work on blocking servlets

### what is blocking (and vs non blocking)

just a general overview (another post)

### what are servlets, servlet-api and servlet containers

just a very short overview (another post)

## tomcat

## jetty

## undertow

## waht about netty

reference to other [post]({{ site.baseurl }}{% post_url 2023-03-18-my-first-blog-post %})

<script src="{{ '/js/motion-canvas-player.js' | prepend: site.baseurl }}" type="text/javascript"></script>
