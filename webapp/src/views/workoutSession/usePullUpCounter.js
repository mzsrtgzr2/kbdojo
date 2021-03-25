import { useRef, useReducer, useCallback } from "react"
import { Mixpanel } from 'mixpanel';

const TICK_MS = 100;

function getKeypointsObject(pose) {
  return pose.keypoints.reduce((acc, { part, position }) => {
    acc[part] = position
    return acc
  }, {})
}

function reducer(count, {type, currentSide}) {
  switch (currentSide){
    case 'both':
      count = {...count, bothTotal: count.bothTotal + 1};
      break;
    case 'left':
      count = {...count, leftTotal: count.leftTotal + 1};
      break;
    case 'right':
      count = {...count, rightTotal: count.rightTotal + 1};
      
      break;
  }
  if (type=='increment'){
    count = {...count, reps: [...count.reps, {
      side: currentSide,
      timestamp: Date.now()
    }]};
    Mixpanel.track('count_increase', {
      bothTotal: count.bothTotal,
      leftTotal: count.leftTotal,
      rightTotal: count.rightTotal,
      side: currentSide,
      timestamp: Date.now(),
    })
  }

  return count
}

function checkSnatchPisition(shoulder, elbow, wrist, nose, sensitivity=50){
  console.log('y', wrist.y, elbow.y, shoulder.y, (wrist.y < elbow.y) && (wrist.y < shoulder.y) && (elbow.y < shoulder.y));

  console.log('x', wrist.x, elbow.x, shoulder.x, Math.abs(wrist.x-elbow.x)<=sensitivity, Math.abs(wrist.x-shoulder.x)<=sensitivity);

  return(
    (sensitivity <= (nose.y-wrist.y)) &&
    (sensitivity <= Math.abs(shoulder.y-wrist.y)) &&
    (wrist.y < elbow.y) && (wrist.y < shoulder.y) && (elbow.y < shoulder.y))
    // (Math.abs(wrist.x-elbow.x)<=2*sensitivity) &&
    // (Math.abs(wrist.x-shoulder.x)<=2*sensitivity))
}

function checkBallDown(shoulder, elbow, wrist){
  
  const arm_edge = elbow
  const arm_base = shoulder
  // if (!!arm_edge && !!arm_base && arm_edge.y > arm_base.y)
  //   console.log(arm_edge.y, arm_base.y);
  return !!arm_edge && !!arm_base && arm_edge.y > arm_base.y;
}

export default function(sensitivity = 10) {
  const [count, dispatch] = useReducer(reducer, {
    leftTotal: 0,
    rightTotal: 0,
    bothTotal: 0,
    currentSide: null,
    reps: []
  });

  const state = useRef('down')
  const downCounter = useRef(0);
  const upCounter = useRef(0);
  const downLastTimestamp = useRef(0);
  const upLastTimestamp = useRef(0);
  
  const checkPoses = useCallback(
    pose => {
      if (pose.score<0.4){
        return;
      }
      const now = Date.now()
      const {
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
        nose,
      } = getKeypointsObject(pose)

      const isDown = 
        checkBallDown(
          rightShoulder,
          rightElbow,
          rightWrist
        ) &&
        checkBallDown(
          leftShoulder,
          leftElbow,
          leftWrist
        )

      if (!leftShoulder || !leftElbow || !rightShoulder || !rightElbow || !nose){
        console.log('not enough info')
        return;
      }

      const chestWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      
      if (isDown){
        const prev = downLastTimestamp.current


        if (state.current === 'up'){
          if (downCounter.current<=0){
            console.log('down counter started')
            downCounter.current = 5;
            upCounter.current = -1;
          } else {
            const diff = now-prev
            if (prev && 0<diff<=10*TICK_MS){
              console.log('down counter advanced')
              downCounter.current-=diff/TICK_MS;
            }
        
            if (downCounter.current<=0){
              state.current = 'down';
              upCounter.current = -1;
              console.log('down')
            }
          }
        }
        // update time stamp of down event
        downLastTimestamp.current = now
        upLastTimestamp.current = 0; //zero other option
        return
      }
      
      var isRightSnatch=false, isLeftSnatch=false;
      // check right
      if (!!rightWrist && !!rightShoulder && !!rightElbow){
        isRightSnatch = checkSnatchPisition(
          rightShoulder,
          rightElbow,
          rightWrist,
          nose,
          sensitivity = chestWidth/1.5
          )
          // if (isRightSnatch){
          //   console.log('right snatch!', rightShoulder,
          //   rightElbow,
          //   rightWrist)
          // }
      }

      // check left
      if (!!leftWrist && !!leftShoulder && !!leftElbow){
        isLeftSnatch = checkSnatchPisition(
          leftShoulder,
          leftElbow,
          leftWrist,
          nose,
          sensitivity = chestWidth/1.5
        )
        // if (isLeftSnatch){
        //   console.log('left snatch!', leftShoulder,
        //   leftElbow,
        //   leftWrist)
        // }
      }

      // console.log((isLeftSnatch || isRightSnatch), state.current)
      if (isLeftSnatch || isRightSnatch){
        const prev = upLastTimestamp.current

        if (state.current === 'down'){
          if (upCounter.current <= 0){
            console.log('up counter started')
            upCounter.current = 1;
            downCounter.current = -1;
          } else {

            const diff = now-prev
            if (prev && 0<diff<=10*TICK_MS){
              console.log('up counter advanced')
              upCounter.current-=diff/TICK_MS;
            }
        
            if (upCounter.current<=0){
              state.current = 'up';
              downCounter.current = -1;

              var currentSide = null;
              if (isLeftSnatch && isRightSnatch){
                currentSide = 'both';
              } else if (isLeftSnatch){
                currentSide = 'left';
              } else if (isRightSnatch){
                currentSide = 'right';
              }
              dispatch({
                type: 'increment',
                currentSide,
              });
              console.log('up')
            }  
          }
          
        }

        // update time stamp of down event
        upLastTimestamp.current = now;
        downLastTimestamp.current = 0; //zero other option
            
      }      
    },
    [sensitivity]
  )
  return [count, checkPoses]
}
