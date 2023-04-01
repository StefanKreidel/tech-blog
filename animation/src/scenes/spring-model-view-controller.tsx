import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt, Shape, Circle } from '@motion-canvas/2d/lib/components';
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
  const modelViewStyle = {
    width: 160,
    height: 80,
    radius: 8,
    fill: 'black'
  }
  const arrowStyle = {
    lineWidth: 3,
    stroke: 'white',
    endArrow: true,
    arrowSize: 12
  }
  
  // references
  const spring = createRef<Rect>();
  const tomcat = createRef<Rect>();
  const dispatcher = createRef<Rect>();
  const controller = createRef<Rect>();
  const viewResolver = createRef<Rect>();
  const viewResponse = createRef<Rect>();
  const viewResponseText = createRef<Txt>();
  const viewRenderer = createRef<Rect>();
  const requestProcessing = createRef<Circle>();
  const heroConnectionArrow = createRef<Line>();
  const viewResolverArrow = createRef<Line>();
  const heroRequest = createRef<Rect>();
  const heroRequestText = createRef<Txt>();
  const connections = createRef<Rect>();
  const connectionsText = createRef<Txt>();
  const requests = createRef<Rect>();
  const requestsText = createRef<Txt>();

  // signals
  const connectionArrowSignal = createSignal(0);
  const viewResolverArrowSignal = createSignal(0);



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
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
      </Rect>

      {/* Connection arrows */}
      <Line
        ref={heroConnectionArrow}
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(connectionArrowSignal() * 270),
        ]}
        x={-850}
        y={30}
        opacity={() => connectionArrowSignal()}
      />

      {/* Hero Request */}
      <Rect {...requestStyle} x={-440} y={30} ref={heroRequest}>
        <Circle
          ref={requestProcessing}
          size={20}
          closed={false}
          startAngle={0}
          endAngle={270}
          lineWidth={6}
          stroke={'white'}
        />
        <Txt {...heading3Style} text={'Model'} ref={heroRequestText} />
      </Rect>

      {/* Tomcat container */}
      <Rect
        ref={tomcat}
        width={500}
        height={600}
        lineWidth={5}
        stroke={undertowColor}
        radius={16}
        x={-370}
        y={40}
      >
        <Txt text={'Tomcat'} y={-250} {...heading2Style} fill={undertowColor} fontSize={40} fontWeight={700} />

        {/* Connections and requests */}
        <Rect
          ref={connections}
          width={300}
          height={50}
          x={-170}
          fill={connectionColor}
          radius={12}
          rotation={-90}
        >
          <Txt {...heading3Style} ref={connectionsText} text={'Connections'} />
        </Rect>

        <Rect
          ref={requests}
          width={300}
          height={50}
          x={-70}
          fill={requestColor}
          radius={12}
          rotation={-90}
        >
          <Txt {...heading3Style} ref={requestsText} text={'Requests'} />
        </Rect>

        {/* Dispatcher Servlet */}
        <Rect
          ref={dispatcher}
          width={200}
          height={300}
          lineWidth={5}
          stroke={'#71a7da'}
          radius={16}
          x={120}
        >
          <Txt {...heading2Style} textAlign='center' y={-80} fill={'#71a7da'} text='Dispatcher 
          Servlet' />
        </Rect>
      </Rect>

      {/* Controller */}
      <Rect
        ref={controller}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#4a8e6a'}
        radius={16}
        x={430}
        y={-220}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#4a8e6a'} text='Controller' />
      </Rect>

      {/* View Resolver */}
      <Line
        ref={viewResolverArrow}
        {...arrowStyle}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(viewResolverArrowSignal() * 380),
        ]}
        x={-140}
        y={30}
        opacity={() => viewResolverArrowSignal()}
      />
      <Rect
        ref={viewResolver}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#7a858f'}
        radius={16}
        x={430}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#7a858f'} text='View Resolver' />
        <Rect {...modelViewStyle} ref={viewResponse} y={25} fill={'#7a858f'}>
          <Txt {...heading3Style} ref={viewResponseText} text={'View'} />
        </Rect>
      </Rect>

      {/* Renderer */}
      <Rect
        ref={viewRenderer}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#8e8372'}
        radius={16}
        x={430}
        y={220}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#8e8372'} text='View Renderer' />
      </Rect>
    </>
  );

  // animation setup
  connections().save();
  connectionsText().save();
  requests().save();
  requestsText().save();
  heroRequest().save();
  heroRequestText().save();
  viewResponse().save();
  viewResponseText().save();

  yield* all(
    tomcat().opacity(0, 0),
    connections().size(0, 0),
    connectionsText().fontSize(0, 0),
    requests().size(0, 0),
    requestsText().fontSize(0, 0),
    dispatcher().opacity(0, 0),
    heroRequest().size(0, 0),
    requestProcessing().endAngle(0, 0),
    heroRequestText().fontSize(0, 0),
    viewResponseText().fontSize(0, 0),
    viewResponse().size(0, 0),
    controller().opacity(0, 0),
    viewResolver().opacity(0, 0),
    viewRenderer().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // pop in
  yield* tomcat().opacity(1, shortTransition);
  yield* connectionArrowSignal(1, shortTransition);
  yield* all(
    connections().restore(shortTransition),
    connectionsText().restore(shortTransition)
  );
  yield* all(
    requests().restore(shortTransition),
    requestsText().restore(shortTransition)
  );
  yield* dispatcher().opacity(1, shortTransition);

  yield* waitFor(longTransition);
  

  // dispatch to controller
  yield* all(
    heroRequest().restore(shortTransition),
    heroRequest().absolutePosition(dispatcher().absolutePosition, shortTransition),
    heroRequest().position.y(80, shortTransition)
  );

  yield* waitFor(shortTransition);
  yield* controller().opacity(1, shortTransition);
  yield* waitFor(shortTransition);

  yield* all(
    heroRequest().absolutePosition(controller().absolutePosition, longTransition),
    heroRequest().position.y(-195, longTransition)
  );
  yield* waitFor(shortTransition);

  yield all(
    heroRequest().fill('4a8e6a', longTransition * 3),
    heroRequest().width(modelViewStyle.width, longTransition * 3),
    heroRequest().height(modelViewStyle.height, longTransition * 3)
  );
  for (let i=1; i<4; i++) {
    yield* requestProcessing().endAngle(330 * i, shortTransition);
    yield* requestProcessing().startAngle(330 * i, shortTransition);
  }
  yield* heroRequestText().restore(shortTransition);
  yield* waitFor(longTransition);

  yield* all(
    heroRequest().absolutePosition(dispatcher().absolutePosition, longTransition),
    heroRequest().position.y(45, longTransition)
  );
  yield* waitFor(longTransition);

  // dispatch to view resolver
  yield* chain(
    viewResolver().opacity(1, shortTransition),
    viewResolverArrowSignal(1, shortTransition),
    all(
      viewResponse().restore(shortTransition),
      viewResponseText().restore(shortTransition)
    )
  );
  yield* chain(
    viewResolverArrow().arrowSize(0, shortTransition),
    viewResolverArrow().endArrow(false, 0),
    viewResolverArrow().startArrow(true, 0),
    viewResolverArrow().arrowSize(12, shortTransition),
  );

  yield* all(
    viewResolverArrowSignal(0, longTransition),
    viewResponse().absolutePosition(dispatcher().absolutePosition, longTransition),
    viewResponse().position.y(135, longTransition)
  );
  yield* waitFor(longTransition);

  // dispatch to renderer
  yield* chain(
    viewRenderer().opacity(1, shortTransition),
    viewResponse().position(new Vector2(80, 250), longTransition),
    heroRequest().position(new Vector2(350, 250), longTransition)
  );
  yield* waitFor(shortTransition);
  yield* all(
    heroRequest().position.x(430, longTransition),
    viewResponse().position.x(0, longTransition),
    viewResponse().fill('#8e8372', longTransition)
  );
  yield* all(
    heroRequest().opacity(0, shortTransition),
    waitFor(longTransition)
  );

  // send response
  yield* all(
    viewResponse().absolutePosition(dispatcher().absolutePosition, longTransition),
    viewResponse().position.y(80, longTransition)
  );
  yield* waitFor(shortTransition);

  yield* chain(
    heroConnectionArrow().arrowSize(0, shortTransition),
    heroConnectionArrow().endArrow(false, 0),
    heroConnectionArrow().startArrow(true, 0),
    heroConnectionArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    viewResponse().size(0, longTransition),
    viewResponseText().fontSize(0, longTransition),
    connectionArrowSignal(0, longTransition)
  )



  yield* waitFor(longTransition * 2);
});
