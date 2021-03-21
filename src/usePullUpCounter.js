import { useRef, useReducer, useCallback } from "react"

function getKeypointsObject(pose) {
  return pose.keypoints.reduce((acc, { part, position }) => {
    acc[part] = position
    return acc
  }, {})
}

function reducer(count, action) {
  if (action === "reset") {
    return 0
  }
  count = count + 1;

  return count
}

function checkSnatchPisition(shoulder, elbow, wrist, sensitivity=50){
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
  const [count, dispatch] = useReducer(reducer, 0)
  const state = useRef('down')
  const downCounter = useRef(0);
  const upCounter = useRef(0);
  const checkPoses = useCallback(
    poses => {
      if (poses.length !== 1) {
        return
      }

      const {
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
      } = getKeypointsObject(poses[0])

      // console.log(getKeypointsObject(poses[0]))

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
        if (state.current === 'up' && downCounter.current<=0){
          downCounter.current = 20;
        }
        downCounter.current--;
        
        if (downCounter.current==0){
          state.current = 'down';
          upCounter.current = 0;
          console.log('down')
        }
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
          if (isRightSnatch){
            console.log('right snatch!', rightShoulder,
            rightElbow,
            rightWrist)
          }
      }

      // check left
      if (!!leftWrist && !!leftShoulder && !!leftElbow){
        isLeftSnatch = checkSnatchPisition(
          leftShoulder,
          leftElbow,
          leftWrist
        )
        if (isLeftSnatch){
          console.log('left snatch!', leftShoulder,
          leftElbow,
          leftWrist)
        }
      }

      // console.log((isLeftSnatch || isRightSnatch), state.current)
      if (isLeftSnatch || isRightSnatch){
        
        if (state.current === 'down' && upCounter.current <= 0){
          upCounter.current = 20;
          
        }
        upCounter.current--;
        
        if (upCounter.current==0){
          state.current = 'up';
          downCounter.current = 0;
          dispatch("increment");
          console.log('up')
        }      
      }      
    },
    [sensitivity]
  )
  return [count, checkPoses]
}
