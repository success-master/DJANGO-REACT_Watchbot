import React from 'react';
import { connect } from 'react-redux'

import { ModalJoinBid } from '../_actions/Bids.action'
import { LoadRefDetails } from '../_actions/References.action'
import { Button } from 'semantic-ui-react'

class ButtonMakeSecondOffer extends React.Component {

  render() {
   
    return (
      <Button className="panel-btn join-btn"
        onClick={() => {
          this.props.LoadRefDetails(this.props.act.reference.id)
          this.props.ModalJoinBid( true,
                                   this.props.act.id,
                                   this.props.act.reference.reference,
                                   this.props.act.reference.model_name,
                                   this.props.act.price,
                                   this.props.notifId,
                                   this.props.act.raise_price,
                                   this.props.act.offer.bid_price_1)
        }}
      >
        Rlnch
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

export default connect(mapStateToProps, mapActionsToProps)(ButtonMakeSecondOffer)
