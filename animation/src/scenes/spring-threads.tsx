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
  const threadStyle = {
    width: 90,
    height: 50,
    lineWidth: 5,
    radius: 4,
    stroke: '#7a858f'
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
  const requestProcessing = createRef<Circle>();
  const requestWaiting = createRef<Icon>();
  const heroConnectionArrow = createRef<Line>();
  const heroRequest = createRef<Rect>();
  const connections = createRef<Rect>();
  const connectionsText = createRef<Txt>();
  const requests = createRef<Rect>();
  const requestsText = createRef<Txt>();
  const threadPoolExecutor = createRef<Rect>();
  const userService = createRef<Rect>();
  const greetService = createRef<Rect>();
  const database = createRef<Icon>();
  const databaseArrow = createRef<Line>();
  const threads: Rect[] = [];

  // signals
  const connectionArrowSignal = createSignal(0);
  const databaseArrowSignal = createSignal(0);
  const heroPosition = createSignal(new Vector2(-440, 30))


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
        <Icon ref={requestWaiting} icon={'mdi:timer-sand'} color={'white'} size={40} />
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

      {/* Controller and Beans */}
      <Rect
        ref={controller}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#4a8e6a'}
        radius={16}
        x={100}
        y={-120}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#4a8e6a'} text='GreetController' />
      </Rect>
      <Rect
        ref={userService}
        width={250}
        height={120}
        lineWidth={5}
        stroke={'#8e8372'}
        radius={16}
        x={480}
        y={-200}
      >
        <Txt {...heading2Style} textAlign='center' y={-25} fill={'#8e8372'} text='UserService' />
      </Rect>
      <Rect
        ref={greetService}
        width={250}
        height={120}
        lineWidth={5}
        stroke={'#8e8372'}
        radius={16}
        x={480}
        y={-40}
      >
        <Txt {...heading2Style} textAlign='center' y={-25} fill={'#8e8372'} text='GreetService' />
      </Rect>

      {/* ThreadPoolExecutor */}
      <Rect
        ref={threadPoolExecutor}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#7a858f'}
        radius={16}
        x={100}
        y={200}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#7a858f'} text='ThreadPoolExecutor' />
        <Txt {...heading2Style} x={-150} y={30} text={'['} />
        <Rect {...threadStyle} x={-80} y={30} ref={makeRef(threads, 0)} />
        <Txt {...heading2Style} y={30} text={'...'} />
        <Rect {...threadStyle} x={80} y={30} ref={makeRef(threads, 1)} />
        <Txt {...heading2Style} x={150} y={30} text={']'} />
      </Rect>

      {/* Database */}
      <Line
        ref={databaseArrow}
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => Vector2.right.scale(databaseArrowSignal() * 130),
        ]}
        x={620}
        y={-200}
        opacity={() => databaseArrowSignal()}
      />
      <Icon
        ref={database}
        icon={'fluent:database-20-regular'}
        size={180}
        x={820}
        y={-200}
        color={'gray'}
      />
      
    </>
  );

  // animation setup
  threads.forEach(thread => thread.save());

  connections().save();
  connectionsText().save();
  requests().save();
  requestsText().save();
  heroRequest().save();
  requestWaiting().save();

  yield* all(
    tomcat().opacity(0, 0),
    connections().size(0, 0),
    connectionsText().fontSize(0, 0),
    requests().size(0, 0),
    requestsText().fontSize(0, 0),
    dispatcher().opacity(0, 0),
    heroRequest().size(0, 0),
    requestProcessing().endAngle(0, 0),
    requestWaiting().size(0, 0),
    controller().opacity(0, 0),
    userService().opacity(0, 0),
    greetService().opacity(0, 0),
    database().opacity(0, 0),
    threads[0].lineWidth(0, 0),
    threads[1].lineWidth(0, 0),
    threadPoolExecutor().opacity(0, 0)
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

  yield* controller().opacity(1, shortTransition);
  yield* chain(
    threadPoolExecutor().opacity(1, shortTransition),
    threads[0].restore(shortTransition),
    threads[1].restore(shortTransition)
  );

  yield* waitFor(longTransition);


  // thread handles request
  const heroThread = threads[0];
  heroThread.save();
  heroPosition(dispatcher().absolutePosition().addY(40));
  yield* all(
    heroRequest().restore(longTransition),
    heroRequest().absolutePosition(heroPosition, longTransition),
    heroThread.absolutePosition(heroPosition, longTransition),
  );
  yield* waitFor(shortTransition);


  // dispatch to controller
  yield* heroPosition(controller().absolutePosition().addY(20), longTransition);
  yield* waitFor(shortTransition);
  yield* all(
    userService().opacity(1, shortTransition),
    database().opacity(1, shortTransition)
  );
  yield* greetService().opacity(1, shortTransition);
  yield* waitFor(shortTransition);


  // process at user service
  yield* heroPosition(userService().absolutePosition().addY(20), longTransition);
  yield* all(
    requestWaiting().restore(shortTransition),
    databaseArrowSignal(1, shortTransition)
  );
  yield heroRequest().fill('#8e8372', longTransition * 2);
  for (let i=1; i<3; i++) {
    yield* requestWaiting().rotation(360 * i, longTransition);
  }
  yield* chain(
    databaseArrow().arrowSize(0, shortTransition),
    databaseArrow().endArrow(false, 0),
    databaseArrow().startArrow(true, 0),
    databaseArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    requestWaiting().size(0, shortTransition),
    databaseArrowSignal(0, shortTransition)
  );

  yield* waitFor(shortTransition);
  yield* heroPosition(controller().absolutePosition().addY(20), longTransition);
  yield* waitFor(shortTransition);


  // process at greet service
  yield* heroPosition(greetService().absolutePosition().addY(20), longTransition);
  
  yield heroRequest().fill('#46a33c', longTransition * 3)
  for (let i=1; i<4; i++) {
    yield* requestProcessing().endAngle(330 * i, shortTransition);
    yield* requestProcessing().startAngle(330 * i, shortTransition);
  }

  yield* waitFor(shortTransition);
  yield* heroPosition(controller().absolutePosition().addY(20), longTransition);
  yield* waitFor(shortTransition);


  // send response
  yield* heroPosition(dispatcher().absolutePosition().addY(40), longTransition);
  yield* waitFor(shortTransition);

  yield* chain(
    heroConnectionArrow().arrowSize(0, shortTransition),
    heroConnectionArrow().endArrow(false, 0),
    heroConnectionArrow().startArrow(true, 0),
    heroConnectionArrow().arrowSize(12, shortTransition),
    );
    yield* all(
    heroThread.restore(longTransition),
    heroRequest().size(0, longTransition),
    connectionArrowSignal(0, longTransition)
  );



  yield* waitFor(longTransition * 2);
});
