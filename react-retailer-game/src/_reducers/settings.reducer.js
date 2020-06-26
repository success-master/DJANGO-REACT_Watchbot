import { LOAD_AUTH_OK,
         SENT_FIREBASE_TOKEN_OK,
         SUBSCRIBED_TO_TOPIC,
         LOAD_SETTINGS_PROFILE_OK,
         WRITE_SETTINGS_PROFILE_OK,
         SET_PAGE,
         SET_PANEL,
         SET_SAFARI,
         SET_PANEL_LEFT_OPEN,
         SET_PANEL_RIGHT_OPEN,
         CREDIT_CARD_LIST,
         SET_CREDIT_CARD } from '../_actions/Settings.action'
//define the initial state
const initialState = {
  isAuthenticated: false,
  isFirebaseTokeSent: false,
  isTopicSubscribed: false,
  isSafari: false,
  userSettingsProfile : {},
  disableSaveSettings: true,
  currentPage: 'dashboard',
  currentPanel: '',
  mustUpd: false,
  paginationMaxLines: { schedules: 100 },
  paginationCurrent: { schedulePutPage: 1, scheduleCallPage: 1 },
  isPaneOpenLeft: false,
  isPaneOpenRight: false
}

export default function userInfoReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_AUTH_OK:
      return {...state, isAuthenticated: action.payload}
    case SENT_FIREBASE_TOKEN_OK:
      return {...state, isFirebaseTokeSent: action.payload}
    case SUBSCRIBED_TO_TOPIC:
      return {...state, isTopicSubscribed: true}
    case LOAD_SETTINGS_PROFILE_OK:
      return {...state, userSettingsProfile: action.payload }
    case WRITE_SETTINGS_PROFILE_OK:
      return {...state, userSettingsProfile: action.payload }
    case SET_PAGE:
      return {...state, currentPage: action.payload }
    case SET_PANEL:
      return {...state, currentPanel: action.payload }
    case SET_SAFARI:
      return {...state, isSafari: action.payload }
    case SET_PANEL_LEFT_OPEN:
      return {...state, isPaneOpenLeft: action.payload }
    case SET_PANEL_RIGHT_OPEN:
      return {...state, isPaneOpenRight: action.payload }
    case CREDIT_CARD_LIST:
      return {...state, userSettingsProfile: action.payload}
    case SET_CREDIT_CARD:
      return {...state, userSettingsProfile: action.payload}
    default:
      return state
  }
}
