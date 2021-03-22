import { useRef, useReducer, useCallback } from "react"

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
  
  return count
}

function checkSnatchPisition(shoulder, elbow, wrist, sensitivity=100){
  // console.log(wrist.y, elbow.y, shoulder.y, (wrist.y < elbow.y) && (wrist.y < shoulder.y) && (elbow.y < shoulder.y));
  // console.log(wrist.x, elbow.x, shoulder.x, Math.abs(wrist.x-elbow.x)<=sensitivity, Math.abs(wrist.x-shoulder.x)<=sensitivity);
  return(
    (wrist.y < elbow.y) && (sensitivity < shoulder.y-wrist.y) && (elbow.y < shoulder.y)  &&
    (Math.abs(wrist.x-elbow.x)<=sensitivity) &&
    (Math.abs(wrist.x-shoulder.x)<=sensitivity))
}

function checkBallDown(shoulder, elbow, wrist, sensitivity=0){
  
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
    currentSide: null
  });

  const state = useRef('down')
  const downCounter = useRef(0);
  const upCounter = useRef(0);
  const downLastTimestamp = useRef(0);
  const upLastTimestamp = useRef(0);
  
  const checkPoses = useCallback(
    pose => {
      if (pose.score<0.5){
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
      
      if (isDown){
        const prev = downLastTimestamp.current


        if (state.current === 'up'){
          if (downCounter.current<=0){
            console.log('down counter started')
            downCounter.current = 5;
            upCounter.current = -1;
          } else {
            const diff = now-prev
            if (prev && 0<diff<=2*TICK_MS){
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
          rightWrist
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
          leftWrist
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
            upCounter.current = 2;
            downCounter.current = -1;
          } else {

            const diff = now-prev
            if (prev && 0<diff<=2*TICK_MS){
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
