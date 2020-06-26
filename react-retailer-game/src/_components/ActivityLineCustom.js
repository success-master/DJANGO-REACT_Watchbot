import React from 'react';

import { timestamp2date } from '../_utilities/time'
import { capitalizeFirstLetter } from '../_utilities/formatStrings'
import { Grid } from 'semantic-ui-react'

import { formatMoney } from '../_utilities/price';

const TradeIdCol = ({dash, id, type, stepAstaVerbose, descrizione}) => (
  <Grid.Column mobile={1} tablet={1} computer={2} className="col-trade-id">
      <div style={{height: "auto"}} className="trade-id-wrapper">
        <span>{id}</span> {/* <span>{tipoAsta}</span> */}
      </div>
      {dash !== "rcMatchedTrades" && dash !== "rcFailedTrades" && dash !== "rCompetitorsPut" ? (
        <div style={{height: "auto"}} className="highlighted-text">
          {stepAstaVerbose} {descrizione}
        </div>
      ):(
        <div style={{height: "auto"}} className="highlighted-text">
          {dash !== "rCompetitorsPut" && capitalizeFirstLetter(type)}
        </div>
      )}
  </Grid.Column>
)

const StartDateCol = ({startDate}) => (
  <Grid.Column mobile={3} tablet={3} computer={3} className="col-date">
        <div>
          {timestamp2date(startDate)}
        </div>
  </Grid.Column>
)

const PriceCol = ({dash, askedOrMatchedPrice}) => (
  <Grid.Column mobile={2} tablet={2} computer={2} className="col-price">
    <div>
      {formatMoney(askedOrMatchedPrice)} &euro;
    </div>
    {dash === "rcMatchedTrades" ?
      (
        <div className="td__label">matched price</div>
      ):(
        <div className="td__label">asked price</div>
      )
    }
  </Grid.Column>
)

const BidPriceCol = ({dash, bidPrice}) => (
  ((dash === "rJoinedLiveCalls" || dash === "cMyJoinedLivePuts") && bidPrice !== null) ? (
    <Grid.Column mobile={2} tablet={2} computer={2} className="col-price">
        <div>
          {formatMoney(bidPrice)} &euro;
        </div>
        <div className="td__label">bid price</div>
    </Grid.Column>
  ) : ( '')
)

const TotalDueCol = ({matched_price, deposit}) => (
  <Grid.Column mobile={2} tablet={2} computer={2} className="col-price">
    <div>
      {formatMoney(matched_price - deposit)} &euro;
    </div>
    {process.env.REACT_APP_USER === 'retailer' ?
    ( <div className="td__label">net cash in</div>) :
    (<div className="td__label">total due</div>) }
  </Grid.Column>
)

const EmptyCol = () => (
  <Grid.Column mobile={1} tablet={1} computer={1} className="col-empty">
      <div>
      </div>
      <div>
      </div>
  </Grid.Column>
)

const TradeResultCol = ({status}) => {
  let statusShowed = status.replace(new RegExp('_', 'gi')," ")
  if (status.indexOf("decayed") !== -1) { statusShowed = "UNMATCHED" }
  if (status.indexOf("cancelled") !== -1) { statusShowed = "Cancelled" }
  return (
    <Grid.Column mobile={2} tablet={2} computer={2} className="col-status">
      <div>
        {statusShowed}
      </div>
    </Grid.Column>
  )
}

const CountryCol = ({dash, city, country}) => {
  if (dash === "cMyLiveCalls") {
    return null
  }

  if (dash !== "rLiveCalls" &&
      dash !== "rJoinedLiveCalls" &&
      dash !== "rcMatchedTrades" &&
      dash !== "allLivePuts" &&
      dash !== "cMyWatchlistLivePuts" &&
      dash !== "cMyJoinedLivePuts") {
    return (<EmptyCol />)
  }

  return (
    <Grid.Column mobile={2} tablet={2} computer={2} className="col-country">
        <div>
          {city}
        </div>
        <div className="highlighted-text">
          {country}
        </div>

    </Grid.Column>
  )
}

const MatcheStatusCol = ({payment_status, shipping_status}) => (
  <Grid.Column mobile={2} tablet={2} computer={2} className="col-status">
    <div>
      {payment_status.replace(new RegExp('_', 'gi')," ")}
    </div>
    <div>
      {shipping_status.replace(new RegExp('_', 'gi')," ")}
    </div>
  </Grid.Column>
)


