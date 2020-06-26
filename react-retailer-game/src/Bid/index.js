import React from "react";
import { connect } from 'react-redux'
import { Link } from "react-router-dom"
import { LoadCurrentBid,
         UpdateCurrentBid,
         ResetChosenBidders,
         AddChosenBidder,
         RemoveChosenBidder,
         SendFirstCallSelection,
         ResetGraphDataSecondCall,
         SelectWinner,
         SendWinnerSelection,
         SendDelayBid } from '../_actions/Bids.action'
import { ShowModal, HideModal } from '../_actions/Modals.action'
import { SetPage } from '../_actions/Settings.action'

import BidChart from  '../_components/BidChart';
import BiddersPanel from  '../_panels/Bidders.panel';
import ModalRetailerWinnerSelected from  '../_modals/RetailerWinnerSelected.modal';
import ModalCustomerWinnerSelected from  '../_modals/CustomerWinnerSelected.modal';
import IndiModalDefault from  '../_modals/IndiModalDefault.modal';

import { Container, Grid, Button } from 'semantic-ui-react'
//import bidUser from '../_assets/icons/bid_user-retina.png';

import Countdown from '../_components/Countdown';

import {formatMoney} from "../_utilities/price";

import {LoadRefDetails} from '../_actions/References.action'


const UserItemsNum=40;
const numStep = { "first_call_open": 0, "first_call": 1, "first_call_selection": 2, "second_call_open": 3, "second_call": 4, "second_call_selection": 5, "winner_selected": 6, "closed" : 7 , "decayed": 8 } // 0=O in apertura, 1=A1, 2=AS (fase selezione utenti per A2), 3=O2, 4=A2, 5=F (fase scelta vincitore), 6=P (da pagare), 7=C completata, 8=D decaduta


