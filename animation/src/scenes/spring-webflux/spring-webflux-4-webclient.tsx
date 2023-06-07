import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt, Circle, Icon } from '@motion-canvas/2d/lib/components';
import { createRef, makeRef, useScene } from '@motion-canvas/core/lib/utils';
import { all, chain, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createSignal } from '@motion-canvas/core/lib/signals';

import "@motion-canvas/core/lib/types/Color"

export default makeScene2D(function* (view) {
  // project variables
  const longTransition = useScene().variables.get('transitionSpeed', 1)();
  const shortTransition = longTransition / 2;

  const springColor = '#5caa22';
  const boxColor = 'gray';

  const requestColor = '#8e524a';
  const requestCompleteColor = '#46a33c';
  
  const background = '#1f2934';

  // reusable styling
  const headingStyle = {
    fontWeight: 700,
    fontSize: 56,
    offsetY: -1,
    cache: true,
    fill: springColor,
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
    fill: requestColor
  }
  const eventLoopStyle = {
    width: 90,
    height: 50,
    lineWidth: 5,
    radius: 4,
    stroke: '#71a7da'
  }
  const arrowStyle = {
    lineWidth: 3,
    stroke: 'white',
    endArrow: true,
    arrowSize: 12
  }
  
  // references
  const spring = createRef<Rect>();
  const requestBox = createRef<Rect>();
  const service = createRef<Rect>();
  const client = createRef<Rect>();
  const clientArrow = createRef<Line>();
  const taskQueue = createRef<Rect>();
  const eventLoopGroup = createRef<Rect>();

  const eventLoops: Rect[] = [];
  const request = createRef<Rect>();
  const requestProcessing = createRef<Circle>();
  const requestWaiting = createRef<Icon>();

  // signals
  const requestArrowSignal = createSignal(0);
  const clientArrowSignal = createSignal(0);
  const eventLoopPosition = createSignal(Vector2.zero);


  view.fill(background)

  view.add(
    <>
      {/* Spring container */}
      <Rect
        ref={spring}
        width={'70%'}
        height={'70%'}
        lineWidth={10}
        stroke={springColor}
        radius={20}
      >
        <Txt text={'Spring WebFlux'} y={-350} {...headingStyle} />
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
      </Rect>

      {/* SocketChannel arrows */}
      <Line
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(requestArrowSignal() * 270),
        ]}
        x={-850}
        y={40}
        opacity={() => requestArrowSignal()}
      />


      {/* Incoming socket requests */}
      <Rect
        ref={requestBox}
        width={200}
        height={400}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={-450}
        y={40}
      >
        <Txt text={'Requests'} y={250} {...heading2Style} fill={boxColor} fontSize={32} fontWeight={700} />
        <Rect {...requestStyle} ref={request} x={0} y={0}>
          <Circle
            ref={requestProcessing}
            size={20}
            closed={false}
            startAngle={0}
            endAngle={270}
            lineWidth={6}
            stroke={'white'}
          />
          <Icon ref={requestWaiting}icon={'mdi:timer-sand'} color={'white'} size={40} />
        </Rect>
      </Rect>

      {/* Event Loop Group */}
      <Rect
        ref={eventLoopGroup}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#71a7da'}
        radius={16}
        x={-50}
        y={180}
      >
        <Txt {...heading2Style} textAlign='center' y={-60} fill={'#71a7da'} text='EventLoopGroup' />
        <Rect {...eventLoopStyle} x={-110} y={30} ref={makeRef(eventLoops, 0)}>
          <Circle size={30} fill={'#35475a'} x={43} y={23}>
            <Txt {...heading3Style} text={'1'} x={1} y={2} />
          </Circle>
        </Rect>
        <Rect {...eventLoopStyle} x={0} y={30} ref={makeRef(eventLoops, 1)}>
          <Circle size={30} fill={'#35475a'} x={43} y={23}>
            <Txt {...heading3Style} text={'2'} x={1} y={2} />
          </Circle>
        </Rect>
        <Rect {...eventLoopStyle} x={110} y={30} ref={makeRef(eventLoops, 2)}>
          <Circle size={30} fill={'#35475a'} x={43} y={23}>
            <Txt {...heading3Style} text={'3'} x={1} y={2} />
          </Circle>
        </Rect>
      </Rect>

      {/* Processing */}
      <Rect
        ref={service}
        width={250}
        height={150}
        lineWidth={5}
        stroke={'#4a8e6a'}
        radius={16}
        x={-50}
        y={-80}
      >
        <Txt {...heading2Style} textAlign='center' y={-40} fill={'#4a8e6a'} text={'GithubAccess'} />        
      </Rect>

      {/* Client */}
      <Rect
        ref={client}
        width={250}
        height={150}
        lineWidth={5}
        stroke={'#8e8372'}
        radius={16}
        x={400}
        y={-80}
      >
        <Txt {...heading2Style} textAlign='center' y={-40} fill={'#8e8372'} text={'WebClient'} />        
      </Rect>
      <Line
        ref={clientArrow}
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(clientArrowSignal() * 270),
        ]}
        x={500}
        y={-70}
        opacity={() => clientArrowSignal()}
      />

      {/* TakQueue */}
      <Rect
        ref={taskQueue}
        width={380}
        height={150}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={400}
        y={180}
      >
        <Txt {...heading2Style} textAlign='center' y={-40} fill={boxColor} text={'ScheduledTaskQueue'} />        
      </Rect>
      
    </>
  );

  // animation setup
  request().save();
  requestWaiting().save();
  eventLoops.forEach(eventLoop => eventLoop.save());
  

  yield* all(
    request().size(0, 0),
    requestBox().opacity(0, 0),
    requestProcessing().endAngle(0, 0),
    requestWaiting().size(0, 0),
    eventLoops[0].lineWidth(0, 0),
    eventLoops[1].lineWidth(0, 0),
    eventLoops[2].lineWidth(0, 0),
    eventLoops[0].opacity(0, 0),
    eventLoops[1].opacity(0, 0),
    eventLoops[2].opacity(0, 0),
    eventLoopGroup().opacity(0, 0),
    service().opacity(0, 0),
    client().opacity(0, 0),
    taskQueue().opacity(0, 0)
  );

  yield* waitFor(longTransition);

  // pop in
  yield* requestBox().opacity(1, shortTransition);
  yield* eventLoopGroup().opacity(1, shortTransition);
  yield* waitFor(shortTransition);
  
  yield* eventLoops[0].restore(shortTransition);
  yield* eventLoops[1].restore(shortTransition);
  yield* eventLoops[2].restore(shortTransition);
  yield* waitFor(shortTransition);

  yield* service().opacity(1, shortTransition);
  yield* waitFor(longTransition);
  

  // REQUEST 1 --------------------------------------------------------------------

  yield* requestArrowSignal(1, shortTransition);

  yield* all(
    request().radius(20, shortTransition),
    request().width(20, shortTransition),
    request().height(20, shortTransition)
  );

  // event loop takes over
  var request1Position = request().absolutePosition();
  eventLoops[0].save();
  yield* eventLoops[0].absolutePosition(request().absolutePosition, shortTransition);
  yield* request().restore(shortTransition);

  yield* all(
    eventLoops[0].absolutePosition(service().absolutePosition().addY(50), longTransition),
    request().absolutePosition(service().absolutePosition().addY(50), longTransition)
  );

  // initial request processing
  yield request().fill('#8e8372', longTransition * 3);
  yield client().opacity(1, shortTransition);
  for (let i=1; i<3; i++) {
    yield* requestProcessing().endAngle(330 * i, shortTransition);
    yield* requestProcessing().startAngle(330 * i, shortTransition);
  }

  // move to client
  yield* all(
    eventLoops[0].absolutePosition(client().absolutePosition().addY(50), longTransition),
    request().absolutePosition(client().absolutePosition().addY(50), longTransition),
  );
  yield all(
    request().fill('#3c7d57', longTransition * 3),
    eventLoops[0].restore(shortTransition),
    clientArrowSignal(1, shortTransition),
    requestWaiting().restore(shortTransition),
    taskQueue().opacity(1, shortTransition)
  );

  for (let i=1; i<3; i++) {
    yield* requestWaiting().rotation(360 * i, longTransition);
  }
  yield* chain(
    clientArrow().arrowSize(0, shortTransition),
    clientArrow().endArrow(false, 0),
    clientArrow().startArrow(true, 0),
    clientArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    clientArrowSignal(0, shortTransition),
    requestWaiting().size(0, shortTransition)
  );
  yield* request().absolutePosition(taskQueue().absolutePosition().addY(50), longTransition)

  // event loop takes back over
  eventLoops[2].save();
  yield* eventLoops[2].absolutePosition(request().absolutePosition, longTransition);
  yield* all(
    eventLoops[2].absolutePosition(service().absolutePosition().addY(50), longTransition),
    request().absolutePosition(service().absolutePosition().addY(50), longTransition)
  );

  // final request processing
  yield all(
    request().fill('#46a33c', longTransition * 3),
    client().opacity(1, shortTransition),
    requestProcessing().endAngle(0, 0),
    requestProcessing().startAngle(0, 0)
  );
  for (let i=1; i<4; i++) {
    yield* requestProcessing().endAngle(330 * i, shortTransition);
    yield* requestProcessing().startAngle(330 * i, shortTransition);
  }

  // return result
  yield* all(
    request().absolutePosition(request1Position, longTransition),
    eventLoops[2].absolutePosition(request1Position, longTransition)
  );
  yield* all(
    eventLoops[2].restore(shortTransition),
    request().position(new Vector2(-150, 0), shortTransition),
    request().size(0, shortTransition)
  );



  yield* waitFor(longTransition * 2);
});
