import {makeProject} from '@motion-canvas/core';

import springLifecycleBasic from './scenes/spring-webmvc/spring-lifecycle-basic?scene'
import springWithServletContainer from './scenes/spring-webmvc/spring-with-servlet-container?scene'
import springModelViewController from './scenes/spring-webmvc/spring-model-view-controller?scene'
import springThreads from './scenes/spring-webmvc/spring-threads?scene'
import springThreadsUndertow from './scenes/spring-webmvc/spring-threads-undertow?scene'
import springRestTemplate from './scenes/spring-webmvc/spring-rest-template?scene'
import springWebClient from './scenes/spring-webmvc/spring-web-client?scene'

import springWebfluxLifecycleBasic from './scenes/spring-webflux/spring-webflux-1-lifecycle-basic?scene'
import springWebfluxSocketBinding from './scenes/spring-webflux/spring-webflux-2-socket-binding?scene'
import springWebfluxBlockingOperations from './scenes/spring-webflux/spring-webflux-3-blocking-operations?scene'
import springWebfluxWebClient from './scenes/spring-webflux/spring-webflux-4-webclient?scene'
import springWebfluxBoundedElastic from './scenes/spring-webflux/spring-webflux-5-bounded-elastic?scene'

import './global.css';

export default makeProject({
  scenes: [
    // springLifecycleBasic,
    // springWithServletContainer,
    // springModelViewController,
    // springThreads,
    // springThreadsUndertow,
    // springRestTemplate,
    // springWebClient,
    // springWebfluxLifecycleBasic,
    // springWebfluxSocketBinding,
    // springWebfluxBlockingOperations,
    // springWebfluxWebClient,
    springWebfluxBoundedElastic
  ]
});
