import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalJoinBidSuccess extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal} className="message-modal">
        <Modal.Header>Bid joined succesfully</Modal.Header>

        <Modal.Content>
          <Modal.Description>
            {/* <Header>
            {this.props.modalProps.server_status} OK
            </Header>
            <p>
            Auction ID: {this.props.modalProps.auction}<br />
            Your price: {this.props.modalProps.price}
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


export default connect(mapStateToProps, mapActionsToProps)(ModalJoinBidSuccess)
