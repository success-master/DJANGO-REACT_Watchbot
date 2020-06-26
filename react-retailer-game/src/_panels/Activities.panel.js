import React from 'react';
import { connect } from 'react-redux'

import ActivityLine from  '../_components/ActivityLine';

import { Container, Grid } from 'semantic-ui-react'

class ActivitiesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: ['ALL'] ,
    };
  }

  /*
  viewAll = () => this.setState({ view: ['ALL'] })
  viewAperte = () => this.setState({ view: ['first_call','first_call_open','first_call_selection','second_call','second_call_open','second_call_selection'] })
  viewChiuse = () => this.setState({ view: ['winner_selected','closed'] })
  viewDecadute = () => this.setState({ view: ['decayed_first_call','decayed_first_call_selection','decayed_second_call','decayed_second_call_selection','decayed_not_payed'] })
  */
  
  render() {
    const _stateView = this.state.view
    let ActivityItems = [];
    let pageTitle = '';
    let customTableStyle = ''

    switch(this.props.kind) {
      case "latest":
        ActivityItems = this.props.activProps.activitiesData.map(function(act, index) {
          return (_stateView[0]==='ALL' || _stateView.includes(act.status) ? <ActivityLine key ={index + "-" + act.id} act = {act} typing={index < 5 }/> : '' )
        })
        pageTitle = 'LATEST';
        break
      /*
      case "mybids":
        ActivityItems = this.props.activProps.myCreatedActivitiesData.map(function(act, index) {
          return (_stateView[0]==='ALL' || _stateView.includes(act.status) ? <ActivityLine key ={index + "-" + act.id} act = {act} myactivity typing={index < 5 } /> : '' )
        })
        pageTitle = 'MY TRADES';
        break
      case "myoffer":
        ActivityItems = this.props.activProps.myOfferActivitiesData.map(function(act, index) {
          return (_stateView[0]==='ALL' || _stateView.includes(act.status) ? <ActivityLine key ={index + "-" + act.id} act = {act} myactivity typing={index < 5 } /> : '' )
        })
        pageTitle = 'MY OFFERS';
        break
      case "myfollow":
        ActivityItems = this.props.activProps.myFollowActivitiesData.map(function(act, index) {
          return (_stateView[0]==='ALL' || _stateView.includes(act.status) ? <ActivityLine key ={index + "-" + act.id} act = {act} typing={index < 5 } /> : '' )
        })
        pageTitle = 'MY FOLLOW';
        break
      case "myalert":
        ActivityItems = this.props.activProps.myAlertActivitiesData.map(function(act, index) {
          return (_stateView[0]==='ALL' || _stateView.includes(act.status) ? <ActivityLine key ={index + "-" + act.id} act = {act} typing={index < 5 } /> : '' )
        })
        break
      */
      case "rLivePuts":
        if (typeof this.props.activProps.rLivePuts.count !=='undefined') {
          ActivityItems = this.props.activProps.rLivePuts.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rLivePuts" />)
          })
        }
        pageTitle = 'LIVE PUTS';
        customTableStyle = 'live-puts';
        break
      case "rLiveCalls":
        if (typeof this.props.activProps.liveCalls.count !=='undefined') {
          ActivityItems = this.props.activProps.liveCalls.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rLiveCalls" />)
          })
        }
        pageTitle = 'LIVE CALLS';
        customTableStyle = 'live-calls';
        break
      case "rJoinedLiveCalls":
        if (typeof this.props.activProps.rJoinedLiveCalls.count !=='undefined') {
          ActivityItems = this.props.activProps.rJoinedLiveCalls.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rJoinedLiveCalls" />)
          })
        }
        pageTitle = 'JOINED LIVE CALLS';
        customTableStyle = 'joined-live-calls';
        break
      case "rcMatchedTrades":
        if (typeof this.props.activProps.rcMatchedTrades.count !=='undefined') {
          ActivityItems = this.props.activProps.rcMatchedTrades.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rcMatchedTrades" />)
          })
        }
        pageTitle = 'MATCHED TRADES';
        customTableStyle = 'matched-trades';
        break
      case "rcFailedTrades":
        if (typeof this.props.activProps.rcFailedTrades.count !=='undefined') {
          ActivityItems = this.props.activProps.rcFailedTrades.results.map(function (act, index) {
            //return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rcFailedTrades" /> : '')
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rcFailedTrades" />)
          })
        }
        pageTitle = 'FAILED TRADES';
        customTableStyle = 'failed-trades';
        break
      case "rCompetitorsPut":
        if (typeof this.props.activProps.rCompetitorsPut.count !=='undefined') {
          ActivityItems = this.props.activProps.rCompetitorsPut.results.map(function (act, index) {
            //return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rCompetitorsPut" /> : '')
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="rCompetitorsPut" />)
          })
        }
        pageTitle = "COMPETITORS' PUTS";
        customTableStyle = 'competitors-put';
        break
      case "allLivePuts":
        if (typeof this.props.activProps.allLivePuts.count !=='undefined') {
          ActivityItems = this.props.activProps.allLivePuts.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="allLivePuts" />)
          })
        }
        pageTitle = 'ALL LIVE PUTS';
        customTableStyle = 'live-puts';
        break
      case "cMyWatchlistLivePuts":
        if (typeof this.props.activProps.cMyWatchlistLivePuts.count !=='undefined') {
          ActivityItems = this.props.activProps.cMyWatchlistLivePuts.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="cMyWatchlistLivePuts" />)
          })
        }
        pageTitle = 'MY WATCHLIST LIVE PUTS';
        customTableStyle = 'live-puts';
        break
      case "cMyJoinedLivePuts":
        if (typeof this.props.activProps.cMyJoinedLivePuts.count !=='undefined') {
          ActivityItems = this.props.activProps.cMyJoinedLivePuts.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="cMyJoinedLivePuts" />)
          })
        }
        pageTitle = 'MY JOINED LIVE PUTS';
        customTableStyle = 'joined-live-puts';
        break
      case "cMyLiveCalls":
        if (typeof this.props.activProps.cMyLiveCalls.count !=='undefined') {
          ActivityItems = this.props.activProps.cMyLiveCalls.results.map(function(act, index) {
            return (<ActivityLine key={index + "-" + act.id} act={act} typing={index < 5} dash="cMyLiveCalls" />)
          })
        }
        pageTitle = 'MY LIVE CALLS';
        customTableStyle = 'live-calls';
        break
      default:
        break
    }

    return (
      <Container className="activities-list-container">
        { /*
        <Grid columns={16}>
          <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "0px"}}>
            <div className="actBar actBar-r">
            <Button active={this.state.view.includes('ALL')} className="dash-btn panelh-btn" onClick={(e) => this.viewAll()}>
              View All
            </Button>
            |
            <Button active={this.state.view.includes('first_call')} className="dash-btn panelh-btn" onClick={(e) => this.viewAperte()}>
              <img src={tickerOpen} alt="ticker open" className="btickerHOpen" > <span>Open</span>
            </Button>
            |
            <Button active={this.state.view.includes('closed')} className="dash-btn panelh-btn" onClick={(e) => this.viewChiuse()}>
              <img src={tickerClosedWhite} alt="ticker close" className="btickerHClosed" /> <span>Closed</span>
            </Button>
            |
            <Button active={this.state.view.includes('decayed_first_call')} className="dash-btn panelh-btn" onClick={(e) => this.viewDecadute()}>
              <img src={tickerDecayedWhite} alt="ticker decayed" className="btickerHDecayed" /> <span>Decayed</span>
            </Button>
            </div>
          </Grid.Column>
        </Grid>
        */ }
        {/* <Grid columns={16} className="table-head">
          <Grid.Column mobile={2} tablet={2} computer={2}>
            TRADE ID
          </Grid.Column>
          <Grid.Column mobile={5} tablet={5} computer={5}>
            WATCH
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2}>
            ASKED/PRICE
          </Grid.Column>
          <Grid.Column mobile={3} tablet={3} computer={3}>
            DATE
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2}>
            TIME
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2}>
             VIEW/OPEN
          </Grid.Column>
        </Grid> */}

        <div className="boardfull boardfullscroll">
          <div className="page-title">{pageTitle}</div>
          <Grid columns={16} className={'table-body '+ customTableStyle + (process.env.REACT_APP_USER === 'customer' ? ' bayer' : ' retailer')}>
            {ActivityItems}
          </Grid>
        </div>
      </Container>
    )
  }
}

const mapStateToProps = store => ({
  activProps: store.activitiesList
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(ActivitiesPanel)
