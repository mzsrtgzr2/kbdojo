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

// function checkSnatchVector(lastPoses, side){
//   if (!!lastPoses && lastPoses.length>1){
//     const x_vals = lastPoses.map(({pose})=>{
//       if (side=='left'){
//         return pose.leftElbow.x
//       }
//       return pose.rightElbow.x
      
//     })
//     let sumX = 0;
//     for (let i=1; i<x_vals.length; i++){
//       sumX += Math.abs(x_vals[i]-x_vals[i-1])
//     }

//     const y_vals = lastPoses.map(({pose})=>{
//       if (side=='left'){
//         return pose.leftElbow.y
//       }
//       return pose.rightElbow.y
      
//     })

//     let sumY = 0;
//     for (let i=1; i<y_vals.length; i++){
//       sumY += Math.abs(y_vals[i]-y_vals[i-1])
//     }
  
//     return [sumX/lastPoses.length, sumY/lastPoses.length]
//   }
//   return [0,0];
// }

function checkBackSwing(lastPoses, chestWidth){
  if (!!lastPoses && lastPoses.length>1){
    const poseMiddles = lastPoses.map(({pose})=>getPoseMiddle(pose.nose, pose.leftShoulder, pose.rightShoulder))

    const pose = lastPoses[lastPoses.length-1].pose;
    const lastPoseMiddle = getPoseMiddle(pose.nose, pose.leftShoulder, pose.rightShoulder);
    
    for(let i=0; i<poseMiddles.length;i++){
      const poseMiddle = poseMiddles[i]
      if (Math.abs(poseMiddle-lastPoseMiddle)>chestWidth/2){
        return true;
      }
    }
  }
  return false;
}

function checkSnatchPisition(shoulder, elbow, wrist, nose, sensitivity=50){
  // console.log('y', wrist.y, elbow.y, shoulder.y, (wrist.y < elbow.y) && (wrist.y < shoulder.y) && (elbow.y < shoulder.y));
  // // console.log('x', wrist.x, elbow.x, shoulder.x, Math.abs(wrist.x-elbow.x)<=sensitivity, Math.abs(wrist.x-shoulder.x)<=sensitivity);
  // console.log(
  //   0 <= (nose.y-wrist.y),
  //   (0 <= shoulder.y-elbow.y),
  //   Math.abs(wrist.x-shoulder.x)<=4*sensitivity)
  
  // console.log(nose.y, wrist.y)

  return(
      // 0 <= (nose.y-wrist.y) || 
    sensitivity <= (nose.y-wrist.y) &&
    // ((sensitivity/2 <= shoulder.y-wrist.y)  && 
    (sensitivity <= shoulder.y-elbow.y) &&
    // Math.abs(wrist.x-elbow.x)<=4*sensitivity &&
    Math.abs(wrist.x-shoulder.x)<=8*sensitivity)
}

function checkHandAboveHand(shoulder, elbow, wrist, nose, sensitivity=50){
  
  return (sensitivity <= (nose.y-wrist.y) || sensitivity <= (shoulder.y-elbow.y) )
    // (Math.abs(wrist.x-elbow.x)<=2*sensitivity) &&
    // (Math.abs(wrist.x-shoulder.x)<=2*sensitivity))
}

function checkBallDown(shoulder, elbow, wrist, nose, sensitivity=50){
  
  const res = !!elbow && !!wrist && !!shoulder && (
    (((elbow.y-nose.y) >= 0 || (elbow.y-shoulder.y) >= 0) && (wrist.y-nose.y) >= 0));
  // if (res)
    // console.log(
    //   shoulder.y, elbow.y, wrist.y, nose.y, sensitivity
    // );
  return res;
}

function checkHandsParallel(rightElbow, leftElbow, rightWrist, leftWrist, sensitivity){
  return (
    (sensitivity>=Math.abs(rightElbow.y-leftElbow.y)) ||
    (sensitivity>=Math.abs(rightWrist.y-leftWrist.y))
  )
}

function getChestWidth(leftShoulder, rightShoulder){
  return Math.sqrt(
    Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
    Math.pow(leftShoulder.y - rightShoulder.y, 2))
}

