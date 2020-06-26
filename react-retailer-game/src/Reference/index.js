import React from "react";
import { connect } from 'react-redux'
import { Link } from "react-router-dom"
import ReferenceChart from  '../_components/ReferenceChart';
import ReferenceMyActivitiesPanel from  '../_panels/ReferenceMyActivities.panel';
import ReferenceOtherActivitiesPanel from  '../_panels/ReferenceOtherActivities.panel';
//import WatchesSearch from  '../_components/WatchesSearch'
//import ModalCreateTrade from  '../_modals/_CreateTrade.modal';
import ModalJoinTrade from  '../_modals/_JoinTrade.modal';

import { LoadRefDetails, LoadRefHistoricalData, AddFollow, Unfollow } from '../_actions/References.action'
import { LoadReferenceMyActivities, LoadReferenceOtherActivities } from '../_actions/Activities.action'
import { ShowModalAddTrade } from '../_actions/Bids.action'
import { AddWatchGraph} from '../_actions/WatchGraphList.action'
import { ModalJoinBid } from '../_actions/Bids.action'
import { SetPage } from '../_actions/Settings.action'

import { Container, Grid, Button } from 'semantic-ui-react'
import btnLaunchCall from '../_assets/icons/btn-launch-call.png';
import btnAddToMyHome from '../_assets/icons/btn-add-my-home.png';
//import advReference from '../_assets/adv-ref.png';

let launchTradeBtnName = (process.env.REACT_APP_USER === 'customer' ? 'call' : 'put')

