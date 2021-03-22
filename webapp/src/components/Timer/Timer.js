import React, { Component } from 'react'
import SecondsTohhmmss from './SecondsTohhmmss'
import PropTypes from 'prop-types'

let offset = null, interval = null

/**
 * Timer module
 * A simple timer component.
**/
export default class Timer extends Component {
  static get propTypes () {
    return {
      options: PropTypes.object,
      onMinute: PropTypes.func
    }
  }

  constructor(props) {
    super(props)
    this.state = { clock: 0, time: '', active: false }
  }

  componentDidMount() {
    this.play();
  }

  componentWillUnmount() {
    this.pause()
  }

  pause() {
    if (interval) {
      clearInterval(interval)
      interval = null
      this.setState({active: false})
    }
  }

  play() {
    if (!interval) {
      offset = Date.now()
      interval = setInterval(this.update.bind(this), 1000)
      this.setState({active: true})
    }
  }

  reset() {
    let clockReset = 0
    this.setState({clock: clockReset })
    let time = SecondsTohhmmss(clockReset / 1000)
    this.setState({time: time })
  }

  update() {
    let clock = this.state.clock
    clock += this.calculateOffset()
    this.setState({clock: clock })
    let time = SecondsTohhmmss(clock / 1000)
    this.setState({time: time })
    // notify for 1 minute threshold
    if (!!this.props.onMinute){
      const seconds = parseInt(clock/1000);
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
    const timerStyle = {
      textAlign: "center",
      width: "100%",
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    };

    const buttonStyle = {
      background: "#fff",
      color: "#666",
      border: "1px solid #ddd",
      marginRight: "5px",
      padding: "10px",
      fontWeight: "200"
    };

    const secondsStyles = {
      
    };

    return (
      <div style={timerStyle}>
        <div style={secondsStyles} className="seconds"> {this.state.time}</div>
        {active ? <>
          <button onClick={this.reset.bind(this)} style={buttonStyle} >reset</button>
          <button onClick={this.pause.bind(this)} style={buttonStyle} >pause</button>
        </> : <>
          <button onClick={this.play.bind(this)} style={buttonStyle} >play</button>
        </>}
        
      </div>
    )
  }
}
