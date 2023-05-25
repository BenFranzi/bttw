  import { useKeyboardControls } from '@react-three/drei';
  import useGame from "./stores/use-game.js";
  import {useEffect, useRef} from "react";
  import {addEffect} from "@react-three/fiber";
export default function Interface() {
  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const time = useRef();

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);
  const jump = useKeyboardControls((state) => state.jump);


  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      if (!time.current) return;

      const state = useGame.getState();

      let elapsedTime = 0;
      if (state.phase === 'playing') {
        elapsedTime = Date.now() - state.startTime;
      } else if (state.phase === 'ended') {
        elapsedTime = state.endTime - state.startTime;

      }

      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);

      time.current.textContent = elapsedTime;
    });
    return () => unsubscribeEffect();
  }, []);



  return (
    <div className="interface">
      <div className="time" ref={time}>0.00</div>
      {phase === 'ended' && <div className="restart" onClick={restart}>RESTART</div>}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? 'active' : ''}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${backward ? 'active' : ''}`}></div>
          <div className={`key ${left ? 'active' : ''}`}></div>
          <div className={`key ${right ? 'active' : ''}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  )
}
