//import { MISSING_API } from '../_missing_api'
import axios from "axios"

export const LOAD_AUTH_OK = 'LOAD_AUTH_OK'
export const LOAD_AUTH_NO = 'LOAD_AUTH_NO'
export const LOAD_AUTH_ERROR = 'LOAD_AUTH_ERROR'
export const SENT_FIREBASE_TOKEN_OK = 'SENT_FIREBASE_TOKEN_OK'
export const SUBSCRIBED_TO_TOPIC = 'SUBSCRIBED_TO_TOPIC'
export const LOAD_SETTINGS_PROFILE_OK = 'LOAD_SETTINGS_PROFILE_OK'
export const LOAD_SETTINGS_PROFILE_ERROR = 'LOAD_SETTINGS_PROFILE_ERROR'
export const WRITE_SETTINGS_PROFILE_OK = 'WRITE_SETTINGS_PROFILE_OK'
export const WRITE_SETTINGS_PROFILE_ERROR = 'WRITE_SETTINGS_PROFILE_ERROR'
export const SET_PAGE = 'SET_PAGE'
export const SET_PANEL = 'SET_PANEL'
export const SET_SAFARI = 'SET_SAFARI'
export const SET_PANEL_LEFT_OPEN = 'SET_PANEL_LEFT_OPEN'
export const SET_PANEL_RIGHT_OPEN = 'SET_PANEL_RIGHT_OPEN'
export const CREDIT_CARD_LIST = 'CREDIT_CARD_LIST'
export const SET_CREDIT_CARD = 'SET_CREDIT_CARD'

export function LoadAuth() {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
      localStorage.setItem('wbtk', 'demo')
      dispatch({type: LOAD_AUTH_OK , payload: true})
    }
  }

  return function(dispatch) {
console.log(process.env.REACT_APP_API_HOST)
    axios.get(process.env.REACT_APP_API_HOST+"is-authenticated/?format=json")
      .then((response) => {
        localStorage.setItem('wbtk', response.data.token)
        dispatch({type: LOAD_AUTH_OK , payload: response.data.is_authenticated})
        if (process.env.REACT_APP_LOCAL === "true") {
          if (process.env.REACT_APP_USER === 'customer') {
            //localStorage.setItem('wbtk', '5a41b446e2c489170e81cdf423b9aceaeaecad17')
            //localStorage.setItem('wbtk', 'a0e33517409f2c117ad25efa045a186bd8b7f389') //customer1
            localStorage.setItem('wbtk', '9f3f73bc0fb29ad7c72d3536f7103e30ed87ba05') //paols
            //localStorage.setItem('wbtk', '8bb2f998e0049f350deb4313bfd99fca78c9e520') //olga
          } else {
            //localStorage.setItem('wbtk', 'a078bd0aeeb80d179bbd7846bcf54ab46d4ff9f0')
            localStorage.setItem('wbtk', '0439c71935901d1b2d23c705c78c04790543aef6') //customer1
          }
          dispatch({type: LOAD_AUTH_OK , payload: true})
        }
        if (response.data.is_authenticated === false) {
          //dispatch({type: 'SHOW_MODAL', modalType: 'NOT_AUTHENTICATED', modalProps: {} })
        }
      })
      .catch((err) => {
        dispatch({type: LOAD_AUTH_ERROR, payload: err})
      })
  }
}

export function SendFirebaseToken(tk) {
  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    let data = {
      "token": tk,
    }
    axios.put(process.env.REACT_APP_API_HOST+"firebase-token/", data, { headers: headers })
      .then((response) => {
        dispatch({type: SENT_FIREBASE_TOKEN_OK, payload: true})

        axios.post(process.env.REACT_APP_API_HOST+"topic-subscribtion/", data, { headers: headers })
        .then((response) => {
          dispatch({type: SUBSCRIBED_TO_TOPIC, payload: true})
        })
        .catch((err) => {
          dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
          //alert(err.response.header)
        })

      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: 'Firebase Token: '+err.response.status, server_data: JSON.stringify(err.response.data)} })
      })

  }

}

