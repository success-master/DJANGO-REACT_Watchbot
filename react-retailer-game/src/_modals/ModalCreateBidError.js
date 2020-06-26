import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalCreateBidError extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal}>
        <Modal.Header>BID CREATE ERROR</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <Header>{this.props.modalProps.server_status} Error</Header>
            <p>
            La richiesta sulla referenceId {this.props.modalProps.referenceId} / datetimeZ: {this.props.modalProps.datetimeZ} non è andata a buon fine<br /><br />
            <b>Server Data Response</b><br />
            {this.props.modalProps.server_data}
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


export default connect(mapStateToProps, mapActionsToProps)(ModalCreateBidError)
