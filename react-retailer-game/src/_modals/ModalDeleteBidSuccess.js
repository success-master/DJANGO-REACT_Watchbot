import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalDeleteBidSuccess extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal}>
        <Modal.Header>TRADE DELETED</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <Header>Success</Header>
            <p>
            {this.props.modalProps.bidId}
            </p>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button color='white' inverted onClick={this.props.HideModal}>
            <Icon name='checkmark' /> Exit
          </Button>
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


export default connect(mapStateToProps, mapActionsToProps)(ModalDeleteBidSuccess)
