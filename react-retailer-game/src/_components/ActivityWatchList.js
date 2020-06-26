import React from 'react';
import { connect } from 'react-redux'

import { timestamp2date } from '../_utilities/time'
import { Grid } from 'semantic-ui-react'

import { formatMoney} from '../_utilities/price';

class ActivityWatchList extends React.Component {

  render() {

      return (
        <Grid.Row className="panelRow" style={{borderLeft: this.props.color_left, background: this.props.color_background}}>

          <Grid.Column mobile={2} tablet={2} computer={2} className="col-trade-id">
              <div style={{height: "auto"}} className="trade-id-wrapper">
                <span>{this.props.act.id}</span> <span>{this.props.tipoAsta}</span>
              </div>
              <div style={{height: "auto"}}>
                {this.props.stepAstaVerbose} {this.props.descrizione}
              </div>
          </Grid.Column>

          <Grid.Column mobile={5} tablet={5} computer={5} className="col-description">
              <div style={{height: "auto"}}>
                {this.props.act.reference.model_name}
              </div>
              <div style={{height: "auto" }} className="highlighted-text">
                {this.props.act.reference.brand_name} {this.props.act.reference.reference}
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
            <span className="td__label">asked/price</span>
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

          <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions">
            {this.props.ctaButton}
          </Grid.Column>

        </Grid.Row>
      )

  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(ActivityWatchList)
