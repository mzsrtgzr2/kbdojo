import 'babel-polyfill'

import React, { useCallback, useEffect, useState } from "react"
// import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"
import Timer from './components/Timer/Timer';
import PoseNet from './components/PoseNet'


import './App.css';

const inferenceConfig = {
  decodingMethod: "single-person"
}


function App() {
  const [count, checkPoses] = usePullUpCounter()
  const onEstimate = useCallback(poses => checkPoses(poses), [checkPoses])
  const [workout, setWorkout] = useState(null);

  useEffect(()=>{
    var msg = new SpeechSynthesisUtterance();
    msg.lang = 'ru-RU';
    var total = count.bothTotal + count.leftTotal+count.rightTotal;
    if (total>0){
      msg.text=total;
    } else {
      msg.text = 'welcome my friend!';
    }
    window.speechSynthesis.speak(msg);
  }, [count]);

  const renderWorkout = ()=>{
    return (
      <div>
      <div className="topMenu">
        <span className="topMenuCell topMenuMiddle">
          <div>Total</div>
          <div>{count.bothTotal + count.leftTotal+count.rightTotal}</div>
          </span>
        <span className="topMenuCell topMenuLeft">
          <div>Left</div>
          <div>{count.leftTotal}</div>
        </span>
        <span className="topMenuCell topMenuLeft">

          <div>Right</div>
          <div>{count.rightTotal}</div>

        </span>
        <span className="topMenuCell topMenuRight">
          <div>Double</div>
          <div>{count.bothTotal}</div>

        </span>
      </div>
      <div className="bottomMenu">
          <Timer options={{delay:2}}/>
      </div>
      </div>
    )
  };

  const renderWorkoutSetup = ()=>{

  };

  return (
    <div className="App">
      
      {/* <PoseNet
        className="videoClass"
        facingMode="user"
        inferenceConfig={inferenceConfig}
        onEstimate={onEstimate}
      /> */}
      <PoseNet />

      {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
      {renderWorkout()}
    </div>
  );
}

export default App;