function getPoseMiddle(nose, leftShoulder, rightShoulder){
  return (nose.x+leftShoulder.x+rightShoulder.x)/3;
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
  const sideCounter = useRef([]);
  const downLastTimestamp = useRef(0);
  const upLastTimestamp = useRef(0);
  const lastSide = useRef(null)
  const lastTimeOfFixation = useRef(null)
  const lastFixationPose = useRef(null);
  const lastFixationY = useRef(null);
  const lastPoses = useRef([]);
  const fixationTimeSafetyIncreases = useRef(0);
  
  const checkPoses = useCallback(
    (poses, minPoseConfidence) => {

      const now = Date.now();
      let pose;

      // const lastPoseMiddle = !!lastPose.current ? 
      //   getPoseMiddle(lastPose.current.pose.nose, lastPose.current.pose.leftShoulder, lastPose.current.pose.rightShoulder)
      // const poseMiddles = poses.map(_pose=>getPoseMiddle(_pose.nose, _pose.leftShoulder, _pose.rightShoulder));
      // let lastPoseIndex = poses.reduce((iMax, _pose, i, arr) => 
      //   getPoseMiddle(_pose.nose, _pose.leftShoulder, _pose.rightShoulder) > arr[iMax].score ? i : iMax, 0);

      // for (let i; i<poses.length; i++){
      //   const poseIndex = poses.reduce((iMax, _pose, i, arr) => _pose.score > arr[iMax].score ? i : iMax, 0);


      // }
      const chestWidths = poses.map(_pose=>{
        const {
          leftShoulder,
          rightShoulder,
        } = getKeypointsObject(_pose)
        if (!!leftShoulder && !!rightShoulder){
          return getChestWidth(leftShoulder, rightShoulder);
        }
        return 0;
      })

      const poseIndex = chestWidths.reduce((iMax, val, i, arr) => val > arr[iMax] ? i : iMax, 0);
      
      pose = poses[poseIndex];

      if (pose.score < minPoseConfidence){
        console.log('low pose confidence', pose.score)
        return;
      }

      const {
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
        nose,
      } = getKeypointsObject(pose)

      if (!leftShoulder || !leftElbow || !rightShoulder || !rightElbow || !rightWrist || !leftWrist || !nose){
        console.log('pose dropped, not enough info')
      }

      lastPoses.current = lastPoses.current.filter(({time})=>time>(now-500))

      // set this as last pose
      lastPoses.current.push({
        pose: {
          score: pose.score,
          leftShoulder,
          rightShoulder,
          leftElbow,
          rightElbow,
          leftWrist,
          rightWrist,
          nose,
        },
        time: now
      });

      const chestWidth = getChestWidth(leftShoulder, rightShoulder);

      const isDown = 
      checkBallDown(
        rightShoulder,
        rightElbow,
        rightWrist,
        nose,
        sensitivity=chestWidth
      ) &&
      checkBallDown(
        leftShoulder,
        leftElbow,
        leftWrist,
        nose,
        sensitivity=chestWidth
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
        fixationTimeSafetyIncreases.current = 0;
        sideCounter.current = []
        return pose
      }

      // const isBackSwing = checkBackSwing(lastPoses.current, chestWidth);
      // if (isBackSwing){

      //   console.log('detected backswing');
      //   return pose;
      // }
      
      var isRightSnatch=false, isLeftSnatch=false, isRightHandAboveHead=false, isLeftHandAboveHead=false;
      // check right
      if (!!rightWrist && !!rightShoulder && !!rightElbow){
         
          isRightSnatch = checkSnatchPisition(
            rightShoulder,
            rightElbow,
            rightWrist,
            nose,
            sensitivity = chestWidth/3
            )

          isRightHandAboveHead = checkHandAboveHand(
            rightShoulder,
            rightElbow,
            rightWrist,
            nose,
            sensitivity = chestWidth/3
          )
        
      }

      // check left
      if (!!leftWrist && !!leftShoulder && !!leftElbow){
        
      
        isLeftSnatch = checkSnatchPisition(
          leftShoulder,
          leftElbow,
          leftWrist,
          nose,
          sensitivity = chestWidth/3
        )
        isLeftHandAboveHead = checkHandAboveHand(
          leftShoulder,
          leftElbow,
          leftWrist,
          nose,
          sensitivity = chestWidth/3
        )
      }

      // console.log((isLeftSnatch || isRightSnatch), state.current)
      if (isLeftSnatch || isRightSnatch){
        const prev = upLastTimestamp.current

        var currentSide = null;
        if (
          checkHandsParallel(rightElbow, leftElbow, leftWrist, leftElbow, chestWidth/2) && 
          (
            (isLeftSnatch && (isRightHandAboveHead || isRightSnatch)) || 
            (isRightSnatch && (isLeftHandAboveHead || isLeftSnatch))
          )){
          currentSide = 'both';
        } else if (isLeftSnatch){
          currentSide = 'left';
        } else if (isRightSnatch){
          currentSide = 'right';
        }

        const prevSide = lastSide.current;
        if (prevSide != currentSide && 
            !!lastTimeOfFixation.current &&
            (now-lastTimeOfFixation.current) <= 2000){
              console.log('dropped up because its probably back swing');
              sideCounter.current = []
              upLastTimestamp.current = 0; //zero other option
              return pose;
        }

        let diffLifts = 0;
        if (!!lastTimeOfFixation.current){
          diffLifts = now-lastTimeOfFixation.current
        }
        
        if (!!currentSide){
          sideCounter.current.push(
            currentSide
          )
        }

        if (state.current === 'down'){
          if (upCounter.current <= 0){

            // special case is when state "changes", we need to wait a bit more
            // to make sure it's not a back swting
            if (prevSide != currentSide){
              if (diffLifts>3500){
                upCounter.current =  2; // long time passed. it's ok to require less
              } else {
                upCounter.current =  3; //longer fixation required
              }
            } else {
              upCounter.current =  1;
            }

            downCounter.current = -1;
            fixationTimeSafetyIncreases.current = 0;
          } else {

            const diff = now-prev
            if (prev && 0<diff<=10*TICK_MS){
              console.log('up counter advanced')
              upCounter.current-=diff/TICK_MS;
            }
        
            if (upCounter.current<=0){
              // find what side was most active
              var counts = {};
              const arr = sideCounter.current;

              let pointer=null;
              for (var i = arr.length-1; i >=0; i--) {
                var val = arr[i];
                if (!!pointer && pointer!=val && !!counts[val]){
                  break;
                }
                pointer = val;
                counts[val] = counts[val] ? counts[val] + 1 : 1;
              }

              const sorted = Object.entries(counts).sort((x,y)=>y[1]-x[1]);
              const maxOccSide = sorted[0]
              const secondMaxOccSide = sorted[1]
              const side = maxOccSide[0];

              if (fixationTimeSafetyIncreases.current<3 &&
                  !!prevSide && (side != prevSide) && 
                  (now-lastTimeOfFixation.current) <= 5000 && (
                  !!secondMaxOccSide && 
                    secondMaxOccSide[1]/maxOccSide[1]>0.4)){
                upCounter.current+=1
                console.log('side is not confident, adding more time for fixation')
                fixationTimeSafetyIncreases.current+=1
                return pose
              }

              let fixationYVal = 0;
              switch(side){
                case 'both':
                  fixationYVal = (leftWrist.y+rightWrist.y)/2;
                  break;
                case 'left':
                  fixationYVal = leftWrist.y;
                  break;
                case 'right':
                  fixationYVal = rightWrist.y;
                  break;
              }

              // find the last Y position of the last fixation
              // if it's too far, it's probably a back swing
              if (fixationTimeSafetyIncreases.current<3 &&
                  !!prevSide && side!='both' && prevSide != 'both' &&
                  !!lastTimeOfFixation.current &&
                  (now-lastTimeOfFixation.current) <= 5000 &&
                  !!lastFixationY.current && 
                    Math.abs(fixationYVal-lastFixationY.current)>chestWidth/3){
                  upCounter.current+=1
                  fixationTimeSafetyIncreases.current+=1
                  console.log('side is not confident, adding more time for fixation')
                  return pose
              }

              dispatch({
                type: 'increment',
                currentSide: side,
              });

              lastFixationPose.current = pose;
              lastFixationY.current = fixationYVal;
              lastSide.current = side;
              lastTimeOfFixation.current = now
              state.current = 'up';
              downCounter.current = -1;
              console.log('up', side)
            }  
          }
          
        }

        // update time stamp of down event
        upLastTimestamp.current = now;
        downLastTimestamp.current = 0; //zero other option
            
      }
      return pose
    },
    [sensitivity]
  )
  return [count, checkPoses]
}
