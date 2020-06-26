import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalCreateBidSuccess extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal} className="message-modal">
        <Modal.Header>Bid created succesfully</Modal.Header> 
        <Modal.Content>

          <Modal.Description>
            {/* <Header>
            {this.props.modalProps.server_status} OK
            </Header>
            <p>
            Reference ID: {this.props.modalProps.referenceId}<br />
            Time: {this.props.modalProps.datetimeZ}
            </p>
            {this.props.modalProps.server_data} */}
          </Modal.Description>

        </Modal.Content>

        <Modal.Actions>
          <Button className="gray-btn" onClick={this.props.HideModal}>Close</Button>
        </Modal.Actions>
      </Modal>

    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  HideModal
}


export default connect(mapStateToProps, mapActionsToProps)(ModalCreateBidSuccess)
