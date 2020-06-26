import React from 'react'
import { connect } from 'react-redux'

import { Grid, Button } from 'semantic-ui-react'

import RefPreferenceLines from '../_components/RefPreferenceLines';
import { LoadRefsByBrand, UnloadBrandToShow } from '../_actions/WatchesPreferences.action'

class BrandLine extends React.Component {

  preferenceChangeBrand = (brand) => {
    if (brand.id !== this.props.watchBrandSelected.id) { this.props.LoadRefsByBrand(brand) }
    else { this.props.UnloadBrandToShow()}
  }

  render() {

      return (

        <Grid.Row>
          <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "0px"}}>
            {this.props.watchBrandSelected.id !== this.props.brand.id ?
              (<div style={{padding: "8px 8px 8px 16px"}}>
                <Button className="prefBrand-btn" onClick={() => this.preferenceChangeBrand(this.props.brand)}>{this.props.brand.name.toUpperCase()}</Button>
               </div>
              )
              :
              (<div style={{background: "#212121", padding: "8px 8px 8px 16px", borderRadius: "8px"}}>
                <Button className="prefBrand-btn prefBrand-btn-selected" onClick={() => this.preferenceChangeBrand(this.props.brand)}>{this.props.brand.name.toUpperCase()}</Button>
                <RefPreferenceLines />
               </div>
              )

            }
          </Grid.Column>
        </Grid.Row>

      )

  }
}

const mapStateToProps = store => ({
  watchBrandSelected: store.watchesPreferencesInfo.brandSelected
})

const mapActionsToProps = {
  LoadRefsByBrand,
  UnloadBrandToShow
}

export default connect(mapStateToProps, mapActionsToProps)(BrandLine)
