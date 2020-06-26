import React from 'react';
import { connect } from 'react-redux'

import { timestamp2date } from '../_utilities/time'
import { capitalizeFirstLetter } from '../_utilities/formatStrings'
import { Grid } from 'semantic-ui-react'

import { formatMoney} from '../_utilities/price';

class ActivityLineOriginal extends React.Component {

  render() {
      let ownerOrBuyerCity = this.props.dash === "rLiveCalls" || this.props.dash === "rJoinedLiveCalls" ? this.props.act.owner_address.city : null
      let ownerOrBuyerCountry = this.props.dash === "rLiveCalls" || this.props.dash === "rJoinedLiveCalls" ? this.props.act.owner_address.country : null

      if (this.props.dash === "rcMatchedTrades") {
        ownerOrBuyerCity = this.props.act.buyer.buyer_city
        ownerOrBuyerCountry = this.props.act.buyer.buyer_country
      }

      return (
        <Grid.Row className="panelRow" style={{borderLeft: this.props.color_left, background: this.props.color_background}}>

          <TradeIdCol
            dash={this.props.dash}
            id = {this.props.act.id}
            type = {this.props.act.type}
            //tipoAsta = {this.props.tipoAsta}
            stepAstaVerbose = {this.props.stepAstaVerbose}
            descrizione = {this.props.descrizione}
          />

          <Grid.Column mobile={3} tablet={3} computer={3} className="col-description">
              <div style={{height: "auto"}} className="sku-wrapper">
                <span>{this.props.act.reference.brand_name}</span> <span>{this.props.act.reference.reference}</span>
              </div>
              <div style={{height: "auto" }}>
                {this.props.act.reference.model_name}
              </div>

          </Grid.Column>
          { /*
          <Grid.Column mobile={1} tablet={1} computer={1} style={{paddingTop: "8px", color: "#c1c2c3", cursor: "pointer"}}>
            {this.props.act.main_image &&
              (
                <Popup
                  trigger={<img src={iconDetails} alt="details" />}
                  position='bottom left'
                >
                  <Popup.Content>
                    <img src={this.props.act.main_image} alt="watch" style={{width: "400px", height: "auto"}} />
                  </Popup.Content>
                </Popup>
              )
            }
          </Grid.Column>
          */ }
          <Grid.Column mobile={2} tablet={2} computer={2} className="col-price">
            {formatMoney(this.props.act.price)} &euro;
            <span className="label__mobile">asked/price</span>
          </Grid.Column>
          <Grid.Column mobile={3} tablet={3} computer={3} className="col-date">
                <span>
                  {timestamp2date(this.props.act.call_1_start_date)}
                </span>
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2} className="col-time">
                <span>
                  {this.props.timeRemainingToShow}
                </span>
          </Grid.Column>

          <PriceCol
            dash={this.props.dash}
            askedOrMathedPrice={this.props.dash !== "rcMatchedTrades" ? Number(this.props.act.price) : this.props.act.buyer.matched_price}
            bidPrice = {this.props.dash === "rJoinedLiveCalls" ? this.props.act.offer.bid_price_1 : null}
            />

          {/* 4th column */}

          {(this.props.dash !== "rcFailedTrades" && this.props.dash !== "rCompetitorsPut" && this.props.dash !== "rcMatchedTrades") && (
            <StartDateCol startDate={this.props.act.call_1_start_date} />
          )}

          {this.props.dash === "rcMatchedTrades" && (
            <TotalDueCol
                matched_price = {this.props.act.buyer.matched_price}
                deposit = {this.props.act.buyer.deposit}
            />
          )}

          {(this.props.dash === "rcFailedTrades" || this.props.dash === "rCompetitorsPut") && (
             <EmptyCol />
          )}

          {/* 5th column */}
          {this.props.dash !== "rcFailedTrades" && this.props.dash !== "rCompetitorsPut" ? (
            <CountryCol
                dash={this.props.dash}
                city={ownerOrBuyerCity}
                country={ownerOrBuyerCountry}
            />
          ):(
            <TradeResultCol status={this.props.act.status} />
          )}

          {/* Matche Trades exclusice column */}
          {this.props.dash === "rcMatchedTrades" && (
            <MatcheStatusCol
              payment_status={this.props.act.buyer.payment_status}
              shipping_status={this.props.act.buyer.shipping_status}
            />
          )}

          {/* 6th column */}
          {(this.props.dash === "rcFailedTrades" || this.props.dash === "rCompetitorsPut") ? (
            <StartDateCol startDate={this.props.act.call_1_start_date} />
          ):(
            <TimeRemainingCol timeRemaining={this.props.timeRemainingToShow} />
          )}

          {/* 7th column */}
          <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions">
            {this.props.ctaButton}
          </Grid.Column>

        </Grid.Row>


      )

  }
}

export default ActivityLineOriginal
