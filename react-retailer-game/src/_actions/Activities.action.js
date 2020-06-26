//import { MISSING_API } from '../_missing_api'

import axios from "axios"

//import { GameReferencePageUpdate } from './Game.action'

export const LOAD_LATEST_ACTIVITIES_OK = 'LOAD_LATEST_ACTIVITIES_OK'
export const LOAD_LATEST_ACTIVITIES_ERROR = 'LOAD_LATEST_ACTIVITIES_ERROR'
//export const LOAD_MY_OFFER_ACTIVITIES_OK = 'LOAD_MY_OFFER_ACTIVITIES_OK'
//export const LOAD_MY_OFFER_ACTIVITIES_ERROR = 'LOAD_MY_OFFER_ACTIVITIES_ERROR'
//export const LOAD_MY_CREATED_ACTIVITIES_OK = 'LOAD_MY_CREATED_ACTIVITIES_OK'
//export const LOAD_MY_CREATED_ACTIVITIES_ERROR = 'LOAD_MY_CREATED_ACTIVITIES_ERROR'
//export const LOAD_MY_FOLLOW_ACTIVITIES_OK = 'LOAD_MY_FOLLOW_ACTIVITIES_OK'
//export const LOAD_MY_FOLLOW_ACTIVITIES_ERROR = 'LOAD_MY_FOLLOW_ACTIVITIES_ERROR'
//export const LOAD_MY_ALERT_ACTIVITIES_OK = 'LOAD_MY_ALERT_ACTIVITIES_OK'
//export const LOAD_MY_ALERT_ACTIVITIES_ERROR = 'LOAD_MY_ALERT_ACTIVITIES_ERROR'
export const LOAD_REFERENCE_MY_ACTIVITIES_OK = 'LOAD_REFERENCE_MY_ACTIVITIES_OK'
export const LOAD_REFERENCE_MY_ACTIVITIES_ERROR = 'LOAD_REFERENCE_MY_ACTIVITIES_ERROR'
export const LOAD_REFERENCE_OTHER_ACTIVITIES_OK = 'LOAD_REFERENCE_OTHER_ACTIVITIES_OK'
export const LOAD_REFERENCE_OTHER_ACTIVITIES_ERROR = 'LOAD_REFERENCE_OTHER_ACTIVITIES_ERROR'
export const LOAD_SCHEDULED_PUT_OK = 'LOAD_SCHEDULED_PUT_OK'
export const LOAD_SCHEDULED_CALL_OK = 'LOAD_SCHEDULED_CALL_OK'
export const SET_FILTER_BY_BRAND = 'SET_FILTER_BY_BRAND'

export const LOAD_RETAILER_LIVE_PUTS_OK = 'LOAD_RETAILER_LIVE_PUTS_OK'
export const LOAD_RETAILER_JOINED_LIVE_CALLS_OK = 'LOAD_RETAILER_JOINED_LIVE_CALLS_OK'
export const LOAD_MY_MATCHED_TRADES_OK = 'LOAD_MATCHED_TRADES_OK'
export const LOAD_MY_FAILED_TRADES_OK = 'LOAD_MY_FAILED_TRADES_OK'
export const LOAD_COMPETITORS_PUT_OK = 'LOAD_COMPETITORS_PUT_OK'
export const LOAD_ALL_LIVE_PUTS_OK = 'LOAD_ALL_LIVE_PUTS_OK'
export const LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK = 'LOAD_MY_WATCHLIST_LIVE_PUTS_OK'
export const LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK = 'LOAD_MY_JOINED_LIVE_PUTS_OK'
export const LOAD_CUSTOMER_MY_LIVE_CALLS_OK = 'LOAD_CUSTOMER_MY_LIVE_CALLS_OK'

export function LoadLatestActivities() {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/", { headers: { 'Authorization': tok} })

        .then((response) => {
          dispatch({type: LOAD_LATEST_ACTIVITIES_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: LOAD_LATEST_ACTIVITIES_ERROR, payload: err})
        })
    }

}

/*
export function LoadMyOfferActivities() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {

    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"auction/my-offer/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_MY_OFFER_ACTIVITIES_OK, payload: response.data})
      })
      .catch((err) => {
        dispatch({type: LOAD_MY_OFFER_ACTIVITIES_ERROR, payload: err})
      })
  }

}


export function LoadMyCreatedActivities() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"auction/self/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_MY_CREATED_ACTIVITIES_OK, payload: response.data})
      })
      .catch((err) => {
        dispatch({type: LOAD_MY_CREATED_ACTIVITIES_ERROR, payload: err})
      })
  }

}

export function LoadMyFollowActivities() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"auction/by-follow/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_MY_FOLLOW_ACTIVITIES_OK, payload: response.data})
      })
      .catch((err) => {
        dispatch({type: LOAD_MY_FOLLOW_ACTIVITIES_ERROR, payload: err})
      })
  }

}
*/

