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
  const requests: Rect[] = [];
  const requestProcessing: Circle[] = [];
  const requestWaiting: Icon[] = [];

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
        
        <Rect {...requestStyle} ref={makeRef(requests, 0)} x={0} y={-100}>
          <Circle
            ref={makeRef(requestProcessing, 0)}
            size={20}
            closed={false}
            startAngle={0}
            endAngle={270}
            lineWidth={6}
            stroke={'white'}
          />
          <Icon ref={makeRef(requestWaiting, 0)} icon={'mdi:timer-sand'} color={'white'} size={40} />
        </Rect>
        <Rect {...requestStyle} ref={makeRef(requests, 1)} x={0} y={0}>
          <Circle
            ref={makeRef(requestProcessing, 1)}
            size={20}
            closed={false}
            startAngle={0}
            endAngle={270}
            lineWidth={6}
            stroke={'white'}
          />
          <Icon ref={makeRef(requestWaiting, 1)}icon={'mdi:timer-sand'} color={'white'} size={40} />
        </Rect>
        <Rect {...requestStyle} ref={makeRef(requests, 2)} x={0} y={100}>
          <Circle
            ref={makeRef(requestProcessing, 2)}
            size={20}
            closed={false}
            startAngle={0}
            endAngle={270}
            lineWidth={6}
            stroke={'white'}
          />
          <Icon ref={makeRef(requestWaiting, 2)}icon={'mdi:timer-sand'} color={'white'} size={40} />
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
        <Txt {...heading2Style} textAlign='center' y={-40} fill={'#4a8e6a'} text={'Service'} />        
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
        <Txt {...heading2Style} textAlign='center' y={-40} fill={'#8e8372'} text={'Client'} />        
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
  requests.forEach(request => request.save());
  eventLoops.forEach(eventLoop => eventLoop.save());
  requestWaiting.forEach(rw => rw.save())
  

  yield* all(
    requests[0].size(0, 0),
    requests[1].size(0, 0),
    requests[2].size(0, 0),
    requestBox().opacity(0, 0),
    requestProcessing[0].endAngle(0, 0),
    requestProcessing[1].endAngle(0, 0),
    requestProcessing[2].endAngle(0, 0),
    requestWaiting[0].size(0, 0),
    requestWaiting[1].size(0, 0),
    requestWaiting[2].size(0, 0),
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

  // REQUEST 3 Async --------------------------------------------------------------
  var request3Position = requests[2].absolutePosition();
  eventLoops[1].save();
  yield chain(
    waitFor(longTransition * 5),
    all(
      requests[2].radius(20, shortTransition),
      requests[2].width(20, shortTransition),
      requests[2].height(20, shortTransition)
    ),
    eventLoops[1].absolutePosition(requests[2].absolutePosition, shortTransition),
    requests[2].restore(shortTransition),
    all(
      eventLoops[1].absolutePosition(service().absolutePosition().addX(100).addY(50), longTransition),
      requests[2].absolutePosition(service().absolutePosition().addX(100).addY(50), longTransition)
    ),
    // processing
    all(
      requests[2].fill('#46a33c', longTransition * 3),
      chain(
        requestProcessing[2].endAngle(330 * 1, shortTransition),
        requestProcessing[2].startAngle(330 * 1, shortTransition),
        requestProcessing[2].endAngle(330 * 2, shortTransition),
        requestProcessing[2].startAngle(330 * 2, shortTransition),
        requestProcessing[2].endAngle(330 * 3, shortTransition),
        requestProcessing[2].startAngle(330 * 3, shortTransition),
      )
    ),
    // return result
    all(
      requests[2].absolutePosition(request3Position, longTransition),
      eventLoops[1].absolutePosition(request3Position, longTransition)
    ),
    all(
      eventLoops[1].position(new Vector2(0, 30), shortTransition),
      requests[2].position(new Vector2(-150, 100), shortTransition),
      requests[2].size(0, shortTransition)
    )
  );
  

  // REQUEST 1 --------------------------------------------------------------------

  yield* requestArrowSignal(1, shortTransition);

  yield* all(
    requests[0].radius(20, shortTransition),
    requests[0].width(20, shortTransition),
    requests[0].height(20, shortTransition)
  );

  // event loop takes over
  var request1Position = requests[0].absolutePosition();
  eventLoops[0].save();
  yield* eventLoops[0].absolutePosition(requests[0].absolutePosition, shortTransition);
  yield* requests[0].restore(shortTransition);

  yield* all(
    eventLoops[0].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition),
    requests[0].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition)
  );

  // initial request processing
  yield requests[0].fill('#8e8372', longTransition * 3);
  yield client().opacity(1, shortTransition);
  for (let i=1; i<4; i++) {
    yield* requestProcessing[0].endAngle(330 * i, shortTransition);
    yield* requestProcessing[0].startAngle(330 * i, shortTransition);
  }

  // move to client
  yield* all(
    eventLoops[0].absolutePosition(client().absolutePosition().addY(50), longTransition),
    requests[0].absolutePosition(client().absolutePosition().addY(50), longTransition),
    requests[1].radius(20, shortTransition),
    requests[1].width(20, shortTransition),
    requests[1].height(20, shortTransition)
  );
  var request2Position = requests[1].absolutePosition();
  yield requests[0].fill('#3c7d57', longTransition * 6),
  yield chain(
    all(
      clientArrowSignal(1, shortTransition),
      requestWaiting[0].restore(shortTransition),
      eventLoops[0].restore(longTransition),
      taskQueue().opacity(1, shortTransition)
    ),
    // START: process another request ------------------------------
    eventLoops[0].absolutePosition(requests[1].absolutePosition, shortTransition),
    requests[1].restore(shortTransition),
    all(
      eventLoops[0].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition),
      requests[1].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition)
    ),
    // processing
    all(
      requests[1].fill('#46a33c', longTransition * 2),
      chain(
        requestProcessing[1].endAngle(330 * 1, shortTransition),
        requestProcessing[1].startAngle(330 * 1, shortTransition),
        requestProcessing[1].endAngle(330 * 2, shortTransition),
        requestProcessing[1].startAngle(330 * 2, shortTransition)
      )
    ),
    // return result
    all(
      requests[1].absolutePosition(request2Position, longTransition),
      eventLoops[0].absolutePosition(request2Position, longTransition)
    ),
    all(
      eventLoops[0].position(new Vector2(-110, 30), shortTransition),
      requests[1].position(new Vector2(-150, 0), shortTransition),
      requests[1].size(0, shortTransition)
    )
    // END: process another request ------------------------------
  );

  for (let i=1; i<7; i++) {
    yield* requestWaiting[0].rotation(360 * i, longTransition);
  }
  yield* chain(
    clientArrow().arrowSize(0, shortTransition),
    clientArrow().endArrow(false, 0),
    clientArrow().startArrow(true, 0),
    clientArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    clientArrowSignal(0, shortTransition),
    requestWaiting[0].size(0, shortTransition)
  );
  yield* requests[0].absolutePosition(taskQueue().absolutePosition().addY(50), longTransition)

  // event loop takes back over
  eventLoops[2].save();
  yield* eventLoops[2].absolutePosition(requests[0].absolutePosition, longTransition);
  yield* all(
    eventLoops[2].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition),
    requests[0].absolutePosition(service().absolutePosition().addX(-100).addY(50), longTransition)
  );

  // final request processing
  yield all(
    requests[0].fill('#46a33c', longTransition * 3),
    client().opacity(1, shortTransition),
    requestProcessing[0].endAngle(0, 0),
    requestProcessing[0].startAngle(0, 0)
  );
  for (let i=1; i<4; i++) {
    yield* requestProcessing[0].endAngle(330 * i, shortTransition);
    yield* requestProcessing[0].startAngle(330 * i, shortTransition);
  }

  // return result
  yield* all(
    requests[0].absolutePosition(request1Position, longTransition),
    eventLoops[2].absolutePosition(request1Position, longTransition)
  );
  yield* all(
    eventLoops[2].restore(shortTransition),
    requests[0].position(new Vector2(-150, -100), shortTransition),
    requests[0].size(0, shortTransition)
  );



  yield* waitFor(longTransition * 2);
});
