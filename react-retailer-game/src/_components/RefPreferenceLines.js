import React from 'react'
import { connect } from 'react-redux'

import { Grid } from 'semantic-ui-react'
import RefPreferenceLine from '../_components/RefPreferenceLine';

class RefPreferenceLines extends React.Component {

  render() {
    let RefsList = []
    RefsList = this.props.watchRefsDisplayed.map(function(reference, index) {
      return (<RefPreferenceLine key={index} reference={reference} />)
    })

    return (

      <Grid.Row>
        <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "8px", paddingRight: "2px"}}>
          {RefsList}
        </Grid.Column>
      </Grid.Row>

    )

  }
}

const mapStateToProps = store => ({
  watchRefsDisplayed: store.watchesPreferencesInfo.refsDisplayed
})

const mapActionsToProps = {

}

export default connect(mapStateToProps, mapActionsToProps)(RefPreferenceLines)
