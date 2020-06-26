import { PREFERENCE_CHANGE_LETTER,
         PREFERENCE_LOAD_BRANDS_TO_SHOW,
         PREFERENCE_CHANGE_BRAND,
         PREFERENCE_LOAD_REFS_TO_SHOW,
         PREFERENCE_CHANGE_REF
       } from '../_actions/WatchesPreferences.action'

const initialState = {
  letterBrand: 'A',
  brandsDisplayed: [
  ],
  brandSelected: {},
  refsDisplayed: [
  ],
  refSelected: 0
}

export default function watchesPreferencesReducer(state = initialState, action) {
  switch(action.type) {
    case PREFERENCE_CHANGE_LETTER:
      return {...state, letterBrand: String.fromCharCode(action.payload), brandSelected: '', refSelected: ''}
    case PREFERENCE_LOAD_BRANDS_TO_SHOW:
      return {...state, brandsDisplayed: action.payload}
    case PREFERENCE_CHANGE_BRAND:
      return {...state, brandSelected: action.payload, refSelected: ''}
    case PREFERENCE_LOAD_REFS_TO_SHOW:
      return {...state, refsDisplayed: action.payload}
    case PREFERENCE_CHANGE_REF:
      return {...state, refSelected: action.payload}
    default:
      return state
  }
}
