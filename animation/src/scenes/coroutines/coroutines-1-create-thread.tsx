import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Rect, Txt } from '@motion-canvas/2d/lib/components';
import { CodeBlock, insert, lines } from '@motion-canvas/2d/lib/components/CodeBlock';
import { createRef, useScene } from '@motion-canvas/core/lib/utils';
import { all, chain, waitFor } from '@motion-canvas/core/lib/flow';

import "@motion-canvas/core/lib/types/Color"

export default makeScene2D(function* (view) {
  // project variables
  const longTransition = useScene().variables.get('transitionSpeed', 1)();
  const shortTransition = longTransition / 2;

  const kotlinColor = '#2e68ca';
  const coroutinesColor = '#ea710d';
  const threadColor = "#159f0c"
  
  const background = '#1f2934';

  // reusable styling
  const headingStyle = {
    fontWeight: 700,
    fontSize: 56,
    offsetY: -1,
    cache: true,
    fill: kotlinColor,
    fontFamily: 'Noto Sans Display'
  };
  const heading2Style = {
    fontWeight: 300,
    fontSize: 36,
    cache: true,
    fill: 'white',
    fontFamily: 'Noto Sans Display'
  };
  const heading3Style = {
    fontWeight: 200,
    fontSize: 30,
    fill: 'white' ,
    fontFamily: 'Noto Sans Display'
  }
  const smallTextStyle = {
    fontWeight: 200,
    fontSize: 24,
    fill: 'white' ,
    fontFamily: 'Noto Sans Display'
  }
  const arrowStyle = {
    lineWidth: 3,
    stroke: 'white',
    endArrow: true,
    arrowSize: 12
  }
  
  // references
  const codeRef = createRef<CodeBlock>()

  const os = createRef<Rect>()
  const jvm = createRef<Rect>()
  const jvmThreadPool = createRef<Rect>()
  const mainThread = createRef<Rect>()
  const workerThread = createRef<Rect>()
  const osThreadPool = createRef<Rect>()
  const osThread1 = createRef<Rect>()
  const osThread2 = createRef<Rect>()

  const mainThreadText = createRef<Txt>();
  const workerThreadText = createRef<Txt>();


  view.fill(background)

  view.add(
    <>
      <CodeBlock language="kotlin" ref={codeRef} x={- 480}  />

      {/* JVM container */}
      <Rect
        ref={jvm}
        width={'40%'}
        height={'45%'}
        lineWidth={10}
        stroke={kotlinColor}
        radius={20}
        x={480}
        y={-120}>
        <Txt text={'JVM'} y={-200} {...headingStyle} />

        <Rect ref={jvmThreadPool} width={500} height={200} y={50} lineWidth={4} stroke={'gray'} radius={5}>
          <Txt text={'Thread Pool'} {...heading3Style} y={-60} />
          <Rect ref={mainThread} width={100} height={80} x={-100} y={25} lineWidth={4} stroke={threadColor} radius={5}>
            <Txt ref={mainThreadText} text={'main'} {...smallTextStyle} />
          </Rect>
          <Rect ref={workerThread} width={100} height={80} x={100} y={25} lineWidth={4} stroke={threadColor} radius={5}>
            <Txt ref={workerThreadText} text={'worker'} {...smallTextStyle} />
          </Rect>
        </Rect>
      </Rect>

      {/* OS container */}
      <Rect
        ref={os}
        width={'45%'}
        height={'80%'}
        lineWidth={6}
        lineDash={[20, 20]}
        stroke={'gray'}
        radius={20}
        x={480}
        y={-50}>
        <Txt text={'OS'} y={-375} {...heading2Style} />

        <Rect ref={osThreadPool} y={300}>
          <Txt x={-300} text={'OS Threads: ['} {...heading3Style} />
          <Rect ref={osThread1} width={100} height={80} x={-130} lineWidth={4} stroke={'darkgray'} radius={5} />
          <Rect ref={osThread2} width={100} height={80} lineWidth={4} stroke={'darkgray'} radius={5} />
          <Txt text={']'} x={80} {...heading3Style} />
        </Rect>
      </Rect>

      <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
    </>
  );

  // animation setup
  yield* all(
    osThread1().opacity(0, 0),
    osThread2().opacity(0, 0),
    osThreadPool().opacity(0, 0),
    mainThread().opacity(0, 0),
    workerThread().opacity(0, 0),
    jvmThreadPool().opacity(0, 0),
    jvm().opacity(0, 0),
    os().opacity(0, 0)
  )

  yield* waitFor(longTransition);


  // introduce code
  yield* codeRef().edit(1.2, false)`
    ${insert('fun main(args: Array<String>) {')}
      
        
        
      
    ${insert('}')}`;

  yield* codeRef().edit(1.2, false)`
    fun main(args: Array<String>) {
      ${insert('thread {')}
        
        
      ${insert('}.join()')}
    }`;

  yield* codeRef().edit(1.2, false)`
    fun main(args: Array<String>) {
      thread {
        ${insert('someHeavyTask()')}
        
      }.join()
    }`;
  yield* codeRef().edit(1.2, false)`
    fun main(args: Array<String>) {
      thread {
        someHeavyTask()
        ${insert('log.info("task completed")')}
      }.join()
    }`;
  yield* codeRef().selection(lines(6, 6), 0.6)
  yield* waitFor(0.6);


  // introduce animation
  yield* chain(
    os().opacity(1, shortTransition),
    jvm().opacity(1, shortTransition),
    jvmThreadPool().opacity(1, shortTransition),
    osThreadPool().opacity(1, shortTransition)
  );
  yield* waitFor(shortTransition);



  // animation
  // main thread
  yield* chain(
    mainThread().opacity(1, shortTransition),
    osThread1().opacity(1, shortTransition)
  );
  yield* waitFor(shortTransition);
  mainThread().save();
  mainThreadText().save();

  yield* all(
    osThread1().absolutePosition(mainThread().absolutePosition, longTransition),
    osThread1().width(() => mainThread().width() + 10, longTransition),
    osThread1().height(() => mainThread().height() + 10, longTransition)
  );
  yield* waitFor(shortTransition);

  yield* all(
    mainThread().absolutePosition(codeRef().absolutePosition(), longTransition),
    mainThread().width(920, longTransition),
    mainThread().height(400, longTransition),
    mainThreadText().position.y(170, longTransition)
  );

  yield* chain(
    codeRef().selection(lines(0, 0), longTransition),
    codeRef().selection(lines(1, 1), longTransition),
    codeRef().selection(lines(4, 4), longTransition)
  )


  // introduce worker thread
  yield* chain(
    workerThread().opacity(1, shortTransition),
    osThread2().opacity(1, shortTransition)
  );
  yield* waitFor(shortTransition);
  workerThread().save();
  workerThreadText().save();

  yield* all(
    osThread2().absolutePosition(workerThread().absolutePosition, longTransition),
    osThread2().width(() => workerThread().width() + 10, longTransition),
    osThread2  ().height(() => workerThread().height() + 10, longTransition)
  );
  yield* waitFor(shortTransition);

  yield* all(
    workerThread().absolutePosition(codeRef().absolutePosition(), longTransition),
    workerThread().width(800, longTransition),
    workerThread().height(230, longTransition),
    workerThreadText().position.y(90, longTransition)
  );

  yield* chain(
    codeRef().selection(lines(2, 2), longTransition),
    codeRef().selection(lines(3, 3), longTransition),
    codeRef().selection(lines(6, 6), longTransition)
  )
  yield* all(
    workerThread().restore(longTransition),
    workerThreadText().restore(longTransition)
  );

  //resume on main thread
  yield* chain(
    codeRef().selection(lines(4, 4), longTransition),
    codeRef().selection(lines(5, 5), longTransition),
    codeRef().selection(lines(6, 6), longTransition),
  )
  yield* waitFor(shortTransition);
  yield* all(
    mainThread().restore(longTransition),
    mainThreadText().restore(longTransition)
  );
  


  yield* waitFor(longTransition * 2);
});
