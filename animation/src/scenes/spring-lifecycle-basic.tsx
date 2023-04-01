import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {createRef, useScene} from '@motion-canvas/core/lib/utils';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import "@motion-canvas/core/lib/types/Color"
import { createSignal } from '@motion-canvas/core/lib/signals';

export default makeScene2D(function* (view) {
  // project variables
  const transition = useScene().variables.get('transitionSpeed', 1)();
  const fastTransition = transition / 2;
  
  const springColor = useScene().variables.get('springColor', '#000000');

  const freshRequestColor = useScene().variables.get('requestFresh', '#000000');
  const intermediateRequestColor = useScene().variables.get('requestIntermediate', '#000000');
  const oldRequestColor = useScene().variables.get('requestOld', '#000000');
  const completeRequestColor = useScene().variables.get('requestComplete', '#000000');
  
  const background = useScene().variables.get('background', '#000000');

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
  yield* requestVisibility(1, transition);

  yield* all(
    heroRequest().size(new Vector2(requestWidth, requestHeight), fastTransition),
    heroRequest().radius(8, fastTransition)
  );
  yield* all(
    request1().size(new Vector2(requestWidth, requestHeight), fastTransition),
    request1().radius(8, fastTransition),
    heroRequest().fill(intermediateRequestColor, fastTransition)
  );
  yield* all(
    request2().size(new Vector2(requestWidth, requestHeight), fastTransition),
    request2().radius(8, fastTransition),
    heroRequest().fill(oldRequestColor, fastTransition),
    request1().fill(intermediateRequestColor, fastTransition)
  );

  yield* requestBox().opacity(1, fastTransition);
  yield* waitFor(transition);

  // process request ----------------------------------------------------------
  yield* heroRequest().position(new Vector2(700, -(10 + requestHeight) * 2), transition);
  yield* processingBox().opacity(1, fastTransition);
  yield* waitFor(fastTransition);

  yield* heroComplete().width(requestWidth / 3, fastTransition);

  yield* heroRequest().position.y(-(10 + requestHeight), fastTransition);
  yield* heroComplete().width(requestWidth * 2/3, fastTransition);

  yield* heroRequest().position.y(0, fastTransition);
  yield* heroComplete().width(requestWidth, fastTransition);

  yield* waitFor(transition);

  // send response ------------------------------------------------------------
  yield* heroRequest().position(new Vector2(0, 200), transition);

  yield* all(
    heroRequest().width(0, transition),
    heroRequest().position.x(-requestWidth / 2, transition),
    heroComplete().width(0, transition),
    heroComplete().position.x(0, transition),
    responseVisibility(1, transition)
  );

  yield* waitFor(transition);

  // update request queue -----------------------------------------------------
  yield* all(
    request1().position.y(0, fastTransition),
    request1().fill(oldRequestColor, fastTransition),
  );
  yield* all(
    request2().position.y(-(10 + requestHeight), fastTransition),
    request2().fill(intermediateRequestColor, fastTransition)
  );

  yield* waitFor(transition);

});
