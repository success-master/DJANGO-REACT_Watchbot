import React from 'react';
import { connect } from 'react-redux'

import BidderLine from  '../_components/BidderLine';

import { Container, Grid } from 'semantic-ui-react'

class BiddersPanel extends React.Component {

  render() {
    var that=this
    const BiddersItems = this.props.bidders.map(function(bidder, index) {
        return (<BidderLine key ={index + "-" + bidder.bidder} currentBid={that.props.currentBid} updatedSecondOffer={that.props.secondOffersFrom} bidder = {bidder} currentStep={that.props.currentStep} userIndex={index} shouldActivateHold={that.props.shouldActivateHold} shouldActivateMultiOrSingle={that.props.shouldActivateMultiOrSingle} />)
    })

    /*console.log("RENDERED")*/
    const activeFirstRound = [0,1,2].indexOf(this.props.currentStep) !== -1;
    const activeSecondRound = [3,4,5].indexOf(this.props.currentStep) !== -1;
    return (
      <Container className="activities-list-container">
          <Grid columns={16} className="table-head">
            <Grid.Row>
              <Grid.Column mobile={2} tablet={1} computer={1}>
                {/* STATUS */}
              </Grid.Column>
              <Grid.Column mobile={4} tablet={3} computer={3}>
                <span className="label label--active">city</span>
              </Grid.Column>
              <Grid.Column mobile={5} tablet={6} computer={6} className="round">
                {/* PRICE 1st CALL */}
                <span className={'label' + (activeFirstRound ? ' label--active' : '')}>1st round</span>
              </Grid.Column>
              <Grid.Column mobile={5} tablet={6} computer={6} className="round">
                {/* PRICE 2nd CALL */}
                <span className={'label' + (activeSecondRound ? ' label--active' : '')}>2st round</span>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <div className="boardfull boardfullscroll">
            <Grid columns={16} className="table-body">
              {BiddersItems}
            </Grid>
          </div>
      </Container>
    )
  }
}

const mapStateToProps = store => ({
  activProps: store.activitiesList
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(BiddersPanel)