export function SubscribeToTopic(tk) {
  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    let headers = {
                'Authorization': tok,
                'Content-Type': 'application/json'
            }
    let data = {
      "token": tk,
    }
    axios.post(process.env.REACT_APP_API_HOST+"topic-subscribtion/", data, { headers: headers })
      .then((response) => {
        dispatch({type: SUBSCRIBED_TO_TOPIC, payload: true})
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
        //alert(err.response.header)
      })

  }

}


export function LoadSettingsProfile() {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      let userSettings = require("../_game/userSettings.js")()
      dispatch({type: LOAD_SETTINGS_PROFILE_OK , payload: userSettings })
    }
  }


  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"user/me/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_SETTINGS_PROFILE_OK , payload: response.data})
        //console.log(response.data, "++++++++++++++++ LOAD_SETTINGS_PROFILE_OK +++++++++++++")
        //if (response.data.show_splash === true && process.env.REACT_APP_USER === 'customer') {
        //  dispatch({type: 'SHOW_MODAL', modalType: 'SPLASH_PAGE', modalProps: {} })
        //}
      })
      .catch((err) => {
        dispatch({type: LOAD_SETTINGS_PROFILE_ERROR, payload: err})
      })
  }
}

export function WriteSettingsProfile(data) {
  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    var headers = {
        'Authorization': tok,
        'Content-Type': 'application/json'
    }
    axios.post(process.env.REACT_APP_API_HOST+"user/me/", data, { headers: headers })
      .then((response) => {
          dispatch({type: WRITE_SETTINGS_PROFILE_OK, payload: data})
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}

export function SetPage(page) {
  return { type: SET_PAGE, payload: page}
}

export function SetPanel(panel) {
  return { type: SET_PANEL, payload: panel}
}

export function SetSafari() {
  return { type: SET_SAFARI, payload: true}
}

export function SetPanelLeftOpen(bool) {
  return { type: SET_PANEL_LEFT_OPEN, payload: bool}
}

export function SetPanelRightOpen(bool) {
  return { type: SET_PANEL_RIGHT_OPEN, payload: bool}
}


export function updateSelectedCreditCard(id){
  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      let profile = getState().userInfo.userSettingsProfile;
      const newObject = {
        ...profile,
        credit_card_data: {}
      }
      dispatch({type: SET_CREDIT_CARD , payload: newObject})
    }
  }

  return function(dispatch, getState) {
    let tok='Token '+localStorage.getItem('wbtk')
    let headers = {
        'Authorization': tok,
        'Content-Type': 'application/json'
    }
    let data = {
      "id": id.toString(),
      "preferred": true
    }

    axios.put(process.env.REACT_APP_API_HOST+"/user/credit-cards/"+id.toString()+"/", data, { headers: headers })
      .then((response) => {
        //console.log(response, " : response");
        let profile = getState().userInfo.userSettingsProfile;
        let credit_card_data = profile.creditCardList.filter(cc =>{
          return parseInt(cc.id) === parseInt(id)
        });
        const newObject = {
          ...profile,
          credit_card_data: credit_card_data[0]
        }
        dispatch({type: SET_CREDIT_CARD, payload: newObject})
        //console.log(response.data, " ******* updateSelectedCreditCard act resp ++++")
      })
      .catch((err) => {
        dispatch({type: SET_CREDIT_CARD, payload: err})
      })
  }
}


export function creditCardList(){
  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {
      dispatch({type: CREDIT_CARD_LIST , payload: {}})
    }
  }

  return function(dispatch,  getState) {
    let tok='Token '+localStorage.getItem('wbtk');
    axios.get(process.env.REACT_APP_API_HOST+"/user/credit-cards/", { headers: { 'Authorization': tok} })
      .then((response) => {
        //console.log(response, "+++++++++++++++ resp act cc list +++++++++")
        let profile = getState().userInfo.userSettingsProfile;
        const newObject = {
          ...profile,
          creditCardList: response.data.results
        }
        dispatch({type: CREDIT_CARD_LIST, payload: newObject})
      })
      .catch((err) => {
        dispatch({type: CREDIT_CARD_LIST, payload: err})
      })
  }
}
