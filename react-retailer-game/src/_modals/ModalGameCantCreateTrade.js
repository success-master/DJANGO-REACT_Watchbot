import React from "react";
import { connect } from 'react-redux'

import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Icon } from 'semantic-ui-react'

class ModalGameCantCreateTrade extends React.Component {
  render() {

    return (
      <Modal open onClose={this.props.HideModal}>
        <Modal.Header>You can create just a trade at a time</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <p>
            Please complete your already created trade or let it decay in order to create another one
            </p>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button color='gray' inverted onClick={this.props.HideModal}>
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

export default connect(mapStateToProps, mapActionsToProps)(ModalGameCantCreateTrade)