export function LoadSchedulePut() {

    if (process.env.REACT_APP_GAME === "true") {
      return function(dispatch) {
      }
    }

    return function(dispatch, getState) {
      let tok='Token '+localStorage.getItem('wbtk')
      if (getState().activitiesList.filterByBrand.hasOwnProperty('id')) {
        axios.get(process.env.REACT_APP_API_HOST+"programming/by-brand/"+getState().activitiesList.filterByBrand.id.toString(), { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_SCHEDULED_PUT_OK, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      } else {
        axios.get(process.env.REACT_APP_API_HOST+"programming/?page="+getState().userInfo.paginationCurrent.schedulePutPage.toString()+"&page_size="+getState().userInfo.paginationMaxLines.schedules.toString(), { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_SCHEDULED_PUT_OK, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      }

    }

}


export function LoadScheduleCall() {

    if (process.env.REACT_APP_GAME === "true") {
      return function(dispatch) {

      }
    }

    return function(dispatch, getState) {
      let tok='Token '+localStorage.getItem('wbtk')
      if (getState().activitiesList.filterByBrand.hasOwnProperty('id')) {
        axios.get(process.env.REACT_APP_API_HOST+"programming/call/by-brand/"+getState().activitiesList.filterByBrand.id.toString(), { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_SCHEDULED_CALL_OK, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      } else {
        axios.get(process.env.REACT_APP_API_HOST+"programming/call/", { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: LOAD_SCHEDULED_CALL_OK, payload: response.data})
          })
          .catch((err) => {
            dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          })
      }
    }

}



export function LoadReferenceMyActivities(id) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      //dispatch(GameReferencePageUpdate(id))
    }
  }


  return function(dispatch) {
    //let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"auction/by-reference/"+id.toString()+"/self/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        let payload_self = response.data
        axios.get(process.env.REACT_APP_API_HOST+"auction/by-reference/"+id.toString()+"/my-offer/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
        .then((response) => {
          let payload= payload_self.concat(response.data)
          dispatch({type: LOAD_REFERENCE_MY_ACTIVITIES_OK, payload: payload})
          dispatch({type: 'RELOAD_REFERENCE_BIDS', payload: false })
        })
        .catch((err) => {

          dispatch({type: LOAD_REFERENCE_MY_ACTIVITIES_ERROR, payload: err})
        })
      })
      .catch((err) => {

        dispatch({type: LOAD_REFERENCE_MY_ACTIVITIES_ERROR, payload: err})
      })
  }

}

export function LoadReferenceOtherActivities(id) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"auction/by-reference/"+id.toString()+"/not-mine/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_REFERENCE_OTHER_ACTIVITIES_OK, payload: response.data})
        dispatch({type: 'RELOAD_REFERENCE_BIDS', payload: false })
      })
      .catch((err) => {
        dispatch({type: LOAD_REFERENCE_OTHER_ACTIVITIES_ERROR, payload: err})
      })
  }
  /*

   return {
       type: LOAD_REFERENCE_OTHER_ACTIVITIES_OK,
       payload: MISSING_API.reference_other_activities

   }

  */
}

export function ShowModalFilterByBrand() {
  return function(dispatch) {
    dispatch({type: 'SHOW_MODAL', modalType: 'CHANGE_FILTER_BRAND', modalProps: {} })
  }
}

export function FilterByBrand(brandObj) {

return {
    type: SET_FILTER_BY_BRAND,
    payload: brandObj
  }
}



export function LoadRetailerLivePuts() {
    /* Tutte le trade (tipo put) create da questo user retailer */
    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-live-puts", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_RETAILER_LIVE_PUTS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadRetailerJoinedLiveCalls() {
    /* Tutte le trade (tipo put) create da questo user retailer */
    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/joined-live-calls", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_RETAILER_JOINED_LIVE_CALLS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadMyMatchedTrades() {
    /* Se customer:
       tutte le call create dall'utente loggato per cui è stato decretato un retailer vincitore (status: "winner selected" o "closed" o "shipped")
       Se retailer:
       le matched TRADES sono sia le call che ha vinto che le sue put che  hanno avuto un vincitore */
    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }  

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-matched-trades", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_MY_MATCHED_TRADES_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadMyFailedTrades() {
    /*
    Nel caso il chiamante sia un CUSTOMER:
    sono le trade di tipo call create da questo utente con status decayed_first_call, decayed_first_call_selection, decayed_second_call, decayed_second_call_selection, decayed not payed

    Nel caso il chiamante sia un RETAILER:
    sono le trade di tipo put create da questo utentecon status decayed_first_call, decayed_first_call_selection, decayed_second_call, decayed_second_call_selection, decayed not payed
    */
    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-failed-trades", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_MY_FAILED_TRADES_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCompetitorsPut() {

    if (process.env.REACT_APP_GAME === "true")  {
          return function(dispatch, getState) {
          }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/competitors-put", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_COMPETITORS_PUT_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadAllLivePuts() {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/all-live-puts", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_ALL_LIVE_PUTS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCustomerMyWatchlistLivePuts() {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-watchlist-live-puts", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCustomerMyJoinedLivePuts() {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-joined-live-puts", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}

export function LoadCustomerMyLiveCalls() {

    if (process.env.REACT_APP_GAME === "true")  {
      return function(dispatch, getState) {

      }
    }

    return function(dispatch) {
      let tok='Token '+localStorage.getItem('wbtk')
      axios.get(process.env.REACT_APP_API_HOST+"auction/my-live-calls", { headers: { 'Authorization': tok} })
        .then((response) => {
          dispatch({type: LOAD_CUSTOMER_MY_LIVE_CALLS_OK, payload: response.data})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        })
    }
}
