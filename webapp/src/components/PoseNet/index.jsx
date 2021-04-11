import * as posenet from '@tensorflow-models/posenet'
import * as React from 'react'
import * as tf from '@tensorflow/tfjs';
import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core';
import { isMobile, drawKeypoints, drawSkeleton } from './utils'
import './style.scss'
// import kimVid from 'assets/kim1.mp4';
// import andr1Vid from 'assets/andr1.mp4';
// import andr2Vid from 'assets/andr2.mp4';
// import kim2Vid from 'assets/kim2.mp4';
// import kim3Vid from 'assets/kim3.mp4';
// import kim3Vid from 'assets/kim3_problem.mp4';
// import kim4Vid from 'assets/kim4_problem_min_1.mp4';
// import kim4Vid from 'assets/kim4.mp4';
// import kim4Vid from 'assets/kim4_problem_min_1_2.mp4'

// import ksenya1Vid from 'assets/ksenya1.mp4';
// import ksenya1Vid_problem_back_swing from 'assets/ksenya1_problem_back_swing.mp4';
// import ksenya1Vid_problem_back_swing_2 from 'assets/ksenya1_back_swing_crazy.mp4';
// import ksenya1Vid_problem_rep_110_120 from 'assets/ksenya_problem_rep_110_120.mp4';
// import ksenya1Vid_problem_back_swing_lefts from 'assets/ksenya1_back_swing_crazy_lefts.mp4';
// import ksenya1Vid_108_120 from 'assets/ksenya_1_108_120.mp4';
// import andrFastSnatchVid from 'assets/andr_fast.mp4';
// import someGuyVid from 'assets/someguy.mp4'
// import denis1Vid from 'assets/denis1.mp4'
// import kim5Vid from 'assets/kim5_gym.mp4'
  // import kim5Vid_snatch from 'assets/kim5_gym_snatch.mp4'
  import kim5Vid_snatch_problem_double_count from 'assets/kim5_gym_snatch_problem_double_count.mp4';

const vid2Show = kim5Vid_snatch_problem_double_count; //ksenya1Vid;
console.log('Using TensorFlow backend: ', tf.getBackend());

export default class PoseNet extends React.Component {

  static defaultProps = {
    videoWidth: 250,
    videoHeight: 250,
    flipHorizontal: false,
    algorithm: 'multi-pose',
    mobileNetArchitecture: isMobile() ? 'MobileNetV1' : 'MobileNetV1',
    showVideo: true,
    showSkeleton: true,
    showPoints: false,
    minPoseConfidence: 0.4,
    minPartConfidence: 0.2,
    maxPoseDetections: 2,
    nmsRadius: 20.0,
    outputStride: 16,
    imageScaleFactor: 1,
    skeletonColor: 'rgba(239,11,94,0.3)',
    skeletonLineWidth: 7,
    loadingText: 'Loading...',
    className: '',
    onEstimate: null,
    isEndWorkout: false
  }

  constructor(props) {
    super(props, PoseNet.defaultProps)
    this.state = { loading: true }
  }

  getCanvas = elem => {
    this.canvas = elem
  }

  getCanvasPose = elem => {
    this.canvasPose = elem
  }

  getCanvasRecord = elem => {
    this.canvasRecord = elem
  }

  getVideo = elem => {
    this.video = elem
  }

  async componentWillMount() {
    // Loads the pre-trained PoseNet model
    this.net = await posenet.load({
      architecture: 'MobileNetV1',
      // outputStride: 8,
      // multiplier: 0.75,
      inputResolution: { width: this.props.videoWidth, height: this.props.videoHeight },
    });
    console.log('posnet loaded', this.net);
  }

  async componentDidMount() {
    try {
      await this.setupCamera()
    } catch(e) {
      alert('This browser does not support video capture, or this device does not have a camera')
      throw e
    } finally {
      this.setState({ loading: false })
    }

    this.detectPose()
    this.recordCanvas()
  }

  async componentWillReceiveProps(nextProps){
    if (nextProps.isEndWorkout===true){
        if (this.mediaRecord.state === 'recording') {
          // after stop data avilable event run one more time
          this.mediaRecord.stop();
          console.log('stopping tracks');
          this.video.srcObject.getTracks().forEach(function(track) {
            track.stop();
          });
      }
    }
    if (nextProps.isWorkoutStarted===true){
      if (!this.mediaRecord) {
          // after stop data avilable event run one more time
          this.mediaRecord = await this.record(this.canvasRecord)
      }
    }
  }

  async setupCamera() {
      // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw 'Browser API navigator.mediaDevices.getUserMedia not available'
    }

    const { videoWidth, videoHeight } = this.props
    const video = this.video
    const mobile = isMobile()

