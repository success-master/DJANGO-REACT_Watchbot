import React from "react";
import { connect } from 'react-redux'

import { Tab} from 'semantic-ui-react'
import { LoadNotificationsMineRead, LoadNotificationsFollowRead, SetNotificationsMineRead, SetNotificationsFollowRead } from '../_actions/Notifications.action'
import { SetPanel } from '../_actions/Settings.action'
import NotificationsNewPanel from '../_panels/NotificationsNew.panel'
import NotificationsReadPanel from '../_panels/NotificationsRead.panel'

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      webSocket: { status: "DISCONNECTED" , response: "", err: "None"}
    };
  }

  componentDidMount() {
    this.props.LoadNotificationsMineRead()
    this.props.LoadNotificationsFollowRead()
    this.props.SetPanel('notifications')
    /*
    this.ws = new WebSocket('wss://echo.websocket.org/')

    this.ws.onopen = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          status: 'CONNECTED'
      }
      }))
      this.ws.send("test message")

    }

    this.ws.onmessage = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          response: e.data
      }
      }))

    }

    this.ws.onerror = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          err: 'WebSocket error'
      }
      }))

    }

    setTimeout(() => {
            this.ws.send("second message")
        }, 2000);

    setTimeout(() => {
            this.ws.send("third message")
        }, 3000);

    setTimeout(() => {
            this.ws.send({"k1":"test"})
        }, 5000);

    //this.ws.onclose = e => !e.wasClean && this.setState({ error: `WebSocket error: ${e.code} ${e.reason}` })
    */ 
  }

  componentWillUnmount() {
    this.props.SetNotificationsMineRead()
    setTimeout(this.props.SetNotificationsFollowRead(), 2000)
    this.props.SetPanel('')
    //this.ws.close()
    //alert("close")
  }

  render() {
    const panes = [
      { menuItem: 'NEW', render: () => <Tab.Pane><NotificationsNewPanel /></Tab.Pane> },
      { menuItem: 'READ', render: () => <Tab.Pane><NotificationsReadPanel /></Tab.Pane> }
    ]
    return (
      <div>
        <Tab panes={panes} />


        {/*
        <h3>Websocket Test: </h3>
        Status [ {this.state.webSocket.status} ]<br />
        Response [ <b>{this.state.webSocket.response}</b> ]<br />
        Err: [ {this.state.webSocket.err} ]
        */ }

      </div>
    )
  }
}

const mapStateToProps = store => ({
  notifProps: store.notificationsInfo
})

const mapActionsToProps = {
  LoadNotificationsMineRead,
  LoadNotificationsFollowRead,
  SetNotificationsMineRead,
  SetNotificationsFollowRead,
  SetPanel
}

export default connect(mapStateToProps, mapActionsToProps)(Notifications);