const TimeRemainingCol = ({timeRemaining}) => (
  <Grid.Column mobile={2} tablet={2} computer={2} className="col-countdown">
        <div>
          {timeRemaining}
        </div>
  </Grid.Column>
)


class ActivityLineOriginal extends React.Component {

  render() {
      let ownerOrBuyerCity = null
      let ownerOrBuyerCountry = null
      let pointerRowStyle = ''

      switch(this.props.dash) {
        case "rLiveCalls":
        case "rJoinedLiveCalls":
        case "allLivePuts":
        case "cMyWatchlistLivePuts":
        case "cMyJoinedLivePuts":
          ownerOrBuyerCity = this.props.act.owner_address.city
          ownerOrBuyerCountry = this.props.act.owner_address.country
          break
        case "rcMatchedTrades":
          ownerOrBuyerCity = this.props.act.buyer.buyer_city
          ownerOrBuyerCountry = this.props.act.buyer.buyer_country
          pointerRowStyle = 'active-pointer'
          break
        default:
          break

      }

      return (
        <Grid.Row className={`panelRow `+pointerRowStyle} style={{borderLeft: this.props.color_left, background: this.props.color_background}} onClick={() => this.props.rowClickHandler(this.props.dash)}>

          <TradeIdCol
            dash={this.props.dash}
            id = {this.props.act.id}
            type = {this.props.act.type}
            //tipoAsta = {this.props.tipoAsta}
            stepAstaVerbose = {this.props.stepAstaVerbose}
            descrizione = {this.props.descrizione}
          />

          <Grid.Column mobile={3} tablet={3} computer={3} className="col-description">
              <div className={'modal-name-wrapper' + (this.props.act.reference.model_name.length > 31 ? ' truncate-text' : '')}>
                {this.props.act.reference.model_name}
              </div>
              <div className="highlighted-text">
                {this.props.act.reference.brand_name} {this.props.act.reference.reference}
              </div>
          </Grid.Column>


          <PriceCol
            dash={this.props.dash}
            askedOrMatchedPrice={this.props.dash !== "rcMatchedTrades" ? (this.props.act.raise_price !== null ? Number(this.props.act.raise_price) : Number(this.props.act.price)) : this.props.act.buyer.matched_price}
            />

          <BidPriceCol
            dash={this.props.dash}
            bidPrice = {(this.props.dash === "rJoinedLiveCalls" || this.props.dash === "cMyJoinedLivePuts") ? this.props.act.offer.bid_price_1 : null}
            />

          {/* 4th column */}

          {(this.props.dash !== "rcFailedTrades" &&
            this.props.dash !== "rCompetitorsPut" &&
            this.props.dash !== "rcMatchedTrades" &&
            this.props.dash !== "cMyLiveCalls" ) && (
            <StartDateCol startDate={this.props.act.call_1_start_date} />
          )}

          {this.props.dash === "cMyLiveCalls" && (
            <Grid.Column mobile={2} tablet={2} computer={2} className="col-price">
              <div>
                  {formatMoney(this.props.act.reference.price *20 /100)} &euro;
              </div>
              <div className="td__label">deposit</div>
            </Grid.Column>
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
          {(this.props.dash !== "rcFailedTrades" && this.props.dash !== "rCompetitorsPut") ? (
            <CountryCol
                dash={this.props.dash}
                city={ownerOrBuyerCity}
                country={ownerOrBuyerCountry}
            />
          ):(
            <TradeResultCol status={this.props.act.status} />
          )}

          {this.props.dash === "cMyLiveCalls" && (
              <StartDateCol startDate={this.props.act.call_1_start_date} />
          )}

          {/* 6th column */}
          {(this.props.dash === "rcFailedTrades" || this.props.dash === "rCompetitorsPut") ? (
            <StartDateCol startDate={this.props.act.call_1_start_date} />
          ):(
            // <TimeRemainingCol timeRemaining={this.props.timeRemainingToShow} />
            <EmptyCol />
          )}

           {/* Matched Trades & My Live Calls exclusive column */}
           {this.props.dash === "rcMatchedTrades" && (
            <MatcheStatusCol
              payment_status={this.props.act.buyer.payment_status}
              shipping_status={this.props.act.buyer.shipping_status}
            />
          )}

          {this.props.dash === "rcMatchedTrades" && (
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
