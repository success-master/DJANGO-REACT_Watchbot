import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'
import { SendDeleteBid } from '../_actions/Bids.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalCancelBid extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal}>
        <Modal.Header>DELETE SCHEDULED TRADE</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>You are about to delete the scheduled trade #{this.props.modalProps.bid}</Header>
            <p>
            {this.props.modalProps.ref} {this.props.modalProps.model}
            <br />
            Planned call 1 start date: {this.props.modalProps.call_1_start_date}
            <br /><br />
            Are you sure?
            </p>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button color='grey' inverted onClick={() => this.props.SendDeleteBid(this.props.modalProps.bid)}>
            <Icon name='checkmark' /> Yes - Delete
          </Button>
          <Button color='grey' inverted onClick={this.props.HideModal}>
            <Icon name='checkmark' /> No - Exit
          </Button>
        </Modal.Actions>
      </Modal>

    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  HideModal,
  SendDeleteBid
}


export default connect(mapStateToProps, mapActionsToProps)(ModalCancelBid)
