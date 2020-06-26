//import { MISSING_API } from '../_missing_api'
import axios from "axios"
import { hystoricalNoPastData } from '../_utilities/newReferenceGraphData'

export const LOAD_WATCHES_IN_DASHBOARD_OK = 'LOAD_WATCHES_IN_DASHBOARD_OK'
export const RESET_WATCHES_IN_DASHBOARD = 'RESET_WATCHES_IN_DASHBOARD'
export const ADD_WATCHES_DETAILS_TO_DASHBOARD = 'ADD_WATCHES_DETAILS_TO_DASHBOARD'
export const ADD_WATCHES_HISTORICAL_DATA_TO_DASHBOARD ='ADD_WATCHES_HISTORICAL_DATA_TO_DASHBOARD'
export const ADD_WATCH_GRAPH = 'ADD_WATCH_GRAPH'
export const DELETE_WATCH_GRAPH = 'DELETE_WATCH_GRAPH'

export function LoadWatchesInDashboard() {

  if (process.env.REACT_APP_GAME === "true") {
    //let multipleResponseDetails = require("../_game/dashboard.json")

    return function(dispatch, getState) {
      let multipleResponseDetails = getState().gameInfo.myWatchesInDashboard
      console.log(multipleResponseDetails)
      multipleResponseDetails.forEach(function(responseDetails,index){
        console.log(responseDetails.id)
        //let historicalData = [{"month": shortDateLastMonth,  "price": responseDetails.price },{"month": shortDateThisMonth,  "price": responseDetails.price }]
        let historicalData = hystoricalNoPastData(responseDetails.price)
        dispatch({type: 'ADD_WATCHES_DETAILS_TO_DASHBOARD', payload: responseDetails, historicalData: historicalData })
      })
      dispatch({type: LOAD_WATCHES_IN_DASHBOARD_OK})}
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    //axios.get(process.env.REACT_APP_API_HOST+"dashboard/", { headers: { 'Authorization': tok} }) // old watchlist
    axios.get(process.env.REACT_APP_API_HOST+"follow/", { headers: { 'Authorization': tok} })
      .then((response) => {
        //legge dettagli per ogni entry nell'array
        //response.data.dashboard.forEach(function(entry, index) {  // old watchlist
        response.data.forEach(function(entry, index) {
          //entry in array = id
          axios.get(process.env.REACT_APP_API_HOST+"reference/"+entry.toString()+"/", { headers: { 'Authorization': tok} })
            .then((responseDetails) => {

                //legge dati storici per questa entry
                //se non ci sono dati aggregati
                let historicalData = hystoricalNoPastData(responseDetails.data.price)

                dispatch({type: 'ADD_WATCHES_DETAILS_TO_DASHBOARD', payload: responseDetails.data, historicalData: historicalData })
              })
              .catch((err) => {
                dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
              })
        });
        dispatch({type: LOAD_WATCHES_IN_DASHBOARD_OK})

      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }

}


export function AddWatchGraph(refId) {

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch,getState) {
      let referenceOptions = Object.assign({}, getState().referenceInfo.referenceData.selectedOption)
      let newWatchInDashboard = require("../_game/newWatchInDashboard.js")(referenceOptions)
      dispatch({type: "GAME_ADD_WATCH_IN_DASHBOARD", payload: newWatchInDashboard })
      dispatch({type: RESET_WATCHES_IN_DASHBOARD})

      dispatch(LoadWatchesInDashboard())
    }
  }

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
        dispatch({type: RESET_WATCHES_IN_DASHBOARD})
        dispatch(LoadWatchesInDashboard())
      })
  }
}

export function DeleteWatchGraph(numRow, refId) {
  console.log('DeleteWatchGraph Action Fired', numRow)
  console.log('DeleteWatchGraph Action ReferenceId', refId)

  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch) {
      dispatch({type: "GAME_DEL_WATCH_IN_DASHBOARD", payload: numRow })
      dispatch({type: RESET_WATCHES_IN_DASHBOARD})
      dispatch(LoadWatchesInDashboard())
    }
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    axios.delete(process.env.REACT_APP_API_HOST+"follow/"+refId.toString()+"/", { headers: { 'Authorization': tok} })
      .then((response) => {

        dispatch({type: DELETE_WATCH_GRAPH, payload: { rigaDaCanc: numRow } })
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }

}



export function LoadWatchesInTabPanel() {
  if (process.env.REACT_APP_GAME === "true") {
    return function(dispatch, getState) {
      let multipleResponseDetails = getState().gameInfo.myWatchesInDashboard
      console.log(multipleResponseDetails)
      multipleResponseDetails.forEach(function(responseDetails,index){
        console.log(responseDetails.id)
        //let historicalData = [{"month": shortDateLastMonth,  "price": responseDetails.price },{"month": shortDateThisMonth,  "price": responseDetails.price }]
        let historicalData = hystoricalNoPastData(responseDetails.price)
        dispatch({type: 'ADD_WATCHES_DETAILS_TO_DASHBOARD', payload: responseDetails, historicalData: historicalData })
      })
      dispatch({type: LOAD_WATCHES_IN_DASHBOARD_OK})}
  }

  return function(dispatch) {
    let tok='Token '+localStorage.getItem('wbtk')
    //axios.get(process.env.REACT_APP_API_HOST+"dashboard/", { headers: { 'Authorization': tok} }) // old watchlist
    axios.get(process.env.REACT_APP_API_HOST+"follow/", { headers: { 'Authorization': tok} })
      .then((response) => {
        //legge dettagli per ogni entry nell'array
        //response.data.dashboard.forEach(function(entry, index) {  // old watchlist
        response.data.forEach(function(entry, index) {
          //entry in array = id
          axios.get(process.env.REACT_APP_API_HOST+"reference/"+entry.toString()+"/", { headers: { 'Authorization': tok} })
            .then((responseDetails) => {

                //legge dati storici per questa entry
                //se non ci sono dati aggregati
                let historicalData = hystoricalNoPastData(responseDetails.data.price)

                dispatch({type: 'ADD_WATCHES_DETAILS_TO_DASHBOARD', payload: responseDetails.data, historicalData: historicalData })
              })
              .catch((err) => {
                dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
              })
        });
        dispatch({type: LOAD_WATCHES_IN_DASHBOARD_OK})

      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }

}

