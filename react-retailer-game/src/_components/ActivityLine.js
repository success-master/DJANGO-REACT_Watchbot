import React from 'react';
import { connect } from 'react-redux'

import ButtonGoBid from '../_components/ButtonGoBid';
import ButtonMakeAnOffer from '../_components/ButtonMakeAnOffer';
import ButtonMakeSecondOffer from '../_components/ButtonMakeSecondOffer';
import ButtonPay from '../_components/ButtonPay';
import ActivityLineCustom from  '../_components/ActivityLineCustom';

import { SetViewBidId, ModalJoinBid, ShowModalMatchedTrade } from '../_actions/Bids.action'
import { LoadRefDetails} from '../_actions/References.action'

let stepAstaVerbose
let descrizione
let userCanMakeAnOfferFor = (process.env.REACT_APP_USER === 'customer' ? 'PUT' : 'CALL')

class ActivityLine extends React.Component {

  rowClickHandler = (dash) =>{
    switch (dash){
      case "rcMatchedTrades":
        this.props.LoadRefDetails(this.props.act.reference.id);
        this.props.ShowModalMatchedTrade(this.props.act.id)
        break;

      default:
        return true;
    }
  }

  render() {
    // get total seconds between the times
    let diff = 0
    let delta = Math.abs(Number(this.props.act.call_1_start_date) - this.props.act.server_timestamp)
    let postInfo = ''
    switch (this.props.act.status) {
      case 'first_call_open':
      case 'first_call':
      case 'first_call_selection':
      case 'second_call_open':
      case 'second_call':
      case 'second_call_selection':
      case 'winner_selected':
        diff= -1
        delta = Math.abs(parseInt(this.props.act.time_remain, 10))
        break
          //diff= this.props.act.server_timestamp - Number(this.props.act.call_1_end_selection)
          //delta = Math.abs(diff)
          //break
      //case 'first_call_selection':
        //diff= this.props.act.server_timestamp - Number(this.props.act.call_1_end_selection)
        //delta = Math.abs(diff)
        //break
      case 'decayed_game':
        delta = 10
        postInfo = 'ago'
        break
      default:
        diff= this.props.act.server_timestamp - Number(this.props.act.closed_date)
        delta = Math.abs(diff)
        postInfo = 'ago'
    }
    let segno = diff < 0 ? '-':''

    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    let seconds = delta % 60;  // in theory the modulus is not required

    let timeRemainingToShow = segno+(days > 0 ? days+'d' : '')+' '+((hours > 0 || days > 0) ? hours+'h' : '' )+' '+(days > 0 ? '' : minutes+'m')+' '+(( hours > 0 || days > 0) ? '' : seconds+'s' )+' '+postInfo

    let CtaButton = ''
    let created_by_this_user = typeof this.props.act.owned_by_this_user !== 'undefined' ? this.props.act.owned_by_this_user : (this.props.myactivity ? true : false)
    let joined_by_this_user = typeof this.props.act.joined_by_this_user !== 'undefined' ? this.props.act.joined_by_this_user : (this.props.myactivity ? true : false)
    let raised_by_this_user = typeof this.props.act.second_call_joined_by_this_user!== 'undefined' && this.props.act.second_call_joined_by_this_user
    let tipoAsta = (created_by_this_user? 'MY TRD' : (typeof this.props.act.type !== 'undefined' ? this.props.act.type.toUpperCase() : ''))
    tipoAsta = (joined_by_this_user? 'JOINED' : (typeof this.props.act.type !== 'undefined' ? tipoAsta : ''))
    tipoAsta = (raised_by_this_user? 'RAISED' : (typeof this.props.act.type !== 'undefined' ? tipoAsta : ''))
    switch(this.props.act.status) {
      case "first_call_open":
        // descrizione="first round"
        // stepAstaVerbose="Opening ";
        descrizione=""
        stepAstaVerbose="";
        CtaButton = (created_by_this_user? <ButtonGoBid act={this.props.act} /> : (tipoAsta===userCanMakeAnOfferFor ? <ButtonMakeAnOffer act={this.props.act} notifId={-1} /> : '' ))
        break;
      case "first_call":
        descrizione="First round"
        stepAstaVerbose="";
        CtaButton = (created_by_this_user?
                     <ButtonGoBid act={this.props.act} /> : (tipoAsta === userCanMakeAnOfferFor ?
                                                            <ButtonMakeAnOffer act={this.props.act} notifId={-1} />
                                                            :
                                                            '' ))
        break;
      case "first_call_selection":
        descrizione="First round evaluation"
        stepAstaVerbose="";
        CtaButton = (created_by_this_user? <ButtonGoBid act={this.props.act} /> : '' )
        break;
      case "second_call_open":
        descrizione="second round"
        stepAstaVerbose="Opening ";
        CtaButton = (created_by_this_user? <ButtonGoBid act={this.props.act} /> : '' )
        break;
      case "second_call":
        descrizione="Second round"
        stepAstaVerbose="";
        CtaButton = (created_by_this_user? <ButtonGoBid act={this.props.act} /> : (joined_by_this_user && this.props.act.first_call_selection_for_this_user && !this.props.act.second_call_joined_by_this_user ? <ButtonMakeSecondOffer act={this.props.act} notifId={-1} />  : '' ) )
        break;
      case "second_call_selection":
        descrizione="Second round evaluation"
        stepAstaVerbose="";
        CtaButton = (created_by_this_user? <ButtonGoBid act={this.props.act} /> : '' )
        break;
      case "winner_selected":

        descrizione="Trade matched"
        stepAstaVerbose="Closing";
        if (this.props.act.won_by_this_user) {
          descrizione=" - You won!"
          //chiedere le spiegazioni a Paola
          //if (process.env.REACT_APP_USER === 'customer') { CtaButton= (<ButtonPay />) }
        } else {

          if (created_by_this_user && process.env.REACT_APP_USER === 'customer') {

            //chiedere le spiegazioni a Paola
            //CtaButton= (<ButtonPay />)
          }
        }
        break;
      case "closed":
        stepAstaVerbose="Closed";
        break;
      case "decayed_first_call":
      case "decayed_first_call_selection":
      case "decayed_second_call":
      case "decayed_second_call_selection":
      case "decayed_not_payed":
      case "decayed_game":
        //requiredIcon='../assets/icons/ticker-decayed-bianco'
        stepAstaVerbose="Decayed";
        //descrizione=segno + (days > 0 ? days+'d' : '' ) + ((hours > 0 || days > 0) ? ' '+hours+'h' : '' ) + (days > 0 ? '' : ' '+minutes+'m') + ((hours > 0 || days > 0) ? '' : ' '+seconds+'s' ) + ' ' +postInfo
        descrizione=''

        break;
      case "V":
        stepAstaVerbose="Won";

        break;
      case "P":
        stepAstaVerbose="Won";

        break;
      default:
        stepAstaVerbose="?";
        break;
    }

      return (
        <ActivityLineCustom
          act={this.props.act}
          dash={this.props.dash}
          ctaButton={CtaButton}
          tipoAsta={tipoAsta}
          stepAstaVerbose={stepAstaVerbose}
          descrizione={descrizione}
          timeRemainingToShow={timeRemainingToShow}
          rowClickHandler={this.rowClickHandler} />
      )

  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  onViewBidId: SetViewBidId,
  ModalJoinBid,
  LoadRefDetails,
  ShowModalMatchedTrade,
}

export default connect(mapStateToProps, mapActionsToProps)(ActivityLine)
