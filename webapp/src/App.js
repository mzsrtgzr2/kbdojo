import 'babel-polyfill'

import React, { useCallback, useEffect, useState } from "react"
// import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"
import Timer from './components/Timer/Timer';
import PoseNet from './components/PoseNet'


import './App.css';

const speak = (text)=>{
  var msg = new SpeechSynthesisUtterance();
  msg.lang = 'en-EN';
  msg.text=text;
  window.speechSynthesis.speak(msg);
}

function App() {
  const [count, checkPoses] = usePullUpCounter()
  const onEstimate = useCallback(poses => checkPoses(poses), [checkPoses])
  const [workout, setWorkout] = useState(null);

  useEffect(()=>{
    var total = count.bothTotal + count.leftTotal+count.rightTotal;
    if (total>0){
      speak(total);
    } 
    
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
        v0.2
          <Timer
            onMinute={(minute)=>{
              if (!!minute){
                speak(`${minute} minute passed`);
              }
            }}
          />
      </div>
      </div>
    )
  };

  const renderWorkoutSetup = ()=>{

  };

  return (
    <div className="App">

      <PoseNet 
        className="videoClass"
        onEstimate={onEstimate}
        videoWidth={window.innerWidth/3}
        videoHeight={window.innerHeight/3}
      />

      {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
      {renderWorkout()}
    </div>
  );
}

export default App;
