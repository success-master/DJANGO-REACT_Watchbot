import React from "react";
//import './App.css';
import './_styles/App.css';

import { connect } from 'react-redux'
import { SendFirebaseToken, SubscribeToTopic, LoadSettingsProfile, SetSafari, SetPanelLeftOpen, SetPanelRightOpen } from './_actions/Settings.action'
import { SetViewBidId, UpdateCurrentBid, ReloadAllActivities } from './_actions/Bids.action'
import { ReloadLatestReference, UpdateLatestReference, LoadRefFollow } from './_actions/References.action'
import { LoadLatestActivities } from './_actions/Activities.action'
import { LoadReferenceMyActivities, LoadReferenceOtherActivities } from './_actions/Activities.action'
import { LoadNotificationsMineNew , LoadNotificationsFollowNew, LoadNotificationsMineImportant } from './_actions/Notifications.action'

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
//import Dashboard from './Dashboard';
import Notifications from './Notifications';
import Settings from './Settings';
import Reference from './Reference';
import Bid from './Bid';
import ModalRoot from './_modals/_ModalRoot'
import ModalImportantNotificationsMulti from './_modals/_ModalImportantNotificationsMulti'
import WatchesSearch from  './_components/SearchHeader'
//import TimeHeader from './_components/TimeHeader'

import { Container, Grid, Button } from 'semantic-ui-react'
import logo from './_assets/logo.png';
//import notification from './_assets/icons/notification-retina.png';
//import defaultUser from './_assets/icons/default_user-retina.png';
//import iconSenttings from './_assets/icons/settings.png';
import Modal from 'react-modal';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';

import firebase from 'firebase';

let Dashboard = {}
if (process.env.REACT_APP_USER === 'retailer') {
  Dashboard = require('./Dashboard/retailer').default
} else {
  Dashboard = require('./Dashboard/customer').default
}

let basename = "/"+process.env.REACT_APP_USER
if (process.env.REACT_APP_GAME === "true") { basename +="-game" }
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

var config = {
    apiKey: "AIzaSyD_LuTv-rh6GlQ-sjraC9paG4QkacaaB0I",
    authDomain: "watchbot-afbb0.firebaseapp.com",
    databaseURL: "https://watchbot-afbb0.firebaseio.com",
    projectId: "watchbot-afbb0",
    storageBucket: "watchbot-afbb0.appspot.com",
    messagingSenderId: "108225665252"
}

/*
const lang_options = [
  { key: 1, text: 'ENG', value: 1 }
]

const DropdownLang = () => (
  <Menu compact className="navDrop-container">
    <Dropdown text='ENG' className="navDrop" options={lang_options} simple item />
  </Menu>
)
*/

class AppUser extends React.Component {
  constructor(props) {
        super(props);
        /*
        this.state = {
            isPaneOpen: false,
            isPaneOpenLeft: false
        };
        */

        this.state = {
          menuOpen: false
        }

        /*
        //in caso di refresh su pagina Reference
        if (localStorage.getItem('latestRef') !== null) {
          this.props.ReloadLatestReference({selectedOption: JSON.parse(localStorage.getItem('latestRef'))})
        } else {
          this.props.UpdateLatestReference({selectedOption: {"id":0,"ref":"-","label":"-","brand":"-","price":0} })
        }
        //in caso di refresh su pagina Bid
        if (localStorage.getItem('latestBid') !== null) {
          this.props.SetViewBidId(Number(localStorage.getItem('latestBid')))
        }
        */
  }

  tick() {
    this.props.LoadNotificationsMineNew()
    this.props.LoadNotificationsMineImportant()
    this.props.LoadNotificationsFollowNew()
  }

