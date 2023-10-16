import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Circle, Icon, Rect, Txt } from '@motion-canvas/2d/lib/components';
import { createRef, makeRef, useScene } from '@motion-canvas/core/lib/utils';
import { all, chain, waitFor } from '@motion-canvas/core/lib/flow';

import "@motion-canvas/core/lib/types/Color"
import { Vector2 } from '@motion-canvas/core/lib/types';

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
  const codeStyle = {
    fontWeight: 200,
    fontSize: 28,
    fill: 'white' ,
    fontFamily: 'monospace'
  }
  const arrowStyle = {
    lineWidth: 3,
    stroke: 'white',
    endArrow: true,
    arrowSize: 12
  }
  
  // references
  const code = createRef<Rect>()
  const jvm = createRef<Rect>()
  const coroutinePool = createRef<Rect>()
  const jvmThreadPool = createRef<Rect>()
  const mainThread = createRef<Rect>()
  const workerThread1 = createRef<Rect>()
  const workerThread2 = createRef<Rect>()
  
  const fileName = createRef<Rect>()
  const functions: Rect[] = [];
  const lines: Rect[] = [];
  const functionBody: Txt[] = [];
  
  const coroutine1 = createRef<Rect>()
  const coroutine2 = createRef<Rect>()
  const coroutine3 = createRef<Rect>()
  const coroutine1Text = createRef<Txt>();
  const coroutine2Text = createRef<Txt>();
  const coroutine3Text = createRef<Txt>();

  const mainThreadText = createRef<Txt>();
  const workerThread1Text = createRef<Txt>();
  const workerThread2Text = createRef<Txt>();


  view.fill(background)

  view.add(
    <>
      {/* code */}
      <Rect ref={code} x={-480} y={-120} width={'40%'} height={'50%'} stroke={'gray'}>
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
        <Circle x={-330} y={390} size={15} fill={'#6a6d75'} />
        <Circle x={-330} y={440} size={15} fill={'#6a6d75'} />

        <Rect ref={makeRef(functions, 0)} stroke={'white'} width={500} height={200} y={-40} lineWidth={0}>
          <Rect ref={makeRef(lines, 0)} stroke={'grey'} width={470} height={50} x={-20} y={-70} lineWidth={0}>
            <Rect x={-200} width={40} height={20} fill={'#e76a29'} radius={10}/>
            <Rect x={-130} width={80} height={20} fill={'#e76a29'} radius={10}/>
            <Rect x={-30} width={100} height={20} fill={'#449ca9'} radius={10}/>
            <Txt  x={30} {...codeStyle} text={'('} />
            <Rect x={70} width={50} height={20} fill={'#cdceca'} radius={10}/>
            <Rect x={140} width={60} height={20} fill={'#cdceca'} radius={10}/>
            <Txt  x={200} {...codeStyle} text={') {'} />
          </Rect>

          <Rect ref={makeRef(lines, 1)} stroke={'grey'} width={250} height={50} x={-60} y={-20} lineWidth={0}>
            <Rect x={-20} width={200} height={20} fill={'#cdceca'} radius={10}/>
            <Txt  x={100} {...codeStyle} text={'()'} />
          </Rect>

          <Rect ref={makeRef(lines, 2)} stroke={'grey'} width={450} height={50} x={20} y={30} lineWidth={0}>
            <Rect x={-180} width={40} height={20} fill={'#e76a29'} radius={10}/>
            <Rect x={-110} width={80} height={20} fill={'#cdceca'} radius={10}/>
            <Txt  x={-45} {...codeStyle} text={'='} />
            <Rect x={40} width={120} height={20} fill={'#cdceca'} radius={10}/>
            <Txt  x={115} {...codeStyle} text={'('} />
            <Rect x={160} width={60} height={20} fill={'#cdceca'} radius={10}/>
            <Txt  x={205} {...codeStyle} text={')'} />
          </Rect>
          
          <Txt y={80} x={-230} {...codeStyle} text={'}'} />
        </Rect>

        <Rect ref={makeRef(functions, 1)} stroke={'white'} width={500} height={160} y={190} lineWidth={0}>
          <Rect ref={makeRef(lines, 3)}>
            <Rect y={-50} x={-220} width={40} height={20} fill={'#e76a29'} radius={10}/>
            <Rect y={-50} x={-150} width={80} height={20} fill={'#e76a29'} radius={10}/>
            <Rect y={-50} x={0} width={200} height={20} fill={'#449ca9'} radius={10}/>
            <Txt y={-50} x={110} {...codeStyle} text={'('} />
            <Txt y={-50} x={140} {...codeStyle} text={') {'} />
          </Rect>

          <Rect ref={makeRef(lines, 4)}>
            <Txt ref={makeRef(functionBody, 0)} y={0} x={-130} {...codeStyle} fill={'gray'} text={'// ...'} />
          </Rect>
          
          <Txt y={50} x={-230} {...codeStyle} text={'}'} />
        </Rect>

        <Rect ref={makeRef(functions, 2)} stroke={'white'} width={500} height={160} y={390} lineWidth={0}>
          <Rect ref={makeRef(lines, 5)}>
            <Rect y={-50} x={-220} width={40} height={20} fill={'#e76a29'} radius={10}/>
            <Rect y={-50} x={-150} width={80} height={20} fill={'#e76a29'} radius={10}/>
            <Rect y={-50} x={-40} width={120} height={20} fill={'#449ca9'} radius={10}/>
            <Txt y={-50} x={30} {...codeStyle} text={'('} />
            <Rect y={-50} x={70} width={60} height={20} fill={'#cdceca'} radius={10}/>
            <Txt y={-50} x={130} {...codeStyle} text={') {'} />
          </Rect>

          <Rect ref={makeRef(lines, 6)}>
            <Txt ref={makeRef(functionBody, 1)} y={0} x={-130} {...codeStyle} fill={'gray'} text={'// ...'} />
          </Rect>
          
          <Txt y={50} x={-230} {...codeStyle} text={'}'} />
        </Rect>
        
      </Rect>

      {/* JVM container */}
      <Rect
        ref={jvm}
        width={'40%'}
        height={'70%'}
        lineWidth={10}
        stroke={kotlinColor}
        radius={20}
        x={480}
        y={0}>
        <Txt text={'JVM'} y={-300} {...headingStyle} />

        <Rect ref={jvmThreadPool} width={500} height={200} y={200} lineWidth={4} stroke={'gray'} radius={5}>
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
        
        <Rect ref={coroutinePool} width={500} height={200} y={-50} lineWidth={4} stroke={'gray'} radius={5}>
          <Txt text={'Coroutines'} {...heading3Style} y={-60} />
          <Rect ref={coroutine1} width={110} height={80} x={-150} y={25} lineWidth={4} stroke={coroutinesColor} radius={5}>
            <Txt ref={coroutine1Text} text={'co#1'} {...smallTextStyle} />
          </Rect>
          <Rect ref={coroutine2} width={110} height={80} x={0} y={25} lineWidth={4} stroke={coroutinesColor} radius={5}>
            <Txt ref={coroutine2Text} text={'co#2'} {...smallTextStyle} />
          </Rect>
          <Rect ref={coroutine3} width={110} height={80} x={150} y={25} lineWidth={4} stroke={coroutinesColor} radius={5}>
            <Txt ref={coroutine3Text} text={'co#3'} {...smallTextStyle} />
          </Rect>
        </Rect>
      </Rect>



      <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
    </>
  );

  // animation setup
  functions.forEach(fun => fun.opacity(0));

  yield* all(
    lines[1].opacity(0, 0),
    lines[2].opacity(0, 0),
    code().opacity(0, 0),
    coroutine1().opacity(0, 0),
    coroutine2().opacity(0, 0),
    coroutine3().opacity(0, 0),
    coroutinePool().opacity(0, 0),
    mainThread().opacity(0, 0),
    workerThread1().opacity(0, 0),
    workerThread2().opacity(0, 0),
    jvmThreadPool().opacity(0, 0),
    jvm().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // introduce code
  yield* code().opacity(1, shortTransition);
  yield* functions[0].opacity(0.5, shortTransition);
  yield* waitFor(shortTransition);
  yield* all(
    lines[1].opacity(1, longTransition),
    functions[1].opacity(0.5, longTransition)
  );
  yield* all(
    lines[2].opacity(1 , longTransition),
    functions[2].opacity(0.5, longTransition)
  );

  // introduce rest
  yield* waitFor(shortTransition);
  yield* chain(
    jvm().opacity(1, shortTransition),
    coroutinePool().opacity(1, shortTransition), 
    jvmThreadPool().opacity(1, shortTransition)
  );
  yield* waitFor(longTransition);

  
  // animation
  yield* chain(
    coroutine1().opacity(1, shortTransition),
    mainThread().opacity(1, shortTransition)
  )
  coroutine1().save();
  coroutine1Text().save();
  mainThread().save();
  mainThreadText().save();

  // function 1
  yield* all(
    mainThread().absolutePosition(coroutine1().absolutePosition, longTransition),
    mainThread().width(() => coroutine1().width() + 10, longTransition),
    mainThread().height(() => coroutine1().height() + 10, longTransition),
    mainThreadText().opacity(0, longTransition)
  );
  yield* coroutine1Text().text('co#1@main', shortTransition)
  yield* all(
    coroutine1().absolutePosition(functions[0].absolutePosition(), longTransition),
    coroutine1().width(functions[0].width() + 15, longTransition),
    coroutine1().height(functions[0].height() + 15, longTransition),
    coroutine1Text().position.y(-130, longTransition)
  );
  yield* waitFor(shortTransition);

  yield* all(
    coroutine1().absolutePosition(lines[0].absolutePosition(), longTransition),
    coroutine1().width(lines[0].width() + 15, longTransition),
    coroutine1().height(lines[0].height() + 15, longTransition),
    coroutine1Text().position.y(-60, longTransition)
  );
  yield* all(
    functions[0].opacity(1, shortTransition),
    lines[1].opacity(0.5, shortTransition),
    lines[2].opacity(0.5, shortTransition)
  );
  yield* waitFor(shortTransition);

  yield* all(
    coroutine1().absolutePosition(lines[1].absolutePosition(), longTransition),
    coroutine1().width(lines[1].width() + 15, longTransition),
    coroutine1().height(lines[1].height() + 15, longTransition)
  );
  yield* lines[1].opacity(1, shortTransition);

  // introduce worker 1
  yield* chain(
    coroutine2().opacity(1, shortTransition),
    workerThread1().opacity(1, shortTransition)
  )
  coroutine2().save();
  coroutine2Text().save();
  workerThread1().save();
  workerThread1Text().save();

  // parallel 1
  yield chain(
    // move thread to function 1
    all(
      workerThread1().absolutePosition(coroutine2().absolutePosition, longTransition),
      workerThread1().width(() => coroutine2().width() + 10, longTransition),
      workerThread1().height(() => coroutine2().height() + 10, longTransition),
      workerThread1Text().opacity(0, longTransition),
      coroutine2Text().text('co#2@worker1', shortTransition),
      mainThread().restore(longTransition),
      mainThreadText().restore(longTransition),
      coroutine1().restore(longTransition),
      coroutine1Text().restore(longTransition)
    ),
    all(
      coroutine2().absolutePosition(functions[1].absolutePosition(), longTransition),
      coroutine2().width(functions[1].width() + 15, longTransition),
      coroutine2().height(functions[1].height() + 15, longTransition),
      coroutine2Text().position.y(-110, longTransition)
    ),
    functions[1].opacity(1, longTransition * 4),
    all(
      coroutine2().absolutePosition(lines[1].absolutePosition(), longTransition),
      coroutine2().width(lines[1].width() + 15, longTransition),
      coroutine2().height(lines[1].height() + 15, longTransition),
      coroutine2Text().position.y(-60, longTransition)
    ),
    all(
      workerThread1().position(new Vector2(0, 25), longTransition),
      workerThread1().size(new Vector2(110, 80), longTransition),
      workerThread1Text().text('worker-1', longTransition),
      workerThread1Text().opacity(1, longTransition),
      coroutine2().position(new Vector2(0, 25), longTransition),
      coroutine2().size(new Vector2(110, 80), longTransition),
      coroutine2Text().text('co#2', longTransition),
      coroutine2Text().position(Vector2.zero, longTransition),
      coroutine2Text().opacity(1, longTransition),
    )
  );


  // function 2
  yield* chain(
    coroutine3().opacity(1, shortTransition),
    workerThread2().opacity(1, shortTransition)
  )
  coroutine3().save();
  coroutine3Text().save();
  workerThread2().save();
  workerThread2Text().save();

  yield* all(
    workerThread2().absolutePosition(coroutine3().absolutePosition, longTransition),
    workerThread2().width(() => coroutine3().width() + 10, longTransition),
    workerThread2().height(() => coroutine3().height() + 10, longTransition),
    workerThread2Text().opacity(0, longTransition)
  );
  yield* coroutine3Text().text('co#3@worker2', shortTransition)

  yield* all(
    coroutine3().absolutePosition(lines[2].absolutePosition(), longTransition),
    coroutine3().width(lines[2].width() + 15, longTransition),
    coroutine3().height(lines[2].height() + 15, longTransition),
    coroutine3Text().position.y(-60, longTransition)
  );
  yield* lines[2].opacity(1, shortTransition);

  yield* all(
    coroutine3().absolutePosition(functions[2].absolutePosition(), longTransition),
    coroutine3().width(functions[2].width() + 15, longTransition),
    coroutine3().height(functions[2].height() + 15, longTransition),
    coroutine3Text().position.y(-110, longTransition)
  );

  yield* functions[2].opacity(1, longTransition * 2),

  yield* all(
    coroutine3().absolutePosition(lines[2].absolutePosition(), longTransition),
    coroutine3().width(lines[2].width() + 15, longTransition),
    coroutine3().height(lines[2].height() + 15, longTransition),
    coroutine3Text().position.y(-60, longTransition)
  );

  yield* all(
    workerThread2().restore(longTransition),
    workerThread2Text().restore(longTransition),
    coroutine3().restore(longTransition),
    coroutine3Text().restore(longTransition)
  );




  yield* waitFor(longTransition * 2);
});
