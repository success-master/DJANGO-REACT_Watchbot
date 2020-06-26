import React from "react";
import { connect } from 'react-redux'
import { Modal, Header } from 'semantic-ui-react'
//import { HideModal } from '../_actions/Modals.action'

class Payment3ds extends React.Component {

    render(){
        const ServerObj = JSON.parse(this.props.modalProps.server_data);

        return(
          <Modal open className="modal-container matched-trade__modal-container">
            <Modal.Content>
              <Modal.Description>
                <Header>PROCEED TO 3DS SECURE CHECK</Header>
                Click the Authentication button to proceed to 3ds secure check
                <form action={ServerObj.url} method="post">
                  <input type="hidden" name="a" value={ServerObj.shop_login} />
                  <input type="hidden" name="b" value={ServerObj.token} />
                  <input type="hidden" name="c" value={ServerObj.return_url} />
                  <input type="submit" value="authentication" />
                </form>
              </Modal.Description>
            </Modal.Content>
          </Modal>
        )
    }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(Payment3ds)
