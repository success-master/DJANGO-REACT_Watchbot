import axios from "axios"

import { GameDashboardUpdate,
         GameFirstCallSelection2SecondCall //,GameReferencePageUpdate
       } from './Game.action'

export const SET_VIEW_BID_ID = 'SET_VIEW_BID_ID'
export const LOAD_CURRENT_BID = 'LOAD_CURRENT_BID'
export const LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_MINE = 'LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_MINE'
export const LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_FOLLOW = 'LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_FOLLOW'
export const RESET_GRAPH_DATA_FIRST_CALL ='RESET_GRAPH_DATA_FIRST_CALL'
export const CALCULATE_GRAPH_DATA_FIRST_CALL ='CALCULATE_GRAPH_DATA_FIRST_CALL'
export const RESET_GRAPH_DATA_SECOND_CALL ='RESET_GRAPH_DATA_SECOND_CALL'
export const CALCULATE_GRAPH_DATA_SECOND_CALL ='CALCULATE_GRAPH_DATA_SECOND_CALL'
export const RESET_CHOSEN_BIDDERS = 'RESET_CHOSEN_BIDDERS'
export const RESET_CHOSEN_OFFERS = 'RESET_CHOSEN_OFFERS'
export const ADD_CHOSEN_BIDDER = 'ADD_CHOSEN_BIDDER'
export const ADD_CHOSEN_OFFER = 'ADD_CHOSEN_OFFER'
export const REMOVE_CHOSEN_BIDDER = 'REMOVE_CHOSEN_BIDDER'
export const REMOVE_CHOSEN_OFFER = 'REMOVE_CHOSEN_OFFER'
export const SENT_FIRST_CALL_SELECTION_OK ='SENT_FIRST_CALL_SELECTION_OK'
export const SENT_RAISE_PRICE_OK ='SENT_RAISE_PRICE_OK'
export const SELECT_WINNER = 'SELECT_WINNER'
export const SENT_WINNER_SELECTION_OK ='SENT_WINNER_SELECTION_OK'
export const CREATE_PUT_BID = 'PUT_BID'
export const RELOAD_REFERENCE_BIDS = 'RELOAD_REFERENCE_BIDS'
export const RELOAD_ALL_ACTIVITIES = 'RELOAD_ALL_ACTIVITIES'
export const RELOAD_SCHEDULED_CALL = 'RELOAD_SCHEDULED_CALL'
export const RELOAD_SCHEDULED_PUT = 'RELOAD_SCHEDULED_PUT'
export const RELOAD_BID_NOTIFICATIONS = 'RELOAD_BID_NOTIFICATIONS'
export const MODAL_JOIN_BID = 'MODAL_JOIN_BID'
export const MODAL_CANCEL_BID = 'MODAL_CANCEL_BID'
export const LOAD_BID_W_REST_API_OK = 'LOAD_BID_OK'
export const LOAD_BID_W_REST_API_ERROR = 'LOAD_BID_ERROR'
export const TO_PAY = 'TO_PAY'
export const GET_PAYMENT_AMOUNTS = 'GET_PAYMENT_AMOUNTS'


export const LOAD_MY_MATCHED_TRADES_OK = 'LOAD_MATCHED_TRADES_OK'

function updateGraphDataOnLoad(responseObj) {
  return function(dispatch) {
    switch (responseObj.status) {
      case 'first_call_open':
        dispatch({type: RESET_GRAPH_DATA_FIRST_CALL})
        dispatch({type: CALCULATE_GRAPH_DATA_FIRST_CALL, payload: responseObj})
        break
      case 'first_call':
        dispatch({type: RESET_GRAPH_DATA_FIRST_CALL})
        dispatch({type: CALCULATE_GRAPH_DATA_FIRST_CALL, payload: responseObj})
        break
      case 'first_call_selection':

        if (responseObj.first_call_selection_completed === false) {
          dispatch({type: RESET_GRAPH_DATA_FIRST_CALL})
          dispatch({type: CALCULATE_GRAPH_DATA_FIRST_CALL, payload: responseObj})

        } else {
          dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going.length})
        }
        break
      case 'second_call_open':
        dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going.length})
        break
      case 'second_call':
        dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going.length})
        dispatch({type: CALCULATE_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going})
        break
      case 'second_call_selection':
        dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going.length})
        dispatch({type: CALCULATE_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going})
        break
      default:
        break
      }
  }
}

