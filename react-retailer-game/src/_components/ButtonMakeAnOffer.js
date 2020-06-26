import React from 'react';
import { connect } from 'react-redux'

import { ModalJoinBid } from '../_actions/Bids.action'
import { LoadRefDetails } from '../_actions/References.action'
import { Button } from 'semantic-ui-react'

class ButtonMakeAnOffer extends React.Component {

  render() {
    if ( ((Number(this.props.act.call_1_start_date) - this.props.act.server_timestamp) < 60) && (process.env.REACT_APP_GAME === false)) {
      return null;
    }

    return (
      <Button className="panel-btn join-btn"
        onClick={() => {
          this.props.LoadRefDetails(this.props.act.reference.id)
          this.props.ModalJoinBid(
                                   true,
                                   this.props.act.id,
                                   this.props.act.reference.reference,
                                   this.props.act.reference.model_name,
                                   this.props.act.price,
                                   this.props.notifId,
                                   null, //no raise_price
                                   null  //no first offer
                                 )
        }}
      >
        Join
      </Button>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  ModalJoinBid,
  LoadRefDetails
}

export default connect(mapStateToProps, mapActionsToProps)(ButtonMakeAnOffer)
