
import React, { useCallback, useEffect, useState } from "react"
// import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"
import Timer from 'components/Timer/Timer';
import PoseNet from 'components/PoseNet'
import { useParams, useHistory, Redirect } from "react-router-dom";
import {speak} from './utils';
import { Mixpanel } from 'mixpanel';
import { isMobile } from 'components/PoseNet/utils'
import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core';
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
        
      </div>
      <div className="bottomMenu">
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={3} className="topMenuCell">
          
              <div>Total</div>
              <div>{count.bothTotal + count.leftTotal+count.rightTotal}</div>
              
          </Grid>
          {/* <Grid item xs={2} className="topMenuCell">
              <div>Reps/Min</div>
                <div>{calcPace()}</div>
          </Grid> */}
          <Grid item xs={3} className="topMenuCell">
              <div>Lefts</div>
              <div>{count.leftTotal}</div>
          </Grid>
          <Grid item xs={3} className="topMenuCell">
              <div>Rights</div>
              <div>{count.rightTotal}</div>
          </Grid>
          <Grid item xs={3} className="topMenuCell">
              <div>Doubles</div>
              <div>{count.bothTotal}</div>
          </Grid>
        </Grid>
          
          
      </div>
      </div>
    )
  };

  const renderWorkoutSetup = ()=>{

  };

  const forceWidth = isMobile() ? 200: 200;
  // {forceWidth/window.innerWidth * window.innerHeight}
  return (
    <div>
      <PoseNet 
            className="videoClass"
            onEstimate={onEstimate}
            videoWidth={forceWidth}
            videoHeight={forceWidth}
          />
          {/* {renderPositionMessage()} */}
          {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
          {renderWorkout()}
       
    </div>
  );
}

export default App;