export function SetViewBidId(bid) {
/*
return {
    type: SET_VIEW_BID_ID,
    payload: bid
  }
*/
if (process.env.REACT_APP_GAME === "true")  {
  return function(dispatch, getState) {
    dispatch({type: SET_VIEW_BID_ID, payload: bid})
    localStorage.setItem('latestBidGame', bid )
    if (bid === 500) {
      // fake trade default
      let fakeTradeUpdated = Object.assign({},getState().gameInfo.myTradeInProgress)
      dispatch({type: LOAD_CURRENT_BID, payload: fakeTradeUpdated})
      dispatch(updateGraphDataOnLoad(fakeTradeUpdated))
    } else {
      // fake new created trade
      let fakeNewTradeUpdated = Object.assign({},getState().gameInfo.myCreatedTrade)
      dispatch({type: LOAD_CURRENT_BID, payload: fakeNewTradeUpdated})
      dispatch(updateGraphDataOnLoad(fakeNewTradeUpdated))
    }

  }
}

return function(dispatch) {
  dispatch({type: SET_VIEW_BID_ID, payload: bid})
  localStorage.setItem('latestBid', bid )
  axios.get(process.env.REACT_APP_API_HOST+"auction/"+bid.toString()+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
    .then((response) => {
      dispatch({type: LOAD_CURRENT_BID, payload: response.data})
      dispatch(updateGraphDataOnLoad(response.data))

    })
    .catch((err) => {
      dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
    })
 }
}

export function updateGraphDataOnUpdate(responseObj) {
  return function(dispatch) {
    if (responseObj.status.indexOf('first_call') !== -1) {
      dispatch({type: CALCULATE_GRAPH_DATA_FIRST_CALL, payload: responseObj})
    } else {
      if (responseObj.status === 'second_call') {
        dispatch({type: CALCULATE_GRAPH_DATA_SECOND_CALL, payload: responseObj.second_call_on_going})
      }
    }
  }
}

export function UpdateCurrentBid(id) {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {
        //let fakeTradeUpdated = Object.assign({},getState().gameInfo.myTradeInProgress)
        //dispatch({type: LOAD_CURRENT_BID, payload: fakeTradeUpdated})
        //dispatch(updateGraphDataOnUpdate(fakeTradeUpdated))
      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/"+id.toString()+"/", { headers: { 'Authorization': tok} })

        .then((response) => {
          dispatch({type: LOAD_CURRENT_BID, payload: response.data})
          dispatch(updateGraphDataOnUpdate(response.data))
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCurrentBid(id) {
    return function(dispatch) {
      axios.get(process.env.REACT_APP_API_HOST+"auction/"+id.toString()+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
        .then((response) => {
          dispatch({type: LOAD_CURRENT_BID, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCurrentBidDetailForNotification(id, tipo) {
    return function(dispatch) {
      axios.get(process.env.REACT_APP_API_HOST+"auction/"+id.toString()+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
        .then((response) => {
          switch (tipo) {
            case 'follow':
              dispatch({type: LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_FOLLOW, payload: response.data})
              break
            default:
              dispatch({type: LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_MINE, payload: response.data})
          }
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function ResetGraphDataSecondCall(num) {
  return function(dispatch) {
    dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: num})
  }
}

export function ResetChosenBidders() {
  return function(dispatch) {
    dispatch({type: RESET_CHOSEN_BIDDERS, payload: []})
    dispatch({type: RESET_CHOSEN_OFFERS, payload: []})
  }
}

export function AddChosenBidder(bidderIndex, offerId) {
  return function(dispatch) {
    dispatch({type: ADD_CHOSEN_BIDDER, payload: bidderIndex})
    dispatch({type: ADD_CHOSEN_OFFER, payload: offerId})
  }
}

export function RemoveChosenBidder(bidderIndex, offerId) {
  return function(dispatch) {
    dispatch({type: REMOVE_CHOSEN_BIDDER, payload: bidderIndex})
    dispatch({type: REMOVE_CHOSEN_OFFER, payload: offerId})
  }
}


export function SendFirstCallSelection(auctionId, offersArray, raise_price, biddersArray) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      dispatch(GameFirstCallSelection2SecondCall(auctionId, offersArray, raise_price, biddersArray))
    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    let headers = {
                'Authorization': tok,
                'Content-Type': 'application/json'
            }
    let data = {
      "auction": auctionId,
      "offers": offersArray,
      "raise_price": raise_price
    }
    axios.put(process.env.REACT_APP_API_HOST+"auction/selection/", data, { headers: headers })
      .then((response) => {
        dispatch({type: SENT_FIRST_CALL_SELECTION_OK, payload: response.data})
        axios.get(process.env.REACT_APP_API_HOST+"auction/"+auctionId.toString()+"/", { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_CURRENT_BID, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: 'Auction/Selection: '+err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}


export function SendRaisePrice(auctionId, raise_price) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      let MyTradeViewed
      if (auctionId === 500) { MyTradeViewed=Object.assign({}, getState().gameInfo.myTradeInProgress) }
        else { MyTradeViewed=Object.assign({}, getState().gameInfo.myCreatedTrade) }
      if (raise_price>0 && raise_price!=null) {
        MyTradeViewed.raise_price = raise_price
      }
      MyTradeViewed.raised_by_owner = true
      MyTradeViewed.time_remain = 0
      if (auctionId === 500) { dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: MyTradeViewed }) }
        else { dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: MyTradeViewed }) }

    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    let headers = {
                'Authorization': tok,
                'Content-Type': 'application/json'
            }
    let data = {
      "auction": auctionId,
      "price": raise_price
    }
    axios.put(process.env.REACT_APP_API_HOST+"auction/set-raise-price", data, { headers: headers })
      .then((response) => {
        dispatch({type: SENT_RAISE_PRICE_OK, payload: response.data})
        axios.get(process.env.REACT_APP_API_HOST+"auction/"+auctionId.toString()+"/", { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_CURRENT_BID, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: 'Auction/Selection: '+err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}



export function SelectWinner(bidderIndex, offer_id) {
return {
    type: SELECT_WINNER,
    payload: { bidderIndex: bidderIndex, second_call_offer_id: offer_id }
  }
}

export function SendWinnerSelection(auctionId, chosenWinningOffer) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      if (getState().bidInfo.currentBidDetails.id === 500) {
        //sto visualizzando trade di default già presente
        let myTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
        myTradeInProgress.status = "winner_selected"
        dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: myTradeInProgress })
        dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeInProgress})
        dispatch({type: SENT_WINNER_SELECTION_OK, payload: true})
      } else {
        //sto visualizzando nuova trade creata
        let myTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)
        myTradeCreated.status = "winner_selected"
        dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: myTradeCreated })
        dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeCreated})
        dispatch({type: SENT_WINNER_SELECTION_OK, payload: true})
      }
      dispatch(GameDashboardUpdate(process.env.REACT_APP_USER))
    }
  }

  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    let data = {
      "auction": auctionId,
      "offer": chosenWinningOffer
    }
    console.log(data)
    axios.put(process.env.REACT_APP_API_HOST+"auction/winner/", data, { headers: headers })
      .then((response) => {
        dispatch({type: SENT_WINNER_SELECTION_OK, payload: true})
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: 'Auction/Selection: '+err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}

export function ModalJoinBid(show, bid, ref, model, price, notifId, raise_price, firstOfferInCaseOfRelaunch) {
return {
    type: MODAL_JOIN_BID,
    payload: { show: show,
               bid: bid,
               ref: ref,
               model: model,
               price: price,
               fromNotification: notifId,
               raise_price: raise_price,
               first_offer_in_case_of_relaunch: firstOfferInCaseOfRelaunch}
  }
}

export function SendJoinBid(auction,price,frompage,frompanel, creditCardData) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      dispatch({type: "GAME_JOIN_TRADE", payload: { auction: auction, price: price }})
      let fakeCallTrade = Object.assign({}, getState().gameInfo.fakeOthersTrade)
      if (fakeCallTrade.status !== "second_call") {
        fakeCallTrade.joined_by_this_user = true
        fakeCallTrade.offer.bid_price_1 = price
        //fakeCallTrade.raise_price = "800.00"
      } else { /* è un relaunch */
        fakeCallTrade.second_call_joined_by_this_user = true
        fakeCallTrade.offer.bid_price_2 = price
      }
      fakeCallTrade.time_remain = 0

      dispatch({type: "GAME_STORE_FAKE_OTHERS_TRADE", payload: fakeCallTrade })
      dispatch(GameDashboardUpdate(process.env.REACT_APP_USER))
    }
  }

  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    let data = {
      "auction": auction,
      "price": parseFloat(price)
    }

    let newData = {};
    (typeof creditCardData === 'object' && creditCardData !== null) ?
      newData = {...data, ...creditCardData} :
      newData = data;

    axios.put(process.env.REACT_APP_API_HOST+"auction/offer/", newData, { headers: headers })
      .then((response) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'JOIN_BID_SUCCESS', modalProps: { auction: auction, price: price, server_status: response.status, server_data: JSON.stringify(response.data) } })
        console.log(frompage,frompanel)
        switch (frompage) {
          case 'reference':
            dispatch({type: RELOAD_REFERENCE_BIDS, payload: true })
            break
          case 'dashboard':
            dispatch({type: RELOAD_ALL_ACTIVITIES, payload: true })
            if (process.env.REACT_APP_USER ==='customer') { dispatch({type: RELOAD_SCHEDULED_PUT, payload: true }) }
            if (process.env.REACT_APP_USER ==='retailer') { dispatch({type: RELOAD_SCHEDULED_CALL, payload: true }) }
            break
          default:
        }
        if (frompanel === 'notifications') {dispatch({type: RELOAD_BID_NOTIFICATIONS, payload: true })}

      })
      .catch((err) => {
        //alert(err.response.header)
        if (("payment_state" in err.response.data) && (err.response.data.payment_state === '3ds_check')) {
          dispatch({type: 'SHOW_MODAL', modalType: '3DS_CHECK', modalProps: { referenceId: auction, server_status: err.response.status, server_data: JSON.stringify(err.response.data) } })
        } else {
          dispatch({type: 'SHOW_MODAL', modalType: 'JOIN_BID_ERROR', modalProps: { auction: auction, price: price, server_status: err.response.status, server_data: JSON.stringify(err.response.data) } })
        }
      })

  }

}

