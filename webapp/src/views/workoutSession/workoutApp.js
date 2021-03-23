
import React, { useCallback, useEffect, useState } from "react"
// import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"
import Timer from 'components/Timer/Timer';
import PoseNet from 'components/PoseNet'
import { useParams, useHistory, Redirect } from "react-router-dom";
import {speak} from './utils';
import { Mixpanel } from 'mixpanel';


import './App.css';



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

  const calcPace = () => {
    if (!count.reps || count.reps.length==0){
      return 0;
    }
    const secondsOfOccurences = count.reps.map(({timestamp})=>(parseInt(timestamp/1000)));
    const lastest =  secondsOfOccurences[secondsOfOccurences.length-1];
    
    var i;
    for (i=secondsOfOccurences.length-1; i>0; i--){
      const second = secondsOfOccurences[i];
      if (lastest-second >= 60){
        break;
      }
    }
    return secondsOfOccurences.length - i;
  }

  const renderPositionMessage = () => {
    return (<div>

    </div>)
  }

  const isWorkoutStarted = ()=>count.reps.length>0;

  const renderWorkout = ()=>{
    return (
      <div>
      <div className="topMenu">
        <span className="topMenuCell topMenuMiddle">
          <div>Total</div>
          <div>{count.bothTotal + count.leftTotal+count.rightTotal}</div>
          </span>
          <span className="topMenuCell">
            <div>Reps/Min</div>
            <div>{calcPace()}</div>
          </span>
        <span className="topMenuCell topMenuLeft">
          <div>Lefts</div>
          <div>{count.leftTotal}</div>
        </span>
        <span className="topMenuCell topMenuLeft">

          <div>Rights</div>
          <div>{count.rightTotal}</div>

        </span>
        <span className="topMenuCell topMenuRight">
          <div>Doubles</div>
          <div>{count.bothTotal}</div>

        </span>
      </div>
      <div className="bottomMenu">
          {/* <span className="topMenuCell">
            <div>ver</div>
            <div>0.4</div>
          </span> */}
          <Timer
            className="timer"
            startAutomatically={isWorkoutStarted()}
            showControllers={isWorkoutStarted()}
            onMinute={(minute)=>{
              if (!!minute){
                speak(`${minute} minute passed`);
                setTimeout(()=>{
                  Mixpanel.track('minute_update', {
                    totalMinutes: minute
                  })
                }, 0)
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
    <div>
      <PoseNet 
            className="videoClass"
            onEstimate={onEstimate}
            videoWidth={window.innerWidth/2}
            videoHeight={window.innerHeight/2}
          />
          {/* {renderPositionMessage()} */}
          {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
          {renderWorkout()}
       
    </div>
  );
}

export default App;
