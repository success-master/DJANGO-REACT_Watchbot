import React from "react";
import { connect } from 'react-redux'

import TabWatchesPreferences from  '../_panels/CustomerTabWatchesPreferences.panel';

import { Tab} from 'semantic-ui-react'

let TabProfile = {}
if (process.env.REACT_APP_USER === 'retailer') {
  TabProfile = require('../_panels/RetailerTabProfile.panel').default
} else {
  TabProfile = require('../_panels/CustomerTabProfile.panel').default
}

class CustomerSettings extends React.Component {

  render() {
    let panes = [
      { menuItem: 'MY ACCOUNT', render: () => <Tab.Pane><TabProfile /></Tab.Pane> },
      { menuItem: 'MY WATCHLIST', render: () => <Tab.Pane><TabWatchesPreferences /></Tab.Pane> }
    ]

    return (
      <div>
        <Tab panes={panes} />
      </div>
    )
  }
}

const mapStateToProps = store => ({
  userProps: store.userInfo
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(CustomerSettings)
