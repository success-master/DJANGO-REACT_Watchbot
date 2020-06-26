import { LOAD_REF_DETAILS, UPDATE_LATEST_REFERENCE, LOAD_REF_FOLLOW, ADD_REF_FOLLOW, REF_UNFOLLOW, LOAD_REF_HISTORICAL_DATA_OK } from '../_actions/References.action'
import { RELOAD_REFERENCE_BIDS } from '../_actions/Bids.action'
//define the initial state
const initialState = {
  followList: [],
  referenceData: {},
  referenceDetails: {},
  referenceHistoricalData: [],
  reloadReferenceBids: false,
}

export default function referenceInfoReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_REF_DETAILS:
      return {...state, referenceDetails: action.payload }
    case UPDATE_LATEST_REFERENCE:
      return {...state, referenceData: action.payload }
    case LOAD_REF_FOLLOW:
      return {...state, followList: action.payload }
    case ADD_REF_FOLLOW:
      return {...state, followList: [...state.followList, action.payload] }
    case REF_UNFOLLOW:
      let indexOfId = state.followList.indexOf(action.payload)
      return {...state, followList: [...state.followList.slice(0, indexOfId), ...state.followList.slice(indexOfId + 1)] }
    case LOAD_REF_HISTORICAL_DATA_OK:
      return {...state, referenceHistoricalData: action.payload }
    case RELOAD_REFERENCE_BIDS:
      return {...state, reloadReferenceBids: action.payload }
    default:
      return state
  }
}
