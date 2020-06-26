import React from 'react';
import { connect } from 'react-redux'

import ScheduleLineTile from  '../_components/ScheduleLineTile'
//import ScheduleTile from  '../_components/ScheduleTile'

import { Container, Grid } from 'semantic-ui-react'

/*
import tickerOpen from '../_assets/icons/ticker-open.png'
import tickerClosedWhite from '../_assets/icons/ticker-closed-bianco.png'
import tickerDecayedWhite from '../_assets/icons/ticker-decayed-bianco.png'
*/
import iconScheduleTiles from '../_assets/icons/schedules-tiles.png'
import iconScheduleTilesHover from '../_assets/icons/schedules-tiles-h.png'

//import ModalCreateScheduledTrade from  '../_modals/_CreateScheduledTrade.modal'
import {ShowModalAddSchedule} from '../_actions/Bids.action'
import {ShowModalFilterByBrand} from '../_actions/Activities.action'

class SchedulesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      btnTilesHover: false,
      showTiles: false
    }
  }

  onTiles = () => {
    this.setState(prevState => ({
      showTiles: !prevState.showTiles
    }));
  }

  render() {

    if ((this.props.kind === 'put') && (typeof this.props.scheduleProps.scheduledPut.count ==='undefined')) {
      return (<span></span>)
    }

    if ((this.props.kind === 'call') && (typeof this.props.scheduleProps.scheduledCall.count ==='undefined')) {
      return (<span></span>)
    }

    let ScheduleItems
    let _showTiles = this.state.showTiles
    if (this.props.kind === 'put') {
      ScheduleItems = this.props.scheduleProps.scheduledPut.results.map(function(act, index) {
            return (<ScheduleLineTile key ={index + "-" + act.id} act = {act} showTiles={_showTiles} myactivity typing={index < 5 }/> : '' )
          })

    } else {
      /* kind === 'call' */
      ScheduleItems = this.props.scheduleProps.scheduledCall.results.map(function(act, index) {
            return (<ScheduleLineTile key ={index + "-" + act.id} act = {act} showTiles={_showTiles} myactivity typing={index < 5 }/> : '' )
          })
    }

    return (
      <Container className="activities-list-container">
        <Grid columns={16}>
          <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "0px"}}>
            <div className="actBar actBar-r">

            </div>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={16} style={{margin: "2px 0px 6px 0px"}}>
            {process.env.REACT_APP_USER ==='retailer' && this.props.kind === 'put' &&
              (<b className="sch_add_watch" onClick={this.props.ShowModalAddSchedule}>Add watch-reference +</b>)
            }
            <img alt="Icon Tiles" style={{cursor: "pointer", marginRight: "6px", height: "16px", float: "right"}} src={this.state.btnTilesHover === false ? iconScheduleTiles : iconScheduleTilesHover}
              onMouseOver={() => { this.setState({ btnTilesHover: true})}}
              onMouseOut={() => { this.setState({ btnTilesHover: false})}}
              onClick={this.onTiles}
            />
            <span className="sch_filter" onClick={this.props.ShowModalFilterByBrand}>FILTER
            {this.props.filterByBrand.hasOwnProperty('name') &&
              <span>: {this.props.filterByBrand.name}</span>
            }
            </span>
          </Grid.Column>
        </Grid>
        {!this.state.showTiles && (
          <Grid columns={16} style={{background: "#90a4ae", fontSize: "10px", marginLeft: "0px"}}>
            <Grid.Column mobile={6} tablet={6} computer={6} >
              REFERENCE
            </Grid.Column>
            <Grid.Column mobile={6} tablet={6} computer={2} >
              DETAILS
            </Grid.Column>
            <Grid.Column mobile={6} tablet={6} computer={2} >
              PRICE
            </Grid.Column>
            <Grid.Column mobile={6} tablet={6} computer={3} >
              DATE
            </Grid.Column>
            <Grid.Column mobile={6} tablet={6} computer={2} >
              ACTION
            </Grid.Column>
          </Grid>
          )
        }

        <div className="boardfull boardfullscroll">
          <Grid columns={16} >
            {ScheduleItems}
          </Grid>
        </div>


      </Container>
    )
  }
}

const mapStateToProps = store => ({
  scheduleProps: store.activitiesList,
  modalCancelBidProps: store.bidInfo.modalCancelBid,
  filterByBrand: store.activitiesList.filterByBrand
})

const mapActionsToProps = {
  ShowModalAddSchedule,
  ShowModalFilterByBrand
}

export default connect(mapStateToProps, mapActionsToProps)(SchedulesPanel)