  componentDidMount() {

        Modal.setAppElement(this.el);
        isSafari = true //fast firebase bypass

        if ((!isSafari) && (process.env.REACT_APP_GAME !== "true")) {
          firebase.initializeApp(config)

          const messaging = firebase.messaging();
          messaging.usePublicVapidKey("BPXfMrKqkQyz5s8cxmMsklUPxzF9oDcWqD1DKJRbKdgef3WFd5aSiOG84HxefCNu6V6RFRUQSd4wWwHxpZE_VD4");

          /*
          if('serviceWorker' in navigator){
              // Register service worker
              navigator.serviceWorker.register('../firebase-messaging-sw.js').then(function(reg){
                  console.log("SW registration succeeded. Scope is "+reg.scope);
                  firebase.messaging().useServiceWorker(reg);
              }).catch(function(err){
                  console.error("SW registration failed with error "+err);
              });
          }
          */

          let that=this

          if('serviceWorker' in navigator){
              // Handler for messages coming from the service worker
              let MessaggioRicevuto = {}
              navigator.serviceWorker.addEventListener('message', function(event){
                  console.log("Client Received Message: " + JSON.stringify(event.data) );
                  if (event.data["firebase-messaging-msg-data"]) {
                    console.log("background msg")
                    MessaggioRicevuto = Object.assign({}, event.data["firebase-messaging-msg-data"].data);
                  } else {
                    console.log("foreground msg")
                    MessaggioRicevuto = Object.assign({}, event.data.data);
                  }
                  console.log("MessaggioRicevuto", MessaggioRicevuto)
                  let thatBidViewed=that.props.bidViewed
                  switch(MessaggioRicevuto.type) {
                    case 'auction_list':
                      console.log('auction_list')
                      that.props.LoadLatestActivities()

                      break
                    case 'auction_new_offer':
                    case 'new_offer':
                      //solo all'owner
                      console.log("auction_new_offer")

                      console.log(thatBidViewed)
                      console.log(MessaggioRicevuto.auction_id)

                      if (that.props.bidViewed === Number(MessaggioRicevuto.auction_id)) {
                        console.log("updating Bid")
                        that.props.UpdateCurrentBid(MessaggioRicevuto.auction_id)
                        that.props.LoadNotificationsMineNew()
                        that.props.LoadNotificationsMineImportant()
                      }

                      break
                    case 'auction_status_changed':
                    case 'update_auction_status':
                      console.log("auction_status_changed")

                      console.log(thatBidViewed)
                      console.log(MessaggioRicevuto.auction_id)

                      if (that.props.bidViewed === Number(MessaggioRicevuto.auction_id)) {

                          console.log("updating Bid auction_status_changed")
                          that.props.UpdateCurrentBid(MessaggioRicevuto.auction_id)
                          that.props.LoadNotificationsMineNew()
                          that.props.LoadNotificationsMineImportant()
                      }

                      that.props.LoadLatestActivities()

                      break
                    case 'auction_created':
                      //a tutti i follower
                      that.props.LoadNotificationsFollowNew()
                      break
                    case 'auction_offer_selected':
                      //a tutti utentei selezionati alla prima call
                      that.props.LoadNotificationsMineNew()
                      that.props.LoadNotificationsMineImportant()
                      break
                    case 'auction_winner_selected':
                      //ai vincitori
                      that.props.LoadNotificationsMineNew()
                      that.props.LoadNotificationsMineImportant()
                      break

                    default:
                      console.log("Messaggio non implementato:", MessaggioRicevuto.type)
                  }

                  /*
                  console.log("Client Received Message parsed: " + event.data["firebase-messaging-msg-data"].data.type );

                  switch (event.data["firebase-messaging-msg-data"].data.type) {
                    case 'auction_list':
                      if (event.data["firebase-messaging-msg-data"].data.refresh) {
                        console.log("REFRESH")
                      }
                    default:
                  }
                  */
              });
         }

          messaging.requestPermission().then(function() {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            // ...
            messaging.getToken().then(function(currentToken) {
                console.log("TK: ", currentToken)
                if (currentToken) {
                  that.props.SendFirebaseToken(currentToken)
                  //updateUIForPushEnabled(currentToken);
                } else {
                  // Show permission request.
                  console.log('No Instance ID token available. Request permission to generate one.');
                  // Show permission UI.
                  //updateUIForPushPermissionRequired();
                  //setTokenSentToServer(false);
                }
              }).catch(function(err) {
                console.log('An error occurred while retrieving token. ', err);
                //showToken('Error retrieving Instance ID token. ', err);
                //setTokenSentToServer(false);
              });

          }).catch(function(err) {
            console.log('Unable to get permission to notify.', err);
          });
          messaging.onTokenRefresh(token => {
              console.log(token);
          });

          /*
          messaging.onMessage(function(payload) {
              console.log("Messaggio ricevuto", payload)
              //that.messageReceived(payload)
              // ...

          });
          */


          //that.props.LoadLatestActivities()

        // end !isSafari
        } else {
          this.props.SetSafari() //settato anche se game, per aggiornamento bid
        }

        this.props.LoadSettingsProfile()
        this.props.LoadRefFollow()
        this.props.LoadNotificationsMineNew()
        this.props.LoadNotificationsFollowNew()
        this.props.LoadNotificationsMineImportant()
        this.interval = setInterval(() => this.tick(), 20000)

  }