export function SendCreateBid(referenceOptions, datetime, main_image, priceAsked, creditCardData) {

  let datetimeZ=datetime.toISOString()

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {

      let myTradeCreated = require("../_game/createFakeMyTrade.js")('new', referenceOptions, priceAsked, "put")
      dispatch({type: "GAME_CAN_CREATE_TRADE" , payload: false })
      dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: myTradeCreated })

      dispatch(GameDashboardUpdate(process.env.REACT_APP_USER))
      //dispatch(GameReferencePageUpdate(referenceOptions.id))

      let fakeFirstCallDemo = require("../_game/createFakeFirstCallDemo.js")(myTradeCreated.time_remain+30, myTradeCreated.price)

      dispatch({type: "GAME_STORE_MY_TRADE_CREATED_FIRST_CALL_DEMO" , payload: fakeFirstCallDemo })
      fakeFirstCallDemo.randomProgressionTimeSec.forEach(function(timing, index) {
        setTimeout(function(){
          dispatch({type: "GAME_UPDATE_MY_TRADE_CREATED_FIRST_CALL_OFFERS", payload: fakeFirstCallDemo.fakeFirstCallOffers[index]})
          let myCreatedTradeInProgress = Object.assign({}, getState().gameInfo.myCreatedTrade)
          if (getState().userInfo.currentPage === 'bid' && getState().bidInfo.currentBidDetails.id === 501) {
            dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myCreatedTradeInProgress})
            dispatch(updateGraphDataOnUpdate(myCreatedTradeInProgress))
          }
        }, timing*1000);
      })

      //dispatch({type: 'SHOW_MODAL', modalType: 'CREATE_BID_SUCCESS', modalProps: { referenceId: referenceOptions.id, datetimeZ: datetimeZ, server_status: "test server status", server_data: "test server data ok" } })
    }
  }

  return function(dispatch) {
    /* let data = {
      "reference": id,
      "call_1_start_date": datetimeZ,
      "main_image": main_image
    } */
    // let bodyFormData = new FormData()
    // bodyFormData.set('reference', referenceOptions.id)
    // bodyFormData.set('call_1_start_date', datetimeZ)
    // bodyFormData.set('price', priceAsked.toString())
    // if (main_image != null) { bodyFormData.append('main_image', main_image) }

    let headers = {
      'Authorization': 'Token '+localStorage.getItem('wbtk'),
      'Content-Type': 'application/json'
    }
    let data = {
    "reference": referenceOptions.id,
    "call_1_start_date": datetimeZ,
    "price": parseFloat(priceAsked)
    }
    //console.log(referenceOptions.id, datetimeZ, main_image)

    let newData = {};
    (typeof creditCardData === 'object' && creditCardData !== null) ?
      newData = {...data, ...creditCardData} :
      newData = data;

    axios.put(process.env.REACT_APP_API_HOST+"auction/", newData, { headers: headers })
      .then((response) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'CREATE_BID_SUCCESS', modalProps: { referenceId: referenceOptions.id, datetimeZ: datetimeZ, server_status: response.status, server_data: JSON.stringify(response.data) } })
        dispatch({type: RELOAD_REFERENCE_BIDS, payload: true })

        if (process.env.REACT_APP_USER === 'retailer') {
          axios.get(process.env.REACT_APP_API_HOST+"programming/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
            .then((response_sched) => {
              dispatch({type: 'LOAD_SCHEDULED_PUT_OK', payload: response_sched.data})
            })
            .catch((err) => {
              dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response_sched.status, server_data: JSON.stringify(err.response_sched.data)} })
            })
        }

      })
      .catch((err) => {
        //alert(err.response.header)
        if (("payment_state" in err.response.data) && (err.response.data.payment_state === '3ds_check')) {
          dispatch({type: 'SHOW_MODAL', modalType: '3DS_CHECK', modalProps: { referenceId: referenceOptions.id, datetimeZ: datetimeZ, server_status: err.response.status, server_data: JSON.stringify(err.response.data) } })
        } else {
          dispatch({type: 'SHOW_MODAL', modalType: 'CREATE_BID_ERROR', modalProps: { referenceId: referenceOptions.id, datetimeZ: datetimeZ, server_status: err.response.status, server_data: JSON.stringify(err.response.data) } })
        }

        })

  }
}

