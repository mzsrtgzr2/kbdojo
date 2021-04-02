
import React, { useCallback, useEffect, useState, useRef, useInterval } from "react"
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
import { useTranslation } from 'react-i18next';

import './App.css';



function App() {
  const { t } = useTranslation();
  const [count, checkPoses] = usePullUpCounter()
  const onEstimate = useCallback(poses => checkPoses(poses), [checkPoses])
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [timeToStart, setTimeToStart] = useState(null);
  const [timeStr, setTimeStr] = useState('00:00:00');
  const [isEndWorkout, setIsEndWorkout] = useState(false);

  useEffect(()=>{
    var total = count.bothTotal + count.leftTotal+count.rightTotal;
    if (total>0){
      let rate = 1.1;
      if (total>9999){
        rate = 1.6;
      } else if (total>999) {
        rate = 1.4;
      } else if (total>99){
        rate = 1.2;
      }
      speak(total, rate);
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


  const renderWorkout = ()=>{
    return (
      <div>
      <div className="topMenu">
      
            <Button
              className="stopButton"
              variant="contained"
              color="primary"
              onClick={()=>{
                setIsEndWorkout(true)
              }}
              >
              {t('STOP')}
              </Button>
          
      </div>
      <div className="bottomMenu">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Timer
              className="timer"
              startAutomatically={isWorkoutStarted}
              showControllers={isWorkoutStarted}
              onNewTime={(_timeStr)=>{
                setTimeStr(_timeStr);
              }}
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
          <Grid item xs={2.2} className="topMenuCell">
          
              <div>Total</div>
              <div>{count.bothTotal + count.leftTotal+count.rightTotal}</div>
              
          </Grid>
          <Grid item xs={2.2} className="topMenuCell">
              <div>Reps/Min</div>
                <div>{calcPace()}</div>
          </Grid>
          <Grid item xs={2.2} className="topMenuCell">
              <div>Lefts</div>
              <div>{count.leftTotal}</div>
          </Grid>
          <Grid item xs={2.2} className="topMenuCell">
              <div>Rights</div>
              <div>{count.rightTotal}</div>
          </Grid>
          <Grid item xs={2.2} className="topMenuCell">
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

  useEffect(() => {
    if (timeToStart==0){
      setIsWorkoutStarted(true);
      speak('Start working out', 1.2)
    }
    if(timeToStart > 0){
      speak(timeToStart);
      setTimeout(() => setTimeToStart(timeToStart - 1), 1000);
    }
  }, [timeToStart]);

  const renderTimerToStart = ()=>(
    
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      className="containerTimerToStart">
          <Typography className="timerToStart" color="primary">
            {timeToStart}
          </Typography>
          {timeToStart===null && 
            <Button
              className="startButton"
              variant="contained"
              color="primary"
              onClick={()=>{
                setTimeToStart(process.env.NODE_ENV=='development' ? 2: 2);
              }}
              >
              {t('START')}
          </Button>
          }
          
      </Grid>
  );

  let forceWidth = 250;
  let forceHeight = 250;

  return (
    <div>
      <PoseNet 
            className="videoClass"
            onEstimate={isWorkoutStarted && onEstimate}
            videoWidth={forceWidth}
            videoHeight={forceHeight}
            isEndWorkout={isEndWorkout}
            workoutNumbers={{
              time: timeStr,
              total: count.bothTotal + count.leftTotal + count.rightTotal,
              left: count.leftTotal,
              right: count.rightTotal,
              both: count.bothTotal
            }}
          />
          {/* {renderPositionMessage()} */}
          {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
          {isWorkoutStarted && renderWorkout()}
          {!isWorkoutStarted && renderTimerToStart()}
       
    </div>
  );
}

export default App;
