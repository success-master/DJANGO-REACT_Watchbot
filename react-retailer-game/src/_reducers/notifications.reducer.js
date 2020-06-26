import { LOAD_NOTIFICATIONS_MINE_NEW_OK,
        LOAD_NOTIFICATIONS_MINE_READ_OK,
        SET_NOTIFICATIONS_MINE_READ_OK,
        LOAD_NOTIFICATIONS_FOLLOW_NEW_OK,
        LOAD_NOTIFICATIONS_FOLLOW_READ_OK,
        SET_NOTIFICATIONS_FOLLOW_READ_OK,
        SELECT_NOTIFICATIONS_ESSENTIAL,
        SHOW_NOTIFICATIONS_ESSENTIAL
        } from '../_actions/Notifications.action'
import { RELOAD_BID_NOTIFICATIONS } from '../_actions/Bids.action'

//define the initial state
const initialState = {
  reloadBidNotifications: false,
  notificationsEssential: [],
  showNotificationsEssential: false
}

export default function notificationReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_NOTIFICATIONS_MINE_NEW_OK:
      return {...state, notificationsMineNew: action.payload }

    case SELECT_NOTIFICATIONS_ESSENTIAL:
    /*  let Important_notifications = []
      action.payload.results.forEach(function(element) {
        switch (element.get_type) {
          case 'winner_selected':
            Important_notifications.push({type: element.get_type, auction: element.auction, reference: element.reference_string, msg:"You Won!", color: "#ff0000"})
            break
          case 'first_call_user_selected':
            Important_notifications.push({type: element.get_type, auction: element.auction, reference: element.reference_string, msg:"You have been selected for second call!", color: "#ff6600"})
            break
          default:
        }
      }) */
      let showNotificationsEssential = action.payload.length>0 ? true: false
      return {...state, notificationsEssential: action.payload, showNotificationsEssential: showNotificationsEssential }

    case SHOW_NOTIFICATIONS_ESSENTIAL:
      return { ...state, showNotificationsEssential: action.payload }
    case LOAD_NOTIFICATIONS_MINE_READ_OK:
      return {...state, notificationsMineRead: action.payload }
    case SET_NOTIFICATIONS_MINE_READ_OK:
      return state
    case LOAD_NOTIFICATIONS_FOLLOW_NEW_OK:
      return {...state, notificationsFollowNew: action.payload }
    case LOAD_NOTIFICATIONS_FOLLOW_READ_OK:
      return {...state, notificationsFollowRead: action.payload }
    case SET_NOTIFICATIONS_FOLLOW_READ_OK:
      return state
    case RELOAD_BID_NOTIFICATIONS:
      return {...state, reloadBidNotifications: action.payload }
    default:
      return state
  }
}