class Reference extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addedToHomeWithButton: false
    }
  }

  tick() {
    this.props.LoadReferenceMyActivities(this.props.refProps.referenceData.selectedOption.id)
    this.props.LoadReferenceOtherActivities(this.props.refProps.referenceData.selectedOption.id)
  }

  componentDidMount() {
    if (this.props.refProps.referenceData.selectedOption.id === 0) {
      //accesso diretto su pagina Reference
      window.location.replace(process.env.REACT_APP_SITE_URL+"/"+process.env.REACT_APP_USER+"/");
    }
    this.props.LoadRefHistoricalData(this.props.refProps.referenceData.selectedOption.id, this.props.refProps.referenceData.selectedOption.price)
    this.props.LoadReferenceMyActivities(this.props.refProps.referenceData.selectedOption.id)
    this.props.LoadReferenceOtherActivities(this.props.refProps.referenceData.selectedOption.id)
    this.props.SetPage('reference')
    this.interval = setInterval(() => this.tick(), 30000)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onAddWatch = () => {
    this.props.onAddWatch(this.props.refProps.referenceData.selectedOption.id);
    this.setState({ addedToHomeWithButton: true })
  }

  onCloseJoinBid = () => {
    this.props.ModalJoinBid( false, '')
    this.props.LoadReferenceMyActivities(this.props.refProps.referenceData.selectedOption.id)
    this.props.LoadReferenceOtherActivities(this.props.refProps.referenceData.selectedOption.id)
  }

  onCloseCreateBid = () => {
  }

  UpdateThisReferenceBids = () => {
    this.props.LoadReferenceMyActivities(this.props.refProps.referenceData.selectedOption.id)
    this.props.LoadReferenceOtherActivities(this.props.refProps.referenceData.selectedOption.id)
  }

  handleFormRetailerPut = (e) => {
    console.log(this.state.retailerModalPut.price)
    console.log(this.state.retailerModalPut.pw)
    console.log(this.state.retailerModalPut.checkTermValue) //in alt console.log(this.terms.state.checked) con ref={(input) => this.terms = input}
    console.log(this.state.retailerModalPut.checkGdprValue)
    e.preventDefault()
  }

  onUnfollow = () => {
    this.props.onUnfollow(this.props.refProps.referenceData.selectedOption.id);
  }

  onAddFollow = () => {
    this.props.onAddFollow(this.props.refProps.referenceData.selectedOption.id);
  }

  onAddAlert() {

  }

  render() {
    if (typeof this.props.refProps.referenceData.selectedOption ==='undefined') {
      return (<span></span>)
    }
    let alreadyAddedToMyHome = this.state.addedToHomeWithButton
    if (!this.state.addedToHomeWithButton) {
      for (const k in this.props.watchProps.watchesDetailsInDashboard) {
        if (this.props.watchProps.watchesDetailsInDashboard[k].refId === this.props.refProps.referenceData.selectedOption.id ) {
          alreadyAddedToMyHome = true
        }
      }
    }

    if (this.props.refProps.reloadReferenceBids) {
      this.UpdateThisReferenceBids()
    }

    let alreadyFollowed = this.props.refProps.followList.includes(this.props.refProps.referenceData.selectedOption.id)

    return (
      <Container className="mainBoard">
        <Grid columns={16}>
          <Grid.Row style={{marginBottom: "8px"}}>
            <Grid.Column mobile={16} tablet={4} computer={4} style={{paddingRight: "0px"}}>
              <div class="actBar" style={{paddingLeft: "10px"}}><Link to={`/`} className="linkBack" data-letters="Back to Dashboard">Back to Dashboard</Link></div>

            </Grid.Column>
            <Grid.Column mobile={16} tablet={12} computer={12} style={{background: "#2c2c2c", height: "36px"}}>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={6} computer={6} style={{paddingRight: "0rem"}}>
              <Container textAlign="center">
                <div style={{fontSize: "14px", background: "#62757f", marginBottom: "6px", marginLeft: "10px", direction: "ltr"}}>
                  <div style={{padding: "6px", textAlign: "left"}}>
                    {this.props.refProps.referenceData.selectedOption.label}
                    <br/>{this.props.refProps.referenceData.selectedOption.id}
                  </div>
                  <div style={{background: "#4d4e50", textAlign: "right", paddingRight: "8px", paddingTop: "4px"}}>
                  SUGGESTED PRICE: <span style={{color: "#ff6600"}}> €{this.props.refProps.referenceData.selectedOption.price}</span>
                  </div>
                <ReferenceChart data = {this.props.refProps.referenceHistoricalData} suggestedPrice={this.props.refProps.referenceData.selectedOption.price} />
                </div>
                <div style={{width: "50%", margin: "0 auto"}}>
                  <div style={{width: "45%", display: "inline-block", marginRight: "6px"}}>
                    {alreadyFollowed ? (
                        <Button className="full-btn" onClick={this.onUnfollow}>
                          Unfollow
                        </Button>
                      )
                       :
                      (
                        <Button className="full-btn" onClick={this.onAddFollow}>
                          Follow
                        </Button>
                      )
                    }
                  </div>
                  { /*}
                  <div style={{width: "45%", display: "inline-block"}}>
                    <Button className="full-btn" onClick={this.onAddAlert}>
                      Alert
                    </Button>
                  </div>
                  */ }
                </div>
                {/* <img src={advReference} className="advRefImg" /> */ }
              </Container>
            </Grid.Column>

            <Grid.Column mobile={16} tablet={10} computer={10}>
              <Grid.Row className="panelRefActivitiesHeader">
                <div style={{display: "inline-block", fontSize: "13px"}}>
                  Activities
                </div>
                <div className="subPanelRefMyActivitiesHeader">
                  {/* <ModalCreateTrade modalClose={this.onCloseCreateBid} reference={this.props.refProps.referenceData.selectedOption} /> */ }
                  <Button className="refMyActivites-btn" onClick={() => this.props.ShowModalAddTrade(this.props.refProps.referenceData.selectedOption)}>Launch {launchTradeBtnName} <img src={btnLaunchCall} alt="launch trade" style={{verticalAlign: "middle", marginLeft: "6px"}} /></Button>|
                  <Button className="refMyActivites-btn" style={{marginLeft: "6px"}} disabled={alreadyAddedToMyHome} onClick={this.onAddWatch}>
                    Add To My Home <img src={btnAddToMyHome} alt="add to my home btn" style={{verticalAlign: "middle", marginLeft: "6px"}} />
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
                  fromNotification={this.props.modalBidProps.fromNotification} />
                }
              </Grid.Row>

              <ReferenceMyActivitiesPanel id={this.props.refProps.referenceData.selectedOption.id} />

              <ReferenceOtherActivitiesPanel id={this.props.refProps.referenceData.selectedOption.id} />

            </Grid.Column>



          </Grid.Row>

        </Grid>

      </Container>
    )
  }
}

const mapStateToProps = store => ({
  watchProps: store.watchList,
  userProps: store.userInfo,
  refProps: store.referenceInfo,
  modalBidProps: store.bidInfo.modalJoinBid
})

const mapActionsToProps = {
  onAddWatch: AddWatchGraph,
  onAddFollow: AddFollow,
  onUnfollow: Unfollow,
  LoadRefDetails,
  LoadRefHistoricalData,
  LoadReferenceMyActivities,
  LoadReferenceOtherActivities,
  ShowModalAddTrade,
  ModalJoinBid,
  SetPage
}

export default connect(mapStateToProps, mapActionsToProps)(Reference)

/*
<Button className="dash-btn" onClick={ () => this.props.TestApi(this.props.userProps.userDetails.token) } >
  Test Api
</Button>
*/

/*
<Grid.Row className="panelRefActivitiesHeader">
  <div style={{display: "inline-block", fontSize: "13px"}}>
    Repost All Other Activities
  </div>
</Grid.Row>
*/
