import React from 'react';
import ReactDOM from 'react-dom';
import App from './App-auth';

import { combineReducers, applyMiddleware, createStore } from 'redux';
//import { RSAA } from 'redux-api-middleware'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import { logger } from 'redux-logger';
import userInfoReducer from './_reducers/settings.reducer';
import watchgraphReducer from './_reducers/watchglist.reducer';
import activitiesListReducer from './_reducers/activitieslist.reducer';
import referenceInfoReducer from './_reducers/referenceinfo.reducer';
import bidInfoReducer from './_reducers/bid.reducer';
import modalReducer from './_reducers/modals.reducer';
import watchesPreferencesReducer from './_reducers/watchesPreferences.reducer';
import notificationsReducer from './_reducers/notifications.reducer';
import gameReducer from './_reducers/game.reducer';

import registerServiceWorker from './registerServiceWorker';

const retailerReducers = combineReducers({
  userInfo: userInfoReducer,
  referenceInfo: referenceInfoReducer,
  watchList: watchgraphReducer,
  activitiesList: activitiesListReducer,
  bidInfo: bidInfoReducer,
  modalInfo: modalReducer,
  watchesPreferencesInfo: watchesPreferencesReducer,
  notificationsInfo: notificationsReducer,
  gameInfo: gameReducer
});
const middleware=applyMiddleware(thunk, logger)
let store = createStore(
  retailerReducers, middleware/*,
  {
    watchList: [],
    userStore: null,
  },
  window.devToolsExtension && window.devToolsExtension() */
)

/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  }).catch(function(err) {
    console.log('Service worker registration failed, error:', err);
  });
}
*/

ReactDOM.render(<Provider store = { store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