  componentWillUnmount() {
      clearInterval(this.interval);
  }

  messageReceived = (message) => {
        console.log("Messaggio ricevuto")
        console.log(message);
  }

  handlePanel() {
    	this.setState({ visible: ! this.state.visible });
  }

  getToken(messaging) {
      messaging.getToken().then(function(currentToken) {
          console.log(currentToken);
      if (currentToken) {
        this.props.SendFirebaseToken(currentToken)
        //sendTokenToServer(currentToken);
        //updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        //updateUIForPushPermissionRequired();
        //setTokenSentToServer(false);
      }
    }).catch(function(err) {
      console.log('An error occurred while retrieving token. ', err);
      //showToken('Error retrieving Instance ID token. ', err);
      //setTokenSentToServer(false);
    });
  }

  onSetPanelLeftOpen = (bool) => {
    this.props.SetPanelLeftOpen(bool)
  }

  onSetPanelRightOpen = (bool) => {
    this.props.SetPanelRightOpen(bool)
  }

  openCloseMobileMenu(){
    /*this.setState((state) => ({
      mobileMenuOpen: !state.mobileMenuOpen
    }));*/

    this.setState({ menuOpen: !this.state.menuOpen });
    console.log(this.state.menuOpen, " state menu")
  }

  render() {
    let notifMineCounter = typeof this.props.notifProps.notificationsMineNew !== 'undefined' ?  this.props.notifProps.notificationsMineNew.count : 0
    let notifFollowCounter = typeof this.props.notifProps.notificationsFollowNew !== 'undefined' ?  this.props.notifProps.notificationsFollowNew.count : 0
    let notifTotalCounter = notifMineCounter + notifFollowCounter

    if (this.props.reloadAllActivities === true ) {
      this.props.LoadLatestActivities()
    }

    let menuClass = '';
    if(this.state.menuOpen){
      menuClass = 'js-menu-opened'
    }

    return(

        <Router basename={basename}>
        <div className={`page-wrapper ` + menuClass }>

            <Container className="navBar">
              <Grid columns={16}>
                <Grid.Row>
                  <Grid.Column width={1} className="col-burger-button">
                    <div className="burger-button" onClick={this.openCloseMobileMenu.bind(this)}>
                      <span></span><span></span><span></span>
                    </div>
                  </Grid.Column>
                  <Grid.Column width={3} className="col-logo">
                    <Link to={`/`}><img src={logo} alt="logo" className="logo" /></Link>
                    { /*
                      <Icon name='bars' />
                    */ }

                  </Grid.Column>
                  <Grid.Column width={7} className="col-search">
                    <WatchesSearch empty={this.props.watchProps.watchesDetailsInDashboard.length > 0 ? false : true}/>
                  </Grid.Column>
                  {/* <Grid.Column width={4} className="col-time">
                    <TimeHeader />
                  </Grid.Column> */}
                  <Grid.Column width={4} className="navR">
                    <div className="userNot">
                      <Button style={{ padding: "0", background: "transparent" }} className={notifTotalCounter > 0 ? "navNot navNotBadge" : "navNot navNotWithoutBadge" } data-badge={notifTotalCounter} onClick={ () => this.onSetPanelLeftOpen(true) }>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          width="34" height="38" viewBox="0 0 17 19"
                          className="navNot">
                        <defs><path id="jjjga" d="M918.342 40.2a1.8 1.8 0 1 0 3.601 0zm8.026-3.791v-5.266a6.219 6.219 0 0 0-4.787-6.053v-.651c0-.797-.642-1.439-1.438-1.439-.796 0-1.439.642-1.439 1.439v.651a6.219 6.219 0 0 0-4.786 6.053v5.266L912 38.327v.959h16.286v-.96z" /></defs><g><g clipPath="url(#clip-D7D1FE82-2E60-4983-8A33-51A9776FD485)" transform="translate(-912 -23)"><use fill="#ebf4f6" xlinkHref="#jjjga"/></g></g>
                        </svg>
                      </Button>
                    </div>
                    { /*
                    <span className="userHeader">
                      <span className="userName"> { this.props.userProps.userSettingsProfile.first_name !== 'undefined' && this.props.userProps.userSettingsProfile.first_name }</span>
                    </span>
                    */ }
                    <div className="userSettings" onClick={() => this.onSetPanelRightOpen(true)} >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        width="34" height="34" viewBox="0 0 17 17"
                        className="navSettings">
                      <defs><path id="2ihfa" d="M951.465 30.256a3.613 3.613 0 0 0 3.616-3.628A3.612 3.612 0 0 0 951.465 23a3.622 3.622 0 0 0-3.628 3.628 3.623 3.623 0 0 0 3.628 3.628m0 2.418c-2.817 0-8.465 1.415-8.465 4.232v3.024h16.93v-3.024c0-2.817-5.648-4.232-8.465-4.232" /></defs><g><g clipPath="url(#clip-35900242-2C56-4C21-95F2-9FF440C75812)" transform="translate(-943 -23)"><use fill="#ebf4f6" xlinkHref="#2ihfa"/></g></g>
                      </svg>
                    </div>

                    <div className="icn-chat-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        width="40" height="40" viewBox="0 0 20 20">
                        <defs><path id="c06la" d="M992 27h-2v9h-13v2c0 .55.45 1 1 1h11l4 4V28c0-.55-.45-1-1-1m-4 6v-9c0-.55-.45-1-1-1h-13c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1" /></defs><g><g transform="translate(-973 -23)"><use fill="#ebf4f6" xlinkHref="#c06la"/></g></g>
                      </svg>
                    </div>
                    <ModalImportantNotificationsMulti open={this.props.notifProps.showNotificationsEssential}/>
                  </Grid.Column>

                </Grid.Row>
              </Grid>
            </Container>

            <Container className="mainContent">
              <div ref={ref => this.el = ref}>
                    <SlidingPane
                        className='slidingPane my-account'
                        overlayClassName='slidingPane-overlay'
                        isOpen={ this.props.userProps.isPaneOpenRight }
                        title='My Account'
                        width='800px'
                        closeIcon={<div className="close-modal-btn"></div>}
                        onRequestClose={ () => {
                            // triggered on "<" on left top click or on outside click
                            this.onSetPanelRightOpen(false)
                        } }>
                        <Settings />
                    </SlidingPane>
                    <SlidingPane
                        className='slidingPane notifications'
                        isOpen={ this.props.userProps.isPaneOpenLeft }
                        title='Notifications'
                        //from='left'
                        width='740px'
                        closeIcon={<div className="close-modal-btn"></div>}
                        onRequestClose={ () => this.onSetPanelLeftOpen(false) }>
                        <Notifications />
                    </SlidingPane>
              </div>
              {/* <Route exact path={ `/` } component={Dashboard} /> */}
              <Route
                exact path={ `/` }
                render={(props) => <Dashboard {...props} openCloseMobileMenu={this.openCloseMobileMenu.bind(this)} />}
              />
              <Route path={ `/reference-info` } component={Reference} />
              <Route path={ `/bid` } component={Bid} />
              <ModalRoot modalProps={this.props.modalProps}/>
            </Container>
          </div>

        </Router>

    )
  }
}

const mapStateToProps = store => ({
  userProps: store.userInfo,
  watchProps: store.watchList,
  modalProps: store.modalInfo,
  bidViewed: store.bidInfo.viewBidId,
  notifProps: store.notificationsInfo,
  reloadAllActivities: store.activitiesList.reloadAllActivities
})

const mapActionsToProps = {
  SendFirebaseToken, SubscribeToTopic,
  SetSafari, SetPanelLeftOpen, SetPanelRightOpen,
  LoadRefFollow, LoadSettingsProfile,
  SetViewBidId, UpdateCurrentBid, ReloadLatestReference, UpdateLatestReference,
  LoadLatestActivities,
  LoadReferenceMyActivities, LoadReferenceOtherActivities,
  LoadNotificationsMineNew , LoadNotificationsFollowNew, LoadNotificationsMineImportant,
  ReloadAllActivities,
}

export default connect(mapStateToProps, mapActionsToProps)(AppUser)

//{ this.props.userProps.userSettingsProfile.first_name !== 'undefined' && this.props.userProps.userSettingsProfile.first_name  }

//module.hot.accept();

//<Link to= { `${prepend}/dashboard` }>Dashboard</Link>

//{this.props.userProps.userDetails.first_name} {this.props.userProps.userDetails.token}
