import React from 'react'
import { connect } from 'react-redux'

import { Grid, Button } from 'semantic-ui-react'
import { LoadRefPreferencesSelected } from '../_actions/WatchesPreferences.action'
import RefPreferenceDetails from '../_components/RefPreferenceDetails';

class RefPreferenceLine extends React.Component {

  preferenceChangeModel = (reference) => this.props.LoadRefPreferencesSelected(reference)

  render() {

    if (typeof this.props.reference.model === 'undefined') {
      return (<span></span>)
    }

    return (
      <div>
        <Grid.Row>
          <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "8px", paddingRight: "2px"}}>
          {this.props.watchRefSelected === this.props.reference.id ?
            (<div>
              <Button className="prefRef-btn prefRef-btn-selected">{this.props.reference.model.name} {this.props.reference.reference}</Button>
             </div>
            ):
            (<Button className="prefRef-btn" onClick={() => this.preferenceChangeModel(this.props.reference.id)}>{this.props.reference.model.name} {this.props.reference.reference}</Button>)
          }

        {this.props.watchRefSelected === this.props.reference.id &&
          (<RefPreferenceDetails reference={this.props.reference} />)
        }
        </Grid.Column>
      </Grid.Row>
      </div>
    )

  }
}

const mapStateToProps = store => ({
  watchRefSelected: store.watchesPreferencesInfo.refSelected
})

const mapActionsToProps = {
  LoadRefPreferencesSelected

}

export default connect(mapStateToProps, mapActionsToProps)(RefPreferenceLine)
