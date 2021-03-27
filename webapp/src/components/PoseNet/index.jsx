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
import kimVid from 'assets/kim1.mp4';
// import andr1Vid from 'assets/andr1.mp4';
import andr2Vid from 'assets/andr2.mp4';
import kim2Vid from 'assets/kim2.mp4';
import kim3Vid from 'assets/kim3.mp4';
// import kim3Vid from 'assets/kim3_problem.mp4';
import kim4Vid from 'assets/kim4_problem_min_1.mp4';
// import kim4Vid from 'assets/kim4.mp4';
// import kim4Vid from 'assets/kim4_problem_min_1_2.mp4'
import ksenya1Vid from 'assets/ksenya1.mp4';
import ksenya1Vid_problem_back_swing from 'assets/ksenya1_problem_back_swing.mp4';
import ksenya1Vid_problem_back_swing_2 from 'assets/ksenya1_back_swing_crazy.mp4';

console.log('Using TensorFlow backend: ', tf.getBackend());

export default class PoseNet extends React.Component {

  static defaultProps = {
    videoWidth: 600,
    videoHeight: 500,
    flipHorizontal: false,
    algorithm: 'multi-pose',
    mobileNetArchitecture: isMobile() ? 'MobileNetV1' : 'MobileNetV1',
    showVideo: true,
    showSkeleton: true,
    showPoints: false,
    minPoseConfidence: 0.5,
    minPartConfidence: 0.6,
    maxPoseDetections: 2,
    nmsRadius: 20.0,
    outputStride: 16,
    imageScaleFactor: 1,
    skeletonColor: 'rgba(239,11,94,0.5)',
    skeletonLineWidth: 10,
    loadingText: 'Loading...',
    className: '',
    onEstimate: null
  }

  constructor(props) {
    super(props, PoseNet.defaultProps)
    this.state = { loading: true }
  }

  getCanvas = elem => {
    this.canvas = elem
  }

  getVideo = elem => {
    this.video = elem
  }

  async componentWillMount() {
    // Loads the pre-trained PoseNet model
    this.net = await posenet.load({
      architecture: 'MobileNetV1',
      inputResolution: isMobile() ? 300: 300,
      // outputStride: 8,
      // multiplier: 0.75,
      // inputResolution: { width: this.props.videoWidth, height: this.props.videoHeight },
    });
    console.log('posnet loaded', this.net);
  }

  async componentDidMount() {
    try {
      await this.setupCamera()
    } catch(e) {
      alert('This browser does not support video capture, or this device does not have a camera')
      throw 'This browser does not support video capture, or this device does not have a camera'
    } finally {
      this.setState({ loading: false })
    }

    this.detectPose()
  }

  async setupCamera() {
      // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw 'Browser API navigator.mediaDevices.getUserMedia not available'
    }

    const { videoWidth, videoHeight } = this.props
    const video = this.video
    const mobile = isMobile()

    video.width = videoWidth
    video.height = videoHeight

    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   audio: false,
    //   video: {
    //     facingMode: 'user',
    //     width: {max: videoWidth},
    //     height: {max: videoHeight},
    //   }
    // });

    // video.srcObject = stream
    // video.src = "https://tests-kbdojo-assets.s3-eu-west-1.amazonaws.com/kim1.mp4"
    
    
    return new Promise(resolve => {
      
      video.onloadedmetadata = () => {
        // Once the video metadata is ready, we can start streaming video
        setTimeout(()=>video.play(), 100)
        video.muted = true;
        

        resolve(video)
      }
      // video.onloadeddata = ()=>{
      //   setTimeout(
      //     ()=>{
      //       video.currentTime = 40
      //     }, 1000
      //   )
        
      // }
    })
  }

  detectPose() {
    const { videoWidth, videoHeight } = this.props
    const canvas = this.canvas
    const ctx = canvas.getContext('2d')

    canvas.width = videoWidth
    canvas.height = videoHeight

    this.poseDetectionFrame(ctx)
  }

  poseDetectionFrame(ctx) {
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
      let poses = []

      switch (algorithm) {
        case 'single-pose':
          if (!!this.net){
            const pose = await this.net.estimateSinglePose(
              video,
              imageScaleFactor,
              flipHorizontal,
              outputStride
            )
            this.props.onEstimate(pose);
            poses.push(pose)
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

              const pose = rawPoses[0];
              if (pose.score >= minPoseConfidence) {
                this.props.onEstimate(pose);
                poses.push(pose)
              } else {
                console.log('dropping pose, score', pose.score)
              }
            }
          }

          break
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (showVideo) {
        ctx.save()
        // ctx.scale(-1, 1)
        // ctx.translate(-videoWidth, 0)
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
        ctx.restore()
      }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores
      if (process.env.NODE_ENV=='development'){
        poses.forEach(({ score, keypoints }) => {
          if (score >= minPoseConfidence) {
            if (showPoints) {
              drawKeypoints(keypoints, minPartConfidence, skeletonColor, ctx);
            }
            if (showSkeleton) {
              drawSkeleton(keypoints, minPartConfidence, skeletonColor, skeletonLineWidth, ctx);
            }
          }
        })
      }

      requestAnimationFrame(poseDetectionFrameInner)
    }

    poseDetectionFrameInner()
  }

  render() {
    const loading = this.state.loading
      ? <div>{ this.props.loadingText }</div>
      : ''
    return (
      <div className="PoseNet">
        <Grid
              container
              direction="column"
              alignItems="center"
              justify="center">
          { loading }
        </Grid>
        
        <canvas 
          className={this.props.className}
          ref={ this.getCanvas }></canvas>
        <video
          mute
          playsInline
          ref={ this.getVideo }>
            <source src={kim4Vid}></source>
          </video>
      </div>
    )
  }
}
