import React from 'react';

import { connect } from 'react-redux'
import ActivityLine from  './ActivityLine';

import { Grid, Button } from 'semantic-ui-react'
//import { unixTime } from '../_utilities/time'

class NotificationLine extends React.Component {


  render() {

    const ButtonStatus = () => (
      <Button className="panel-btn join-btn"
        onClick={() => { this.props.statusClickFun(this.props.index)}}
      >
        Status
      </Button>
    )

    //let color='white'
    //let color_descr='white'
    //let color_background='#737373'

    //var date = unixTime(this.props.notif.creation_date)

      return (
        <div>
          <Grid columns={16} >
            <Grid.Row className="panelRow">

              {/* <Grid.Column mobile={2} tablet={2} computer={2}>
                date.toString()  {this.props.tipo}
              </Grid.Column> */}
              <Grid.Column mobile={4} tablet={2} computer={2} className="col-id">
                {/* {this.props.notif.get_type} [Bid <b>{this.props.notif.auction.id}</b>] */}
                Bid {this.props.notif.auction.id}
              </Grid.Column>
              <Grid.Column mobile={12} tablet={14} computer={14}>
                {this.props.notif.reference_string}
              </Grid.Column>
              {/* <Grid.Column mobile={2} tablet={2} computer={2}>
                <ButtonStatus />
              </Grid.Column> */}
            </Grid.Row>
          </Grid>
          {this.props.openStatus && typeof this.props.mineBidProps.id !=='undefined' && this.props.tipo ==='mine' &&
              (<Grid columns={16} >
                <ActivityLine act = {this.props.mineBidProps} typing={false}/>
               </Grid>
              )
          }
          {this.props.openStatus && typeof this.props.followBidProps.id !=='undefined' && this.props.tipo ==='follow' &&
              (<Grid columns={16} >
                <ActivityLine act = {this.props.followBidProps} typing={false}/>
               </Grid>
              )
          }
        </div>


      )

  }
}

const mapStateToProps = store => ({
  mineBidProps: store.bidInfo.currentBidDetailsNotificationMine,
  followBidProps: store.bidInfo.currentBidDetailsNotificationFollow
})

const mapActionsToProps = {

}

export default connect(mapStateToProps, mapActionsToProps)(NotificationLine)
/*
<Grid.Row className="panelRow" style={{borderLeft: "16px solid #000000", background: color_background}}>

  <Grid.Column mobile={16} tablet={16} computer={16} style={{paddingLeft: "8px", fontSize: "9px", paddingRight: "0px", color: color }}>
    {typeof this.props.mineBidProps.id !=='undefined' ?
      (<Container>
        <ActivityLine act = {this.props.mineBidProps} typing={false}/>
       </Container>
      )
        :
      (<span></span>)
    }
  </Grid.Column>

</Grid.Row>
*/
//<ActivityLine act = {this.props.mineBidProps.currentBidDetailsNotificationMine} typing={false}/>
