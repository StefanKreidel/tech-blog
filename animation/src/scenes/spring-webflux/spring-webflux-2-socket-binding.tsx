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
  const socketChannels = createRef<Rect>();
  const eventProcessing = createRef<Rect>();
  const eventLoopGroup = createRef<Rect>();

  const eventLoops: Rect[] = [];
  const socket1Requests: Rect[] = [];
  const sockets: Rect[] = [];
  const socket2Request = createRef<Rect>();

  // signals
  const socketChannelArrowSignals = [
    createSignal(0),
    createSignal(0),
    createSignal(0)
  ];
  const eventLoopPosition = createSignal(Vector2.zero)


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
          () => Vector2.right.scale(socketChannelArrowSignals[0]() * 270),
        ]}
        x={-850}
        y={-60}
        opacity={() => socketChannelArrowSignals[0]()}
      />
      <Line
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(socketChannelArrowSignals[1]() * 270),
        ]}
        x={-850}
        y={40}
        opacity={() => socketChannelArrowSignals[1]()}
      />
      <Line
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(socketChannelArrowSignals[2]() * 270),
        ]}
        x={-850}
        y={140}
        opacity={() => socketChannelArrowSignals[2]()}
      />


      {/* Incoming socket requests */}
      <Rect
        ref={socketChannels}
        width={300}
        height={400}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={-420}
        y={40}
      >
        <Txt text={'Socket Channels'} y={250} {...heading2Style} fill={boxColor} fontSize={32} fontWeight={700} />
        
        <Rect ref={makeRef(sockets, 0)}>
          <Txt {...heading2Style} x={-110} y={-100} text={'['} />
          <Rect {...requestStyle} ref={makeRef(socket1Requests, 0)} x={-50} y={-100} />
          <Rect {...requestStyle} ref={makeRef(socket1Requests, 1)} x={0} y={-100} />
          <Rect {...requestStyle} ref={makeRef(socket1Requests, 2)} x={50} y={-100} />
          <Txt {...heading2Style} x={110} y={-100} text={']'} />
          <Txt {...heading3Style} x={125} y={-80} text={'1'} />
        </Rect>

        <Rect ref={makeRef(sockets, 1)}>
          <Txt {...heading2Style} x={-110} y={0} text={'['} />
          <Rect {...requestStyle} ref={socket2Request} x={-50} y={0} />
          <Txt {...heading2Style} x={110} y={0} text={']'} />
          <Txt {...heading3Style} x={125} y={20} text={'2'} />
        </Rect>

        <Rect ref={makeRef(sockets, 2)}>
          <Txt {...heading2Style} x={-110} y={100} text={'['} />
          <Txt {...heading2Style} x={110} y={100} text={']'} />
          <Txt {...heading3Style} x={125} y={120} text={'3'} />
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
        y={40}
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
        ref={eventProcessing}
        width={300}
        height={400}
        lineWidth={5}
        stroke={boxColor}
        radius={16}
        x={420}
        y={40}
      >
        <Txt text={'Processing'} y={250} {...heading2Style} fill={boxColor} fontSize={32} fontWeight={700} />        
      </Rect>
      
    </>
  );

  // animation setup
  socket1Requests.forEach(request => request.save());
  socket2Request().save();
  eventLoops.forEach(eventLoop => eventLoop.save());
  

  yield* all(
    socket1Requests[0].size(0, 0),
    socket1Requests[1].size(0, 0),
    socket1Requests[2].size(0, 0),
    socket2Request().size(0, 0),
    sockets[0].opacity(0, 0),
    sockets[1].opacity(0, 0),
    sockets[2].opacity(0, 0),
    socketChannels().opacity(0, 0),
    eventLoops[0].lineWidth(0, 0),
    eventLoops[1].lineWidth(0, 0),
    eventLoops[2].lineWidth(0, 0),
    eventLoops[0].opacity(0, 0),
    eventLoops[1].opacity(0, 0),
    eventLoops[2].opacity(0, 0),
    eventLoopGroup().opacity(0, 0),
    eventProcessing().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // pop in
  yield* socketChannels().opacity(1, shortTransition);
  yield* eventLoopGroup().opacity(1, shortTransition);
  yield* waitFor(shortTransition);

  yield* socketChannelArrowSignals[0](1, shortTransition);
  yield* sockets[0].opacity(1, shortTransition);
  yield* socketChannelArrowSignals[1](1, shortTransition);
  yield* sockets[1].opacity(1, shortTransition);
  yield* socketChannelArrowSignals[2](1, shortTransition);
  yield* sockets[2].opacity(1, shortTransition);
  yield* waitFor(shortTransition);

  yield* eventLoops[0].restore(shortTransition);
  yield* eventLoops[1].restore(shortTransition);
  yield* eventLoops[2].restore(shortTransition);
  yield* waitFor(longTransition);


  // handle socket-channel 2 --------------------------------------------------------------
  const socket2Position = socket2Request().absolutePosition();
  eventLoops[1].save();
  yield chain(
    waitFor(longTransition * 6),
    // request pops in
    all(
      socket2Request().radius(20, shortTransition),
      socket2Request().width(20, shortTransition),
      socket2Request().height(20, shortTransition)
    ),
    // event loop takes over
    eventLoops[1].absolutePosition(socket2Request().absolutePosition, shortTransition),
    socket2Request().restore(shortTransition),
    // event is processed
    all(
      eventProcessing().opacity(1, longTransition),
      eventLoops[1].absolutePosition(eventProcessing().absolutePosition, longTransition),
      socket2Request().absolutePosition(eventProcessing().absolutePosition, longTransition)
    ),
    socket2Request().fill(requestCompleteColor, longTransition * 3),
    // response is returned
    all(
      eventLoops[1].absolutePosition(socket2Position, longTransition),
      socket2Request().absolutePosition(socket2Position, longTransition)
    ),
    all(
      eventLoops[1].position(new Vector2(0, 30), shortTransition),
      socket2Request().position(new Vector2(-150, 0), shortTransition),
      socket2Request().size(0, shortTransition)
    )
  );


  // handle socket-channel 1 --------------------------------------------------------------
  // REQUEST 1
  yield* all(
    socket1Requests[0].radius(20, shortTransition),
    socket1Requests[0].width(20, shortTransition),
    socket1Requests[0].height(20, shortTransition)
  );

  // event loop takes over
  var socket1Position = socket1Requests[0].absolutePosition();
  eventLoops[0].save();
  yield* eventLoops[0].absolutePosition(socket1Requests[0].absolutePosition, shortTransition);
  yield* socket1Requests[0].restore(shortTransition);
  
  // event is processed
  yield* all(
    eventProcessing().opacity(1, longTransition),
    eventLoops[0].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition),
    socket1Requests[0].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition)
  );
  yield socket1Requests[0].fill(requestCompleteColor, longTransition * 7);
  
  // next requests pops in
  yield* waitFor(longTransition * 1);
  yield* all(
    socket1Requests[1].radius(20, shortTransition),
    socket1Requests[1].width(20, shortTransition),
    socket1Requests[1].height(20, shortTransition)
  );
  yield* waitFor(longTransition * 3)
  yield* all(
    socket1Requests[2].radius(20, shortTransition),
    socket1Requests[2].width(20, shortTransition),
    socket1Requests[2].height(20, shortTransition)
  );
  yield* waitFor(longTransition * 2)

  // response is returned
  yield* all(
    eventLoops[0].absolutePosition(socket1Position, longTransition),
    socket1Requests[0].absolutePosition(socket1Position, longTransition)
  );
  yield* all(
    eventLoops[0].restore(shortTransition),
    socket1Requests[0].position(new Vector2(-150, -100), shortTransition),
    socket1Requests[0].size(0, shortTransition)
  );


  // REQUEST 2
  // event loop takes over
  socket1Position = socket1Requests[1].absolutePosition();
  eventLoops[0].save();
  yield* eventLoops[0].absolutePosition(socket1Requests[1].absolutePosition, shortTransition);
  yield* socket1Requests[1].restore(shortTransition);
  
  // event is processed
  yield* all(
    eventLoops[0].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition),
    socket1Requests[1].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition)
  );
  yield* socket1Requests[1].fill(requestCompleteColor, longTransition * 2);

  // response is returned
  yield* all(
    eventLoops[0].absolutePosition(socket1Position, longTransition),
    socket1Requests[1].absolutePosition(socket1Position, longTransition)
  );
  yield* all(
    eventLoops[0].restore(shortTransition),
    socket1Requests[1].position(new Vector2(-150, -100), shortTransition),
    socket1Requests[1].size(0, shortTransition)
  );


  // REQUEST 3
  // event loop takes over
  socket1Position = socket1Requests[2].absolutePosition();
  eventLoops[0].save();
  yield* eventLoops[0].absolutePosition(socket1Requests[2].absolutePosition, shortTransition);
  yield* socket1Requests[2].restore(shortTransition);
  
  // event is processed
  yield* all(
    eventLoops[0].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition),
    socket1Requests[2].absolutePosition(eventProcessing().absolutePosition().addY(-200), longTransition)
  );
  yield* socket1Requests[2].fill(requestCompleteColor, longTransition * 1);

  // response is returned
  yield* all(
    eventLoops[0].absolutePosition(socket1Position, longTransition),
    socket1Requests[2].absolutePosition(socket1Position, longTransition)
  );
  yield* all(
    eventLoops[0].restore(shortTransition),
    socket1Requests[2].position(new Vector2(-150, -100), shortTransition),
    socket1Requests[2].size(0, shortTransition)
  );




  yield* waitFor(longTransition * 2);
});
