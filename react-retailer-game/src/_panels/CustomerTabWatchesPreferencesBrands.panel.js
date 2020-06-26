import React from 'react';
import { connect } from 'react-redux'

import BrandLine from '../_components/BrandLine';

class TabWatchesPreferencesBrands extends React.Component {

  render() {
    let BrandsList = []
    BrandsList = this.props.watchesPreferencesProps.brandsDisplayed.map(function(brand, index) {
      return (<BrandLine key={index} brand={brand} />)
    })
    return (
      <div>
        {BrandsList}
      </div>
    )
  }
}

const mapStateToProps = store => ({
    watchesPreferencesProps: store.watchesPreferencesInfo
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(TabWatchesPreferencesBrands)