export function SendDelayBid(bidId) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      if (getState().bidInfo.currentBidDetails.id === 500) {
        //sto visualizzando trade di default già presente
        let myTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
        myTradeInProgress.time_remain += 300
        myTradeInProgress.delay_available = 0
        dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: myTradeInProgress })
        dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeInProgress})
        dispatch(updateGraphDataOnUpdate(myTradeInProgress))
      } else {
        //sto visualizzando nuova trade creata
        let myTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)
        myTradeCreated.time_remain += 300
        myTradeCreated.delay_available = 0
        dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: myTradeCreated })
        dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeCreated})
        dispatch(updateGraphDataOnUpdate(myTradeCreated))
      }
    }
  }

  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    let data = {
    }
    axios.post(process.env.REACT_APP_API_HOST+"auction/set-delay/"+bidId.toString()+"/", data, { headers: headers })
      .then((response) => {
        axios.get(process.env.REACT_APP_API_HOST+"auction/"+bidId.toString()+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })

          .then((response) => {
            dispatch({type: LOAD_CURRENT_BID, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      })
      .catch((err) => {
        //alert(err.response.header)
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })

  }
}

export function ModalCancelBid(show, bid, ref, model, call_1_start_date) {
  return function(dispatch){
    dispatch({type: 'SHOW_MODAL', modalType: 'CANCEL_BID', modalProps: {bid: bid, ref: ref, model: model, call_1_start_date: call_1_start_date} })
    }
}

export function SendDeleteBid(bidId) {
  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk')
            }

    axios.delete(process.env.REACT_APP_API_HOST+"/auction/delete/"+bidId.toString()+"/", { headers: headers })
      .then((response) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'DELETE_BID_SUCCESS', modalProps: { bidId: bidId} })

        if (localStorage.getItem('latestBid') === bidId) {
          localStorage.removeItem('latestBid')
        }

        dispatch({type: RELOAD_ALL_ACTIVITIES, payload: true })

        if (process.env.REACT_APP_USER === 'retailer') {
          axios.get(process.env.REACT_APP_API_HOST+"programming/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
            .then((response_sched) => {
              dispatch({type: 'LOAD_SCHEDULED_PUT_OK', payload: response_sched.data})
            })
            .catch((err) => {
              dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response_sched.status, server_data: JSON.stringify(err.response_sched.data)} })
            })
        }


      })
      .catch((err) => {
        //alert(err.response.header)
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })

  }
}


