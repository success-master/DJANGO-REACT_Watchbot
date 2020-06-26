import React from "react";

import { Button, Modal } from 'semantic-ui-react'

class IndiModalDefault extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modalOpen: true

    }
  }

  //handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => {
    this.setState({ modalOpen: false })
    if (this.props.refreshToHome === true) {
      if (process.env.REACT_APP_GAME !== "true") {
        window.location.replace(process.env.REACT_APP_SITE_URL+"/"+process.env.REACT_APP_USER+"/")
      } else {
        //window.location.replace("localhost:3000/retailer-game/")
        window.location.replace(process.env.REACT_APP_SITE_URL+"/"+process.env.REACT_APP_USER+"-game/")
      }

    }
  }

  render() {
    const ButtonClose = () => (
      <Button className="gray-btn" onClick={this.handleClose}>
        Close
      </Button>
    )

    return (
      <Modal size='tiny' open={this.state.modalOpen} onClose={this.handleClose} className="message-modal">
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>

          <Modal.Description>
            <p>{this.props.msg}</p>
            <p>{this.props.msg2}</p>
          </Modal.Description>


        </Modal.Content>
        <Modal.Actions>

            <ButtonClose />


        </Modal.Actions>
      </Modal>
    )
  }
}

export default IndiModalDefault
