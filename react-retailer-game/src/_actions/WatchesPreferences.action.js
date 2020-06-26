import axios from "axios"

export const PREFERENCE_CHANGE_LETTER = 'PREFERENCE_CHANGE_LETTER'
export const PREFERENCE_LOAD_BRANDS_TO_SHOW = 'PREFERENCE_LOAD_BRANDS_TO_SHOW'
export const PREFERENCE_CHANGE_BRAND = 'PREFERENCE_CHANGE_BRAND'
export const PREFERENCE_LOAD_REFS_TO_SHOW = 'PREFERENCE_LOAD_REFS_TO_SHOW'
export const PREFERENCE_CHANGE_REF = 'PREFERENCE_CHANGE_REF'


export function LoadBrandsByFirstLetter(charCode) {
  return function(dispatch) {
    dispatch({type: PREFERENCE_CHANGE_LETTER , payload: charCode})
    axios.get(process.env.REACT_APP_API_HOST+"brand/"+String.fromCharCode(charCode)+"/", { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
      .then((response) => {
        dispatch({type: PREFERENCE_LOAD_BRANDS_TO_SHOW, payload: response.data.results})
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}

export function LoadRefsByBrand(brand) {
  return function(dispatch) {
    dispatch({type: PREFERENCE_CHANGE_BRAND , payload: brand})
    axios.get(process.env.REACT_APP_API_HOST+"reference-by-brand/"+brand.id.toString(), { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
      .then((response) => {
        dispatch({type: PREFERENCE_LOAD_REFS_TO_SHOW, payload: response.data.results})
      })
      .catch((err) => {
        dispatch({type: 'SHOW_MODAL', modalType: 'SERVER_STATUS', modalProps: {server_status: err.response.status, server_data: JSON.stringify(err.response.data)} })
      })
  }
}

export function UnloadBrandToShow() {
  return function(dispatch) {
    dispatch({type: PREFERENCE_CHANGE_BRAND , payload: {}})
    dispatch({type: PREFERENCE_LOAD_REFS_TO_SHOW , payload: []})
  }
}

export function LoadRefPreferencesSelected(id) {
  return function(dispatch) {
    dispatch({type: PREFERENCE_CHANGE_REF , payload: id})
  }
}
