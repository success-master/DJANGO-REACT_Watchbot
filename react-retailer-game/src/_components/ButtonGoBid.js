import React from 'react';
import { withRouter } from "react-router-dom"
import { connect } from 'react-redux'

import { SetViewBidId } from '../_actions/Bids.action'
import { Button } from 'semantic-ui-react'

class ButtonGoBid extends React.Component {

  onViewBidId = () => {
    this.props.onViewBidId(this.props.act.id);
  }
  
  render() {

    const ButtonGoWithRouter = withRouter(({ history }) => (
      <Button className="panel-btn view-btn"
        onClick={() => {
          this.onViewBidId()
          history.push('/bid')
        }}
      >
        View
      </Button>
    ))

    return (
      <ButtonGoWithRouter />
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  onViewBidId: SetViewBidId
}

export default connect(mapStateToProps, mapActionsToProps)(ButtonGoBid)
