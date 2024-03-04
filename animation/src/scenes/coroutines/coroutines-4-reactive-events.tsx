import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt, Icon } from '@motion-canvas/2d/lib/components';
import { createRef, makeRef, useScene } from '@motion-canvas/core/lib/utils';
import { all, chain, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createSignal } from '@motion-canvas/core/lib/signals';

import "@motion-canvas/core/lib/types/Color"

export default makeScene2D(function* (view) {
  // project variables
  const longTransition = useScene().variables.get('transitionSpeed', 1)();
  const shortTransition = longTransition / 2;

  const kotlinColor = '#cc1bc9';
  const kotlinAccentColor = '#884afb';
  const boxColor = 'gray';

  const eventColor = '#8e524a';
  const eventIntermediateColor1 = '#a3823c'
  const eventIntermediateColor2 = '#94a33c'
  const eventCompleteColor = '#46a33c';
  
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
  const requestStyle = {
    width: 80,
    height: 40,
    radius: 8,
    fill: eventColor
  }
  const eventLoopStyle = {
    width: 90,
    height: 50,
    lineWidth: 5,
    radius: 4,
    stroke: kotlinAccentColor
  }
  const arrowStyle = {
    lineWidth: 3,
    stroke: 'white',
    endArrow: true,
    arrowSize: 12
  }
  
  // references
  const kotlinApp = createRef<Rect>();
  const requestEvents = createRef<Rect>();
  const internalEvents = createRef<Rect>();
  const threadGroup = createRef<Rect>();
  const thread = createRef<Rect>();

  const requestEvent: Rect[] = [];
  const requestWaiting: Icon[] = [];
  const internalEvent: Rect[] = [];
  const internalWaiting: Icon[] = [];

  // signals
  const connectionArrowSignal = createSignal(0);
  const eventLoopPosition = createSignal(Vector2.zero)


  view.fill(background)

  view.add(
    <>
      {/* Kotlin container */}
      <Rect
        ref={kotlinApp}
        width={'70%'}
        height={'70%'}
        lineWidth={10}
        stroke={kotlinColor}
        radius={20}
      >
        <Txt text={'Kotlin Application'} y={-350} {...headingStyle} />
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
      </Rect>

      {/* Incoming events */}
      <Rect
        ref={requestEvents}
        width={300}
        height={400}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={-420}
        y={40}
      >
        <Txt text={'Request Events'} y={250} {...heading2Style} fill={boxColor} fontSize={32} fontWeight={700} />
        <Rect {...requestStyle} ref={makeRef(requestEvent, 0)} y={-100} />
        <Icon ref={makeRef(requestWaiting, 0)} icon={'mdi:timer-sand'} color={'white'} size={40} y={-100} />
        <Rect {...requestStyle} ref={makeRef(requestEvent, 1)} />
        <Icon ref={makeRef(requestWaiting, 1)} icon={'mdi:timer-sand'} color={'white'} size={40} />
        <Rect {...requestStyle} ref={makeRef(requestEvent, 2)} y={100} />
        <Icon ref={makeRef(requestWaiting, 2)} icon={'mdi:timer-sand'} color={'white'} size={40} y={100} />
      </Rect>

      {/* Coroutine Threads */}
      <Rect
        ref={threadGroup}
        width={300}
        height={200}
        lineWidth={5}
        stroke={kotlinAccentColor}
        radius={16}
        y={40}
      >
        <Txt {...heading2Style} textAlign='center' y={-60} fill={kotlinAccentColor} text='Threads' />
        <Rect {...eventLoopStyle} y={30} ref={thread} />
      </Rect>

      {/* Internal Events */}
      <Rect
        ref={internalEvents}
        width={300}
        height={400}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={420}
        y={40}
      >
        <Txt text={'Internal Events'} y={250} {...heading2Style} fill={boxColor} fontSize={32} fontWeight={700} />    
        <Rect {...requestStyle} ref={makeRef(internalEvent, 0)} y={-100} />
        <Icon ref={makeRef(internalWaiting, 0)} icon={'mdi:timer-sand'} color={'white'} size={40} y={-100} />
        <Rect {...requestStyle} ref={makeRef(internalEvent, 1)} />
        <Icon ref={makeRef(internalWaiting, 1)} icon={'mdi:timer-sand'} color={'white'} size={40} />
        <Rect {...requestStyle} ref={makeRef(internalEvent, 2)} y={100} />
        <Icon ref={makeRef(internalWaiting, 2)} icon={'mdi:timer-sand'} color={'white'} size={40} y={100} />    
      </Rect>
      
    </>
  );

  // animation setup
  requestEvent.forEach(request => request.save());
  requestWaiting.forEach(waiting => waiting.save());
  internalEvent.forEach(request => request.save());
  internalWaiting.forEach(waiting => waiting.save());

  thread().save();
  

  yield* all(
    requestEvent[0].size(0, 0),
    requestEvent[1].size(0, 0),
    requestEvent[2].size(0, 0),
    requestWaiting[0].size(0, 0),
    requestWaiting[1].size(0, 0),
    requestWaiting[2].size(0, 0),
    internalEvent[0].size(0, 0),
    internalEvent[1].size(0, 0),
    internalEvent[2].size(0, 0),
    internalWaiting[0].size(0, 0),
    internalWaiting[1].size(0, 0),
    internalWaiting[2].size(0, 0),
    thread().lineWidth(0, 0),
    threadGroup().opacity(0, 0),
    internalEvents().opacity(0, 0),
    requestEvents().opacity(0, 0)
  );

  yield* waitFor(longTransition);

  // pop in
  yield* requestEvents().opacity(1, longTransition);
  yield* internalEvents().opacity(1, longTransition);
  yield* threadGroup().opacity(1, longTransition);
  yield* waitFor(shortTransition);


  // process first event
  yield* requestEvent[0].restore(shortTransition);
  yield* thread().restore(shortTransition);
  thread().save();
  yield* thread().absolutePosition(requestEvent[0].absolutePosition, shortTransition);
  yield* requestEvent[0].fill(eventIntermediateColor1, longTransition);

  yield* all(
    thread().restore(shortTransition),
    requestWaiting[0].restore(shortTransition)
  );
  for (let i=1; i<3; i++) {
    yield* requestWaiting[0].rotation(360 * i, shortTransition);
  }

  thread().save();
  yield* all(
    requestWaiting[0].size(0, shortTransition),
    thread().absolutePosition(requestEvent[0].absolutePosition, shortTransition)
  );
  yield* requestEvent[0].fill(eventCompleteColor, longTransition);

  yield* all(
    thread().restore(shortTransition),
    requestEvent[0].size(0, shortTransition)
  );


  // process more random events
  yield* waitFor(shortTransition);
  thread().save();

  yield* requestEvent[1].restore(shortTransition);
  yield* thread().absolutePosition(requestEvent[1].absolutePosition, shortTransition);
  yield internalEvent[1].restore(shortTransition);
  yield* requestEvent[1].fill(eventIntermediateColor1, longTransition);

  yield* all(
    thread().restore(shortTransition),
    requestWaiting[1].restore(shortTransition)
  );

  thread().save();
  yield* all(
    thread().absolutePosition(internalEvent[1].absolutePosition, shortTransition),
    requestWaiting[1].rotation(360, shortTransition)
  );
  yield chain(
    internalEvent[1].fill(eventCompleteColor, longTransition * 2),
    all(
      thread().restore(shortTransition),
      internalEvent[1].size(0, shortTransition)
    )
  );

  yield* requestWaiting[1].rotation(720, shortTransition);
  yield* requestWaiting[1].size(0, shortTransition);
  yield* waitFor(shortTransition);
  yield* internalEvent[2].restore(shortTransition);
  yield* waitFor(shortTransition);

  thread().save();
  yield* thread().absolutePosition(requestEvent[1].absolutePosition, shortTransition);
  yield* requestEvent[1].fill(eventIntermediateColor2, shortTransition);
  yield* all(
    thread().restore(shortTransition),
    requestWaiting[1].size(40, shortTransition)
  );

  thread().save();
  yield chain(
    thread().absolutePosition(internalEvent[2].absolutePosition, shortTransition),
    internalEvent[2].fill(eventIntermediateColor1, longTransition),
    all(
      thread().position(new Vector2().addY(30), shortTransition),
      internalWaiting[2].restore(shortTransition)
    ),
    internalWaiting[2].rotation(360, shortTransition),
    all(
      internalWaiting[2].rotation(720, shortTransition),
      internalEvent[0].restore(shortTransition)
    ),
    internalWaiting[2].rotation(1080, shortTransition),
    internalWaiting[2].rotation(1440, shortTransition),
    internalWaiting[2].size(0, shortTransition)
  );

  for (let i=1; i<6; i++) {
    yield* requestWaiting[1].rotation(720 + 360 * i, shortTransition);
  }
  yield* requestWaiting[1].size(0, shortTransition);

  thread().save();
  yield* thread().absolutePosition(internalEvent[0].absolutePosition, shortTransition);
  yield* internalEvent[0].fill(eventCompleteColor, longTransition);
  yield* all(
    internalEvent[0].size(0, shortTransition),
    thread().restore(shortTransition)
  );

  thread().save();
  yield* thread().absolutePosition(requestEvent[1].absolutePosition, shortTransition);
  yield* requestEvent[1].fill(eventCompleteColor, shortTransition);
  yield* all(
    requestEvent[1].size(0, shortTransition),
    thread().restore(shortTransition)
  );

  thread().save();
  yield* thread().absolutePosition(internalEvent[2].absolutePosition, shortTransition);
  yield* internalEvent[2].fill(eventCompleteColor, longTransition);
  yield* all(
    thread().restore(shortTransition),
    internalEvent[2].size(0, shortTransition)
  );

  yield* waitFor(longTransition);

  thread().save();
  yield* requestEvent[2].restore(shortTransition);
  yield* thread().absolutePosition(requestEvent[2].absolutePosition, shortTransition);
  yield* requestEvent[2].fill(eventCompleteColor, longTransition);
  yield* all(
    thread().restore(shortTransition),
    requestEvent[2].size(0, shortTransition)
  );



  yield* waitFor(longTransition * 2 );
});
