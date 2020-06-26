import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"

import { SetPanelRightOpen } from '../_actions/Settings.action'
import { UpdateLatestReference, AddFollow, Unfollow } from '../_actions/References.action'


import { Grid, Button } from 'semantic-ui-react'

class RefPreferenceDetails extends React.Component {

  //preferenceChangeModelDetails = (model) => this.props.LoadModelPreferencesSelected(model)

  toggleFollow = e => {
    console.log(this.props.reference.id)
    if (this.props.refProps.followList.includes(this.props.reference.id)) {
      this.props.Unfollow(this.props.reference.id)
    } else {
      this.props.AddFollow(this.props.reference.id)
    }
  }

  render() {
    const ButtonViewReference = withRouter(({ history }) => (
      <Button className="watch-pref-btn watch-view" style={{fontSize: "11px"}}
        onClick={() => {
          this.props.UpdateLatestReference({selectedOption:{ "id": this.props.reference.id, "ref": this.props.reference.reference, "label": this.props.reference.label, "brand": this.props.reference.model.brand.name, "price": this.props.reference.price }})
          history.push('/reference-info')
          this.props.SetPanelRightOpen(false)
        }} >
        VIEW
      </Button>
    ))

    let alreadyFollowed = this.props.refProps.followList.includes(this.props.reference.id)

    return (

      <Grid.Row>
        <Grid.Column mobile={16} tablet={16} computer={16} style={{backgroundColor: "#181818", borderRadius: "4px", padding: "6px 12px"}}>
          FOLLOW
          <label className="switch">
            <input type="checkbox" checked={alreadyFollowed} onChange={this.toggleFollow} />
            <span className="slider round"></span>
          </label>
          <ButtonViewReference />
        </Grid.Column>
      </Grid.Row>

    )

  }
}

const mapStateToProps = store => ({
  refProps: store.referenceInfo
})

const mapActionsToProps = {
  SetPanelRightOpen,
  UpdateLatestReference,
  AddFollow,
  Unfollow
}

export default connect(mapStateToProps, mapActionsToProps)(RefPreferenceDetails)
