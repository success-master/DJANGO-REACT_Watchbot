import React from "react";
import ReactGA from 'react-ga'
import { connect } from 'react-redux'
import WatchesGraphListPanel from  '../_panels/WatchesGraphList.panel';
import ActivitiesPanel from  '../_panels/Activities.panel';
//import SchedulesPanel from  '../_panels/Schedules.panel';
import ModalJoinTrade from  '../_modals/_JoinTrade.modal';

import { LoadLatestActivities,
         LoadMyMatchedTrades,
         LoadMyFailedTrades,
         LoadAllLivePuts,
         LoadCustomerMyWatchlistLivePuts,
         LoadCustomerMyJoinedLivePuts,
         LoadCustomerMyLiveCalls } from '../_actions/Activities.action'
import { ModalJoinBid } from '../_actions/Bids.action'
import { SetPage } from '../_actions/Settings.action'

import { Container, Grid, Button } from 'semantic-ui-react'
//import advDash_sidebar from '../_assets/adv-dash.png';
//import advDash_primaryContent from '../_assets/adv-tommy.jpg';
import Joyride from 'react-joyride';

class RetailerDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showingActivities: 'allLivePuts',
      showingPanel: 'activities',
      steps: [
      {
          content: <h2>Let's begin our journey!</h2>,
          locale: { skip: <strong aria-label="skip">SKIP</strong> },
          placement: 'center',
          target: 'body',
          },
      { title:'ALL LIVE PUTS',
        target: '#one-step',
        content: 'Lorem ipsum dolor sit amet, consnec libero a nisi io eget iaculis',
      },
      {
        title:'MY WATCHLIST LIVE PUTS',
        target: '#two-step',
        content: 'Quisque at interdum enim. Etiam nec tempor diam. Cras libero ante, venenatis eget nulla in, dictum sagittis mi. Donec convallis cursus euismod. Donec orci lacus, fermentum sed finibus id, facilisis vel odio.',
      },
      {
        title:'MY JOINED LIVE PUTS',
        target: '#three-step',
        content: 'text here!',
      },
      {
        title:'MY LIVE CALLS',
        target: '#four-step',
        content: 'text here!',
      },
      {
        title:'MATCHED TRADES',
        target: '#five-step',
        content: 'text here!',
      },
      {
        title:'FAILED TRADES',
        target: '#six-step',
        content: 'text here!',
      },
      {
        title:'MY WATCHLIST',
        target: '#seven-step',
        content: 'text here!',
      }
    ]
    };
  }

  tick() {
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'allLivePuts')) { this.props.LoadAllLivePuts() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'cMyWatchlistLivePuts')) { this.props.LoadCustomerMyWatchlistLivePuts() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'cMyJoinedLivePuts')) { this.props.LoadCustomerMyJoinedLivePuts() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'cMyLiveCalls')) { this.props.LoadCustomerMyLiveCalls() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rcMatchedTrades')) { this.props.LoadMyMatchedTrades() }
    if ((this.state.showingPanel === 'activities') && (this.state.showingActivities === 'rcFailedTrades')) { this.props.LoadMyFailedTrades() }
  }

  componentDidMount() {
    this.props.SetPage('dashboard')
    this.props.LoadLatestActivities()

    this.props.LoadAllLivePuts()
    this.props.LoadCustomerMyLiveCalls()
    this.interval = setInterval(() => this.tick(), 10000)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  showAllLivePuts = () => this.setState({ showingPanel: 'activities', showingActivities: 'allLivePuts' })
  showCMyWatchlistLivePuts = () => {
    this.props.LoadCustomerMyWatchlistLivePuts()
    this.setState({ showingPanel: 'activities', showingActivities: 'cMyWatchlistLivePuts' })
  }
  showCMyJoinedLivePuts = () => {
    this.props.LoadCustomerMyJoinedLivePuts()
    this.setState({ showingPanel: 'activities', showingActivities: 'cMyJoinedLivePuts' })
  }
  showCMyLiveCalls = () => {
    this.props.LoadCustomerMyLiveCalls()
    this.setState({ showingPanel: 'activities', showingActivities: 'cMyLiveCalls' })
  }
  showRCMatchedTrades = () => {
    this.props.LoadMyMatchedTrades()
    this.setState({ showingPanel: 'activities', showingActivities: 'rcMatchedTrades' })
  }
  showRCFailedTrades = () => {
    this.props.LoadMyFailedTrades()
    this.setState({ showingPanel: 'activities', showingActivities: 'rcFailedTrades' })
  }


  showWatchlist = () => this.setState({ showingPanel: 'watchlist', showingActivities: '' })

  onCloseJoinBid = () => {
    this.props.ModalJoinBid( false, '')
    this.props.LoadLatestActivities()
    this.props.LoadCustomerMyJoinedLivePuts()
  }

  clickHandlerGoogleAnalitycsAllLivesPuts = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - ALL LIVE PUTS',
            action: 'E\' stato cliccato ALL LIVE PUTS'
        })
  }

  clickHandlerGoogleAnalitycsMyWatchListLivePuts = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - MY WATCHLIST LIVE PUTS',
            action: 'E\' stato cliccato MY WATCHLIST LIVE PUTS'
        })
  }
