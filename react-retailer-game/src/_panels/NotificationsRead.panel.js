import React from 'react';
import { connect } from 'react-redux'

import { LoadCurrentBidDetailForNotification, ReloadBidNotifications } from '../_actions/Bids.action'
import NotificationLine from  '../_components/NotificationLine';

import { Grid, Container } from 'semantic-ui-react'

class NotificationsReadPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeMineStatus: -1,
      activeFollowStatus: -1
    }
  }

  componentDidMount() {
  }

  onShowBids(e) {
    this.props.onShowBids(e);
  }

  onClickMineStatus = (indexNotif) => {
    this.setState(prevState => ({
      activeMineStatus: prevState.activeMineStatus === indexNotif? -1 : indexNotif
    }))
    this.props.LoadCurrentBidDetailForNotification(this.props.notifProps.notificationsMineRead.results[indexNotif].auction.id,'mine')
  }

  onClickFollowStatus = (indexNotif) => {
    this.setState(prevState => ({
      activeFollowStatus: prevState.activeFollowStatus === indexNotif? -1 : indexNotif
    }))
    this.props.LoadCurrentBidDetailForNotification(this.props.notifProps.notificationsFollowRead.results[indexNotif].auction.id,'follow')
  }

  render() {
    if (this.props.notifProps.reloadBidNotifications === true) {
      if (this.state.activeMineStatus > -1) {this.props.LoadCurrentBidDetailForNotification(this.props.notifProps.notificationsMineRead.results[this.state.activeMineStatus].auction.id,'mine') }
      if (this.state.activeFollowStatus > -1) {this.props.LoadCurrentBidDetailForNotification(this.props.notifProps.notificationsFollowRead.results[this.state.activeFollowStatus].auction.id,'follow') }
      this.props.ReloadBidNotifications(false)
    }

    let thatMSF = this.onClickMineStatus
    let thatFSF = this.onClickFollowStatus
    let thatMineStatus = this.state.activeMineStatus
    let thatFollowStatus = this.state.activeFollowStatus
    const NotificationMineItems = this.props.notifProps.notificationsMineRead.results.map(function(notif, index) {
      return <NotificationLine key ={ index + '-mr'} index={index} notif = { notif } color_left={"#ff6600"} statusClickFun={thatMSF} openStatus={thatMineStatus === index} tipo={'mine'} />
    });

    const NotificationFollowItems = this.props.notifProps.notificationsFollowRead.results.map(function(notif, index) {
      return <NotificationLine key ={ index + '-fr' } index={index} notif = { notif } color_left={"#90a4ae"} statusClickFun={thatFSF} openStatus={thatFollowStatus === index} tipo={'follow'} />
    });

    return (
      <div>
        <Container  className="notifications-block__header">
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={16}>
              <div className="notifications-block__header__title">From my trades</div>
            </Grid.Column>
          </Grid.Row>
        </Container>
        <Container className="boardNotif notifications-block__content">
          {NotificationMineItems}
        </Container>

        <Container  className="notifications-block__header">
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={16}>
              <div className="notifications-block__header__title">From my watchlist</div>
            </Grid.Column>
          </Grid.Row>
        </Container>
        <Container className="boardNotif notifications-block__content">
          {NotificationFollowItems}
        </Container>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  notifProps: store.notificationsInfo
})

const mapActionsToProps = {
  LoadCurrentBidDetailForNotification,
  ReloadBidNotifications
}

export default connect(mapStateToProps, mapActionsToProps)(NotificationsReadPanel)
