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
  const connectionStyle = {
    size: 40,
    radius: 20,
    fill: connectionColor
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
  const connectionPool = createRef<Rect>();
  const restTemplate = createRef<Rect>();
  const githubApi = createRef<Icon>();
  const githubApiArrow = createRef<Line>();
  const threads: Rect[] = [];
  const clientConnections: Rect[] = [];

  // signals
  const connectionArrowSignal = createSignal(0);
  const githubArrowSignal = createSignal(0);
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
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#4a8e6a'} text='RepoController' />
      </Rect>
      <Rect
        ref={restTemplate}
        width={250}
        height={140}
        lineWidth={5}
        stroke={'#8e8372'}
        radius={16}
        x={480}
        y={-120}
      >
        <Txt {...heading2Style} textAlign='center' y={-30} fill={'#8e8372'} text='RestTemplate' />
      </Rect>

      {/* GitHub API */}
      <Line
        ref={githubApiArrow}
        {...arrowStyle}
        lineDash={[20, 20]}
        points={[
          Vector2.zero,
          () => new Vector2(1, -0.1).scale(githubArrowSignal() * 160),
        ]}
        x={590}
        y={-100}
        opacity={() => githubArrowSignal()}
      />
      <Icon
        ref={githubApi}
        icon={'carbon:cloud-app'}
        size={150}
        x={820}
        y={-120}
        color={'lightgray'}
      >
        <Txt {...heading3Style} y={100} text={'GitHub API'} fill={'lightgray'} />
      </Icon>


      {/* Pools */}
      <Rect
        ref={threadPoolExecutor}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#7a858f'}
        radius={16}
        x={90}
        y={200}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#7a858f'} text='ThreadPoolExecutor' />
        <Txt {...heading2Style} x={-150} y={30} text={'['} />
        <Rect {...threadStyle} x={-80} y={30} ref={makeRef(threads, 0)} />
        <Txt {...heading2Style} y={30} text={'...'} />
        <Rect {...threadStyle} x={80} y={30} ref={makeRef(threads, 1)} />
        <Txt {...heading2Style} x={150} y={30} text={']'} />
      </Rect>

      <Rect
        ref={connectionPool}
        width={350}
        height={200}
        lineWidth={5}
        stroke={'#8e7b5c'}
        radius={16}
        x={460}
        y={200}
      >
        <Txt {...heading2Style} textAlign='center' y={-50} fill={'#8e7b5c'} text='ConnectionPool' />
        <Txt {...heading2Style} x={-150} y={30} text={'['} />
        <Rect {...connectionStyle} x={-95} y={30} ref={makeRef(clientConnections, 0)} />
        <Rect {...connectionStyle} x={-20} y={30} ref={makeRef(clientConnections, 1)} />
        <Txt {...heading2Style} y={30} x={40} text={'...'} />
        <Rect {...connectionStyle} x={95} y={30} ref={makeRef(clientConnections, 2)} />
        <Txt {...heading2Style} x={150} y={30} text={']'} />
      </Rect>
    </>
  );

  // animation setup
  threads.forEach(thread => thread.save());
  clientConnections.forEach(connection => connection.save());

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
    restTemplate().opacity(0, 0),
    githubApi().opacity(0, 0),
    threads[0].lineWidth(0, 0),
    threads[1].lineWidth(0, 0),
    threadPoolExecutor().opacity(0, 0),
    clientConnections[0].size(0, 0),
    clientConnections[1].size(0, 0),
    clientConnections[2].size(0, 0),
    connectionPool().opacity(0, 0)
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
  yield* chain(
    restTemplate().opacity(1, shortTransition),
    githubApi().opacity(1, shortTransition),
    connectionPool().opacity(1, shortTransition),
    clientConnections[0].restore(shortTransition),
    clientConnections[1].restore(shortTransition),
    clientConnections[2].restore(shortTransition),
  );
  yield* waitFor(longTransition * 2);


  // process at rest template
  const heroConnection = clientConnections[1];
  heroConnection.save();
  yield* chain(
    heroPosition(restTemplate().absolutePosition().addY(50).addX(-80), longTransition),
    heroConnection.absolutePosition(restTemplate().absolutePosition().addY(50).addX(110), longTransition)
  );
  yield* waitFor(shortTransition);

  heroConnection.save();
  yield* all(
    heroConnection.width(requestStyle.width, shortTransition),
    heroConnection.height(requestStyle.height, shortTransition),
    heroConnection.radius(requestStyle.radius * 2, shortTransition),
    requestWaiting().restore(shortTransition),
    githubArrowSignal(1, shortTransition)
  );
  for (let i=1; i<3; i++) {
    yield* requestWaiting().rotation(360 * i, longTransition);
  }

  yield* chain(
    githubApiArrow().arrowSize(0, shortTransition),
    githubApiArrow().endArrow(false, 0),
    githubApiArrow().startArrow(true, 0),
    githubApiArrow().arrowSize(12, shortTransition),
  );
  yield* all(
    heroConnection.restore(shortTransition),
    heroRequest().fill('#46a33c', shortTransition),
    requestWaiting().size(0, shortTransition),
    githubArrowSignal(0, shortTransition)
  );

  yield* waitFor(shortTransition);
  yield* all(
    heroPosition(controller().absolutePosition().addY(20), longTransition),
    heroConnection.restore(longTransition)
  );
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
    heroRequest().absolutePosition(requests().absolutePosition, longTransition),
    connectionArrowSignal(0, longTransition)
  );



  yield* waitFor(longTransition * 2);
});
