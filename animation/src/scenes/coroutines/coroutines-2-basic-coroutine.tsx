import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Circle, Icon, Line, Rect, Txt } from '@motion-canvas/2d/lib/components';
import { CodeBlock, insert, lines } from '@motion-canvas/2d/lib/components/CodeBlock';
import { createRef, makeRef, useScene } from '@motion-canvas/core/lib/utils';
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
  const code = createRef<Rect>()
  const os = createRef<Rect>()
  const jvm = createRef<Rect>()
  const jvmThreadPool = createRef<Rect>()
  const mainThread = createRef<Rect>()
  const workerThread1 = createRef<Rect>()
  const workerThread2 = createRef<Rect>()
  const osThreadPool = createRef<Rect>()
  const osThread1 = createRef<Rect>()
  const osThread2 = createRef<Rect>()
  const osThread3 = createRef<Rect>()

  const fileName = createRef<Rect>()
  const codeLines: Rect[] = [];
  const suspend = createRef<Txt>()

  const mainThreadText = createRef<Txt>();
  const workerThread1Text = createRef<Txt>();
  const workerThread2Text = createRef<Txt>();


  view.fill(background)

  view.add(
    <>
      {/* code */}
      <Rect ref={code} x={-480} y={-80} width={'40%'} height={'50%'} stroke={'gray'}>
        <Rect ref={fileName} fill={'#191b21'} x={-300} y={-200} width={120} height={60} radius={10}>
          <Icon icon={'logos:kotlin-icon'} x={-30} size={30}/>
          <Rect fill={'#6a6d75'} width={60} height={20} x={20} radius={10}/>
        </Rect>

        <Circle x={-330} y={-110} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={-60} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={-10} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={40} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={90} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={140} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={190} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={240} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={290} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={340} size={15} fill={'#6a6d75'} />

        <Rect y={-110} x={-180} ref={makeRef(codeLines, 0)} width={120} height={20} fill={'#449ca9'} radius={10}/>
        <Rect y={-110} x={-80} ref={makeRef(codeLines, 1)} width={60} height={20} fill={'#6a6d75'} radius={10}/>
        <Rect y={-110} x={10} ref={makeRef(codeLines, 2)} width={100} height={20} fill={'#e76a29'} radius={10}/>

        <Rect y={-60} x={-170} ref={makeRef(codeLines, 3)} width={140} height={20} fill={'#ef0062'} radius={10}/>
        <Rect y={-60} x={-40} ref={makeRef(codeLines, 4)} width={100} height={20} fill={'#9ada24'} radius={10}/>
        <Rect y={-60} x={120} ref={makeRef(codeLines, 5)} width={200} height={20} fill={'#cdceca'} radius={10}/>

        <Rect y={-10} x={-190} ref={makeRef(codeLines, 6)} width={100} height={20} fill={'#449ca9'} radius={10}/>
          <Rect y={90} x={-200} width={4} height={110} fill={'#6a6d75'} radius={10}/>

          <Rect y={40} x={-150} ref={makeRef(codeLines, 7)} width={40} height={20} fill={'#ef0062'} radius={10}/>
          <Rect y={40} x={-40} ref={makeRef(codeLines, 8)} width={160} height={20} fill={'#6a6d75'} radius={10}/>

          <Rect y={90} x={-160} ref={makeRef(codeLines, 9)} width={20} height={20} fill={'#e76a29'} radius={10}>
            <Txt ref={suspend} text={'suspend'} fontSize={20} fontWeight={600} fill={'black'} />
          </Rect>

          <Rect y={140} x={-130} ref={makeRef(codeLines, 10)} width={80} height={20} fill={'#cdceca'} radius={10}/>

        <Rect y={190} x={-210} ref={makeRef(codeLines, 11)} width={60} height={20} fill={'#ef0062'} radius={10}/>
        <Rect y={190} x={-110} ref={makeRef(codeLines, 12)} width={120} height={20} fill={'#9d6af5'} radius={10}/>

        <Rect y={240} x={-190} ref={makeRef(codeLines, 13)} width={100} height={20} fill={'#449ca9'} radius={10}/>

          <Rect y={290} x={-130} ref={makeRef(codeLines, 14)} width={80} height={20} fill={'#9ada24'} radius={10}/>
          <Rect y={290} x={-20} ref={makeRef(codeLines, 15)} width={120} height={20} fill={'#cdceca'} radius={10}/>

        <Rect y={340} x={-210} ref={makeRef(codeLines, 16)} width={60} height={20} fill={'#ef0062'} radius={10}/>      
      </Rect>

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
          <Rect ref={mainThread} width={110} height={80} x={-150} y={25} lineWidth={4} stroke={threadColor} radius={5}>
            <Txt ref={mainThreadText} text={'main'} {...smallTextStyle} />
          </Rect>
          <Rect ref={workerThread1} width={120} height={80} y={25} lineWidth={4} stroke={threadColor} radius={5}>
            <Txt ref={workerThread1Text} text={'worker-1'} {...smallTextStyle} />
          </Rect>
          <Rect ref={workerThread2} width={120} height={80} x={150} y={25} lineWidth={4} stroke={threadColor} radius={5}>
            <Txt ref={workerThread2Text} text={'worker-2'} {...smallTextStyle} />
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
          <Rect ref={osThread3} width={100} height={80} x={130} lineWidth={4} stroke={'darkgray'} radius={5} />
          <Txt text={']'} x={210} {...heading3Style} />
        </Rect>
      </Rect>

      <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
    </>
  );

  // animation setup
  yield* all(
    suspend().opacity(0, 0),
    code().opacity(0, 0),
    osThread1().opacity(0, 0),
    osThread2().opacity(0, 0),
    osThread3().opacity(0, 0),
    osThreadPool().opacity(0, 0),
    mainThread().opacity(0, 0),
    workerThread1().opacity(0, 0),
    workerThread2().opacity(0, 0),
    jvmThreadPool().opacity(0, 0),
    jvm().opacity(0, 0),
    os().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // introduce code
  yield* code().opacity(1, shortTransition);
  yield* waitFor(shortTransition);
  yield* chain(
    os().opacity(1, shortTransition),
    jvm().opacity(1, shortTransition),
    jvmThreadPool().opacity(1, shortTransition),
    osThreadPool().opacity(1, shortTransition)
  );
  yield* waitFor(longTransition);

  
  
  // animation

  // main thread
  yield* chain(
    mainThread().opacity(1, shortTransition),
    osThread1().opacity(1, shortTransition)
  );
  mainThread().save();
  mainThreadText().save();
  osThread1().save();

  yield* all(
    osThread1().absolutePosition(mainThread().absolutePosition, longTransition),
    osThread1().width(() => mainThread().width() + 10, longTransition),
    osThread1().height(() => mainThread().height() + 10, longTransition)
  );
  yield* waitFor(shortTransition);

  // file-name
  yield* all(
    mainThread().absolutePosition(fileName().absolutePosition(), longTransition),
    mainThread().width(fileName().width() + 20, longTransition),
    mainThread().height(fileName().height() + 20, longTransition),
    mainThreadText().position.y(-60, longTransition)
  );
  // line 1
  yield* all(
    mainThread().absolutePosition(codeLines[0].absolutePosition(), shortTransition),
    mainThread().width(codeLines[0].width() + 15, shortTransition),
    mainThread().height(codeLines[0].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition)
  );
  yield* all(
    mainThread().absolutePosition(codeLines[1].absolutePosition(), shortTransition),
    mainThread().width(codeLines[1].width() + 15, shortTransition),
    mainThread().height(codeLines[1].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition)
  );
  yield* all(
    mainThread().absolutePosition(codeLines[2].absolutePosition(), shortTransition),
    mainThread().width(codeLines[2].width() + 15, shortTransition),
    mainThread().height(codeLines[2].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition)
  );
  // line 2
  yield* all(
    mainThread().absolutePosition(codeLines[3].absolutePosition(), shortTransition),
    mainThread().width(codeLines[3].width() + 15, shortTransition),
    mainThread().height(codeLines[3 ].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition)
  );
  yield* waitFor(shortTransition);


  // worker thread 1
  yield* chain(
    workerThread1().opacity(1, shortTransition),
    osThread2().opacity(1, shortTransition)
  );
  workerThread1().save();
  workerThread1Text().save();
  osThread2().save();

  yield* all(
    osThread2().absolutePosition(workerThread1().absolutePosition, longTransition),
    osThread2().width(() => workerThread1().width() + 10, longTransition),
    osThread2().height(() => workerThread1().height() + 10, longTransition)
  );
  yield* all(
    workerThread1().absolutePosition(codeLines[4].absolutePosition(), longTransition),
    workerThread1().width(codeLines[4].width() + 15, longTransition),
    workerThread1().height(codeLines[4].height() + 15, longTransition),
    workerThread1Text().position.y(-40, longTransition)
  );
  yield* waitFor(shortTransition);

  // still line 2
  yield* all(
    mainThread().absolutePosition(codeLines[6].absolutePosition(), shortTransition),
    mainThread().width(codeLines[6].width() + 15, shortTransition),
    mainThread().height(codeLines[6].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition),
    //
    workerThread1().absolutePosition(codeLines[5].absolutePosition(), shortTransition),
    workerThread1().width(codeLines[5].width() + 15, shortTransition),
    workerThread1().height(codeLines[5].height() + 15, shortTransition),
    workerThread1Text().position.y(-40, shortTransition)
  );

  // loop
  yield* all(
    mainThread().absolutePosition(codeLines[7].absolutePosition(), shortTransition),
    mainThread().width(codeLines[7].width() + 15, shortTransition),
    mainThread().height(codeLines[7].height() + 15, shortTransition),
    mainThreadText().position.y(-40, shortTransition),
  );

  // worker thread 2
  yield* chain(
    workerThread2().opacity(1, shortTransition),
    osThread3().opacity(1, shortTransition)
  );
  workerThread2().save();
  workerThread2Text().save();
  osThread3().save();

  yield* all(
    osThread3().absolutePosition(workerThread2().absolutePosition, longTransition),
    osThread3().width(() => workerThread2().width() + 10, longTransition),
    osThread3().height(() => workerThread2().height() + 10, longTransition)
  );
  yield* all(
    workerThread2().absolutePosition(codeLines[8].absolutePosition(), longTransition),
    workerThread2().width(codeLines[8].width() + 15, longTransition),
    workerThread2().height(codeLines[8].height() + 15, longTransition),
    workerThread2Text().position.y(-40, longTransition),
    //
    mainThread().restore(longTransition),
    mainThreadText().restore(longTransition)
  );

  yield all(
    workerThread1().restore(longTransition),
    workerThread1Text().restore(longTransition)
  );


  yield* all(
    workerThread2().absolutePosition(codeLines[9].absolutePosition(), shortTransition),
    workerThread2().width(codeLines[9].width() + 15, shortTransition),
    workerThread2().height(codeLines[9].height() + 15, shortTransition),
    workerThread2Text().position.y(-40, shortTransition),
  );

  // suspend
  yield all(
    codeLines[9].width(300, longTransition * 3),
    codeLines[9].position.x(-20, longTransition * 3),
    suspend().opacity(1, longTransition * 3)
  );
  yield* waitFor(shortTransition);
  workerThread1().save();
  workerThread1Text().save();

  // continue loop
  yield* all(
    workerThread2().absolutePosition(codeLines[10].absolutePosition(), shortTransition),
    workerThread2().width(codeLines[10].width() + 15, shortTransition),
    workerThread2().height(codeLines[10].height() + 15, shortTransition),
    workerThread2Text().position.y(-40, shortTransition),
  );
  yield* all(
    workerThread1().absolutePosition(codeLines[11].absolutePosition(), longTransition),
    workerThread1().width(codeLines[11].width() + 15, longTransition),
    workerThread1().height(codeLines[11 ].height() + 15, longTransition),
    workerThread1Text().position.y(-40, longTransition),
  );
  yield* all(
    workerThread1().absolutePosition(codeLines[12].absolutePosition(), shortTransition),
    workerThread1().width(codeLines[12].width() + 15, shortTransition),
    workerThread1().height(codeLines[12].height() + 15, shortTransition),
    workerThread1Text().position.y(-40, shortTransition),
  );

  // continue suspended function
  yield* all(
    workerThread1().absolutePosition(codeLines[9].absolutePosition(), shortTransition),
    workerThread1().width(codeLines[9].width() + 15, shortTransition),
    workerThread1().height(codeLines[9].height() + 15, shortTransition),
    workerThread1Text().position.y(-40, shortTransition),
    //
    workerThread2().absolutePosition(codeLines[13].absolutePosition(), shortTransition),
    workerThread2().width(codeLines[13].width() + 15, shortTransition),
    workerThread2().height(codeLines[13].height() + 15, shortTransition),
    workerThread2Text().position.y(-40, shortTransition),
  );
  yield* suspend().opacity(0, shortTransition);
  yield* waitFor(shortTransition);

  // final code
  yield* all(
    workerThread1().absolutePosition(codeLines[10].absolutePosition(), shortTransition),
    workerThread1().width(codeLines[10].width() + 15, shortTransition),
    workerThread1().height(codeLines[10].height() + 15, shortTransition),
    workerThread1Text().position.y(-40, shortTransition),
    //
    workerThread2().absolutePosition(codeLines[14].absolutePosition(), shortTransition),
    workerThread2().width(codeLines[14].width() + 15, shortTransition),
    workerThread2().height(codeLines[14].height() + 15, shortTransition),
    workerThread2Text().position.y(-40, shortTransition),
  );
  yield* all(
    workerThread2().absolutePosition(codeLines[15].absolutePosition(), shortTransition),
    workerThread2().width(codeLines[15].width() + 15, shortTransition),
    workerThread2().height(codeLines[15].height() + 15, shortTransition),
    workerThread2Text().position.y(-40, shortTransition),
  );
  yield* waitFor(shortTransition);

  yield* all(
    workerThread1().absolutePosition(codeLines[16].absolutePosition(), shortTransition),
    workerThread1().width(codeLines[16].width() + 15, shortTransition),
    workerThread1().height(codeLines[16].height() + 15, shortTransition),
    workerThread1Text().position.y(-40, shortTransition),
    //
    workerThread2().restore(longTransition),
    workerThread2Text().restore(longTransition),
  );

  yield* all(
    workerThread1().restore(longTransition),
    workerThread1Text().restore(longTransition)
  )
  
  


  yield* waitFor(longTransition * 2);
});
