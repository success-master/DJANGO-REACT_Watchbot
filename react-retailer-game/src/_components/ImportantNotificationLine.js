import React from 'react';
import { withRouter } from "react-router-dom"

import { connect } from 'react-redux'
import { SetViewBidId, ModalJoinBid } from '../_actions/Bids.action'


class ImportantNotificationLine extends React.Component {

  render() {
    return(
      <div>
        xxx {this.props.act.status}
      </div>
    )
  }

}

const mapStateToProps = store => ({

})

const mapActionsToProps = {

}

export default connect(mapStateToProps, mapActionsToProps)(ImportantNotificationLine)
