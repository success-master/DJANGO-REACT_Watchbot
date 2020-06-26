import React from "react";
import { connect } from 'react-redux'

import { HideModal } from '../_actions/Modals.action'

import SubmodalAddTrade from './SubmodalAddTrade'

import { Modal } from 'semantic-ui-react'

let launchTradeHeader = (process.env.REACT_APP_USER === 'customer' ? 'YOU ARE PROPOSING FOR BUYING' : 'You are launching a PUT for')

class ModalAddTrade extends React.Component {
  render() {

    return (
      <Modal open closeOnEscape={true}
        closeOnDimmerClick={false} onClose={() => this.props.HideModal()} className="modal-container">
        {/* <Modal.Header><h3>{launchTradeHeader}:</h3></Modal.Header> */}

        <SubmodalAddTrade selectedOption={this.props.modalProps.selectedOption} calledFrom="schedulePut" launchTradeHeader={launchTradeHeader} />

      </Modal>

    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  HideModal
}

export default connect(mapStateToProps, mapActionsToProps)(ModalAddTrade)
