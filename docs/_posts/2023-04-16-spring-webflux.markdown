---
layout: post
title:  'Spring Webflux: Threading and EventLoops'
date:   2023-04-16 09:10:00 +0100
author: stefan
image:  'https://i.imgur.com/eODIUMc.jpg'
featured: true
tags:   [Spring, Webflux]
tags_color: '#16afd0'
---


## EventLoop as core

- how they work
  - heavy weight, have to run continuously
  - more event-loops does not help --> if blocking

#### netty

#### non blocking servlet container

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
