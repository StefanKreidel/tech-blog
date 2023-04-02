import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {createRef, useScene} from '@motion-canvas/core/lib/utils';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createSignal } from '@motion-canvas/core/lib/signals';

import "@motion-canvas/core/lib/types/Color"

export default makeScene2D(function* (view) {
  // project variables
  const longTransition = useScene().variables.get('transitionSpeed', 1)();
  const shortTransition = longTransition / 2;

  const springColor = '#5caa22';

  const freshRequestColor = '#e57d67'
  const intermediateRequestColor = '#c24835'
  const oldRequestColor = '#962f1b';
  const completeRequestColor = '#46a33c'
  
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
  const arrowTextStyle = {
    fontWeight: 300,
    fontSize: 36,
    cache: true,
    fill: 'white',
    fontFamily: 'Noto Sans Display'
  };
  const requestStyle = {
    width: 0,
    height: 0,
    radius: 16,
    fill: freshRequestColor
  }
  const arrowLineWidth = 4;
  const requestHeight = 50;
  const requestWidth = 250;
  
  // references
  const spring = createRef<Rect>();
  const socketRequest = createRef<Line>();
  const socketResponse = createRef<Line>();
  const requestBox = createRef<Rect>()
  const processingBox = createRef<Rect>()
  const heroRequest = createRef<Rect>()
  const heroComplete = createRef<Rect>()
  const request1 = createRef<Rect>()
  const request2 = createRef<Rect>()

  // signals
  const heroCompletePositionX = createSignal(() => -requestWidth / 2 + heroComplete().width() / 2)
  const requestVisibility = createSignal(0);
  const responseVisibility = createSignal(0);

  view.fill(background)

  view.add(
    <>
      <Rect
        ref={spring}
        width={'60%'}
        height={'60%'}
        lineWidth={10}
        stroke={springColor}
        radius={20}
      >
        {/* requests and responses */}
        <Txt text={'Spring'} y={-300} {...headingStyle} />
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} fontFamily={'Noto Sans Display'} />
        <Line
          ref={socketRequest}
          points={[
            Vector2.zero,
            () => Vector2.right.scale(requestVisibility() * 300),
          ]}
          x={-900}
          y={-20}
          lineWidth={arrowLineWidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={() => requestVisibility()}
        >
          <Txt text={'requests'} y={-30} x={160} {...arrowTextStyle} />
          <></>
        </Line>
        <Line
          ref={socketResponse}
          points={[
            Vector2.zero,
            () => Vector2.left.scale(responseVisibility() * 300),
          ]}
          x={-600}
          y={20}
          lineWidth={arrowLineWidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={() => responseVisibility()}
        >
          <Txt text={'responses'} y={25} x={-140} {...arrowTextStyle} />
          <></>
        </Line>
        
        {/* Request Box */}
        <Rect x={-350}>
          <Rect
            ref={requestBox}
            width={300}
            height={220}
            lineWidth={3}
            y={-60}
            radius={10}
            stroke={'grey'}
            opacity={0}
          >
            <Txt text={'requests queue'} y={140} fill={'grey'} {...arrowTextStyle} />
          </Rect>
          <Rect {...requestStyle} ref={request2} y={-(requestHeight + 10) *2} />
          <Rect {...requestStyle} ref={request1} y={-(requestHeight + 10)} />
          <Rect {...requestStyle} ref={heroRequest}>
            <Rect ref={heroComplete} width={0} height={requestHeight} x={heroCompletePositionX} radius={8} fill={completeRequestColor} />
          </Rect>
        </Rect>

        {/* Response Box */}
        <Rect
          ref={processingBox}
          width={300}
          height={220}
          lineWidth={3}
          x={350}
          y={-60}
          radius={10}
          stroke={'grey'}
          opacity={0}
        >
          <Txt text={'processing'} y={140} fill={'grey'} {...arrowTextStyle} />
        </Rect>
      </Rect>
    </>
  );

  // requests get queued ------------------------------------------------------
  yield* waitFor(longTransition);

  yield* requestVisibility(1, longTransition);

  yield* all(
    heroRequest().size(new Vector2(requestWidth, requestHeight), shortTransition),
    heroRequest().radius(8, shortTransition)
  );
  yield* all(
    request1().size(new Vector2(requestWidth, requestHeight), shortTransition),
    request1().radius(8, shortTransition),
    heroRequest().fill(intermediateRequestColor, shortTransition)
  );
  yield* all(
    request2().size(new Vector2(requestWidth, requestHeight), shortTransition),
    request2().radius(8, shortTransition),
    heroRequest().fill(oldRequestColor, shortTransition),
    request1().fill(intermediateRequestColor, shortTransition)
  );

  yield* requestBox().opacity(1, shortTransition);
  yield* waitFor(longTransition);

  // process request ----------------------------------------------------------
  yield* heroRequest().position(new Vector2(700, -(10 + requestHeight) * 2), longTransition);
  yield* processingBox().opacity(1, shortTransition);
  yield* waitFor(shortTransition);

  yield* heroComplete().width(requestWidth / 3, shortTransition);

  yield* heroRequest().position.y(-(10 + requestHeight), shortTransition);
  yield* heroComplete().width(requestWidth * 2/3, shortTransition);

  yield* heroRequest().position.y(0, shortTransition);
  yield* heroComplete().width(requestWidth, shortTransition);

  yield* waitFor(longTransition);

  // send response ------------------------------------------------------------
  yield* heroRequest().position(new Vector2(0, 200), longTransition);

  yield* all(
    heroRequest().width(0, longTransition),
    heroRequest().position.x(-requestWidth / 2, longTransition),
    heroComplete().width(0, longTransition),
    heroComplete().position.x(0, longTransition),
    responseVisibility(1, longTransition)
  );

  yield* waitFor(longTransition);

  // update request queue -----------------------------------------------------
  yield* all(
    request1().position.y(0, shortTransition),
    request1().fill(oldRequestColor, shortTransition),
  );
  yield* all(
    request2().position.y(-(10 + requestHeight), shortTransition),
    request2().fill(intermediateRequestColor, shortTransition)
  );




  yield* waitFor(longTransition * 2);
});
