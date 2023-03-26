import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import springWebmvcServlet from './scenes/spring-webmvc-servlet?scene'

export default makeProject({
  scenes: [
    // example,
    springWebmvcServlet
  ],
});
