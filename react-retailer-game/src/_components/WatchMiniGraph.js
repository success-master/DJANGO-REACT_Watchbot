import React from 'react'
//import { withRouter } from "react-router-dom"

import ReferenceChart from  '../_components/ReferenceChart';

import { connect } from 'react-redux'
import { DeleteWatchGraph } from '../_actions/WatchGraphList.action'
import { UpdateLatestReference, LoadReferenceInfo, LoadRefDetails} from '../_actions/References.action'

import { formatMoney} from '../_utilities/price';

import { Grid, Button } from 'semantic-ui-react'

class WatchMiniGraph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      btnViewHover: false,
      btnDelHover: false,
      historicalData: [],
    }
  }

  // componentDidMount() {
  //   let ref= this.props.reference
  //   let obj = MISSING_API.refhistoricaldata.find(function (obj) { return obj.ref === ref; });
  //   if (typeof obj !== 'undefined') {
  //     this.setState({historicalData : obj.historicalData})
  //   } else {
  //     this.setState({historicalData : []})
  //   }
  // }

  onDelWatch = () => {
    this.props.onDelWatch(this.props.listId, this.props.refId)
  }

  render() {

    const isOpen = this.props.openAnalytics.includes(this.props.listId);

    const ButtonRemove = () => (
      <Button className=""
        onClick={() => { this.onDelWatch()}}
      >
        REMOVE
      </Button>
    )

    /*
    const ButtonViewReference = withRouter(({ history }) => (

      <Button className=""
        onClick={() => {
          //this.props.UpdateLatestReference({ selectedOption: { "id": this.props.refId, "reference": this.props.reference, "label": this.props.label, "brand": this.props.brand, "model": this.props.model, "price": this.props.suggestedPriceDollars }})
          this.props.UpdateLatestReference({ selectedOption: { ...this.props.api20 }})
          history.push('/reference-info')
        }}
      >
        VIEW WATCH
      </Button>
    ))
    */

    const ButtonViewReferenceInModal = () => (
      <Button className=""
        onClick={() => {
          this.props.LoadRefDetails(this.props.refId)
          this.props.LoadReferenceInfo({ historicalData: this.props.historicalData,
                                         refId: this.props.refId,
                                         refPrice: this.props.suggestedPriceDollars})
          //this.props.UpdateLatestReference({ selectedOption})
        }}
      >
        VIEW WATCH
      </Button>
    )

    /*
    const ButtonViewReferenceInModal_OLD = () => (
      <Button className=""
        onClick={() => {
          this.props.LoadReferenceInfo({ historicalData: this.props.historicalData,
                                        selectedOption:
                                        { "id": this.props.refId,
                                        "reference": this.props.reference,
                                        "label": this.props.label,
                                        "brand": this.props.brand,
                                        "model": this.props.model,
                                        "price": this.props.suggestedPriceDollars,
                                        "case_size": this.props.api20.case_size,
                                        "case_material": this.props.api20.case_material,
                                        "dial_color": this.props.api20.dial_color,
                                        "bracelet_material": this.props.api20.bracelet_material,
                                        "movement": this.props.api20.movement,
                                        "gender": this.props.api20.gender,
                                        "picture_url": this.props.api20.picture_url
                                        }})
          this.props.UpdateLatestReference({ selectedOption:
                                            { "id": this.props.refId,
                                            "reference": this.props.reference,
                                            "label": this.props.label,
                                            "brand": this.props.brand,
                                            "model": this.props.model,
                                            "price": this.props.suggestedPriceDollars,
                                            "case_size": this.props.api20.case_size,
                                            "case_material": this.props.api20.case_material,
                                            "dial_color": this.props.api20.dial_color,
                                            "bracelet_material": this.props.api20.bracelet_material,
                                            "movement": this.props.api20.movement,
                                            "gender": this.props.api20.gender,
                                            "picture_url": this.props.api20.picture_url}})
        }}
      >
        VIEW WATCH
      </Button>
    )
    */

    const ButtonShowAnalytics = () => (
      <Button className="panel-btn join-btn"
        onClick={() => { this.props.onShowAnalytics(this.props.listId)}}
      >
        {!isOpen ? 'SHOW ANALYTICS' : 'HIDE ANALYTICS'}
      </Button>
    )

    return (
      <Grid.Row className={isOpen ? "panelRow active" : "panelRow"} style={{borderLeft: this.props.color_left, background: this.props.color_background}}>

          <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions remove">
            <ButtonRemove />
          </Grid.Column>

          <Grid.Column mobile={5} tablet={5} computer={5} className="col-description">
            <div style={{ height: "auto" }} className="model-wrapper">
              <span>{this.props.model}</span>
            </div>
            <div style={{height: "auto"}} className="highlighted-text">
              {this.props.brand} {this.props.reference}
            </div>
          </Grid.Column>

          <Grid.Column mobile={2} tablet={2} computer={2} className="col-date">
            {this.props.api20.case_size}
            <span className="td__label">case size</span>
          </Grid.Column>
          <Grid.Column mobile={3} tablet={3} computer={3} className="col-price">
            {formatMoney(this.props.suggestedPriceDollars)} €
          <span className="td__label">list price</span>
          </Grid.Column>
          <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions view-reference">
              {/* <ButtonViewReference /> */}
              <ButtonViewReferenceInModal/>
          </Grid.Column>

          <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions show-analytics">
              <ButtonShowAnalytics />
          </Grid.Column>


          {isOpen ? (
              <ReferenceChart data={this.props.historicalData} suggestedPrice={this.props.suggestedPriceDollars} zoom={false} />
            ) : (
              ``
            )
          }
        </Grid.Row>
    )
  }
}


const mapActionsToProps = {
  onDelWatch: DeleteWatchGraph,
  UpdateLatestReference,
  LoadReferenceInfo,
  LoadRefDetails,
}

export default connect(null, mapActionsToProps)(WatchMiniGraph)
