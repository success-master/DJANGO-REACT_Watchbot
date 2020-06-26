import React from "react";
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"

import { SetViewBidId, ModalJoinBid, ShowModalMatchedTrade } from '../_actions/Bids.action'
import { HideAllImportantNotifications, SetNotificationReadById } from '../_actions/Notifications.action'
import { LoadRefDetails} from '../_actions/References.action'
import { formatMoney} from '../_utilities/price';


import { Button } from 'semantic-ui-react'

class ModalImportantNotificationsMulti extends React.Component {

  onSetAllImportantNotificationsRead = () => {
    let NotificationReadArray = this.props.notifProps.notificationsEssential.map(function(notif, index) {
      return (notif.id)
      }
    )
    this.props.SetNotificationReadById(NotificationReadArray)
  }

  render() {
    if (this.props.notifProps.notificationsEssential.length === 0 || !this.props.open) { return null }

    let thatSetViewBidId = this.props.SetViewBidId
    let thatModalJoinBid = this.props.ModalJoinBid
    let thatSetNotificationReadById = this.props.SetNotificationReadById

    const ButtonGoBid = withRouter(({ history, ...props }) => (
      <Button className="dark__btn"
        onClick={() => {
          //console.log(props.notif.auction.id)
          thatSetViewBidId(props.notif.auction.id)
          thatSetNotificationReadById([props.notif.id])
          history.push('/bid')
        }}
      >
        View
      </Button>
    ))

    const ButtonMakeSecondOffer = (props) => (
      <Button className="dark__btn"
        onClick={() => {
          this.props.LoadRefDetails(props.notif.reference);
          thatModalJoinBid( true, props.notif.auction.id, props.notif.reference, props.notif.reference_string, props.notif.auction.price, props.notif.id, props.notif.auction.raise_price)
        }}
      >
        Relaunch
      </Button>
    )

    const ButtonPay = (props) => (
      <Button className="dark__btn" onClick={() => {
        this.props.LoadRefDetails(props.notif.reference);
        this.props.ShowModalMatchedTrade(props.notif.auction.id)
        thatSetNotificationReadById([props.notif.id])
      }}>
        Pay
      </Button>
    ) 

    const ButtonReadThisNotif = (props) => (
      <div className="close-modal-btn__container">
        <Button className="close-modal-btn " onClick={() => {thatSetNotificationReadById([props.notifId])}}>
        </Button>
      </div>
    )

    const NotificationItem = (props) => {
      return (
        <div className='modal-notification__wrapper' key={props.index}>
          <ButtonReadThisNotif notifId={props.notif.id} />

          <div className='modal-notification__head'>
            Trade {props.notif.auction.id}
          </div>

          {/* solo per dev */}
          <div style={{display: 'none'}}>{props.notif.get_type}: {props.notif.auction.status}</div> 

          <div className='modal-notification__content'>
            <div className="content-wrapper">
                {props.primaryMsg !== null &&
                  (<div className="primary-message">{props.primaryMsg}</div>)
                }

                <div className="reference-name"><span>Your watch:</span>{props.notif.reference_string}</div>

                {props.button !== null &&
                  (<div className="content-action">
                    {props.button}
                  </div>)
                }
            </div>
          </div>
        </div>
      )
    }


    const NotificationItems = this.props.notifProps.notificationsEssential.map(function(notif, index) {
      if(notif.get_type === 'winner_selected' && notif.auction.status === 'winner_selected' && process.env.REACT_APP_USER === 'customer'){
        return <NotificationItem 
                key={index}
                index={index} 
                notif={notif} 
                primaryMsg={null} 
                button={<ButtonPay notif={notif} />} />
      }

      if(notif.get_type === 'first_call_user_selected' && (notif.auction.status === 'second_call' || notif.auction.status === 'second_call_open')){
        return <NotificationItem 
                key={index}
                index={index} 
                notif={notif} 
                primaryMsg={process.env.REACT_APP_USER === 'customer' ? `New suggested price from trade: €${formatMoney(notif.auction.raise_price)}` : null} 
                button={<ButtonMakeSecondOffer notif={notif}/>} />
      }

      if(notif.get_type === 'status_changed' && notif.auction.status === 'first_call_selection'){
        return <NotificationItem 
                key={index}
                index={index} 
                notif={notif} 
                primaryMsg={'Select users for 2nd call or winner'} 
                button={<ButtonGoBid notif={notif}/>} />
      }

      if(notif.get_type === 'status_changed' && notif.auction.status === 'second_call_selection'){
        return <NotificationItem 
                key={index}
                index={index} 
                notif={notif} 
                primaryMsg={'Select winner'} 
                button={<ButtonGoBid notif={notif}/>} />
      }

      return null;
    })


    //OLD VERSION
    const NotifItems = this.props.notifProps.notificationsEssential.map(function(notif, index) {
      return (
        <div className='modal-notification__wrapper' key={index}>
          <ButtonReadThisNotif notifId={notif.id} />

          <div className='modal-notification__head'>
            Trade {notif.auction.id}
          </div>
          { /*
          <Icon.Group>
            <Icon loading color='grey' name='asterisk' />
          </Icon.Group>

          <span style={{color: "#ff0000"}}><b>{notif.get_type}</b></span> Auction #{notif.auction.id}<br />
          */ }
          <div className='modal-notification__content'>
            <b>{notif.get_type}</b>: {notif.auction.status}<br /> 
           
              {notif.get_type === 'winner_selected' && notif.auction.status === 'winner_selected' && process.env.REACT_APP_USER === 'customer' &&
                (
                  <div className="content-wrapper">
                    <div className="reference-name">{notif.reference_string}</div>
                    <div className="content-action">
                      <ButtonPay />
                    </div>
                  </div>
                )
              }

              {notif.get_type === 'first_call_user_selected' && (notif.auction.status === 'second_call' || notif.auction.status === 'second_call_open') &&
                (
                  <div className="content-wrapper">
                    {process.env.REACT_APP_USER === 'customer' &&
                      ( <div className="primary-message">
                          New suggested price from trade op: {notif.auction.raise_price}<br />
                        </div>
                      )
                    }
                    <div className="reference-name">{notif.reference_string}</div>
                    <div className="content-action">
                      <ButtonMakeSecondOffer notif={notif}/>
                    </div>
                  </div>
                )
              }

              {notif.get_type === 'status_changed' && notif.auction.status === 'first_call_selection' &&
                (
                  <div className="content-wrapper">
                    <div className="primary-message">Select users for 2nd call or winner</div>
                    <div className="reference-name">{notif.reference_string}</div>
                    <div className="content-action">
                      <ButtonGoBid notif={notif}/>
                    </div>
                  </div>
                )
              }

              {notif.get_type === 'status_changed' && notif.auction.status === 'second_call_selection' &&
                (
                  <div className="content-wrapper">
                    <div className="primary-message">Select winner</div>
                    <div className="reference-name">{notif.reference_string}</div>
                    <div className="content-action">
                      <ButtonGoBid notif={notif}/>
                    </div>
                  </div>
                )
              }
              { /*
              <ButtonReadThisNotif notifId={notif.id} />
              */ }
          </div>
        </div>
       )
    })


    if(NotificationItems[0] !== null){
      return (
        <div className='modal-notification-container'>
        {NotificationItems}
        {/* <div className='modal-notification__actions'>
          <Button className="dark__btn" onClick={this.onSetAllImportantNotificationsRead}>Ok, I read all</Button>
        </div> */}
        </div>
      )

    } else {
      return null;
    }
  }
}

const mapStateToProps = store => ({
  notifProps: store.notificationsInfo
})

const mapActionsToProps = {
  HideAllImportantNotifications, 
  SetNotificationReadById,
  SetViewBidId, 
  ModalJoinBid, 
  LoadRefDetails,
  ShowModalMatchedTrade,
}

export default connect(mapStateToProps, mapActionsToProps)(ModalImportantNotificationsMulti)
