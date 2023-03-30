import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt, Shape, Circle } from '@motion-canvas/2d/lib/components';
import { createRef, makeRef, useScene } from '@motion-canvas/core/lib/utils';
import { all, chain, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import "@motion-canvas/core/lib/types/Color"
import { createSignal, SimpleSignal } from '@motion-canvas/core/lib/signals';

export default makeScene2D(function* (view) {
  // project variables
  const longTransition = useScene().variables.get('transitionSpeed', 1)();
  const shortTransition = longTransition / 2;

  const springColor = '#5caa22';
  const undertowColor = '#4a6d8e';

  const connectionColor = '#8e744a';
  const requestColor = '#8e524a';
  
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
  const connectionStyle = {
    width: 80,
    height: 40,
    radius: 8,
    fill: connectionColor
  }
  const requestStyle = {
    width: 80,
    height: 40,
    radius: 8,
    fill: requestColor
  }
  const arrowLineWidth = 3;
  
  // references
  const spring = createRef<Rect>();
  const tomcat = createRef<Rect>();
  const dispatcher = createRef<Rect>();
  const processor = createRef<Rect>();
  const requestProcessing = createRef<Circle>();
  const connectionShape = createRef<Shape>();
  const requestsShape = createRef<Shape>();
  const connectionEnum = createRef<Txt>();
  const requestEnum = createRef<Txt>();
  const heroConnectionArrow = createRef<Line>();
  const connections: Rect[] = [];
  const requests: Rect[] = [];

  // signals
  const connectionArrowSignals = [
    createSignal(0),
    createSignal(0),
    createSignal(0)
  ];
  const requestArrowSignals = [
    createSignal(0),
    createSignal(0),
    createSignal(0)
  ];


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
        <Txt text={'Spring'} y={-350} {...headingStyle} />
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} />
      </Rect>

      {/* Connection arrows */}
      <Line
        points={[
          Vector2.zero,
          () => Vector2.right.scale(connectionArrowSignals[0]() * 300),
        ]}
        x={-850}
        y={-30}
        lineWidth={arrowLineWidth}
        lineDash={[20, 20]}
        stroke={'white'}
        endArrow
        arrowSize={12}
        opacity={() => connectionArrowSignals[0]()}
      />
      <Line
        ref={heroConnectionArrow}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(connectionArrowSignals[1]() * 300),
        ]}
        x={-850}
        y={30}
        lineWidth={arrowLineWidth}
        lineDash={[20, 20]}
        stroke={'white'}
        endArrow
        arrowSize={12}
        opacity={() => connectionArrowSignals[1]()}
      />
      <Line
        points={[
          Vector2.zero,
          () => Vector2.right.scale(connectionArrowSignals[2]() * 300),
        ]}
        x={-850}
        y={150}
        lineWidth={arrowLineWidth}
        lineDash={[20, 20]}
        stroke={'white'}
        endArrow
        arrowSize={12}
        opacity={() => connectionArrowSignals[2]()}
      />

      {/* Tomcat container */}
      <Rect
        ref={tomcat}
        width={800}
        height={600}
        lineWidth={5}
        stroke={undertowColor}
        radius={16}
        x={-220}
        y={40}
      >
        <Txt text={'Tomcat'} y={-250} {...heading2Style} fill={undertowColor} fontSize={40} fontWeight={700} />

        {/* Connections */}
        <Shape ref={connectionShape} x={-280}>
          <Txt {...heading2Style}            y={-180} text={'Connections'} />
          <Txt {...heading2Style}    x={-70} y={-130} text={'['} />
          <Rect {...connectionStyle} x={10}  y={-70} ref={makeRef(connections, 0)} />
          <Rect {...connectionStyle} x={10}  y={-10} ref={makeRef(connections, 1)} />
          <Txt {...heading2Style}    x={10}  y={45} text={'...'} ref={connectionEnum} />
          <Rect {...connectionStyle} x={10}  y={110} ref={makeRef(connections, 2)} />
          <Txt {...heading2Style}    x={-70} y={180} text={']'} />
        </Shape>

        <Line
          points={[
            Vector2.zero,
            () => new Vector2(1, 0.37).scale(requestArrowSignals[0]() * 160),
          ]}
          x={-200}
          y={-70}
          lineWidth={arrowLineWidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={() => requestArrowSignals[0]()}
        />
        <Line
          points={[
            Vector2.zero,
            () => new Vector2(1, -0.37).scale(requestArrowSignals[1]() * 160),
          ]}
          x={-200}
          y={-10}
          lineWidth={arrowLineWidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={() => requestArrowSignals[1]()}
        />
        <Line
          points={[
            Vector2.zero,
            () => Vector2.right.scale(requestArrowSignals[2]() * 160),
          ]}
          x={-200}
          y={110}
          lineWidth={arrowLineWidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={() => requestArrowSignals[2]()}
        />

        {/* Requests */}
        <Shape ref={requestsShape} x={-20}>
          <Txt {...heading2Style}         y={-180} text={'Requests'} />
          <Txt {...heading2Style} x={-40} y={-130} text={'['} />
          <Rect {...requestStyle} x={40}  y={-70} ref={makeRef(requests, 0)}>
            <Circle
              ref={requestProcessing}
              size={20}
              closed={false}
              startAngle={0}
              endAngle={270}
              lineWidth={6}
              stroke={'white'}
            />
          </Rect>
          <Rect {...requestStyle} x={40}  y={-10} ref={makeRef(requests, 1)} />
          <Txt {...heading2Style} x={40}  y={45} text={'...'} ref={requestEnum} />
          <Rect {...requestStyle} x={40}  y={110} ref={makeRef(requests, 2)} />
          <Txt {...heading2Style} x={-40} y={180} text={']'} />
        </Shape>

        <Rect
          ref={dispatcher}
          width={200}
          height={200}
          lineWidth={5}
          stroke={'#71a7da'}
          radius={16}
          x={270}
        >
          <Txt {...heading2Style} textAlign='center' y={-30} fill={'#71a7da'} text='Dispatcher 
          Servlet' />
        </Rect>
      </Rect>

      <Rect
        ref={processor}
        width={350}
        height={300}
        lineWidth={5}
        stroke={'#4a8e6a'}
        radius={16}
        x={430}
      >
        <Txt {...heading2Style} textAlign='center' y={-70} fill={'#4a8e6a'} text='Business Logic
        Processing' />
      </Rect>
    </>
  );

  // animation setup
  connections.forEach(connection => connection.save());
  requests.forEach(request => request.save());

  yield* all(
    tomcat().opacity(0, 0),
    connections[0].size(0, 0),
    connections[1].size(0, 0),
    connections[2].size(0, 0),
    connectionEnum().opacity(0, 0),
    requests[0].size(0, 0),
    requests[1].size(0, 0),
    requests[2].size(0, 0),
    requestEnum().opacity(0, 0),
    requestProcessing().startAngle(0, 0),
    requestProcessing().endAngle(0, 0),
    connectionShape().opacity(0, 0),
    requestsShape().opacity(0, 0),
    dispatcher().opacity(0, 0),
    processor().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // pop in
  yield* chain(
    tomcat().opacity(1, shortTransition),
    connectionShape().opacity(1, shortTransition)
  );

  yield* waitFor(shortTransition);

  yield* chain(
    connectionArrowSignals[0](1, shortTransition),
    connections[0].restore(shortTransition),
    connectionArrowSignals[1](1, shortTransition),
    connections[1].restore(shortTransition),
    connectionEnum().opacity(1, shortTransition),
    connectionArrowSignals[2](1, shortTransition),
    connections[2].restore(shortTransition),
  );

  yield* chain(
    waitFor(shortTransition),
    requestsShape().opacity(1, shortTransition),
    waitFor(shortTransition)
  );

  yield* chain(
    requestArrowSignals[1](1, shortTransition),
    requests[0].restore(shortTransition),
    requestArrowSignals[0](1, shortTransition),
    requests[1].restore(shortTransition),
    requestEnum().opacity(1, shortTransition),
    requestArrowSignals[2](1, shortTransition),
    requests[2].restore(shortTransition),
  );

  yield* chain(
    waitFor(shortTransition),
    dispatcher().opacity(1, longTransition),
    processor().opacity(1, longTransition),
    waitFor(shortTransition)
  )


  // dispatch single request
  const heroRequest = requests[0];
  yield* chain(
    heroRequest.fill('#da7e71', shortTransition),
    waitFor(shortTransition),
    all(
      heroRequest.absolutePosition(dispatcher().absolutePosition, shortTransition),
      heroRequest.position.y(50, shortTransition),
      requestArrowSignals[1](0, shortTransition)
    ),
    waitFor(shortTransition)
  )

  // process single request
  yield* all(
    heroRequest.absolutePosition(processor().absolutePosition, shortTransition),
    heroRequest.position.y(15, shortTransition)
  );

  yield heroRequest.fill('#46a33c', longTransition * 3);
  for (let i=1; i<4; i++) {
    yield* requestProcessing().endAngle(330 * i, shortTransition);
    yield* requestProcessing().startAngle(330 * i, shortTransition);
  }
  yield* waitFor(shortTransition);


  // send response
  yield* heroRequest.absolutePosition(connections[1].absolutePosition, longTransition);
  yield* waitFor(shortTransition);

  yield* chain(
    heroConnectionArrow().arrowSize(0, shortTransition),
    heroConnectionArrow().endArrow(false, 0),
    heroConnectionArrow().startArrow(true, 0),
    heroConnectionArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    heroRequest.size(0, longTransition),
    connections[1].size(0, longTransition),
    connectionArrowSignals[1](0, longTransition)
  )


  yield* waitFor(longTransition * 2);
});
