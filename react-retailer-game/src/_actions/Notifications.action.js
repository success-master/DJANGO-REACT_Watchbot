import axios from "axios"

export const LOAD_NOTIFICATIONS_MINE_NEW_OK = 'LOAD_NOTIFICATIONS_MINE_NEW_OK'
export const LOAD_NOTIFICATIONS_MINE_READ_OK = 'LOAD_NOTIFICATIONS_MINE_READ_OK'
export const SET_NOTIFICATIONS_MINE_READ_OK = 'SET_NOTIFICATIONS_MINE_READ_OK'
export const LOAD_NOTIFICATIONS_FOLLOW_NEW_OK = 'LOAD_NOTIFICATIONS_FOLLOW_NEW_OK'
export const LOAD_NOTIFICATIONS_FOLLOW_READ_OK = 'LOAD_NOTIFICATIONS_FOLLOW_READ_OK'
export const SET_NOTIFICATIONS_FOLLOW_READ_OK = 'SET_NOTIFICATIONS_FOLLOW_READ_OK'
export const SELECT_NOTIFICATIONS_ESSENTIAL = 'SELECT_NOTIFICATIONS_ESSENTIAL'
export const SHOW_NOTIFICATIONS_ESSENTIAL = 'SHOW_NOTIFICATIONS_ESSENTIAL'

export function LoadNotificationsMineNew() {

  if (process.env.REACT_APP_GAME === "true") {
    let payload = require("../_game/notificationsMineNew.json")
    return function(dispatch) {
      dispatch({type: LOAD_NOTIFICATIONS_MINE_NEW_OK , payload: payload })
    }
  }

  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"notification/mine/new/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: LOAD_NOTIFICATIONS_MINE_NEW_OK, payload: response.data})
        /*
        let Important_notifications = []
        response.data.results.forEach(function(element) {
          switch (element.get_type) {
            case 'winner_selected':
              Important_notifications.push({type: element.get_type, auction: element.auction, reference: element.reference_string, msg:"You Won!", color: "#ff0000"})
              break
            case 'first_call_user_selected':
              Important_notifications.push({type: element.get_type, auction: element.auction, reference: element.reference_string, msg:"You have been selected for second call!", color: "#ff6600"})
              break
            default:
          }
        })

        console.log("Important_notifications", Important_notifications)

        dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL, payload: Important_notifications})
      */
      })
      .catch((err) => {

      })
  }
}

export function LoadNotificationsMineImportant() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
    }
  }

  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"notification/mine/important/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL, payload: response.data.results})
      })
      .catch((err) => {

      })
  }
}

export function SetNotificationReadById(notifIdArray) {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch, getState) {
      let fakeNotificationsMineImportant = getState().notificationsInfo.notificationsEssential
      console.log(fakeNotificationsMineImportant)
      /*fakeNotificationsMineImportant=fakeNotificationsMineImportant.filter(
        function(singleObj) {
          return singleObj.id !=
        }
      ) */
      let updatedFakeNotificationsMineImportant = []
      updatedFakeNotificationsMineImportant  = fakeNotificationsMineImportant.filter(function(notif, index) {
        if (!notifIdArray.includes(notif.id)) {
            return (notif)
        }
      })
      console.log(updatedFakeNotificationsMineImportant)
      dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL, payload: updatedFakeNotificationsMineImportant})
    }
  }

  return function(dispatch) {
    var headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    var data = {notifications: notifIdArray}
    console.log(notifIdArray)
    axios.put(process.env.REACT_APP_API_HOST+"notification/set-read-by-id/", data, { headers: headers })
      .then((response) => {
          console.log(response.data)
          axios.get(process.env.REACT_APP_API_HOST+"notification/mine/important/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
            .then((response) => {
              dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL, payload: response.data.results})
            })
            .catch((err) => {

            })
          axios.get(process.env.REACT_APP_API_HOST+"notification/mine/new/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
            .then((response) => {
              dispatch({type: LOAD_NOTIFICATIONS_MINE_NEW_OK, payload: response.data})
            })
            .catch((err) => {

            })

      })
      .catch((err) => {
      })

  }
}

export function HideAllImportantNotifications() {
  return {
      type: SHOW_NOTIFICATIONS_ESSENTIAL, payload: false
  }
}

export function LoadNotificationsMineRead() {

  if (process.env.REACT_APP_GAME === "true") {
    let payload = require("../_game/notificationsMineRead.json")
    return function(dispatch) {
      dispatch({type: LOAD_NOTIFICATIONS_MINE_READ_OK , payload: payload })
    }
  }

  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"notification/mine/read/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: LOAD_NOTIFICATIONS_MINE_READ_OK, payload: response.data})
      })
      .catch((err) => {

      })
  }
}

export function SetNotificationsMineRead() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
    }
  }

  return function(dispatch) {
    var headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    var data = {}
    axios.post(process.env.REACT_APP_API_HOST+"notification/mine/set-read/", data, { headers: headers })
      .then((response) => {
          console.log(response.data)
          dispatch({type: SET_NOTIFICATIONS_MINE_READ_OK, payload: response.data})
          axios.get(process.env.REACT_APP_API_HOST+"notification/mine/new/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
            .then((response) => {
              dispatch({type: LOAD_NOTIFICATIONS_MINE_NEW_OK, payload: response.data})
            })
            .catch((err) => {

            })

      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}

export function LoadNotificationsFollowNew() {

  if (process.env.REACT_APP_GAME === "true") {
    let payload = require("../_game/notificationsFollowNew.json")
    return function(dispatch) {
      dispatch({type: LOAD_NOTIFICATIONS_FOLLOW_NEW_OK , payload: payload })
    }
  }

  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"notification/follow/new/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: LOAD_NOTIFICATIONS_FOLLOW_NEW_OK, payload: response.data})
      })
      .catch((err) => {

      })
  }
}

export function LoadNotificationsFollowRead() {

  if (process.env.REACT_APP_GAME === "true") {
    let payload = require("../_game/notificationsFollowRead.json")
    return function(dispatch) {
      dispatch({type: LOAD_NOTIFICATIONS_FOLLOW_READ_OK , payload: payload })
    }
  }

  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"notification/follow/read/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: LOAD_NOTIFICATIONS_FOLLOW_READ_OK, payload: response.data})
      })
      .catch((err) => {

      })
  }
}

export function SetNotificationsFollowRead() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
    }
  }
  
  return function(dispatch) {
    var headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    var data = {}
    axios.post(process.env.REACT_APP_API_HOST+"notification/follow/set-read/", data, { headers: headers })
      .then((response) => {
          console.log(response.data)
          dispatch({type: SET_NOTIFICATIONS_FOLLOW_READ_OK, payload: response.data})
          axios.get(process.env.REACT_APP_API_HOST+"notification/follow/new/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
            .then((response) => {
              dispatch({type: LOAD_NOTIFICATIONS_FOLLOW_NEW_OK, payload: response.data})

            })
            .catch((err) => {

            })
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}
