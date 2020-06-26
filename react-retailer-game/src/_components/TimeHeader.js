import React from 'react'
import Moment from 'react-moment'
import 'moment-timezone'

class TimeHeader extends React.Component {
  render() {
    const dateToFormat = new Date()
    return (

      <div>
        <div>
          <Moment date={dateToFormat} format="HH:mm:ss dddd LL" />
        </div>
        <div>
          <span>
            CET
            <Moment date={dateToFormat} tz="Europe/Berlin" format="HH:mm" />
          </span>
          <span>
            CST
            <Moment date={dateToFormat} tz="America/Regina" format="HH:mm" />
          </span>
          <span>
            EST
            <Moment date={dateToFormat} tz="America/New_York" format="HH:mm" />
          </span>
          <span>
            PST
            <Moment date={dateToFormat} tz="America/Los_Angeles" format="HH:mm" />
          </span>
        </div>
      </div>
    );
  }
}

export default TimeHeader
