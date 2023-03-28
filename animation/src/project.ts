import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import springWebmvcServlet from './scenes/spring-webmvc-servlet?scene'

export default makeProject({
  scenes: [
    // example,
    springWebmvcServlet
  ],
  variables: {
    background: '#1f2934',
    spring: '#5caa22',
    requestFresh: '#e57d67',
    requestIntermediate: '#c24835',
    requestOld: '#962f1b',
    requestComplete: '#46a33c',
    transitionSpeed: 1
  },
});