export function TestApi(token) {
console.log('Put Bid Fired')
  return function(dispatch) {
    axios({
      method: 'get',
      url: process.env.REACT_APP_API_HOST+'test/?format=json',
      params: { token: token},
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then((response) => {
        console.log(response.data)
      })
      .catch((err) => {

      })
  }
}

export function CreatePutBid(reference, price, token) {
console.log('Put Bid Fired')
  return function(dispatch) {
    axios({
      method: 'get',
      url: process.env.REACT_APP_API_HOST+'test/?format=json',
      data: { token: token},
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
      .then((response) => {

      })
      .catch((err) => {

      })
  }
}

export function LoadBidData(bid) {
console.log('LoadBidData Action Fired', bid)
  return function(dispatch) {
    axios.get("http://localhost:8088/?id="+bid)
      .then((response) => {
        dispatch({type: LOAD_BID_W_REST_API_OK , payload: response.data})
      })
      .catch((err) => {
        dispatch({type: LOAD_BID_W_REST_API_ERROR, payload: err})
      })
  }
}

export function ReloadBidNotifications(payload) {
  return { type: RELOAD_BID_NOTIFICATIONS, payload: payload}
}

export function ReloadAllActivities(payload) {
 return { type: RELOAD_ALL_ACTIVITIES, payload: payload}
}

export function ShowModalAddTrade(selectedOption) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      if (!getState().gameInfo.canCreateTrade) {
        dispatch({type: 'SHOW_MODAL', modalType: 'GAME_CANT_CREATE_TRADE' })
      } else {
        dispatch({type: 'SHOW_MODAL', modalType: 'ADD_TRADE', modalProps: { selectedOption: selectedOption} })
      }
    }
  }

  return function(dispatch) {
    dispatch({type: 'SHOW_MODAL', modalType: 'ADD_TRADE', modalProps: { selectedOption: selectedOption} })
  }
}

export function ShowModalAddSchedule() {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      if (!getState().gameInfo.canCreateTrade) {
        dispatch({type: 'SHOW_MODAL', modalType: 'GAME_CANT_CREATE_TRADE' })
      } else {
        dispatch({type: 'SHOW_MODAL', modalType: 'ADD_SCHEDULE', modalProps: {} })
      }
    }
  }

  return function(dispatch) {
    dispatch({type: 'SHOW_MODAL', modalType: 'ADD_SCHEDULE', modalProps: {} })
  }
}


