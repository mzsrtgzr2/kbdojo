
import React, { useCallback, useEffect, useState, useRef, useInterval } from "react"
// import PoseNet from "react-posenet"
import usePullUpCounter from "./usePullUpCounter"
import Timer from 'components/Timer/Timer';
import PoseNet from 'components/PoseNet'
import { useParams, useHistory, Redirect } from "react-router-dom";
import {speak} from './utils';
import { Mixpanel } from 'mixpanel';
import { isMobile } from 'components/PoseNet/utils'
import NoSleep from 'nosleep.js';

import {
  Grid,
  Button,
  Typography,
  Avatar
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import StopImage from 'assets/stop.png';
import './App.css';
import './blinking.css';


const noSleep = new NoSleep();


function App() {
  const { t } = useTranslation();
  const [count, checkPoses] = usePullUpCounter()
  const onEstimate = useCallback(poses => checkPoses(poses), [checkPoses])
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isEndWorkout, setIsEndWorkout] = useState(false);

  const [timeToStart, setTimeToStart] = useState(null);
  const [timeStr, setTimeStr] = useState('00:00:00');
  const [dataByMinute, setDataByMinute]  = useState([]);
  const [videoUrl, setVideoUrl]  = useState(null);


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

  const updateDataByMinute = (minute)=>{
    if (minute===undefined){
      minute = dataByMinute.length>0 ? dataByMinute[dataByMinute.length-1].minute+1: 1
    }
    // calc data per minute
    const lastMinute = dataByMinute.length>0 ? dataByMinute[dataByMinute.length-1]: null;
    let pace = calcPace();
    let right = count.rightTotal;
    let left = count.leftTotal;
    let both = count.bothTotal;

    if (!!lastMinute){
      left -= lastMinute.left;
      right -= lastMinute.right;
      both -= lastMinute.both;
    }

    setDataByMinute([
      ...dataByMinute,
      {
        pace, left, right, both, minute
      }
    ])
  }

  const onMinute = (minute)=>{
    if (!!minute){
      speak(`${minute} minute passed`);
      setTimeout(()=>{
        Mixpanel.track('minute_update', {
          totalMinutes: minute
        })
      }, 0)

      updateDataByMinute(minute)
    }
  }

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
          startIcon={<img src={StopImage} className="blinking"/>}
          onClick={()=>{
            setIsEndWorkout(true)
            updateDataByMinute()
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
              onMinute={onMinute}
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
      noSleep.enable();
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
                setTimeToStart(process.env.NODE_ENV=='development' ? 2: 10);
              }}
              >
              {t('START')}
          </Button>
          }
          
      </Grid>
  );

  let forceWidth = 250;
  let forceHeight = 250;
  
  if (!isEndWorkout || !videoUrl){
    return (
      <div>
        <PoseNet
              className="videoClass"
              onEstimate={isWorkoutStarted && onEstimate}
              videoWidth={forceWidth}
              videoHeight={forceHeight}
              isEndWorkout={isEndWorkout}
              isWorkoutStarted={isWorkoutStarted}
              workoutNumbers={{
                time: timeStr,
                total: count.bothTotal + count.leftTotal + count.rightTotal,
                left: count.leftTotal,
                right: count.rightTotal,
                both: count.bothTotal,
                pace: calcPace()
              }}
              onVideoUrl={(url)=>{
                setVideoUrl(url);
              }}
            />
            {/* {renderPositionMessage()} */}
            {/* {!!workout ? renderWorkout(): renderWorkoutSetup()} */}
            {isWorkoutStarted && renderWorkout()}
            {!isWorkoutStarted && renderTimerToStart()}
        
      </div>
    );
  } else {
    return (<div>
      <Grid
      container
      direction="column"
      alignItems="center"
      justify="center">

          <Typography variant="h3" color="primary">Set complete!</Typography>
          {
            dataByMinute.map(({minute, pace, right, left, both})=>(
              <Typography variant="h6">
                  - Minute {minute-1}: R: {right}, L: {left}, D: {both} at pace {pace} reps/minute
              </Typography>
            ))
          }

          <Grid className="paddedContainer">
            <Button variant="contained"
                color="primary"
                onClick={()=>{
              var a = document.createElement("a");
              document.body.appendChild(a);
              a.style = "display: none";
              a.href = videoUrl;
              a.download = `kbbuddy_${Date.now()}.webm`;
              a.click();     
            }}>Download Video</Button>
          </Grid>
          
            <video src={videoUrl} controls playsinline></video>
          
          
          <Grid className="paddedContainer">
            <Button variant="contained"
                color="primary" onClick={window.location.reload}>
                  Do another set!</Button>
          </Grid>
          

      </Grid>
    </div>);
  }
}

export default App;
