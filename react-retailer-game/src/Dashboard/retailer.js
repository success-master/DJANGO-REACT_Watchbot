import React from "react";
import { connect } from 'react-redux'
import WatchesGraphListPanel from  '../_panels/WatchesGraphList.panel';
import ActivitiesPanel from  '../_panels/Activities.panel';
//import SchedulesPanel from  '../_panels/Schedules.panel';
import ModalJoinTrade from  '../_modals/_JoinTrade.modal';

import { LoadLatestActivities,
         LoadScheduleCall,
         LoadRetailerLivePuts,
         LoadRetailerJoinedLiveCalls,
         LoadMyMatchedTrades,
         LoadMyFailedTrades,
         LoadCompetitorsPut } from '../_actions/Activities.action'
import { ModalJoinBid } from '../_actions/Bids.action'
import { SetPage } from '../_actions/Settings.action'

import { Container, Grid, Button } from 'semantic-ui-react'
//import advDash_sidebar from '../_assets/adv-dash.png';
//import advDash_primaryContent from '../_assets/adv-tommy.jpg';

class RetailerDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showingActivities: 'rLivePuts',
      showingPanel: 'activities'
    };
  }

  tick() {
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rLivePuts')) { this.props.LoadRetailerLivePuts() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rLiveCalls')) { this.props.LoadScheduleCall() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rJoinedLiveCalls')) { this.props.LoadRetailerJoinedLiveCalls() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rcMatchedTrades')) { this.props.LoadMyMatchedTrades() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rcFailedTrades')) { this.props.LoadMyFailedTrades() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rCompetitorsPut')) { this.props.LoadCompetitorsPut() }
  }

  componentDidMount() {
    this.props.SetPage('dashboard')
    this.props.LoadLatestActivities()
    this.props.LoadRetailerLivePuts()
    this.interval = setInterval(() => this.tick(), 10000)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  showRLivePuts = () => this.setState({ showingPanel: 'activities', showingActivities: 'rLivePuts' })
  showRLiveCalls = () => {
    this.props.LoadScheduleCall()
    this.setState({ showingPanel: 'activities', showingActivities: 'rLiveCalls' })
  }
  showRJoinedLiveCalls = () => {
    this.props.LoadRetailerJoinedLiveCalls()
    this.setState({ showingPanel: 'activities', showingActivities: 'rJoinedLiveCalls' })
  }
  showRCMatchedTrades = () => {
    this.props.LoadMyMatchedTrades()
    this.setState({ showingPanel: 'activities', showingActivities: 'rcMatchedTrades' })
  }
  showRCFailedTrades = () => {
    this.props.LoadMyFailedTrades()
    this.setState({ showingPanel: 'activities', showingActivities: 'rcFailedTrades' })
  }
  showRCompetitorsPut = () => {
    this.props.LoadCompetitorsPut()
    this.setState({ showingPanel: 'activities', showingActivities: 'rCompetitorsPut' })
  }

  showWatchlist = () => this.setState({ showingPanel: 'watchlist', showingActivities: '' })

  onCloseJoinBid = () => {
    this.props.ModalJoinBid( false, '')
    this.props.LoadLatestActivities()

    this.props.LoadRetailerLivePuts()
    this.props.LoadRetailerJoinedLiveCalls()
  }

  render() {
    if (this.props.activProps.reloadScheduledCall === true) {
      this.props.LoadScheduleCall()
    }

    return (

        <Container className="mainBoard">
          <Grid columns={16}>
            <Grid.Row>
              { /*
              <Grid.Column mobile={16} tablet={4} computer={4}>
                <WatchesGraphListPanel />
              </Grid.Column>
              */ }
              <Grid.Column mobile={16} tablet={3} computer={3} className="sidebar left">
                { /*
                <div className="actBar actBar-middle">YOUR ACTIVITIES</div>
                */ }
                <div className="userSide">
                  <div className="welcome-container userName">
                    <span>Welcome</span>
                    { this.props.userProps.userSettingsProfile.first_name !== 'undefined' && this.props.userProps.userSettingsProfile.first_name }
                  </div>

                  <div className="userSide-wrapper">
                    <div className="userSide-wrapper__info">
                      <div>
                        {process.env.REACT_APP_GAME === "true" ? (
                          this.props.activProps.rLivePuts.results.length
                        ):(
                          this.props.activProps.rLivePuts.hasOwnProperty("count") ? this.props.activProps.rLivePuts.count : 0
                        )
                        }
                      </div>
                      <span>
                        Live Trades
                      </span>
                    </div>
                    <div className="userSide-wrapper__info">
                      <div>
                        <i>01/m</i><i>10/y</i>
                      </div>
                      <span>
                        Cancellations left
                      </span>
                    </div>
                  </div>

                </div>

                <div className="menu-container">
                  <Button active={this.state.showingActivities==='rLivePuts'} className="buttonTri" onClick={() => {this.showRLivePuts(); this.props.openCloseMobileMenu()}}>
                    LIVE PUTS <i className="arrowRight" style={{float: "right"}}></i>
                  </Button>
                  <Button active={this.state.showingActivities === 'rLiveCalls'} className="buttonTri" onClick={() => {this.showRLiveCalls(); this.props.openCloseMobileMenu()}}>
                    LIVE CALLS <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  <Button active={this.state.showingActivities === 'rJoinedLiveCalls'} className="buttonTri" onClick={() => {this.showRJoinedLiveCalls(); this.props.openCloseMobileMenu()}}>
                    JOINED LIVE CALLS {/*MY FOLLOW*/} <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  <Button active={this.state.showingActivities === 'rcMatchedTrades'} className="buttonTri" onClick={() => {this.showRCMatchedTrades(); this.props.openCloseMobileMenu()}}>
                    MATCHED TRADES{/* MY TRADES*/} <i className="arrowRight" style={{float: "right"}}></i>
                  </Button>
                  {/* TO DO */}
                  <Button active={this.state.showingActivities === 'rcFailedTrades'} className="buttonTri" onClick={() => {this.showRCFailedTrades(); this.props.openCloseMobileMenu()}}>
                    FAILED TRADES <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  {/* TO DO */}
                  <Button active={this.state.showingActivities === 'rCompetitorsPut'} className="buttonTri" onClick={() => {this.showRCompetitorsPut(); this.props.openCloseMobileMenu()}}>
                    COMPETITORS' PUTS <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  {/* TO DO */}
                  <Button active={this.state.showingPanel === 'watchlist'} className="buttonTri" onClick={() => {this.showWatchlist(); this.props.openCloseMobileMenu()}}>
                    WATCHLIST <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                </div>

                {typeof this.props.modalBidProps.show &&
                  <ModalJoinTrade
                  modalOpen={this.props.modalBidProps.show}
                  modalClose={this.onCloseJoinBid}
                  bid={this.props.modalBidProps.bid}
                  label={this.props.modalBidProps.ref + " " + this.props.modalBidProps.model}
                  reference={this.props.modalBidProps.ref}
                  model={this.props.modalBidProps.model}
                  minPrice={this.props.modalBidProps.price}
                  fromNotification={this.props.modalBidProps.fromNotification}
                  raise_price={this.props.modalBidProps.raise_price}
                  offer_before_relaunch={this.props.modalBidProps.offer_before_relaunch} />
                }


                {/* <div className="advDash adv__sidebar-position">
                  <img src={advDash_sidebar} alt="dashboard adv" className="advDashImg" />
                </div> */}

              </Grid.Column>

              <Grid.Column mobile={16} tablet={13} computer={13} className="primary-content">
                {this.state.showingPanel==='activities' &&
                  (
                    <ActivitiesPanel kind={this.state.showingActivities} />
                  )
                }

                {this.state.showingPanel==='watchlist' &&
                  (
                    <WatchesGraphListPanel />
                  )
                }

              {/* <div className="advDash adv__primary-content-position">
                <img src={advDash_primaryContent} alt="dashboard adv" />
              </div> */}

              </Grid.Column>
            </Grid.Row>

          </Grid>
        </Container>
    )
  }
}

const mapStateToProps = store => ({
  activProps: store.activitiesList,
  modalBidProps: store.bidInfo.modalJoinBid,
  userProps: store.userInfo
})

const mapActionsToProps = {
  LoadLatestActivities,
  LoadScheduleCall,
  LoadRetailerLivePuts,
  LoadRetailerJoinedLiveCalls,
  LoadMyMatchedTrades,
  LoadMyFailedTrades,
  LoadCompetitorsPut,
  ModalJoinBid,
  SetPage
}

export default connect(mapStateToProps, mapActionsToProps)(RetailerDashboard)
