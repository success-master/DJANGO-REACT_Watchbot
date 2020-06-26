import React from "react";
import { connect } from 'react-redux'
import { Link } from "react-router-dom"
import { LoadCurrentBid, UpdateCurrentBid, ResetChosenBidders, AddChosenBidder, RemoveChosenBidder, SendFirstCallSelection, ResetGraphDataSecondCall, SelectWinner, SendWinnerSelection, SendDelayBid } from '../_actions/Bids.action'
import { ShowModal } from '../_actions/Modals.action'
import { SetPage } from '../_actions/Settings.action'

import BidChart from  '../_components/BidChart';
import BiddersPanel from  '../_panels/Bidders.panel';
import ModalRetailerWinnerSelected from  '../_modals/RetailerWinnerSelected.modal';
import IndiModalDefault from  '../_modals/IndiModalDefault.modal';

import { Container, Grid, Button, Card, Icon, Loader } from 'semantic-ui-react'
import bidUser from '../_assets/icons/bid_user-retina.png';

import Countdown from '../_components/Countdown';

/*
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}
*/

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
      secondOffersFrom: -1,
      webSocket: { status: "DISCONNECTED" , response: "", err: "None"}
      //maxTimeinMs: { "first_call_open" :600000, "first_call" : 600000, "first_call_selection" : 600000, "second_call_open" : 600000, "second_call" : 600000, "second_call_selection" : 600000 }
      //timeRemaingToNextStepInMs: 600000,
    }

  }

