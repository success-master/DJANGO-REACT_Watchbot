import React from 'react';

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: false,
      wholeTime: this.props.timeremaing,
      timeText: '-- : -- : --',
      strokeDashOffset: false,
      strokeDashArray: false,
      transformPointer: '',
    };
    this.intervalTimer = false;
    this.length = Math.PI * 2 * 100;
  }

  update = (value, timePercent) => {
    this.setState({
      strokeDashOffset: - this.length - this.length * value / (timePercent),
      transformPointer: `rotate(${360 * value / (timePercent)}deg)`
    });
  };


  timer = (seconds) => {
    let remainTime = Date.now() + (seconds * 1000);
    this.displayTimeLeft(seconds);
    this.intervalTimer = setInterval(() => {
      this.setState(_prevState => {
        _prevState.timeLeft = Math.round((remainTime - Date.now()) / 1000);
        if(_prevState.timeLeft < 0){
          clearInterval(this.intervalTimer);
          this.displayTimeLeft(_prevState.wholeTime);
          return _prevState;
        }
        this.displayTimeLeft(_prevState.timeLeft);
        return _prevState;
      });
    }, 1000);
  };


  displayTimeLeft = (timeLeft) => { //displays time on the input
    let dd = 0;
    let hh = 0;
    let mm = 0;
    let ss = 0;
    let n = timeLeft;
    let hours = (timeLeft >= 86400) ? 24 : 0;

    if(hours > 0){
      dd = Math.floor(n / (hours * 3600)); 
      n = n % (hours * 3600); 
    }
    hh = Math.floor(n / 3600); 
    n %= 3600; 
    mm = Math.floor(n / 60); 
    n %= 60; 
    ss = Math.floor(n); 
    
    // dd hh:mm:ss
    this.setState({timeText: `${dd}dd ${hh < 10 ? '0' : ''}${hh}:${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`});
    this.update(timeLeft, this.state.wholeTime);
  };

  start = (time) => {
    clearInterval(this.intervalTimer);
    this.setState(prevState => {
      console.log(this.length);
      prevState.strokeDashArray = this.length;
      prevState.strokeDashOffset = 0;
      prevState.wholeTime = time;
      setTimeout(() => this.timer(time), 300);
      return prevState;
    });

  };


  componentDidMount() {
    console.log("Countdown mounted");
    this.start(this.props.timeremaing);
  }

  componentWillUnmount() {
    clearInterval(this.intervalTimer);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.step !== nextProps.step || this.props.delay_available !== nextProps.delay_available) {
      clearInterval(this.intervalTimer);
      console.log(this.props.timeremaing, nextProps.timeremaing);
      this.start(nextProps.timeremaing);
    }
  }

  render() {
    return (
        <div style={{textAlign: 'center'}}>
            <div className="countdown-circular">
                <div className="circle">
                    <svg width="150" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(110,110)">
                            <circle r="100" className="e-c-base"/>
                            <g transform="rotate(-90)">
                                <circle r="100" className="e-c-progress" style={{
                                    strokeDasharray: this.state.strokeDashArray,
                                    strokeDashoffset: this.state.strokeDashOffset,
                                }}/>
                            </g>
                        </g>
                    </svg>
                </div>
                <div className="controlls">
                    <div className="display-remain-time">
                        <span className="label">time remaining</span>
                        <span>{this.state.timeText}</span>
                    </div>
                </div>
            </div>
        </div>
    )
  }
}

export default Countdown