clickHandlerGoogleAnalitycsMyJoinedLivePuts = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - MY JOINED LIVE PUTS',
            action: 'E\' stato cliccato MY JOINED LIVE PUTS '
        })
  }
clickHandlerGoogleAnalitycsMyLiveCalls = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - MY LIVE CALLS',
            action: 'E\' stato cliccato MY LIVE CALLS'
        })
  }

clickHandlerGoogleAnalitycsMatchedTrades = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - MATCHED TRADES',
            action: 'E\' stato cliccato MATCHED TRADES'
        })
  }
clickHandlerGoogleAnalitycsFailedTrades = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - FAILED TRADES',
            action: 'E\' stato cliccato FAILED TRADES'
        })
  }
clickHandlerGoogleAnalitycsMyWatchlist = () =>{
        ReactGA.event({
            category: 'Dashboard - Customer - MY WATCHLIST',
            action: 'E\' stato cliccato MY WATCHLIST'
        })
  }


  render() {
      const { steps } = this.state;

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
                        this.props.activProps.cMyLiveCalls.results.length
                      ):(
                        this.props.activProps.cMyLiveCalls.hasOwnProperty("count") ? this.props.activProps.cMyLiveCalls.count : 0
                      )
                      }
                      </div>
                      <span>
                        Live Trades
                      </span>
                    </div>
                    <div className="userSide-wrapper__info">
                      {/*<div>
                        3/10
                      </div>
                      <span>
                        Voluntary Cancellations Left
                      </span>*/}
                    </div>
                  </div>

                </div>

                <div className="menu-container">



                    {process.env.REACT_APP_GAME === "true" ? (
                    <div>
                        <Joyride
                          continuous={true}
                          scrollToFirstStep={true}
                          showProgress={true}
                          showSkipButton={true}
                          steps={steps}
                          styles={{
                            options: {
                              arrowColor: '#f0af13',
                              backgroundColor: '#fff',
                              overlayColor: 'rgba(49, 68, 67, 0.0)',
                              primaryColor: '#f49b2c',
                              textColor: 'black',
                              zIndex: 1000,
                            }
                          }}
                        />
                         </div>
                      ):
                      null
                    }


                  <Button id="one-step" active={this.state.showingActivities==='allLivePuts'} className="buttonTri" onClick={() => {this.showAllLivePuts(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsAllLivesPuts()}}>
                    ALL LIVE PUTS <i className="arrowRight" style={{float: "right"}}></i>
                  </Button>
                  <Button id="two-step" active={this.state.showingActivities === 'cMyWatchlistLivePuts'} className="buttonTri" onClick={() => {this.showCMyWatchlistLivePuts(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsMyWatchListLivePuts()}}>
                    MY WATCHLIST LIVE PUTS <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  <Button id="three-step" active={this.state.showingActivities === 'cMyJoinedLivePuts'} className="buttonTri" onClick={() => {this.showCMyJoinedLivePuts(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsMyJoinedLivePuts()}}>
                    MY JOINED LIVE PUTS {/*MY FOLLOW*/} <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  <Button id="four-step" active={this.state.showingActivities === 'cMyLiveCalls'} className="buttonTri" onClick={() => {this.showCMyLiveCalls(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsMyLiveCalls()}}>
                    MY LIVE CALLS <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>
                  <Button id="five-step" active={this.state.showingActivities === 'rcMatchedTrades'} className="buttonTri" onClick={() => {this.showRCMatchedTrades(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsMatchedTrades()}}>
                    MATCHED TRADES{/* MY TRADES*/} <i className="arrowRight" style={{float: "right"}}></i>
                  </Button>
                  {/* TO DO */}
                  <Button id="six-step" active={this.state.showingActivities === 'rcFailedTrades'} className="buttonTri" onClick={() => {this.showRCFailedTrades(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsFailedTrades()}}>
                    FAILED TRADES <i className="arrowRight" style={{ float: "right" }}></i>
                  </Button>

                  <Button id="seven-step" active={this.state.showingPanel === 'watchlist'} className="buttonTri" onClick={() => {this.showWatchlist(); this.props.openCloseMobileMenu(); this.clickHandlerGoogleAnalitycsMyWatchlist()}}>
                    MY WATCHLIST <i className="arrowRight" style={{ float: "right" }}></i>
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
  LoadMyMatchedTrades,
  LoadMyFailedTrades,
  LoadAllLivePuts,
  LoadCustomerMyWatchlistLivePuts,
  LoadCustomerMyJoinedLivePuts,
  LoadCustomerMyLiveCalls,
  ModalJoinBid,
  SetPage
}

export default connect(mapStateToProps, mapActionsToProps)(RetailerDashboard)
