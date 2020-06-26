import { SET_VIEW_BID_ID,
         LOAD_CURRENT_BID,
         LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_MINE,
         LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_FOLLOW,
         RESET_GRAPH_DATA_FIRST_CALL,
         CALCULATE_GRAPH_DATA_FIRST_CALL,
         RESET_GRAPH_DATA_SECOND_CALL,
         CALCULATE_GRAPH_DATA_SECOND_CALL,
         RESET_CHOSEN_BIDDERS, RESET_CHOSEN_OFFERS,
         ADD_CHOSEN_BIDDER, ADD_CHOSEN_OFFER,
         REMOVE_CHOSEN_BIDDER, REMOVE_CHOSEN_OFFER,
         SELECT_WINNER,
         SENT_WINNER_SELECTION_OK,
         MODAL_JOIN_BID,
         TO_PAY,
         GET_PAYMENT_AMOUNTS
        } from '../_actions/Bids.action'

const initialState = {
  viewBidId: 0,
  currentBidDetails: {},
  currentBidDetailsNotificationMine: {},
  currentBidDetailsNotificationFollow: {},
  modalJoinBid: {show: false, bid: '' },
  chosenBidders: [],
  chosenOffers: [],
  graphData: [
    {bidder: 1, offer:0},
    {bidder: 2, offer:0},
    {bidder: 3, offer:0},
    {bidder: 4, offer:0},
    {bidder: 5, offer:0},
    {bidder: 6, offer:0},
    {bidder: 7, offer:0},
    {bidder: 8, offer:0},
    {bidder: 9, offer:0},
    {bidder: 10, offer:0},
    {bidder: 11, offer:0},
    {bidder: 12, offer:0},
    {bidder: 13, offer:0},
    {bidder: 14, offer:0},
    {bidder: 15, offer:0},
    {bidder: 16, offer:0},
    {bidder: 17, offer:0},
    {bidder: 18, offer:0},
    {bidder: 19, offer:0},
    {bidder: 20, offer:0},
    {bidder: 21, offer:0},
    {bidder: 22, offer:0},
    {bidder: 23, offer:0},
    {bidder: 24, offer:0},
    {bidder: 25, offer:0},
    {bidder: 26, offer:0},
    {bidder: 27, offer:0},
    {bidder: 28, offer:0},
    {bidder: 29, offer:0},
    {bidder: 30, offer:0},
    {bidder: 31, offer:0},
    {bidder: 32, offer:0},
    {bidder: 33, offer:0},
    {bidder: 34, offer:0},
    {bidder: 35, offer:0},
    {bidder: 36, offer:0},
    {bidder: 37, offer:0},
    {bidder: 38, offer:0},
    {bidder: 39, offer:0},
    {bidder: 40, offer:0},
  ],
  showModalWinnerSelected: false,
  paymentData: {},
  amounts: {}// price from api /auction/{id}/amounts
}


let UserItemsNum = 40

export default function bidInfoReducer(state = initialState, action) {
  switch(action.type) {
    case SET_VIEW_BID_ID:
      return {...state, viewBidId: action.payload }
    case "GAME_LOAD_CURRENT_BID":
      return {...state, currentBidDetails: action.payload}
    case LOAD_CURRENT_BID:
      return {...state, currentBidDetails: action.payload, chosenOffers: [], chosenBidders: [], chosenWinningOffer: null, showModalWinnerSelected: false }
    case LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_MINE:
      return {...state, currentBidDetailsNotificationMine: action.payload }
    case LOAD_CURRENT_BID_DETAIL_FOR_NOTIFICATION_FOLLOW:
      return {...state, currentBidDetailsNotificationFollow: action.payload }
    case RESET_GRAPH_DATA_FIRST_CALL:
      let graphicalDataReset= []
      for (let i = 0; i < UserItemsNum; i++) {
          graphicalDataReset[i]={ bidder: i+1, offer: 0 }
      }
      return {...state, graphData: graphicalDataReset}
    case CALCULATE_GRAPH_DATA_FIRST_CALL:
      let graphicalData= state.graphData
      for (let i = 0; i < UserItemsNum; i++) {
        if (i<action.payload.first_call_offers.length) {
         graphicalData[i]={ bidder: i+1, offer: Number(action.payload.first_call_offers[i].price) }
        }
      }
      return {...state, graphData: graphicalData}
    case RESET_GRAPH_DATA_SECOND_CALL:
      let graphicalData_start_second_call = []
      for (let i = 0; i < action.payload ; i++) {
        graphicalData_start_second_call.push({bidder: i+1, offer:0})
      }
      return {...state, graphData: graphicalData_start_second_call}
    case CALCULATE_GRAPH_DATA_SECOND_CALL:
      let graphicalDataSecondCall= state.graphData
      for (let i = 0; i < state.graphData.length; i++) {
        if (action.payload[i].price_second_call !=='awaiting') {
         graphicalDataSecondCall[i]={ bidder: i+1, offer: action.payload[i].price_second_call }
       } else {
         graphicalDataSecondCall[i]={ bidder: i+1, offer: action.payload[i].price_first_call }
       }
      }
      return {...state, graphData: graphicalDataSecondCall}
    case RESET_CHOSEN_BIDDERS:
      return {...state, chosenBidders: action.payload }
    case RESET_CHOSEN_OFFERS:
      return {...state, chosenOffers: action.payload }
    case ADD_CHOSEN_BIDDER:
      return {...state, chosenBidders: [...state.chosenBidders, action.payload]}
    case ADD_CHOSEN_OFFER:
      return {...state, chosenOffers: [...state.chosenOffers, action.payload]}
    case SELECT_WINNER:
      return {...state, chosenBidders: [action.payload.bidderIndex],
                        chosenWinningOffer: action.payload.second_call_offer_id }
    case SENT_WINNER_SELECTION_OK:
      return {...state, showModalWinnerSelected: true}
    case REMOVE_CHOSEN_BIDDER:
      let newChArray = state.chosenBidders
      let index = newChArray.indexOf(action.payload)
      newChArray.splice(index,1)
      return {...state, chosenBidders: newChArray}
    case REMOVE_CHOSEN_OFFER:
      let newOfArray = state.chosenOffers
      let indice = newOfArray.indexOf(action.payload)
      newOfArray.splice(indice,1)
      return {...state, chosenOffers: newOfArray}
    case MODAL_JOIN_BID:
      return {...state, modalJoinBid: {show: action.payload.show,
                                       bid: action.payload.bid,
                                       ref: action.payload.ref,
                                       model: action.payload.model,
                                       price: action.payload.price,
                                       fromNotification: action.payload.fromNotification,
                                       raise_price: action.payload.raise_price,
                                       offer_before_relaunch: action.payload.first_offer_in_case_of_relaunch} }
    case TO_PAY:
      return {...state, paymentData: action.payload }
    case 'RESET_PAYMENT_STATE':
      return {...state, paymentData: action.payload }
    case GET_PAYMENT_AMOUNTS:
      return {...state, amounts: action.payload }
    default:
      return state
  }
}
