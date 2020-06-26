import React from "react";
import { connect } from 'react-redux'
import { HideModal } from '../_actions/Modals.action'
import { WriteSettingsProfile } from '../_actions/Settings.action'

import { Modal, Button, Icon } from 'semantic-ui-react'
import tut1 from '../_assets/tutorial/1.png'
import tut2 from '../_assets/tutorial/2.png'
import tut3 from '../_assets/tutorial/3.png'
import tut4 from '../_assets/tutorial/4.png'
import tut5 from '../_assets/tutorial/5.png'

const TUTORIAL_SLIDES = [tut1, tut2, tut3, tut4, tut5]

class ModalSplashPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tutSlide: 0 };
  }

  onNotShowMeAnymore = () => {
    let newUserSettings = {...this.props.userSettingsProps, show_splash: false}
    this.props.WriteSettingsProfile(newUserSettings)
    this.props.HideModal()
  }

  NextSlide = () => {
    this.setState(prevState => {
       if (prevState.tutSlide === TUTORIAL_SLIDES.length-1) { return {tutSlide: 0} }
       return {tutSlide: prevState.tutSlide + 1}
    })
  }

  render() {
    return (
      <Modal className="wbModal" size={'fullscreen'} open>
        <Modal.Actions>
          <Button color='grey' inverted onClick={this.props.HideModal}>
            <Icon name='checkmark' /> Ok
          </Button>
        </Modal.Actions>
        <Modal.Content>

          <Modal.Description>
            <center>
              <img src={TUTORIAL_SLIDES[this.state.tutSlide]} alt="slide" style={{width: "100%", maxWidth: "1440px", height: "auto"}} />
            </center>
          </Modal.Description>

        </Modal.Content>
        <Modal.Actions>
          <Button style={{float: "left"}} color='grey' inverted onClick={this.onNotShowMeAnymore}>
            <Icon name='checkmark' /> Ok, don&apos;t show me this next time
          </Button>
          <Button color='grey' inverted onClick={this.NextSlide}>
            Next
          </Button>

        </Modal.Actions>
      </Modal>

    )
  }
}

const mapStateToProps = store => ({
  userSettingsProps: store.userInfo.userSettingsProfile
})

const mapActionsToProps = {
  WriteSettingsProfile,
  HideModal
}

export default connect(mapStateToProps, mapActionsToProps)(ModalSplashPage)
