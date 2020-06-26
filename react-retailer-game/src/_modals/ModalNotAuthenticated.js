import React from "react";

import { Modal, Button, Header, Icon } from 'semantic-ui-react'

class ModalNotAuthenticated extends React.Component {

  render() {
    return (
      <Modal open>
        <Modal.Header>Not Authenticated</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <Header>Autenticazione Fallita</Header>
            <p></p>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button color='red' inverted>
            <Icon name='checkmark' /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>

    )
  }
}



export default ModalNotAuthenticated
