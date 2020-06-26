import React from "react";
//import './App.css';
import './_styles/App.css';

import { connect } from 'react-redux'
import { LoadAuth, LoadSettingsProfile } from './_actions/Settings.action'
import { StartGame, GameUpdateDaemon } from './_actions/Game.action'

import AppUser from './App-user'

class AppAuth extends React.Component {
  constructor(props) {
        super(props);
        this.state = {
            proceed: false
        }

        if (process.env.REACT_APP_GAME === "true") {
          console.log("%cGAME MODE ON",'background: #ffa500; color: #f1f2f3')
          this.props.StartGame(process.env.REACT_APP_USER)
          this.gameInterval = setInterval(() => this.props.GameUpdateDaemon(10,0,process.env.REACT_APP_USER), 10000)
        }

        if (process.env.REACT_APP_LOCAL === "true") {
          console.log("%cLOCALHOST",'background: #ffa500; color: #f1f2f3')
        }

        this.props.LoadAuth()


  }

  componentWillUnmount() {
      if (process.env.REACT_APP_GAME === "true") { clearInterval(this.gameInterval) }
    }

  render() {
    if (!this.props.userProps.isAuthenticated) {
      return(
        <span></span>
      )
    } else {
      return (
        <AppUser />
      )
    }

  }
}

const mapStateToProps = store => ({
  userProps: store.userInfo
})

const mapActionsToProps = {
  LoadAuth, LoadSettingsProfile,
  StartGame, GameUpdateDaemon
}

export default connect(mapStateToProps, mapActionsToProps)(AppAuth)
