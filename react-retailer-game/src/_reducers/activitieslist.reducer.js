import { LOAD_LATEST_ACTIVITIES_OK,
         //LOAD_MY_CREATED_ACTIVITIES_OK,
         //LOAD_MY_OFFER_ACTIVITIES_OK,
         //LOAD_MY_FOLLOW_ACTIVITIES_OK,
         //LOAD_MY_ALERT_ACTIVITIES_OK,
         LOAD_REFERENCE_MY_ACTIVITIES_OK,
         LOAD_REFERENCE_OTHER_ACTIVITIES_OK,

         LOAD_SCHEDULED_PUT_OK,
         LOAD_SCHEDULED_CALL_OK,
         SET_FILTER_BY_BRAND,

         LOAD_RETAILER_LIVE_PUTS_OK,
         LOAD_RETAILER_JOINED_LIVE_CALLS_OK,
         LOAD_MY_MATCHED_TRADES_OK,
         LOAD_MY_FAILED_TRADES_OK,
         LOAD_COMPETITORS_PUT_OK,

         LOAD_ALL_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_LIVE_CALLS_OK } from '../_actions/Activities.action'
import { RELOAD_ALL_ACTIVITIES,
         RELOAD_SCHEDULED_CALL,
         RELOAD_SCHEDULED_PUT } from '../_actions/Bids.action'

const initialState = {
  activitiesData: [],
  //myCreatedActivitiesData: [],
  //myOfferActivitiesData: [],
  //myFollowActivitiesData: [],
  //myAlertActivitiesData: [],
  rLivePuts: {},
  liveCalls: {},
  rJoinedLiveCalls: {},
  rCompetitorsPut: {},
  allLivePuts: {},
  cMyWatchlistLivePuts: {},
  cMyJoinedLivePuts: {},
  cMyLiveCalls: {},
  rcFailedTrades: {},
  rcMatchedTrades: {},
  scheduledPut: {},
  scheduledCall: {},
  filterByBrand: {},
  dashboardActivitiesLoaded: false,
  referenceMyActivitiesData: [],
  referenceOtherActivitiesData: [],
  reloadAllActivities: false,
  reloadScheduledCall: false,
  reloadScheduledPut: false
}

export default function activitiesListReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_LATEST_ACTIVITIES_OK:
      return {...state, activitiesData: action.payload, dashboardActivitiesLoaded: true, reloadAllActivities: false }
    case LOAD_RETAILER_LIVE_PUTS_OK:
      return {...state, rLivePuts: action.payload, dashboardActivitiesLoaded: true, reloadAllActivities: false }
    case LOAD_RETAILER_JOINED_LIVE_CALLS_OK:
      return {...state, rJoinedLiveCalls: action.payload }
    case LOAD_COMPETITORS_PUT_OK:
      return {...state, rCompetitorsPut: action.payload }
    case LOAD_ALL_LIVE_PUTS_OK:
      return {...state, allLivePuts: action.payload }
    case LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK:
      return {...state, cMyWatchlistLivePuts: action.payload }
    case LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK:
      return {...state, cMyJoinedLivePuts: action.payload }
    case LOAD_CUSTOMER_MY_LIVE_CALLS_OK:
      return {...state, cMyLiveCalls: action.payload }
    case LOAD_MY_MATCHED_TRADES_OK:
      return {...state, rcMatchedTrades: action.payload }
    case LOAD_MY_FAILED_TRADES_OK:
      return {...state, rcFailedTrades: action.payload }

    /*
    case LOAD_MY_CREATED_ACTIVITIES_OK:
      return {...state, myCreatedActivitiesData: action.payload }
    case LOAD_MY_OFFER_ACTIVITIES_OK:
      return {...state, myOfferActivitiesData: action.payload }
    case LOAD_MY_FOLLOW_ACTIVITIES_OK:
      return {...state, myFollowActivitiesData: action.payload }
    case LOAD_MY_ALERT_ACTIVITIES_OK:
      return {...state, myAlertActivitiesData: action.payload }
    */
    case LOAD_SCHEDULED_PUT_OK:
      return {...state, scheduledPut: action.payload, reloadScheduledPut: false }
    case LOAD_SCHEDULED_CALL_OK:
      return {...state, scheduledCall: action.payload, liveCalls: action.payload, reloadScheduledCall: false }
    case SET_FILTER_BY_BRAND:
      return {...state, filterByBrand: action.payload }
    case LOAD_REFERENCE_MY_ACTIVITIES_OK:
      return {...state, referenceMyActivitiesData: action.payload }
    case LOAD_REFERENCE_OTHER_ACTIVITIES_OK:
      return {...state, referenceOtherActivitiesData: action.payload }
    case RELOAD_ALL_ACTIVITIES:
      return {...state, reloadAllActivities: action.payload }
    case RELOAD_SCHEDULED_CALL:
        return {...state, reloadScheduledCall: true }
    case RELOAD_SCHEDULED_PUT:
        return {...state, reloadScheduledPut: true }
    default:
      return state
  }
}
