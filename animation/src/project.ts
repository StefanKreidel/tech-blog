import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import springLifecycleBasic from './scenes/spring-lifecycle-basic?scene'
import springWithServletContainer from './scenes/spring-with-servlet-container'

export default makeProject({
  scenes: [
    // example,
    //springLifecycleBasic
    springWithServletContainer
  ],
  variables: {
    background: '#1f2934',
    spring: '#5caa22',
    undertow: '#4a6d8e',
    requestFresh: '#e57d67',
    requestIntermediate: '#c24835',
    requestOld: '#962f1b',
    requestComplete: '#46a33c',
    transitionSpeed: 1
  },
});
