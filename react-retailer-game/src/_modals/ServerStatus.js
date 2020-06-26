import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'

import { Modal, Button, Header} from 'semantic-ui-react'

class ModalServerStatus extends React.Component {

  render() {
    console.log(this.props.modalProps.server_data)
    return (
      <Modal open onClose={this.props.HideModal} className="message-modal">
        <Modal.Header>ERROR</Modal.Header>
        <Modal.Content>

          <Modal.Description style={{display: 'none', height: '50px'}}>
            <Header>{this.props.modalProps.server_status} Server Error</Header>
            {/*
            <p>
            <b>Server Data Response</b><br />
            {this.props.modalProps.server_data}
            </p>
            */ }
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button className="gray-btn" onClick={this.props.HideModal}>
            Close
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


export default connect(mapStateToProps, mapActionsToProps)(ModalServerStatus)
