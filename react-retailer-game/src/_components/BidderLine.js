import React from 'react';

import {connect} from 'react-redux'
import {AddChosenBidder, SelectWinner, RemoveChosenBidder} from '../_actions/Bids.action'

import Typist from 'react-typist';

import {Grid, Button} from 'semantic-ui-react'

import { formatMoney} from '../_utilities/price';


class BidderLine extends React.Component {

    selectUser = (num, multipleOrSingle) => {
        if (!this.props.bidId.chosenBidders.includes(num)) {

            if (multipleOrSingle === 'multi') {
                this.props.AddChosenBidder(num, this.props.bidId.currentBidDetails.first_call_offers[num].offer_id)
            } else {
                if (this.props.bidId.currentBidDetails.second_call_on_going[num].second_call_offer_id > 0) {
                    this.props.SelectWinner(num, this.props.bidId.currentBidDetails.second_call_on_going[num].second_call_offer_id)
                } else {
                    this.props.SelectWinner(num, this.props.bidId.currentBidDetails.second_call_on_going[num].first_call_offer_id)
                }
            }

        } else {

            this.props.RemoveChosenBidder(num, this.props.bidId.currentBidDetails.first_call_offers[num].offer_id)
        }

    }

    render() {
        const activeFirstRound = [0, 1, 2].indexOf(this.props.currentStep) !== -1;
        const activeSecondRound = [3, 4, 5].indexOf(this.props.currentStep) !== -1;
        return (
            <Grid.Row className="panelRow">
                <Grid.Column mobile={2} tablet={1} computer={1} className="col-actions">
                    {this.props.shouldActivateHold &&

                    (this.props.bidId.chosenBidders.includes(this.props.userIndex) ? (
                            <Button className="active"
                                    onClick={(e) => this.selectUser(this.props.userIndex, this.props.shouldActivateMultiOrSingle, e)}/>
                        ) : (
                            <Button
                                onClick={(e) => this.selectUser(this.props.userIndex, this.props.shouldActivateMultiOrSingle, e)}/>
                        )
                    )
                    }
                </Grid.Column>

                <Grid.Column mobile={4} tablet={3} computer={3} className="col-description">
                  <span>
                     {this.props.bidder.user_city} {this.props.bidder.user_country}
                  </span>
                </Grid.Column>

                <Grid.Column
                    mobile={5}
                    tablet={6}
                    computer={6}
                    style={this.props.bidId.chosenBidders.includes(this.props.userIndex) ? {color: "#f68b1f"} : {color: "#fff"}}
                    className={'col-price' + (activeFirstRound ? ' active' : '')}
                >
                    <Grid columns={16}>
                        <Grid.Row>
                            <Grid.Column mobile={16} tablet={8} computer={8}>
                                {(this.props.typing && this.props.currentStep < 3) ? (
                                    <Typist key={this.props.currentBid + "_" + this.props.bidder.user_id} avgTypingDelay={1}
                                            cursor={{hideWhenDone: true}}>
                                        <span className="price">
                                        €{formatMoney(this.props.bidder.price)}
                                        {/*Math.round(this.props.bidder.price).toString()*/}
                                        </span>
                                    </Typist>
                                ) : (
                                    <span className="price">
                                        €{this.props.currentStep < 3 ? formatMoney(this.props.bidder.price) : formatMoney(this.props.bidder.price_first_call)}
                                        {/*this.props.currentStep < 3 ? Math.round(this.props.bidder.price).toString() : this.props.bidder.price_first_call.toString()*/}
                                    </span>
                                )}
                                <small>1st bid</small>
                            </Grid.Column>
                            <Grid.Column mobile={16} tablet={8} computer={8}>
                                <span className="price price__cash">
                                    {this.props.currentStep < 3 ? (
                                        '€' + formatMoney(Number(this.props.bidder.price) + Number(this.props.bidder.price) * 0.22)
                                    ) : (
                                        '€' + formatMoney(Number(this.props.bidder.price_first_call) + Number(this.props.bidder.price_first_call) * 0.22)
                                    )}
                                </span>
                                {process.env.REACT_APP_USER === 'retailer' ? (
                                  <small>net cash in</small>
                                ):(
                                  <small>TOTAL TO PAY</small>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>

                <Grid.Column
                    mobile={5}
                    tablet={6}
                    computer={6}
                    style={this.props.bidId.chosenBidders.includes(this.props.userIndex) ? {color: "#f68b1f"} : {color: "#fff"}}
                    className={'col-price' + (activeSecondRound ? ' active' : '')}
                >
                    <Grid columns={16}>
                        <Grid.Row>
                            <Grid.Column mobile={16} tablet={8} computer={8}>
                                {(this.props.currentStep > 2 && this.props.bidder.price_second_call !== 'awaiting') ? (
                                    <span>
                                         {this.props.typing ? (
                                             <Typist key={this.props.currentBid + "_" + this.props.bidder.user_id + "_2"} avgTypingDelay={1}
                                                     cursor={{hideWhenDone: true}}>
                                            <span className="price">
                                               €{formatMoney(this.props.bidder.price_second_call)}
                                               {/*this.props.bidder.price_second_call.toString()*/}
                                            </span>
                                             </Typist>
                                         ) : (
                                             <span className="price">
                                             €{formatMoney(this.props.bidder.price_second_call)}
                                             {/*this.props.bidder.price_second_call.toString()*/}
                                           </span>
                                         )}
                                    </span>
                                ) : (
                                    <span className="price price--none"> - </span>
                                )}
                                <small>2nd bid</small>
                            </Grid.Column>
                            <Grid.Column mobile={16} tablet={8} computer={8}>
                                <span className="price price__cash">
                                    {this.props.bidder.price_second_call > 0 ? (
                                        '€' + formatMoney(Number(this.props.bidder.price_second_call) - Number(this.props.bidder.price_second_call) * 5 / 100)
                                    ) : (
                                        '-'
                                    )}
                                </span>
                                {process.env.REACT_APP_USER === 'retailer' ? (
                                  <small>net cash in</small>
                                ):(
                                  <small>TOTAL TO PAY</small>
                                )}

                            </Grid.Column>
                        </Grid.Row>
                    </Grid>

                </Grid.Column>
            </Grid.Row>
        )

    }
}

const mapStateToProps = store => ({
    bidId: store.bidInfo
})

const mapActionsToProps = {
    AddChosenBidder,
    SelectWinner,
    RemoveChosenBidder
}

export default connect(mapStateToProps, mapActionsToProps)(BidderLine)
