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
    if (count>0){
      msg.text=count;
    } else {
      msg.text = 'welcome my friend!';
    }
    window.speechSynthesis.speak(msg);
  }, [count]);

  const renderWorkout = ()=>{
    return (
      <div>
        <div className="topMenu">{`Reps: ${count}`}</div>

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
      />

      {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
      {renderWorkout()}
    </div>
  );
}

export default App;
