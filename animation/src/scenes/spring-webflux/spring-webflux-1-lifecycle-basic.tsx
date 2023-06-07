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
  const requestEvents = createRef<Rect>();
  const eventProcessing = createRef<Rect>();
  const eventLoopGroup = createRef<Rect>();

  const requestArrow = createRef<Line>();
  const eventLoop = createRef<Rect>();

  const requests: Rect[] = [];
  const requestTexts: Txt[] = [];

  // signals
  const connectionArrowSignal = createSignal(0);
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

      {/* Connection arrows */}
      <Line
        ref={requestArrow}
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
        <Rect {...requestStyle} ref={makeRef(requests, 0)} y={-100}>
          <Txt {...heading3Style} ref={makeRef(requestTexts, 0)} text={'!'} />
        </Rect>
        <Rect {...requestStyle} ref={makeRef(requests, 1)}>
          <Txt {...heading3Style} ref={makeRef(requestTexts, 1)} text={'!'} />
        </Rect>
        <Rect {...requestStyle} ref={makeRef(requests, 2)} y={100}>
          <Txt {...heading3Style} ref={makeRef(requestTexts, 2)} text={'!'} />
        </Rect>
      </Rect>

      {/* Event Loop Group */}
      <Rect
        ref={eventLoopGroup}
        width={300}
        height={200}
        lineWidth={5}
        stroke={'#71a7da'}
        radius={16}
        y={40}
      >
        <Txt {...heading2Style} textAlign='center' y={-60} fill={'#71a7da'} text='EventHandler' />
        <Rect {...eventLoopStyle} y={30} ref={eventLoop} />
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
  requests.forEach(request => request.save());
  requestTexts.forEach(text => text.save());

  eventLoop().save();
  

  yield* all(
    requests[0].position(new Vector2(-150, 0), 0),
    requests[1].position(new Vector2(-150, 0), 0),
    requests[2].position(new Vector2(-150, 0), 0),
    requests[0].size(0, 0),
    requests[1].size(0, 0),
    requests[2].size(0, 0),
    requestTexts[0].fontSize(0, 0),
    requestTexts[1].fontSize(0, 0),
    requestTexts[2].fontSize(0, 0),
    requestEvents().opacity(0, 0),
    eventLoop().lineWidth(0, 0),
    eventLoopGroup().opacity(0, 0),
    eventProcessing().opacity(0, 0)
  );

  yield* waitFor(longTransition);


  // pop in
  yield* chain(
    requestEvents().opacity(1, shortTransition),
    connectionArrowSignal(1, shortTransition),
  );
  yield* waitFor(shortTransition);

  yield* chain(
    eventLoopGroup().opacity(1, shortTransition),
    eventLoop().restore(shortTransition)
  );
  eventLoop().save();
  yield* waitFor(shortTransition);


  // accept event 1
  yield* chain(
    requests[0].restore(shortTransition),
    eventLoop().absolutePosition(requests[0].absolutePosition, shortTransition),
    eventProcessing().opacity(1, shortTransition)
  );
  // introduce event 2
  yield chain(
    waitFor(shortTransition),
    requests[1].restore(shortTransition)
  );

  eventLoopPosition(eventProcessing().absolutePosition().addY(-100));
  yield* all(
    eventLoop().absolutePosition(eventLoopPosition, longTransition),
    requests[0].absolutePosition(eventLoopPosition, longTransition),
  );
  // start processing of event 1
  yield chain(
    requests[0].fill(requestCompleteColor, longTransition*3),
    requestTexts[0].restore(0)
  );

  yield* eventLoop().restore(shortTransition);
  eventLoop().save();


  // accept event 2
  yield* eventLoop().absolutePosition(requests[1].absolutePosition, shortTransition)
  yield* all(
    eventLoop().absolutePosition(eventProcessing().absolutePosition, longTransition),
    requests[1].absolutePosition(eventProcessing().absolutePosition, longTransition)
  );
  // start processing of event 2
  yield chain(
    requests[1].fill(requestCompleteColor, shortTransition*17),
    requestTexts[1].restore(0)
  );

  yield* eventLoop().restore(shortTransition);
  eventLoop().save();
  yield* waitFor(shortTransition);


  // return request 1
  yield* eventLoop().absolutePosition(requests[0].absolutePosition, shortTransition)
  yield* all(
    eventLoop().absolutePosition(requestEvents().absolutePosition, longTransition),
    requests[0].absolutePosition(requestEvents().absolutePosition, longTransition)
  )
  yield* all(
    eventLoop().restore(shortTransition),
    requests[0].position(new Vector2(-150, 0), shortTransition),
    requests[0].size(0, shortTransition),
    requestTexts[0].fontSize(0, shortTransition),
    chain(
      waitFor(shortTransition/2),
      requests[2].restore(shortTransition)
    )
  );
  eventLoop().save();


  // accept event 3
  yield* eventLoop().absolutePosition(requests[2].absolutePosition, shortTransition);
  yield* all(
    eventLoop().absolutePosition(eventProcessing().absolutePosition().addY(100), longTransition),
    requests[2].absolutePosition(eventProcessing().absolutePosition().addY(100), longTransition),
  )
  // start processing of event 3
  yield chain(
    requests[2].fill(requestCompleteColor, longTransition),
    requestTexts[2].restore(0)
  );

  yield* eventLoop().restore(shortTransition);
  eventLoop().save();
  yield* waitFor(shortTransition);


  // return request 3
  yield* eventLoop().absolutePosition(requests[2].absolutePosition, shortTransition)
  yield* all(
    eventLoop().absolutePosition(requestEvents().absolutePosition, longTransition),
    requests[2].absolutePosition(requestEvents().absolutePosition, longTransition)
  )
  yield* all(
    eventLoop().restore(shortTransition),
    requests[2].position(new Vector2(-150, 0), shortTransition),
    requests[2].size(0, shortTransition),
    requestTexts[2].fontSize(0, shortTransition)
  );
  eventLoop().save();


  // return request 2
  yield* waitFor(longTransition*0.75);
  yield* eventLoop().absolutePosition(requests[1].absolutePosition, shortTransition)
  yield* all(
    eventLoop().absolutePosition(requestEvents().absolutePosition, longTransition),
    requests[1].absolutePosition(requestEvents().absolutePosition, longTransition)
  )
  yield* all(
    eventLoop().restore(shortTransition),
    requests[1].position(new Vector2(-150, 0), shortTransition),
    requests[1].size(0, shortTransition),
    requestTexts[1].fontSize(0, shortTransition)
  );


  yield* waitFor(longTransition * 2);
});
