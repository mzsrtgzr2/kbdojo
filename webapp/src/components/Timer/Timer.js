import React, { Component } from 'react'
import SecondsTohhmmss from './SecondsTohhmmss'
import PropTypes from 'prop-types'

let offset = null, interval = null
let durations = [];
/**
 * Timer module
 * A simple timer component.
**/
export default class Timer extends Component {
  static get propTypes () {
    return {
      className: PropTypes.string,
      startAutomatically: PropTypes.bool,
      onMinute: PropTypes.func,
      showControllers: PropTypes.bool
    }
  }

  constructor(props) {
    super(props)
    this.state = { clock: 0, time: '00:00:00', active: false }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.pause()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startAutomatically == true && !this.props.startAutomatically) {
        this.play();
    }
  }

  pause() {
    if (interval) {
      clearInterval(interval)
      interval = null
      this.setState({active: false})
      durations.append(this.currentClock())
    }
  }

  play() {
    offset = Date.now()
    if (!interval) {
      interval = setInterval(this.update.bind(this), 1000)
      this.setState({active: true})
      
    }
  }

  reset() {
    this.setState({clock: 0 })
    let time = SecondsTohhmmss(0 / 1000)
    this.setState({time: time })
    if (durations.length>0){
      durations.splice(0, durations.length);
    }
  }

  currentClock(){
    return (Date.now() - offset) / 1000;
  }

  update() {
    const clock = this.currentClock() + durations.reduce((a, b) => a + b, 0) / 1000;
    this.setState({clock: clock })
    let time = SecondsTohhmmss(clock)
    this.setState({time: time })
    // notify for 1 minute threshold
    if (!!this.props.onMinute){
      const seconds = parseInt(clock);
      if (seconds%60 == 0){
        this.props.onMinute(seconds/60);
      }
    }
  }

  calculateOffset() {
    let now = Date.now()
    let newOffset = now - offset
    offset = now
    return newOffset
  }

  render() {
    const {active} = this.state;
    const {showControllers} = this.props;
    const timerStyle = {
      textAlign: "center",
      width: "100%",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    };

    const buttonStyle = {
      background: "#EF0B5E",
      color: "white",
      fontSize: "3vw",
      border: "1px solid #ddd",
      marginRight: "5px",
      padding: "10px",
      fontWeight: "200"
    };

    const secondsStyles = {
      
    };

    const renderControllers = ()=>(<>
      {active ? <>
          <button onClick={this.reset.bind(this)} style={buttonStyle} >reset</button>
          <button onClick={this.pause.bind(this)} style={buttonStyle} >pause</button>
        </> : <>
          <button onClick={this.play.bind(this)} style={buttonStyle} >play</button>
        </>}
    </>);
    
    return (
      <div style={timerStyle} className={this.props.className}>
        <div style={secondsStyles} className="seconds"> {this.state.time}</div>
        <div>
          {/* {showControllers && renderControllers()} */}
        </div>
        
      </div>
    )
  }
}