class Bid extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bidData: {
        "id": 32, "status": "first_call", "ref" : "", "price": "2950.00", "model": "",
        "reference" : {
          "id": 3,
          "reference": "01.657.0129.3.431",
          "model_name": "Diamaster Grande Seconde",
          "brand_name": "Rado"
        },
        "first_call_offers": [
          {
            "user_id": 1,
            "user_country": "italy",
            "price": "1000.00",
            "call_number": "first_call"
          }
        ],
        "bidders":[] },
      winner: false,
      winnerPrice: 0,
      secondOffersFrom: -1,
      webSocket: { status: "DISCONNECTED" , response: "", err: "None"}
      //maxTimeinMs: { "first_call_open" :600000, "first_call" : 600000, "first_call_selection" : 600000, "second_call_open" : 600000, "second_call" : 600000, "second_call_selection" : 600000 }
      //timeRemaingToNextStepInMs: 600000,
    }

  }

  tickSafari() {
    if (numStep[this.props.bidId.currentBidDetails.status] < 5) {
        console.log("updating Safari Bid")
        this.props.UpdateCurrentBid(this.props.bidId.currentBidDetails.id)
    }
  }


  componentDidMount() {
    this.props.SetPage('bid')
    //10000
    if (this.props.isSafari === true) { this.interval = setInterval(() => this.tickSafari(), 10000) } //settato anche se game, per aggiornamento bid
  }


  componentWillUnmount() {
    if (this.props.isSafari === true) { clearInterval(this.interval) }
  }

  selectUser = (num, multipleOrSingle, shouldActivateHold ) => {
    if (!shouldActivateHold) { return }

    if (!this.props.bidId.chosenBidders.includes(num)) {

      if (multipleOrSingle === 'multi') {
        this.props.AddChosenBidder(num, this.props.bidId.currentBidDetails.first_call_offers[num].offer_id)
      } else {
          if (this.props.bidId.currentBidDetails.second_call_on_going.length >0 && this.props.bidId.currentBidDetails.second_call_on_going[num].second_call_offer_id >0)
            {
              this.props.SelectWinner(num, this.props.bidId.currentBidDetails.second_call_on_going[num].second_call_offer_id)
            }
          else
            {
              this.props.SelectWinner(num, this.props.bidId.currentBidDetails.second_call_on_going[num].first_call_offer_id)
            }
      }

    } else {

      this.props.RemoveChosenBidder(num, this.props.bidId.currentBidDetails.first_call_offers[num].offer_id)
      }

  }

  onDrawn = () => {
    this.props.LoadRefDetails(this.props.bidId.currentBidDetails.reference.id)

    switch (this.props.bidId.currentBidDetails.status) {
      case 'first_call_selection':
        this.props.SendFirstCallSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenOffers, null, this.props.bidId.chosenBidders)
        this.props.ResetGraphDataSecondCall(this.props.bidId.chosenOffers.length)
        this.props.ResetChosenBidders()
        this.props.ShowModal('RAISE_PRICE', {
          bidId: this.props.bidId.currentBidDetails.id,
          chosenOffers: this.props.bidId.chosenOffers,
          chosenBidders: this.props.bidId.chosenBidders,
          price: this.props.bidId.currentBidDetails.price,
          reference: this.props.bidId.currentBidDetails.reference,
        })
        //this.props.SendFirstCallSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenOffers)
        //this.props.ResetGraphDataSecondCall(this.props.bidId.chosenOffers.length)
        //this.props.ResetChosenBidders()
        break
      case 'second_call_selection':
        this.props.SendWinnerSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenWinningOffer)
        //this.setState({showModalWinnerSelected: true})
        break
      default:
    }
  }

  onDrawnWinner = () => {
    let winner;
    let winnerPrice;
    let chosenWinner;

    this.props.LoadRefDetails(this.props.bidId.currentBidDetails.reference.id)

    if (this.props.bidId.currentBidDetails.status==='first_call_selection') {
      chosenWinner = this.props.bidId.chosenOffers[0];
      winner = this.props.bidId.currentBidDetails.first_call_offers.find(obj => obj.offer_id === chosenWinner);
      winnerPrice = winner.price;
    } else {
      chosenWinner = this.props.bidId.chosenWinningOffer;
      winner = this.props.bidId.currentBidDetails.second_call_on_going.find(obj => obj.second_call_offer_id === chosenWinner);
      winnerPrice = winner.price_second_call;
    }
    this.setState({ winner, winnerPrice });
    this.props.SendWinnerSelection(this.props.bidId.currentBidDetails.id, chosenWinner)
  }

  onDrawnDelay = () => {
      this.props.SendDelayBid(this.props.bidId.currentBidDetails.id)
  }



  render() {
    let obj = this.props.bidId.currentBidDetails
    //se non ha caricato i dettagli della bid non renderizza (se obj vuoto)
    if ((Object.keys(obj).length === 0 && obj.constructor === Object) || (this.props.bidId.viewBidId === 0 )) {
      return (<span></span>)
    }

    if (this.props.bidId.viewBidId !== this.props.bidId.currentBidDetails.id) {
      return (<span></span>)
    }

    let TimingPhase = ''
    switch (this.props.bidId.currentBidDetails.status) {
      case 'first_call_open':
        TimingPhase = 'Opening, please wait';
        break
      case 'first_call':
        TimingPhase = 'Acquisition';
        break
      case 'first_call_selection':
        TimingPhase = '1st Round evaluation';
        break
      case 'second_call_open':
        TimingPhase = '2nd Round';
        break
      case 'second_call':
        if (!this.props.bidId.currentBidDetails.raised_by_owner) {
          this.props.HideModal()
        }
        TimingPhase = '2nd Round';
        break
      case 'second_call_selection':
        TimingPhase = '2st Round evaluation';
        break
      default:
        TimingPhase = this.props.bidId.currentBidDetails.status;
    }

    const shouldActivateHold = ((this.props.bidId.currentBidDetails.status === "first_call_selection" && (this.props.bidId.currentBidDetails.first_call_selection_completed !== true) ) || this.props.bidId.currentBidDetails.status === "second_call_selection" || this.props.bidId.currentBidDetails.all_second_call_offer_completed === true)
    const shouldActivateMultiOrSingle = this.props.bidId.currentBidDetails.status === "first_call_selection" ? "multi" : "single"

    const that=this

    const EventualModalBid = function() {
      if (that.props.bidId.currentBidDetails.status.indexOf('decayed') !== -1)
        { return (<IndiModalDefault title={"Time expired!"}
                  msg={ "Trade decayed."}
                  msg2={ ""}
                  refreshToHome = {true}
                  />)
        }
      if (that.props.bidId.currentBidDetails.status.indexOf('closed') !== -1)
        { return (<IndiModalDefault title={"TRADE CLOSED"}
                  msg={ "Trade #"+that.props.bidId.viewBidId+" is closed. ["+that.props.bidId.currentBidDetails.status+"]"}
                  refreshToHome = {true}
                  />)
        }
      if ((that.props.bidId.currentBidDetails.status.indexOf('winner') !== -1) && (process.env.REACT_APP_GAME !== "true"))
        { return (<IndiModalDefault title={"TRADE HAS A WINNER"}
                    msg={ "You selected a winner for trade #"+that.props.bidId.viewBidId+". ["+that.props.bidId.currentBidDetails.status+"]"}
                    refreshToHome = {true}
                    />)
        }
      return null
    }

    const currentStep = numStep[this.props.bidId.currentBidDetails.status]

    const drawActive = this.props.bidId.chosenBidders.length > 0;
    const drawWinnerActive =  (this.props.bidId.chosenBidders.length === 1 && (this.props.bidId.currentBidDetails.status === 'first_call_selection' || this.props.bidId.currentBidDetails.status === 'second_call_selection' || this.props.bidId.currentBidDetails.all_second_call_offer_completed === true))
    const delayActive = (((this.props.bidId.currentBidDetails.status === 'first_call_selection' || this.props.bidId.currentBidDetails.status === 'second_call_selection') && this.props.bidId.currentBidDetails.delay_available > 0))

    const showBidAcquisitionPhase = [0, 1, 3, 4].indexOf(currentStep) !== -1;
    const showSelectForSecondRound = currentStep === 2;
    const showSelectMatch = [2, 5].indexOf(currentStep) !== -1;
    //const deposit = Number(this.props.bidId.currentBidDetails.reference.price)*20/100;
    const deposit = this.props.bidId.currentBidDetails.deposit;

    return (
      <Container className="mainBoard bid__container">

        <Grid columns={16}>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={16} className="primary-content bid-content">
              <Grid columns={16}>
                <Grid.Row>
                  <Grid.Column mobile={16} tablet={16} computer={2} className="column-left">
                    {/* <div className="back-to-container">
                        <Link to={`/`} className="linkBack" data-letters="Back to Dashboard">Back to Dashboard</Link>
                    </div> */}
                    <div className="column__info-container">
                      <div className="trade-call">
                        <div className="column__info__row trade-id">
                          <span className="label">TRADE NR</span>
                          <span className="value">
                          {this.props.bidId.currentBidDetails.id}
                        </span>
                        </div>

                        <div className="column__info__row call">
                          <span className="label">NOW ON</span>
                          <span className="value">{TimingPhase}</span>
                        </div>
                      </div>


                      <div className="column__info__row countdown-container">
                        <Countdown timeremaing={this.props.bidId.currentBidDetails.time_remain} delay_available={this.props.bidId.currentBidDetails.delay_available} step={this.props.bidId.currentBidDetails.status} />

                        <div className="actions-container bid-actions-tool">
                          <Button disabled={!delayActive} className="drawDelayMini drawButton-en" onClick={(e) => this.onDrawnDelay(e)} >
                            DELAY 5 min
                          </Button>

                          <Button className="drawDelayMini drawButton-en" >
                            CANCEL TRADE
                          </Button>
                        </div>
                      </div>

                      {process.env.REACT_APP_USER !== 'customer' &&
                        (<div className="column__info__row asked-price-container">
                          <span className="label">CANCELLATIONS LEFT</span>
                          <Grid columns={12}>
                            <Grid.Row>
                              <Grid.Column computer={6} tablet={6} mobile={6}>
                                <span className="value">
                                  01/m
                                </span>
                              </Grid.Column>
                              <Grid.Column computer={6} tablet={6} mobile={6}>
                                <span className="value">
                                  10/y
                                </span>
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                        </div>)
                      }

                      <div className="column__info__row asked-price-container">
                        <span className="label">ASKED PRICE</span>
                        <span className="value">&euro; {this.props.bidId.currentBidDetails.raise_price !== null ? formatMoney(this.props.bidId.currentBidDetails.raise_price) : formatMoney(this.props.bidId.currentBidDetails.price)}</span>
                      </div>
                      {process.env.REACT_APP_USER === 'customer' ? (
                      <div className="column__info__row deposit-container">
                          <span className="value">
                          Deposit
                          </span>
                          <span className="value">
                          &euro; {formatMoney(deposit)}
                          </span>
                      </div>
                      ) : (
                        // formatMoney(deposit)?(
                        // <div className="column__info__row deposit-container">
                        //   <span className="value">
                        //   Deposit
                        //   </span>
                        //   <span className="value">
                        //   &euro; {formatMoney((deposit /100)*85)}
                        //   </span>
                        // </div>
                        // ) : ''
                        ''
                      )}
                    </div>
                  </Grid.Column>

                  <Grid.Column mobile={16} tablet={16} computer={12} className="column-center">
                    <div className="actions-container">
                      {showBidAcquisitionPhase && (
                          <p className="title title__medium">BID acquisition phase...</p>
                      )}
                      {showSelectForSecondRound && (
                          <Button disabled={!drawActive} className="drawButtonMini drawButton-en" onClick={(e) => this.onDrawn(e)} >
                            <b>SELECT FOR 2ND ROUND</b>
                          </Button>
                      )}
                      {showSelectMatch && (
                          <Button disabled={!drawWinnerActive} className="drawWinnerMini drawButton-en" onClick={(e) => this.onDrawnWinner(e)} >
                            <b>SELECT MATCH</b>
                          </Button>
                      )}
                    </div>
                    {currentStep < 3 &&
                      (
                        <BiddersPanel currentBid={this.props.bidId.currentBidDetails.id} currentStep={currentStep} secondOffersFrom={this.state.secondOffersFrom} bidders={this.props.bidId.currentBidDetails.first_call_offers} shouldActivateHold={shouldActivateHold} shouldActivateMultiOrSingle={shouldActivateMultiOrSingle} />
                      )
                    }
                    {currentStep >= 3 && currentStep < 6 &&
                      (
                        <BiddersPanel currentBid={this.props.bidId.currentBidDetails.id} currentStep={currentStep} secondOffersFrom={this.state.secondOffersFrom} bidders={this.props.bidId.currentBidDetails.second_call_on_going} shouldActivateHold={shouldActivateHold} shouldActivateMultiOrSingle={shouldActivateMultiOrSingle} />
                      )
                    }

                  </Grid.Column>

                  <Grid.Column mobile={16} tablet={16} computer={2} className="column-right">
                    <h5 className="title title__small">
                      WATCH DETAILS
                    </h5>
                    <div className="column__info-container">

                      <div className="column__info__row reference-price">
                        <span className="label">reference</span>
                        <span className="value">{this.props.bidId.currentBidDetails.reference.reference}</span>
                      </div>

                      <div className="column__info__row brand-info">
                        <span className="value model-name">{this.props.bidId.currentBidDetails.reference.model_name}</span>
                        <span className="label brand-name">{this.props.bidId.currentBidDetails.reference.brand_name}</span>
                      </div>
                        <div className="column__info__row list-price bid-chart-container">
                            <span className="label">list price</span>
                            <span className="value">&euro; {formatMoney(this.props.bidId.currentBidDetails.reference.price)}</span>
                            <BidChart suggestedPrice={Number(this.props.bidId.currentBidDetails.price)} data={this.props.bidId.graphData} numBidders={this.props.bidId.graphData.length} chosenBidders={that.props.bidId.chosenBidders} UserItemsNum={UserItemsNum} />
                      </div>
                        <div className="column__info__row prices">
                          <div>
                            <span className="value">&euro; {formatMoney(this.props.bidId.currentBidDetails.reference.price)}</span>
                            <span className="label">higher matched price</span>
                          </div>
                          <div>
                            <span className="value">&euro; {formatMoney(this.props.bidId.currentBidDetails.reference.price)}</span>
                            <span className="label">average matched price</span>
                          </div>
                          <div>
                            <span className="value">&euro; {formatMoney(this.props.bidId.currentBidDetails.reference.price)}</span>
                            <span className="label">lowest matched price</span>
                          </div>
                        </div>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>


              {process.env.REACT_APP_USER === 'customer' ?
                (<ModalCustomerWinnerSelected
                  modalOpen={this.props.bidId.showModalWinnerSelected}
                  reference={this.props.bidId.currentBidDetails.reference}
                  bidId={this.props.bidId.currentBidDetails.id}
                  winner={this.state.winner}
                  winnerPrice={this.state.winnerPrice}  />
                ) :
                (<ModalRetailerWinnerSelected
                      modalOpen={this.props.bidId.showModalWinnerSelected}
                      reference={this.props.bidId.currentBidDetails.reference}
                      bidId={this.props.bidId.currentBidDetails.id}
                      winner={this.state.winner}
                      winnerPrice={this.state.winnerPrice}
                  />
                )}
            </Grid.Column>
          </Grid.Row>

        </Grid>
        <EventualModalBid />

      </Container>
    )
  }
}

const mapStateToProps = store => ({
  isSafari: store.userInfo.isSafari,
  bidId: store.bidInfo,
  refProps: store.referenceInfo,
})

const mapActionsToProps = {
  LoadCurrentBid,
  UpdateCurrentBid,
  ResetChosenBidders,
  AddChosenBidder,
  RemoveChosenBidder,
  SendFirstCallSelection,
  ResetGraphDataSecondCall,
  SelectWinner,
  SendWinnerSelection,
  SetPage,
  SendDelayBid,
  ShowModal,
  HideModal,
  LoadRefDetails,
}

export default connect(mapStateToProps, mapActionsToProps)(Bid)
