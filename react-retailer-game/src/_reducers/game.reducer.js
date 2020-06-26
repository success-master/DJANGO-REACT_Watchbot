import { LOAD_LATEST_ACTIVITIES_OK
} from '../_actions/Activities.action'

//define the initial state
const initialState = {
  dashboardLodaded: false,
  myTradeInProgress: {},
  myTradeInProgressFirstCallDemo: {},
  myTradeInProgressSecondCallDemo: {},
  canCreateTrade: true,
  myCreatedTrade: {},
  myCreatedTradeFirstCallDemo: {},
  myCreatedTradeSecondCallDemo: {},
  fakeOthersTrade: {},
  myOfferForCallTrade: {},
  myWatchesInDashboard: require("../_game/dashboard.json"),
  winnerCallSelectedNotificationSent: false
}

export default function gameReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_LATEST_ACTIVITIES_OK:
      return {...state, dashboardLodaded: true }
    case "GAME_ADD_WATCH_IN_DASHBOARD":
      return {...state, myWatchesInDashboard: [ ...state.myWatchesInDashboard, action.payload]}
    case "GAME_DEL_WATCH_IN_DASHBOARD":
      //return { ...state }
      return {...state, myWatchesInDashboard: [ ...state.myWatchesInDashboard.slice(0, action.payload), ...state.myWatchesInDashboard.slice(action.payload + 1)] }
    case "GAME_CAN_CREATE_TRADE":
      return {...state, canCreateTrade: action.payload}
    case "GAME_WINNER_CALL_SELECTED_NOTIFICATION_SENT":
      return {...state, winnerCallSelectedNotificationSent: action.payload}
    case "GAME_STORE_MY_TRADE_IN_PROGRESS":
      return {...state, myTradeInProgress: action.payload}
    case "GAME_STORE_MY_TRADE_CREATED":
      return {...state, myCreatedTrade: action.payload}
    case "GAME_STORE_MY_TRADE_IN_PROGRESS_FIRST_CALL_DEMO":
      return {...state, myTradeInProgressFirstCallDemo: action.payload}
    case "GAME_STORE_MY_TRADE_IN_PROGRESS_SECOND_CALL_DEMO":
      return {...state, myTradeInProgressSecondCallDemo: action.payload}
    case "GAME_UPDATE_MY_TRADE_IN_PROGRESS_FIRST_CALL_OFFERS":
      return {...state, myTradeInProgress: {...state.myTradeInProgress, first_call_offers: [...state.myTradeInProgress.first_call_offers, action.payload]} }
    case "GAME_UPDATE_MY_TRADE_IN_PROGRESS_SECOND_CALL_OFFERS":
      return {...state, myTradeInProgress: {...state.myTradeInProgress, second_call_on_going: state.myTradeInProgress.second_call_on_going.slice(0, action.payload.itemNum).concat(action.payload.offerToReplace ,state.myTradeInProgress.second_call_on_going.slice(action.payload.itemNum+1))} }
    case "GAME_STORE_MY_TRADE_CREATED_FIRST_CALL_DEMO":
      return {...state, myCreatedTradeFirstCallDemo: action.payload}
    case "GAME_STORE_MY_TRADE_CREATED_SECOND_CALL_DEMO":
      return {...state, myCreatedTradeSecondCallDemo: action.payload}
    case "GAME_UPDATE_MY_TRADE_CREATED_FIRST_CALL_OFFERS":
      return {...state, myCreatedTrade: {...state.myCreatedTrade, first_call_offers: [...state.myCreatedTrade.first_call_offers, action.payload]} }
    case "GAME_UPDATE_MY_TRADE_CREATED_SECOND_CALL_OFFERS":
      return {...state, myCreatedTrade: {...state.myCreatedTrade, second_call_on_going: state.myCreatedTrade.second_call_on_going.slice(0, action.payload.itemNum).concat(action.payload.offerToReplace ,state.myCreatedTrade.second_call_on_going.slice(action.payload.itemNum+1))} }
    case "GAME_STORE_FAKE_OTHERS_TRADE":
      return {...state, fakeOthersTrade: action.payload}
    case "GAME_JOIN_TRADE":
      return {...state, myOfferForCallTrade: action.payload }
    default:
      return state
  }
}
