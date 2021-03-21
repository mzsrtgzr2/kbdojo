import React, { useCallback, useEffect, useState } from "react"
import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"

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
      <div className="topMenu">
        <div className="topMenuMiddle">Total: {count.bothTotal + count.leftTotal+count.rightTotal}</div>
        <div className="topMenuLeft">Left: {count.leftTotal}</div>
        <div className="topMenuLeft">Right: {count.rightTotal}</div>
        <div className="topMenuRight">Double: {count.bothTotal}</div>
      </div>
    )
  };

  const renderWorkoutSetup = ()=>{

  };

  return (
    <div className="App">
      
      {/* <h1>{`Snatch Pace/Minute: ${count}`}</h1> */}
      <PoseNet
        className="videoClass"
        facingMode="environment"
        inferenceConfig={inferenceConfig}
        onEstimate={onEstimate}
        frameRate={20}
      />

      {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
      {renderWorkout()}
    </div>
  );
}

export default App;