export function ShowModalMatchedTrade(id) {
  return (dispatch, getState) => {
    let matchedTrades = [], newObjData = [];
    //console.log(getState().activitiesList.rcMatchedTrades, " ********** ShowModalMatchedTrade act")

    if(getState().activitiesList.rcMatchedTrades.results !== undefined){
      matchedTrades = getState().activitiesList.rcMatchedTrades.results;
      newObjData = matchedTrades.filter(obj => {
        return obj.id === id
      });
      dispatch({type: 'SHOW_MODAL', modalType: 'MATCHED_TRADE', modalProps: newObjData[0] === undefined ? {id: id} : newObjData[0] })

    } else {

      dispatch({type: 'SHOW_MODAL', modalType: 'MATCHED_TRADE', modalProps: {id: id} })
    }
  }
}


export function ProceedToPayment(payment_method, auction,price,frompage,frompanel, creditCardData) {
  if (process.env.REACT_APP_GAME === "true")  {
    return (dispatch) => {
      let paymentData = {}
      paymentData.payment_method = payment_method;
      paymentData.payment_state = 'Authorized';
      paymentData.server_status = 'Your payment was successful';
      paymentData.server_data = {};

      dispatch({type: TO_PAY, payload: paymentData})
    }
  }

  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    let data = {
      "auction": auction,
      "price": parseFloat(price),
      "payment_method": payment_method
    }

    let newData = {};
    (typeof creditCardData === 'object' && creditCardData !== null) ?
      newData = {...data, ...creditCardData} :
      newData = data;
    //console.log(newData, "+++++++++++++++++++ newData act ---------")

    axios.put(process.env.REACT_APP_API_HOST+"auction/pay/", newData, { headers: headers })
      .then((response) => {
        dispatch({type: TO_PAY, payload: { auction: auction, price: price, server_status: response.status, server_data: response.data} })
        //console.log(frompage,frompanel)
        switch (frompage) {
          case 'reference':
            dispatch({type: RELOAD_REFERENCE_BIDS, payload: true })
            break
          case 'dashboard':
            dispatch({type: RELOAD_ALL_ACTIVITIES, payload: true })
            if (process.env.REACT_APP_USER ==='customer') { dispatch({type: RELOAD_SCHEDULED_PUT, payload: true }) }
            if (process.env.REACT_APP_USER ==='retailer') { dispatch({type: RELOAD_SCHEDULED_CALL, payload: true }) }
            break
          default:
        }
        if (frompanel === 'notifications') {dispatch({type: RELOAD_BID_NOTIFICATIONS, payload: true })}

      })
      .catch((err) => {
        //alert(err.response.header)
        dispatch({type: TO_PAY, payload: { auction: auction, price: price, server_status: err.response.status, server_data: err.response.data } })
      })

  }
}


export function ResetPaymentData() {
  return function(dispatch) {
    dispatch({type: 'RESET_PAYMENT_STATE', payload: {} })
  }
}


export function GetPaymentAmounts(auctionID) {
  if (process.env.REACT_APP_GAME === "true")  {
    return false
  }

  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }

    axios.get(process.env.REACT_APP_API_HOST+"auction/"+ auctionID +"/amounts/", { headers: headers })
      .then((response) => {
        dispatch({type: GET_PAYMENT_AMOUNTS, payload: {server_status: response.status, server_data: response.data} })
      })
      .catch((err) => {
        dispatch({type: GET_PAYMENT_AMOUNTS, payload: {server_status: err.response.status, server_data: JSON.stringify(err.response.data) } })
      })
  }
}
