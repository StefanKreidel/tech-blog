import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import { Line, Rect, Txt} from '@motion-canvas/2d/lib/components';
import {createRef, useScene} from '@motion-canvas/core/lib/utils';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import "@motion-canvas/core/lib/types/Color"

export default makeScene2D(function* (view) {
  const shortTransition = 0.5;
  const transition = shortTransition * 2;

  const freshRequestColor = '#e57d67';
  const intermediateRequestColor = '#c24835';
  const oldRequestColor = '#962f1b';
  
  // which background to use
  const backgroundDark = '#0d1115';
  const backgroundLight = '#1f2934';
  const background = (useScene().variables.get('appearance', 'light')() === 'dark') ? backgroundDark : backgroundLight;


  const headingStyle = {
    fontWeight: 700,
    fontSize: 56,
    offsetY: -1,
    cache: true
  };
  const arrowTextStyle = {
    fontWeight: 300,
    fontSize: 36,
    cache: true
  };
  const requestStyle = {
    width: 0,
    height: 0,
    radius: 16,
    fill: freshRequestColor
  }
  const arrowLinewidth = 4;
  
  const spring = createRef<Rect>();
  const socketRequest = createRef<Line>();
  const socketResponse = createRef<Line>();

  const requestBox = createRef<Rect>()
  const processingBox = createRef<Rect>()
  const heroRequest = createRef<Rect>()
  const heroComplete = createRef<Rect>()
  const request1 = createRef<Rect>()
  const request2 = createRef<Rect>()
  const request3 = createRef<Rect>()

  view.fill(backgroundLight)

  view.add(
    <>
      <Rect
        ref={spring}
        width={'60%'}
        height={'60%'}
        lineWidth={10}
        stroke={'#5caa22'}
        radius={20}
      >
        <Txt text={'created by Stefan Kreidel'} fill={'grey'} fontSize={28} y={500} />
        <Txt 
          text={'Spring'}
          y={-300}
          fill={'#5caa22'}
          {...headingStyle}
        />
        <Line
          ref={socketRequest}
          points={[
            new Vector2(-900, -20),
            new Vector2(-600, -20)
          ]}
          lineWidth={arrowLinewidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={0}
        >
          <Txt
            text={'requests'}
            y={-50}
            x={-740}
            fill={'white'}
            {...arrowTextStyle}
          />
          <Txt />
        </Line>
        <Line
          ref={socketResponse}
          points={[
            new Vector2(-600, 20),
            new Vector2(-900, 20)
          ]}
          lineWidth={arrowLinewidth}
          stroke={'white'}
          endArrow
          arrowSize={12}
          opacity={0}
        >
          <Txt
            text={'responses'}
            y={40}
            x={-740}
            fill={'white'}
            {...arrowTextStyle}
          />
          <Txt />
        </Line>
        
        
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
            <Txt text={'requests to process'} y={140} fill={'grey'} {...arrowTextStyle} />
          </Rect>
          <Rect {...requestStyle} ref={request3} y={-120} />
          <Rect {...requestStyle} ref={request2} y={-120} />
          <Rect {...requestStyle} ref={request1} y={-60} />
          <Rect {...requestStyle} ref={heroRequest}>
            <Rect ref={heroComplete} width={0} height={50} x={-125} radius={8} fill={'#46a33c'} />
          </Rect>
        </Rect>

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

  // requests pop in -----------------------------------------------------------
  yield* socketRequest().opacity(1, transition);

  yield* all(
    heroRequest().size(new Vector2(250, 50), shortTransition),
    heroRequest().radius(8, shortTransition)
  );
  yield* all(
    request1().size(new Vector2(250, 50), shortTransition),
    request1().radius(8, shortTransition),
    heroRequest().fill(intermediateRequestColor, shortTransition)
  );
  yield* all(
    request2().size(new Vector2(250, 50), shortTransition),
    request2().radius(8, shortTransition),
    heroRequest().fill(oldRequestColor, shortTransition),
    request1().fill(intermediateRequestColor, shortTransition)
  );

  yield* requestBox().opacity(1, shortTransition);
  yield* waitFor(transition);

  heroRequest().save()
  heroComplete().save()
  request1().save()
  request2().save()
  request3().save()

  for (let i=0; i<2; i++) {
    // process request -----------------------------------------------------------
    yield* heroRequest().position(new Vector2(700, -120), transition);
    yield* processingBox().opacity(1, shortTransition);
    yield* waitFor(shortTransition);

    yield* all(
      heroComplete().width(83, shortTransition),
      heroComplete().position.x(-83.5, shortTransition)
    );

    yield* heroRequest().position.y(-60, shortTransition);
    yield* all(
      heroComplete().width(166, shortTransition),
      heroComplete().position.x(-42, shortTransition)
    );

    yield* heroRequest().position.y(0, shortTransition);
    yield* all(
      heroComplete().width(250, shortTransition),
      heroComplete().position.x(0, shortTransition)
    );

    yield* waitFor(transition);

    // send response -----------------------------------------------------------
    yield* heroRequest().position(new Vector2(0, 200), transition);

    yield* all(
      heroRequest().width(0, transition),
      heroRequest().position.x(-125, transition),
      heroComplete().width(0, transition),
      socketResponse().opacity(1, transition)
    );

    yield* waitFor(transition);

    // update requests -----------------------------------------------------------
    yield* all(
      request1().position.y(0, shortTransition),
      request1().fill(oldRequestColor, shortTransition),
    );
    yield* all(
      request2().position.y(-60, shortTransition),
      request2().fill(intermediateRequestColor, shortTransition)
    );
    yield* all(
      request3().size(new Vector2(250, 50), shortTransition),
      request3().radius(8, shortTransition)
    );

    yield* all(
      heroRequest().restore(0),
      heroComplete().restore(0),
      request1().restore(0),
      request2().restore(0),
      request3().restore(0),
    )

    yield* waitFor(transition);
  }

});
