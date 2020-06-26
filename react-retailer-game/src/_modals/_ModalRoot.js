import React from "react";

import ModalGeneric from './Generic'
import ModalServerStatus from './ServerStatus'
import ModalNotAuthenticated from './ModalNotAuthenticated'
import ModalJoinBidSuccess from './ModalJoinBidSuccess'
import ModalJoinBidError from './ModalJoinBidError'
import ModalCreateBidSuccess from './ModalCreateBidSuccess'
import ModalCreateBidError from './ModalCreateBidError'
import ModalCancelBid from './ModalCancelBid'
import ModalRaisePrice from './ModalRaisePrice'
import ModalSplashPage from './ModalSplashPage'
import ModalAddTrade from './ModalAddTrade'
import ModalAddSchedulePut from './ModalAddSchedulePut'
import ModalDeleteBidSuccess from './ModalDeleteBidSuccess'
import ModalFilterByBrand from './ModalFilterByBrand'
import ModalGameCantCreateTrade from './ModalGameCantCreateTrade'
import ModalReferenceInfo from '../_modals/ReferenceInfo.modal';
import ModalMatchedTrade from '../_modals/MatchedTrade.modal';
import Modal3ds from '../_modals/Payment3ds.modal';

const MODAL_COMPONENTS = {
  'GENERIC': ModalGeneric,
  'NOT_AUTHENTICATED': ModalNotAuthenticated,
  'JOIN_BID_SUCCESS': ModalJoinBidSuccess,
  'JOIN_BID_ERROR': ModalJoinBidError,
  'CREATE_BID_SUCCESS': ModalCreateBidSuccess,
  'CREATE_BID_ERROR': ModalCreateBidError,
  'CANCEL_BID': ModalCancelBid,
  'SERVER_STATUS': ModalServerStatus,
  'RAISE_PRICE': ModalRaisePrice,
  'SPLASH_PAGE': ModalSplashPage,
  'ADD_TRADE': ModalAddTrade,
  'ADD_SCHEDULE': ModalAddSchedulePut,
  'DELETE_BID_SUCCESS': ModalDeleteBidSuccess,
  'CHANGE_FILTER_BRAND': ModalFilterByBrand,
  'GAME_CANT_CREATE_TRADE': ModalGameCantCreateTrade,
  'REFERENCE_INFO': ModalReferenceInfo,
  'MATCHED_TRADE': ModalMatchedTrade,
  '3DS_CHECK': Modal3ds
}

class ModalRoot extends React.Component {

  render() {
    if (this.props.modalProps === undefined) {
       return (null)
    } else {

      if (!this.props.modalProps.modalType) {
        return (null)
      }

      /*
      if (this.props.modalProps.modalType === 'NOT_AUTHENTICATED') {
        return (null)
      }
      */

      const SpecificModal = MODAL_COMPONENTS[this.props.modalProps.modalType]
      return (<SpecificModal modalProps={this.props.modalProps.modalProps} />)
    }

  }
}

export default ModalRoot
