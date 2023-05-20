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
  const socket2Request = createRef<Rect>();

  // signals
  const socketChannelArrowSignals = [
    createSignal(1),
    createSignal(1),
    createSignal(1)
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
        <Txt text={'Spring'} y={-350} {...headingStyle} />
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
        
        <Txt {...heading2Style} x={-110} y={-100} text={'['} />
        <Rect {...requestStyle} ref={makeRef(socket1Requests, 0)} x={-50} y={-100} />
        <Rect {...requestStyle} ref={makeRef(socket1Requests, 1)} x={0} y={-100} />
        <Rect {...requestStyle} ref={makeRef(socket1Requests, 2)} x={50} y={-100} />
        <Txt {...heading2Style} x={110} y={-100} text={']'} />
        <Txt {...heading3Style} x={125} y={-80} text={'1'} />

        <Txt {...heading2Style} x={-110} y={0} text={'['} />
        <Rect {...requestStyle} ref={socket2Request} x={-50} y={0} />
        <Txt {...heading2Style} x={110} y={0} text={']'} />
        <Txt {...heading3Style} x={125} y={20} text={'2'} />

        <Txt {...heading2Style} x={-110} y={100} text={'['} />
        <Txt {...heading2Style} x={110} y={100} text={']'} />
        <Txt {...heading3Style} x={125} y={120} text={'3'} />
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
        <Txt {...heading2Style} textAlign='center' y={-60} fill={'#71a7da'} text='EventHandler' />
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
  eventLoops.forEach(request => request.save());
  

  // yield* all(
  //   requests[0].position(new Vector2(-150, 0), 0),
  //   requests[1].position(new Vector2(-150, 0), 0),
  //   requests[2].position(new Vector2(-150, 0), 0),
  //   requests[0].size(0, 0),
  //   requests[1].size(0, 0),
  //   requests[2].size(0, 0),
  //   requestTexts[0].fontSize(0, 0),
  //   requestTexts[1].fontSize(0, 0),
  //   requestTexts[2].fontSize(0, 0),
  //   socketChannels().opacity(0, 0),
  //   eventLoop().lineWidth(0, 0),
  //   eventLoopGroup().opacity(0, 0),
  //   eventProcessing().opacity(0, 0)
  // );

  yield* waitFor(longTransition);


  // pop in
  


  yield* waitFor(longTransition * 2);
});
