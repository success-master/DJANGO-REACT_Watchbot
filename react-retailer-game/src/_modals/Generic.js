import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalGeneric extends React.Component {

  render() {
    return (
      <Modal open onClose={this.props.HideModal}>
        <Modal.Header>{this.props.modalProps.title}</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <Header>{this.props.modalProps.header}</Header>
            <p>
            <b>Message</b><br />
            {this.props.modalProps.msg}
            </p>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={this.props.HideModal}>
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


export default connect(mapStateToProps, mapActionsToProps)(ModalGeneric)