/*
  doSetTimeout (state_with_final_bidders, simulation_step, new_bidders_total, timeout, timing , that) {
    let new_state=Object.assign({}, MISSING_API[state_with_final_bidders])
    // estraggo i bidders fino allo step attuale
    new_state.bidders= new_state.bidders.slice(0, new_bidders_total)
    setTimeout(function() {

      console.log(new_state, "simulation step", simulation_step, "new bidders totale", new_bidders_total, timing);

      that.setState ({
        bidData: new_state,
        timeRemaingToNextStepInMs: timing
      })


      let graphicalData=that.state.graphData,i
      for (i = 0; i < UserItemsNum; i++) {
        if (i<that.state.bidData.bidders.length) {
         graphicalData[i]={ bidder: i+1, offer: that.state.bidData.bidders[i].offerUsd }
        }
      }
      that.setState({graphData: graphicalData})

    }, timeout);

  }
*/

  tickSafari() {
    if (numStep[this.props.bidId.currentBidDetails.status] < 5) {
        console.log("updating Safari Bid")
        this.props.UpdateCurrentBid(this.props.bidId.currentBidDetails.id)
    }
  }


  componentDidMount() {

    this.props.SetPage('bid')
    if ( this.props.isSafari === true ) { this.interval = setInterval(() => this.tickSafari(), 10000) } //settato anche se game, per aggiornamento bid
    //this.setState({bidData: this.props.bidId.currentBidDetails})

    /*
    let graphicalData=this.state.graphData,i
    for (i = 0; i < UserItemsNum; i++) {
      if (i<this.state.bidData.first_call_offers.length) {
        graphicalData[i]={ bidder: i+1, offer: Number(this.state.bidData.first_call_offers[i].price) }
      }
    }
    this.setState({graphData: graphicalData})
    */


    //this.props.ResetChosenBidders()

    /*

    this.ws = new WebSocket('wss://echo.websocket.org/')

    this.ws.onopen = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          status: 'CONNECTED'
      }
      }))

    }

    this.ws.onmessage = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          response: e.data
      }
      }))

      var objData=JSON.parse(e.data)
      this.setState ({
        bidData: objData,
        timeRemaingToNextStepInMs: objData.time_remain
      })
      console.log(objData)


    }

    this.ws.onerror = e => {
      this.setState(prevState => ({
      webSocket: {
          ...prevState.webSocket,
          err: 'WebSocket error'
      }
      }))

    }

    */

    //this.ws.onclose = e => !e.wasClean && this.setState({ error: `WebSocket error: ${e.code} ${e.reason}` })

  }


  componentWillUnmount() {
    /*
    this.ws.close()
    */
    if ( this.props.isSafari === true ) { clearInterval(this.interval) }
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
    switch (this.props.bidId.currentBidDetails.status) {
      case 'first_call_selection':
        console.log("DRAWN")
        console.log(this.props.bidId.currentBidDetails.id)
        console.log(this.props.bidId.chosenOffers)
        this.props.ShowModal('RAISE_PRICE', {bidId: this.props.bidId.currentBidDetails.id, chosenOffers: this.props.bidId.chosenOffers, chosenBidders: this.props.bidId.chosenBidders, price: this.props.bidId.currentBidDetails.price})
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
    /*
    if (this.props.bidId.currentBidDetails.status === "first_call_selection") {
      console.log("DRAWN")
      console.log(this.props.bidId.currentBidDetails.id)
      console.log(this.props.bidId.chosenOffers)
      this.props.SendFirstCallSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenOffers)
      this.props.ResetGraphDataSecondCall(this.props.bidId.chosenOffers.length)
      this.props.ResetChosenBidders()
    }
    */
/*
    if (process.env.REACT_APP_TEST_DATA === "true" && this.state.bidData.step === "first_call_selection") {
      let tempBidData = Object.assign({}, this.state.bidData)
      let tempBidders = []
      let that=this
      this.props.bidId.chosenBidders.forEach(function(element) {
          tempBidders.push({...that.state.bidData.bidders[element],...{offerUsd_secondcall: null} })
      });
      tempBidData.step="second_call_open"
      tempBidData.bidders=tempBidders
      tempBidData.time_remain=60000

      let graphicalData = []
      for (var i = 0; i < tempBidders.length ; i++) {
        graphicalData.push({bidder: i+1, offer:0})
      }

      let simulOrdineDiRilancio = [...Array(tempBidders.length).keys()]
      shuffle(simulOrdineDiRilancio)
      let newSimulatedOffers = []
      for (var i = 0; i < simulOrdineDiRilancio.length ; i++) {
        var scostRandomOffer= getRandomInt(0,30)*100
        newSimulatedOffers.push(tempBidders[simulOrdineDiRilancio[i]].offerUsd + scostRandomOffer)
      }

      this.setState ({
        bidData: tempBidData,
        timeRemaingToNextStepInMs: 60000,
        graphData: graphicalData
      })

      setTimeout(function() {
        tempBidData.step="second_call"
        that.setState ({
          bidData: tempBidData,
          timeRemaingToNextStepInMs: 60000
        })

      }, 60000);

      var xtime=0
      var scostTime= Math.trunc(60000/simulOrdineDiRilancio.length)

      for (var i = 0; i < simulOrdineDiRilancio.length ; i++) {
        var scostRandomTime= getRandomInt(0,3)*1000
        xtime=xtime+scostTime-scostRandomTime

        setNewOffer(i)

      }

      function setNewOffer(i) {

        setTimeout(function(){
          console.log("rilancio", i)
          tempBidData.bidders[simulOrdineDiRilancio[i]].offerUsd_secondcall = newSimulatedOffers[i]
          let graphicalData=that.state.graphData
          graphicalData[simulOrdineDiRilancio[i]]={ bidder: simulOrdineDiRilancio[i]+1, offer: newSimulatedOffers[i]}
          that.setState ({
            bidData: tempBidData,
            secondOffersFrom: i,
            graphData: graphicalData
          })
          //that.setState(prevState => {
            //  return {}
            //})
          console.log(tempBidData)

      }, 60000+xtime);

    }

      setTimeout(function() {
        tempBidData.step="second_call_selection"
        that.setState ({
          bidData: tempBidData,
          timeRemaingToNextStepInMs: 60000
        })

      }, 120000);

      this.props.ResetChosenBidders()

    }

    if (process.env.REACT_APP_TEST_DATA === "true" && this.state.bidData.step === "second_call_selection") {
      this.setState({showModalWinnerSelected: true})
    }

    */
  }

  onDrawnWinner = () => {
    if (this.props.bidId.currentBidDetails.status==='first_call_selection') {
      this.props.SendWinnerSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenOffers[0])
    } else {
      this.props.SendWinnerSelection(this.props.bidId.currentBidDetails.id, this.props.bidId.chosenWinningOffer)
    }

  }

  onDrawnDelay = () => {
      this.props.SendDelayBid(this.props.bidId.currentBidDetails.id)
  }



  render() {
    console.log("render bid",this.props.bidId.viewBidId)
    console.log("render store",this.props.bidId.currentBidDetails)

    let obj = this.props.bidId.currentBidDetails
    //se non ha caricato i dettagli della bid non renderizza (se obj vuoto)
    if ((Object.keys(obj).length === 0 && obj.constructor === Object) || (this.props.bidId.viewBidId === 0 )) {
      return (<span></span>)
    }

    if (this.props.bidId.viewBidId !== this.props.bidId.currentBidDetails.id) {
      return (<span></span>)
    }

    let maxTimeInSecForPercent
    switch (this.props.bidId.currentBidDetails.status) {
      case 'first_call_open':
        maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_1_start_date) - Number(this.props.bidId.currentBidDetails.insert_date)
        break
      case 'first_call':
        maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_1_end_date) - Number(this.props.bidId.currentBidDetails.call_1_start_date)
        break
      case 'first_call_selection':
        if (!this.props.bidId.currentBidDetails.first_call_selection_completed) {
          maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_1_end_selection) - Number(this.props.bidId.currentBidDetails.call_1_end_date)
        } else {
          maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_2_start_date) - Number(this.props.bidId.currentBidDetails.first_call_selection_date)
        }
        break
      case 'second_call_open':
        maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_2_start_date) - Number(this.props.bidId.currentBidDetails.call_1_end_selection)
        break
      case 'second_call':
        maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_2_end_date) - Number(this.props.bidId.currentBidDetails.call_2_start_date)
        break
      case 'second_call_selection':
        maxTimeInSecForPercent= Number(this.props.bidId.currentBidDetails.call_2_end_selection) - Number(this.props.bidId.currentBidDetails.call_2_end_date)
        break
      default:

    }

    const TimingPhaseOpening = () => (
      <div style={{textAlign: "center", marginRight: "10px"}}>
        <span className="blink">
          Opening, please wait
        </span>
        <Icon loading name='spinner' className="blink" style={{color: "#ff0000", marginLeft: "4px"}}/>
      </div>
    )

    const TimingPhaseTwoOpening = () => (
      <div style={{textAlign: "center", marginRight: "10px"}}>
        <span className="blink">
          Opening 2nd call, please wait
        </span>
        <Icon loading name='spinner' className="blink" style={{color: "#ff0000", marginLeft: "4px"}}/>
      </div>
    )

    const TimingPhaseFirstCallSelection = () => (
      <div className="blink" style={{textAlign: "center", marginRight: "10px", borderLeft: "6px solid #ff6600"}}>
        Select 2nd call entrants or winner
      </div>
    )

    const TimingPhaseSelectWinner = () => (
      <div className="blink" style={{textAlign: "center", marginRight: "10px", borderLeft: "6px solid #ff6600"}}>
        Select Winner
      </div>
    )
    //console.log("websocket:",this.state.webSocket.status)

    let TimingPhase = ''
    switch(this.props.bidId.currentBidDetails.status) {
      case "first_call_open":
        TimingPhase = <TimingPhaseOpening />
        break
      case "first_call_selection":
        TimingPhase = <TimingPhaseFirstCallSelection />
        break
      case "second_call_open":
        TimingPhase = <TimingPhaseTwoOpening />
        break
      case "second_call":
        if (this.props.bidId.currentBidDetails.all_second_call_offer_completed === true) {
          TimingPhase = <TimingPhaseSelectWinner />
        }
        break
      case "second_call_selection":
        TimingPhase = <TimingPhaseSelectWinner />
        break
      default:
        break
    }
    if ((this.props.bidId.currentBidDetails.status==="first_call_selection") && (this.props.bidId.currentBidDetails.first_call_selection_completed === true)) {
      TimingPhase = <TimingPhaseOpening />
    }

    const shouldActivateHold = ((this.props.bidId.currentBidDetails.status === "first_call_selection" && (this.props.bidId.currentBidDetails.first_call_selection_completed !== true) ) || this.props.bidId.currentBidDetails.status === "second_call_selection" || this.props.bidId.currentBidDetails.all_second_call_offer_completed === true)
    const shouldActivateMultiOrSingle = this.props.bidId.currentBidDetails.status === "first_call_selection" ? "multi" : "single"

    const that=this

    const EventualModalBid = function() {
      if (that.props.bidId.currentBidDetails.status.indexOf('decayed') !== -1)
        { return (<IndiModalDefault title={"Time expired!"}
                  msg={ "You have not entered an asked price. Your initial submission has been confirmed."}
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

    let thatLength = this.props.bidId.currentBidDetails.first_call_offers.length
    if (this.props.bidId.currentBidDetails.second_call_on_going.length > 0) {
      thatLength=this.props.bidId.currentBidDetails.second_call_on_going.length
    }
    //if currentStep>2 ...usare altro array

    const drawActive = (this.props.bidId.chosenBidders.length>0 ? true : false )
    const drawWinnerActive =  (this.props.bidId.chosenBidders.length === 1 && (this.props.bidId.currentBidDetails.status === 'first_call_selection' || this.props.bidId.currentBidDetails.status === 'second_call_selection' || this.props.bidId.currentBidDetails.all_second_call_offer_completed === true) ) ? true : false
    const delayActive = (((this.props.bidId.currentBidDetails.status === 'first_call_selection' || this.props.bidId.currentBidDetails.status === 'second_call_selection' ) &&  this.props.bidId.currentBidDetails.delay_available > 0) ? true : false)

    const UserCards = function() {
      var userData=[],i

      const styleEmptyUsers = currentStep > 1 ? { display: "none"} : { display: "block"}

      for (i = 0; i < UserItemsNum; i++) {
        let userNum=i
        var styleActiveUsers = that.props.bidId.chosenBidders.includes(i) ? { padding: "0.4em 0.4em", background : "#ff6600", cursor: "pointer" } : { padding: "0.4em 0.4em", background : ( !((that.props.bidId.currentBidDetails.status==="first_call_selection") && (that.props.bidId.currentBidDetails.first_call_selection_completed === true)) ? "#4d4e50" : "transparent"), cursor: (shouldActivateHold ? "pointer" : "arrow") }
        if (i<=thatLength) {
          userData.push(

              <Card key={i} className="bidders-card"  style={{boxShadow: '0 0 0 0, 0 0 0 0', borderRadius: "0px"}} >
                <Card.Content style={ i>=thatLength ? styleEmptyUsers : styleActiveUsers } onClick={(e)=>that.selectUser(userNum,shouldActivateMultiOrSingle,shouldActivateHold, e)} >
                  <Card.Header style={{marginLeft: "0"}}>
                  {i>=thatLength ?
                    (<img src={bidUser} alt="user icon" style={{opacity : "0.3", verticalAlign: "top", height: "23px", width: "23px"}} />)
                    :
                    (<div>
                      {/* <img style={{display: "inline-block", verticalAlign: "top", height: "23px", width: "23px"}} src={bidUser} />  */ }

                        <div style={{ fontSize: "11px", color: "#fff"}}>{i+1}/{thatLength}</div>

                      </div>
                    )
                  }

                  </Card.Header>
                  {/*}
                  <Card.Meta style={{color: "#fff", marginTop: "10px"}}>
                  <div style={{textAlign: "right", fontSize: "10px"}}>
                    { i<thatLength ? that.props.bidId.currentBidDetails.first_call_offers[i].user_country : ""}
                  </div>
                  </Card.Meta>
                  */}
                  <Card.Description style={{color: "#fff", marginTop: "0"}}>
                    { (i>=thatLength) || ((that.props.bidId.currentBidDetails.status==="first_call_selection") && (that.props.bidId.currentBidDetails.first_call_selection_completed === true)) ?
                      (
                       <Loader active />
                      )
                       :
                      (
                       <div style={{textAlign: "right"}}>
                         { (currentStep < 3 || that.props.bidId.currentBidDetails.status==='decayed_first_call' || that.props.bidId.currentBidDetails.status==='decayed_first_call_selection') &&
                              (
                                <strong>${Math.round(that.props.bidId.currentBidDetails.first_call_offers[i].price)}</strong>
                              )
                         }
                         { currentStep >=3 && currentStep <6 &&
                              ( <div>
                                { (that.props.bidId.currentBidDetails.second_call_on_going[i].price_second_call) && (that.props.bidId.currentBidDetails.second_call_on_going[i].price_second_call !=='awaiting') ?
                                  (
                                   <strong>
                                    €{that.props.bidId.currentBidDetails.second_call_on_going[i].price_second_call}
                                   </strong>
                                  )
                                   :
                                  (
                                   <div>
                                    { currentStep < 5 ?
                                      (
                                        <div>
                                          <Loader active />
                                          <strong>------</strong>
                                        </div>
                                      )
                                       :
                                      ( /* second_call_selection */
                                        <strong>€{that.props.bidId.currentBidDetails.second_call_on_going[i].price_first_call}</strong>
                                      )
                                    }
                                   </div>
                                  )
                                }
                             </div>)
                         }
                       </div>
                      )
                    }
                  </Card.Description>
                </Card.Content>
              </Card>

        )
        }
      }

      return (userData);
    }

    return (
      <Container className="mainBoard">

        <Grid columns={16}>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={4} computer={4} style={{paddingRight: "0px"}}>
              <div class="actBar" style={{paddingLeft: "10px"}}><Link to={`/`} className="linkBack" data-letters="Back to Dashboard">Back to Dashboard</Link></div>

            </Grid.Column>
            <Grid.Column mobile={16} tablet={12} computer={12} style={{background: "#2c2c2c", height: "36px"}}>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>

            <Grid.Column mobile={16} tablet={14} computer={16}>
              <Grid columns={16}>
                <Grid.Row>

                    <Grid.Column width={7}>
                      <div style={{fontSize: "14px", background: "#62757f", marginBottom: "2px", marginLeft: "10px", direction: "ltr"}}>
                        <div style={{padding: "4px 12px", textAlign: "left"}}>
                          Trade #{this.props.bidId.currentBidDetails.id}
                          <br /><b>{this.props.bidId.currentBidDetails.reference.model_name} {this.props.bidId.currentBidDetails.reference.reference}</b>
                        </div>
                        <div style={{background: "#4d4e50", textAlign: "right", paddingRight: "8px", paddingTop: "4px"}}>
                        SUGGESTED PRICE: <span style={{color: "#ff6600"}}> €{this.props.bidId.currentBidDetails.price}</span>
                        </div>
                        <BidChart suggestedPrice={Number(this.props.bidId.currentBidDetails.price)} data = {this.props.bidId.graphData} numBidders={this.props.bidId.graphData.length} chosenBidders={that.props.bidId.chosenBidders} UserItemsNum={UserItemsNum} />
                      </div>
                    </Grid.Column>
                    <Grid.Column width={7} style={{paddingRight: "0px"}}>
                      {currentStep < 3 &&
                        (
                          <BiddersPanel currentBid={this.props.bidId.currentBidDetails.id} currentStep={currentStep} secondOffersFrom={this.state.secondOffersFrom} bidders={this.props.bidId.currentBidDetails.first_call_offers} shouldActivateHold={shouldActivateHold} shouldActivateMultiOrSingle={shouldActivateMultiOrSingle} />
                        )
                      }
                      {currentStep >=3 && currentStep <6 &&
                        (
                          <BiddersPanel currentBid={this.props.bidId.currentBidDetails.id} currentStep={currentStep} secondOffersFrom={this.state.secondOffersFrom} bidders={this.props.bidId.currentBidDetails.second_call_on_going} shouldActivateHold={shouldActivateHold} shouldActivateMultiOrSingle={shouldActivateMultiOrSingle} />
                        )
                      }

                    </Grid.Column>
                    <Grid.Column width={2}>
                      <div style={{width: "90%", background: (currentStep === 1 ? "#62757f" : "#4d4e50" ), borderRadius: "5px", padding: "4px", textAlign: "center"}}>1ST CALL</div>
                      <div style={{width: "90%", background: (currentStep === 4 ? "#62757f" : "#4d4e50" ), borderRadius: "5px", padding: "4px", textAlign: "center", margin: "8px 0px 24px 0px"}}>2ND CALL</div>

                      <div style={{fontSize: "10px", textAlign: "center", paddingRight: "10px"}}>TIME REMAINING</div>
                        <Countdown maxTimeInMsForPercent={maxTimeInSecForPercent*1000} timeremaing={this.props.bidId.currentBidDetails.time_remain*1000} step={this.props.bidId.currentBidDetails.status}/>
                        {TimingPhase}
                    </Grid.Column>
                </Grid.Row>


                <Grid.Row >
                    <Grid.Column width={14} style={{paddingLeft: "32px", paddingRight: "0px"}}>
                    <Card.Group>
                      <UserCards />
                    </Card.Group>
                    </Grid.Column>

                    <Grid.Column width={2} style={{paddingTop: "4px"}}>
                      {currentStep < 3 ?
                        ( <div>

                              <Button disabled={!drawActive} className="drawButtonMini drawButton-en" onClick={(e) => this.onDrawn(e)} >
                              <b>DRAW SEL</b>
                              </Button>


                              <Button disabled={!delayActive} className="drawDelayMini drawButton-en" onClick={(e) => this.onDrawnDelay(e)} >
                              <b>DELAY</b>
                              </Button>


                              <Button disabled={!drawWinnerActive} className="drawWinnerMini drawButton-en" onClick={(e) => this.onDrawnWinner(e)} >
                              <b>DRAW WINNER</b>
                              </Button>

                          </div>
                         )
                         :
                         (
                          <div>
                              <Button disabled={!drawWinnerActive} className="drawWinnerMini drawButton-en" onClick={(e) => this.onDrawnWinner(e)} >
                                <b>DRAW WINNER</b>
                              </Button>

                              <Button disabled={!delayActive} className="drawDelayMini drawButton-en" onClick={(e) => this.onDrawnDelay(e)} >
                              <b>DELAY</b>
                              </Button>
                          </div>
                         )
                      }

                      <ModalRetailerWinnerSelected modalOpen={this.props.bidId.showModalWinnerSelected}  />


                    </Grid.Column>


                </Grid.Row>

              </Grid>

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
  bidId: store.bidInfo
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
  ShowModal
}

export default connect(mapStateToProps, mapActionsToProps)(Bid)


//<div style={{lineHeight: "11px", fontWeight: "strong"}}>User ID</div>
//<div style={{lineHeight: "10px"}}>{that.state.bidData.bidders[i].bidder}</div>

//<div style={{textAlign: "right"}}>{i+1}/{UserItemsNum}</div>
