import * as posenet from '@tensorflow-models/posenet'
import * as React from 'react'
import * as tf from '@tensorflow/tfjs';

import { isMobile, drawKeypoints, drawSkeleton } from './utils'
import './style.scss'

console.log('Using TensorFlow backend: ', tf.getBackend());

export default class PoseNet extends React.Component {

  static defaultProps = {
    videoWidth: 600,
    videoHeight: 500,
    flipHorizontal: false,
    algorithm: 'single-pose',
    mobileNetArchitecture: isMobile() ? 'MobileNetV1' : 'MobileNetV1',
    showVideo: true,
    showSkeleton: true,
    showPoints: false,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20.0,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: 'rgba(66,135,246,0.6)',
    skeletonLineWidth: isMobile() ? 5: 15,
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
      architecture: this.props.mobileNetArchitecture,
    });
    console.log('posnet loaded', this.net);
  }

  async componentDidMount() {
    try {
      await this.setupCamera()
    } catch(e) {
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: mobile ? void 0 : videoWidth,
        height: mobile ? void 0: videoHeight,
      }
    });

    video.srcObject = stream

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        // Once the video metadata is ready, we can start streaming video
        video.play()
        resolve(video)
      }
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
        // case 'multi-pose':

          // poses = await net.estimateMultiplePoses(
          //   video,
          //   imageScaleFactor,
          //   flipHorizontal,
          //   outputStride,
          //   maxPoseDetections,
          //   minPartConfidence,
          //   nmsRadius
          // )

          // break
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

      requestAnimationFrame(poseDetectionFrameInner)
    }

    poseDetectionFrameInner()
  }

  render() {
    const loading = this.state.loading
      ? <div className="PoseNet__loading">{ this.props.loadingText }</div>
      : ''
    return (
      <div className="PoseNet">
        { loading }
        
        <canvas 
          className={this.props.className}
          ref={ this.getCanvas }></canvas>
        <video playsInline ref={ this.getVideo }></video>
      </div>
    )
  }
}
