import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import springLifecycleBasic from './scenes/spring-lifecycle-basic?scene'
import springWithServletContainer from './scenes/spring-with-servlet-container?scene'

import './global.css';

export default makeProject({
  scenes: [
    // example,
    // springLifecycleBasic,
    springWithServletContainer
  ]
});
