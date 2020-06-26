//import { MISSING_API } from '../_missing_api'
import axios from "axios"
import { hystoricalNoPastData } from '../_utilities/newReferenceGraphData'

export const LOAD_REF_DETAILS = 'LOAD_REF_DETAILS'
export const UPDATE_LATEST_REFERENCE = 'UPDATE_LATEST_REFERENCE'
export const LOAD_REF_FOLLOW = 'LOAD_REF_FOLLOW'
export const ADD_REF_FOLLOW = 'ADD_REF_FOLLOW'
export const REF_UNFOLLOW = 'REF_UNFOLLOW'
export const LOAD_REF_ALERT = 'LOAD_REF_ALERT'
export const LOAD_REF_HISTORICAL_DATA_OK = 'LOAD_REF_HISTORICAL_DATA_OK'
export const LOAD_REF_HISTORICAL_DATA_ERROR = 'LOAD_REF_HISTORICAL_DATA_ERROR'
export const MODAL_REFERENCE_INFO = 'MODAL_REFERENCE_INFO'

export function LoadRefFollow() {
  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.get(process.env.REACT_APP_API_HOST+"follow/", { headers: { 'Authorization': tok} })
      .then((response) => {
        dispatch({type: LOAD_REF_FOLLOW, payload: response.data })
      })
      .catch((err) => {
        })
      }
  }

export function LoadRefDetails(refId) {

  if (process.env.REACT_APP_GAME === "true")  {
    return function(dispatch, getState) {

      let fakeRefDetails = require("../_game/references.js")('')
      //alert(fakeRefDetails[1].reference)

      let result = fakeRefDetails.filter(function (elem) {
        return elem.id === refId
      })

      dispatch({type: LOAD_REF_DETAILS, payload: result[0] })

    }
  }


  return function(dispatch) {
    axios.get(process.env.REACT_APP_API_HOST+"reference/"+refId.toString()+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk') } })
      .then((response) => {
        dispatch({type: LOAD_REF_DETAILS, payload: response.data })
      })
      .catch((err) => {
        })
      }
}

export function AddFollow(refId) {
  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    let headers = {
                'Authorization': tok,
                'Content-Type': 'application/json'
            }
    let data = {
      "reference": refId,
    }
    axios.put(process.env.REACT_APP_API_HOST+"follow/", data, { headers: headers })
      .then((response) => {
        axios.get(process.env.REACT_APP_API_HOST+"auction/by-follow/", { headers: { 'Authorization': tok} })
          .then((response) => {
            dispatch({type: 'LOAD_MY_FOLLOW_ACTIVITIES_OK', payload: response.data})
          })
        dispatch({type: ADD_REF_FOLLOW, payload: refId})
      })
  }
}

export function Unfollow(refId) {
  return function(dispatch) {
    let headers = {
                'Authorization': 'Token '+localStorage.getItem('wbtk'),
                'Content-Type': 'application/json'
            }
    axios.delete(process.env.REACT_APP_API_HOST+"follow/"+refId.toString(),  { headers: headers })
      .then((response) => {
        axios.get(process.env.REACT_APP_API_HOST+"auction/by-follow/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
          .then((response) => {
            dispatch({type: 'LOAD_MY_FOLLOW_ACTIVITIES_OK', payload: response.data})
          })
        dispatch({type: REF_UNFOLLOW, payload: refId})
      })
  }
}


export function UpdateLatestReference(refObj) {
localStorage.setItem('latestRef', JSON.stringify(refObj.selectedOption))
return {
    type: UPDATE_LATEST_REFERENCE,
    payload: refObj
  }
}

export function ReloadLatestReference(refObj) {
return {
    type: UPDATE_LATEST_REFERENCE,
    payload: refObj
  }
}


export function LoadRefHistoricalData(refId, suggestedPrice, dateRange) {

  return function(dispatch) {
    //legge dati storici per questa entry

    //se invece non ci sono dati aggregati:

    let historicalData = hystoricalNoPastData(suggestedPrice, dateRange)

    dispatch({type: LOAD_REF_HISTORICAL_DATA_OK , payload: historicalData})
  }
}

export function LoadReferenceInfo(objData) {
  return function (dispatch) {
    let historicalData = hystoricalNoPastData(objData.refPrice)
    objData.historicalData = historicalData;
    //objData.selectedOption = getState().referenceInfo.referenceDetails;

    dispatch({ type: 'SHOW_MODAL', modalType: 'REFERENCE_INFO', modalProps: objData })
  }
}


/*

if (process.env.REACT_APP_TEST_DATA !== "true") {

  return function(dispatch) {
    axios.get("http://localhost:8088/reference-historical-data")
      .then((response) => {
        dispatch({type: LOAD_REF_HISTORICAL_DATA_OK , payload: response.data})
      })
      .catch((err) => {
        dispatch({type: LOAD_REF_HISTORICAL_DATA_ERROR, payload: err})
      })
  }

} else {
  console.log(ref)
  console.log(MISSING_API.refhistoricaldata)
  let obj = MISSING_API.refhistoricaldata.find(function (obj) { return obj.ref === ref; });
  if (typeof obj !== 'undefined') {
    return {
        type: LOAD_REF_HISTORICAL_DATA_OK,
        payload: obj.historicalData
    }
  } else {
    return {
        type: LOAD_REF_HISTORICAL_DATA_OK,
        payload: []
    }
  }


}


}

*/