    // video.width = videoWidth
    // video.height = videoHeight

    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (!vid2Show){
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
        }
      });

      video.srcObject = stream
    }
    
    return new Promise(resolve => {
      
      video.onloadedmetadata = () => {
        // Once the video metadata is ready, we can start streaming video
        setTimeout(()=>video.play(), 0)
        video.muted = true;

        console.log('raw video:', video.videoWidth, video.videoHeight)

        if (video.videoWidth > video.videoHeight){
          video.width = videoWidth
          video.height = videoWidth / video.videoWidth * video.videoHeight;
        } else {
          video.width = videoHeight / video.videoHeight * video.videoWidth;
          video.height = videoHeight
        }


        resolve(video)
      }
    })
  }

  record(canvas, time) {
    var recordedChunks = [];
    return new Promise((res, rej) => {
        var stream = canvas.captureStream();
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm"
        });

        //ondataavailable will fire in interval of `time || 4000 ms`
        mediaRecorder.start();

        mediaRecorder.ondataavailable = function (e) {
            recordedChunks.push(e.data);
            if (mediaRecorder.state === 'recording') {
                // after stop data avilable event run one more time
                mediaRecorder.stop();
            }
        }

        mediaRecorder.onstop = (event) =>{
            var blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            var url = URL.createObjectURL(blob);

            this.props.onVideoUrl(url);       
        }

        res(mediaRecorder);
    })
}


  detectPose() {
    const {canvasPose} = this
    const ctxPose = canvasPose.getContext('2d')
  
    canvasPose.width = this.video.width
    canvasPose.height = this.video.height

    this.poseDetectionFrame(ctxPose)
  }


  poseDetectionFrame(ctxPose) {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      maxPoseDetections,
      minPartConfidence,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth,
    } = this.props

    const video = this.video

    const poseDetectionFrameInner = async () => {
      let pose;

      switch (algorithm) {
        case 'single-pose':
          if (!!this.net){
            pose = await this.net.estimateSinglePose(
              video,
              imageScaleFactor,
              flipHorizontal,
              outputStride
            )
            if (!!this.props.onEstimate && !!pose){
                pose = this.props.onEstimate([pose], minPoseConfidence);
            }
          }
          break
        case 'multi-pose':
          if (!!this.net){
            const rawPoses = await this.net.estimateMultiplePoses(
              video,
              imageScaleFactor,
              flipHorizontal,
              outputStride,
              maxPoseDetections,
              minPartConfidence,
              nmsRadius
            )
            if (rawPoses.length>0){

              if (!!this.props.onEstimate){
                pose = this.props.onEstimate(rawPoses, minPoseConfidence);
              }
                
            }
          }

          break
      }

      if (process.env.NODE_ENV=='development' && !!pose){
        ctxPose.clearRect(0, 0, videoWidth, videoHeight);
        const { keypoints } = pose;
        if (showPoints) {
          drawKeypoints(keypoints, minPartConfidence, skeletonColor, ctxPose);
        }
        if (showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, skeletonColor, skeletonLineWidth, ctxPose);
        }
      }
      

      requestAnimationFrame(poseDetectionFrameInner)
    }

    poseDetectionFrameInner()
  }

  recordCanvas() {
    const {canvasRecord} = this
    const ctxRecord = canvasRecord.getContext('2d')

    canvasRecord.width = window.innerWidth;
    canvasRecord.height = window.innerHeight

    this.recordFrame(ctxRecord)
  }

  recordFrame(ctxRecord) {
    const video = this.video

    const inner = async () => {
      
      ctxRecord.clearRect(0, 0, ctxRecord.canvas.width, ctxRecord.canvas.height);

      ctxRecord.drawImage(video, 0, 0, ctxRecord.canvas.width, ctxRecord.canvas.height)
      
      let fontSize = 26;
      let pad = 15;
      if (window.innerWidth>=1400){
        fontSize = 53;
        pad = 20;
      } else if (window.innerWidth>=1000){
        fontSize = 26;
        pad = 20;
      }
      ctxRecord.font = `${fontSize}px Arial`;
      let y = ctxRecord.canvas.height-(fontSize);
      let x = pad*2;
      ctxRecord.fillStyle = 'rgba(225,225,225,0.0)';
      ctxRecord.fillRect(0, ctxRecord.canvas.height - 6*(fontSize+pad), ctxRecord.canvas.width, ctxRecord.canvas.height)

      ctxRecord.fillStyle = 'rgba(239,11,94,1)';
      ctxRecord.fillText(`Doubles: ${this.props.workoutNumbers.both}`, x, y);
      ctxRecord.fillText(`Rights: ${this.props.workoutNumbers.right}`, x, y-1*(fontSize+pad));
      ctxRecord.fillText(`Lefts: ${this.props.workoutNumbers.left}`, x, y-2*(fontSize+pad));

      ctxRecord.font = `bold ${fontSize}px Arial`;
      ctxRecord.fillText(`Pace: ${this.props.workoutNumbers.pace}`, x, y-3*(fontSize+pad));
      ctxRecord.fillText(`Total: ${this.props.workoutNumbers.total}`, x, y-4*(fontSize+pad));
      ctxRecord.fillText(`${this.props.workoutNumbers.time}`, x, y-5*(fontSize+pad));      

      requestAnimationFrame(inner)
    }

    inner()
  }

  render() {

    return (
      <div className="PoseNet">
        {!!vid2Show ?
        <video
          mute
          playsInline
          className={this.props.className}
          ref={ this.getVideo }>
            <source src={vid2Show}></source>
          </video>: <video
            playsInline
            className={this.props.className}
            ref={ this.getVideo }>
            </video>}
          
          <canvas 
            className={this.props.className}
            ref={ this.getCanvasPose }></canvas>

          <canvas 
            className="recordCanvas"
            ref={ this.getCanvasRecord }></canvas>
      </div>
    )
  }
}
