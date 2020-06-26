import React from 'react';
import { withRouter } from "react-router-dom"

import { connect } from 'react-redux'
import { SetViewBidId, ModalJoinBid, ModalCancelBid } from '../_actions/Bids.action'
import { timestamp2date } from '../_utilities/time'

import { Grid, Button, Popup } from 'semantic-ui-react'

import iconDetails from '../_assets/icons/ticker-details-grigio.png';

class ActivityLine extends React.Component {

  onViewBidId = () => {
    this.props.onViewBidId(this.props.act.id);
  }

  render() {

    const ButtonGoBid = withRouter(({ history }) => (
      <Button className="panel-btn view-btn"
        onClick={() => {
          this.onViewBidId()
          history.push('/bid')
        }}
      >
        View
      </Button>
    ))

    const ButtonMakeAnOffer = () => (
      <Button className="panel-btn join-btn"
        onClick={() => {
          this.props.ModalJoinBid( true, this.props.act.id, this.props.act.reference.reference, this.props.act.reference.model_name, this.props.act.price, -1, null)
        }}
      >
        Join
      </Button>
    )

    const ButtonMakeSecondOffer = () => (
      <Button className="panel-btn join-btn"
        onClick={() => {
          this.props.ModalJoinBid( true, this.props.act.id, this.props.act.reference.reference, this.props.act.reference.model_name, this.props.act.price, -1, this.props.act.raise_price)
        }}
      >
        Raise
      </Button>
    )

    const ButtonCancelSchedule = () => (
      <Button className="panel-btn join-btn"
        onClick={() => {
          this.props.ModalCancelBid( true, this.props.act.id, this.props.act.reference.reference, this.props.act.reference.model_name, timestamp2date(this.props.act.call_1_start_date) )
          }}
      >
        Cancel
      </Button>
    )

    //let color='white'
    //let color_descr='white'
    let color_background='none'
    let color_ticker='#fff'
    let color_left= "16px solid #90a4ae"

    let IndicationStatus = () => {
      switch (this.props.act.status) {
        case 'first_call_open':
          if (!this.props.act.owned_by_this_user) {
            if (this.props.act.second_call_joined_by_this_user) { return (<span style={{color: "#ff6600"}}>Raised </span>) }
            if (this.props.act.joined_by_this_user) { return (<span style={{color: "#ff6600"}}>Joined </span>) }
          }
          return ('')
        case 'first_call':
        case 'first_call_selection':
        case 'second_call_open':
        case 'second_call':
        case 'second_call_selection':
          if (!this.props.act.owned_by_this_user) {
            if (this.props.act.second_call_joined_by_this_user) { return (<span style={{color: "#ff6600"}}>Raised </span>) }
            if (this.props.act.joined_by_this_user) { return (<span style={{color: "#ff6600"}}>Joined </span>) }
          }
          return (<span style={{color: "#ff6600"}}>Live </span>)
        case 'winner_selected':
          return (<span style={{color: "#ff6600"}}>Matched </span>)
        default:
          return ('')
      }
    }

    let CtaButton = () => {
      if (!this.props.act.owned_by_this_user) {
        if (this.props.act.joined_by_this_user && this.props.act.first_call_selection_for_this_user && !this.props.act.second_call_joined_by_this_user) { return (<ButtonMakeSecondOffer />) }
        if (!this.props.act.joined_by_this_user) { return (<ButtonMakeAnOffer />) }
        return ('')
      } else {
        //Retailer owns this schedule
        if (this.props.act.status !== 'winner_selected') return (<ButtonGoBid />)
        return ('')
      }
    }

    if (!this.props.showTiles) {
      return (
        <Grid.Row className="panelRow" style={{borderLeft: color_left, background: color_background, height: "48px"}}>
          <Grid.Column mobile={6} tablet={6} computer={6} style={{paddingLeft: "8px", paddingRight: "4px", color: "#c1c2c3"}}>
              <div style={{height: "16px"}}>
                <span style={{color: "#d1d2d3"}}>{this.props.act.reference.reference}</span>
              </div>
              <div className="sch_model" style={{height: "16px", color: color_ticker }}>
                {this.props.act.reference.model_name}
              </div>

          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2} style={{paddingTop: "12px", color: "#c1c2c3", cursor: "pointer"}}>
            <div className="sch_pic">
              {this.props.act.main_image &&
                (
                  <Popup
                    trigger={<img src={iconDetails} alt="icon watch details" />}
                    position='bottom left'
                  >
                    <Popup.Content>
                      <img src={this.props.act.main_image} alt="watch" style={{width: "300px", height: "auto"}} />
                    </Popup.Content>
                  </Popup>
                )
              }
            </div>

          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2} style={{fontWeight: "400", margin: "auto 0", paddingTop: "8px"}}>
              <div className="sch_price" style={{color: "#90a4ae"}}>€{this.props.act.price}</div>
          </Grid.Column>
          <Grid.Column mobile={3} tablet={3} computer={3} style={{fontWeight: "400", margin: "auto 0", paddingTop: "8px"}}>
              <div className="sch_date">
                {timestamp2date(this.props.act.call_1_start_date)}
              </div>
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2} style={{margin: "auto 0", paddingTop: "8px"}}>
            <IndicationStatus /><CtaButton />
          </Grid.Column>

        </Grid.Row>


      )} else {
        /* tile */
        return (
          <Grid.Column mobile={5} tablet={5} computer={5} className='tileItem'>
                <div className='tileImgContainer'>
                  <img className='tileImg' alt="watch" src={this.props.act.main_image} />
                </div>
                <div style={{}}>
                  <div>{timestamp2date(this.props.act.call_1_start_date)}</div>
                  <div style={{color: "#d1d2d3"}}>{this.props.act.reference.reference}</div>
                  <div style={{color: color_ticker }}>
                    {this.props.act.reference.model_name}
                  </div>
                  <div style={{color: "#90a4ae"}}>€{this.props.act.price}</div>
                  <IndicationStatus /><CtaButton />
                </div>
            </Grid.Column>
        )
      }

  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  onViewBidId: SetViewBidId,
  ModalJoinBid,
  ModalCancelBid
}

export default connect(mapStateToProps, mapActionsToProps)(ActivityLine)
