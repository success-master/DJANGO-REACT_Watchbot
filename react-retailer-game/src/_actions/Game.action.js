import { LOAD_LATEST_ACTIVITIES_OK,
         //LOAD_MY_CREATED_ACTIVITIES_OK,
         //LOAD_MY_OFFER_ACTIVITIES_OK,
         //LOAD_MY_FOLLOW_ACTIVITIES_OK,
         //LOAD_SCHEDULED_PUT_OK,
         LOAD_SCHEDULED_CALL_OK,
         //LOAD_REFERENCE_MY_ACTIVITIES_OK,
         //LOAD_REFERENCE_OTHER_ACTIVITIES_OK,
         LOAD_RETAILER_LIVE_PUTS_OK,
         LOAD_RETAILER_JOINED_LIVE_CALLS_OK,
         LOAD_MY_MATCHED_TRADES_OK,
         LOAD_MY_FAILED_TRADES_OK,
         LOAD_COMPETITORS_PUT_OK,
         LOAD_ALL_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK,
         LOAD_CUSTOMER_MY_LIVE_CALLS_OK } from '../_actions/Activities.action'
import { SELECT_NOTIFICATIONS_ESSENTIAL } from '../_actions/Notifications.action'

import { LOAD_CURRENT_BID,
         RESET_GRAPH_DATA_SECOND_CALL,
         CALCULATE_GRAPH_DATA_SECOND_CALL,
         updateGraphDataOnUpdate } from '../_actions/Bids.action'
import { isAuctionLive, isAuctionMatched } from '../_utilities/auctions'

export const GAME_FIRST_SEL_TIME = 120

export function StartGame(appUser) {

  return function(dispatch, getState) {
    if (!getState().gameInfo.dashboardLodaded) {
      let fakeNotificationsMineImportant = require("../_game/notificationsMineImportant.json")
      dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL , payload: fakeNotificationsMineImportant })

      let fakeInprogressTrade = require("../_game/createFakeMyTrade.js")('inProgress', null, 0, appUser === 'retailer' ? "put" : "call" )
      let fakeFirstCallDemo = require("../_game/createFakeFirstCallDemo.js")(fakeInprogressTrade.time_remain, fakeInprogressTrade.price)
      dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: fakeInprogressTrade }) //put
      dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS_FIRST_CALL_DEMO" , payload: fakeFirstCallDemo })

      let fakeOthersTrade = require("../_game/createFakeOthersTrade.js")(appUser === 'retailer' ? "call" : "put")
      dispatch({type: "GAME_STORE_FAKE_OTHERS_TRADE" , payload: fakeOthersTrade })

      dispatch(GameDashboardUpdate(process.env.REACT_APP_USER))

      fakeFirstCallDemo.randomProgressionTimeSec.forEach(function(timing, index) {
        setTimeout(function(){
          dispatch({type: "GAME_UPDATE_MY_TRADE_IN_PROGRESS_FIRST_CALL_OFFERS", payload: fakeFirstCallDemo.fakeFirstCallOffers[index]})
          if (getState().userInfo.currentPage === 'bid') {
            dispatch(GameBidPageUpdate(process.env.REACT_APP_USER))
          }
         }, timing*1000);

      });
    }
  }
}

export function GameDashboardUpdate(appUser) {
  return function(dispatch, getState) {
    let myTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)
    let myTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
    let fakeOthersTrade = Object.assign({}, getState().gameInfo.fakeOthersTrade)

    let allTradesInDashboard = require("../_game/latestTrades.js")()
    let myOldFakeCreatedTrades = require("../_game/myTrades.js")()
    let myOldFakeFollowedActivities = require("../_game/myFollow.js")()
    let myFakeScheduledPut = require("../_game/scheduledPut.js")()

    let rLivePuts = require("../_game/r_livePuts.js")()
    let myFakeScheduledCall = require("../_game/scheduledCall.js")()
    let rJoinedLiveCalls = require("../_game/r_joinedLiveCalls.js")()
    let rcMatchedTrades = require("../_game/rc_matchedTrades.js")()
    let rcFailedTrades = require("../_game/rc_failedTrades.js")()
    let rCompetitorsPut = require("../_game/r_competitorsPut.js")()

    let allLivePuts = require("../_game/allLivePuts.js")()
    let cMyWatchlistLivePuts = require("../_game/c_myWatchlistLivePuts.js")()
    let cMyJoinedLivePuts = require("../_game/c_myJoinedLivePuts.js")()
    let cMyLiveCalls = require("../_game/c_myLiveCalls.js")()

    /* Aggiunge prima fake Others Trade */
    allTradesInDashboard.unshift(fakeOthersTrade)
    let myOldFakeOffersTrades = require("../_game/myOffers.js")()
    if (fakeOthersTrade.joined_by_this_user === true) {
      myOldFakeOffersTrades.unshift(fakeOthersTrade)
      if (isAuctionLive(fakeOthersTrade.status) && appUser === 'retailer') { rJoinedLiveCalls.results.unshift(fakeOthersTrade) }
      if (isAuctionLive(fakeOthersTrade.status) && appUser === 'customer') { cMyJoinedLivePuts.results.unshift(fakeOthersTrade) }

      if (isAuctionMatched(fakeOthersTrade)) { rcMatchedTrades.results.unshift(fakeOthersTrade) }
    }
    //dispatch({type: LOAD_MY_OFFER_ACTIVITIES_OK , payload: myOldFakeOffersTrades })

    if (appUser === 'retailer' && isAuctionLive(fakeOthersTrade.status)) {
        myFakeScheduledCall.results.unshift(fakeOthersTrade)
    }

    if (appUser === 'customer' && isAuctionLive(fakeOthersTrade.status)) {
        allLivePuts.results.unshift(fakeOthersTrade)
        cMyWatchlistLivePuts.results.unshift(fakeOthersTrade)
    }

    /* Poi finte My Trades */
    if (Object.keys(myTradeCreated).length === 0) {
      allTradesInDashboard.unshift(myTradeInProgress)
      myOldFakeCreatedTrades.unshift(myTradeInProgress)
      myOldFakeFollowedActivities.unshift(myTradeInProgress)
      if (myTradeInProgress.status !== 'decayed_game') {
        myFakeScheduledPut.results.unshift(myTradeInProgress)
        rLivePuts.results.unshift(myTradeInProgress)
        cMyLiveCalls.results.unshift(myTradeInProgress)
      } else {
        rcFailedTrades.results.unshift(myTradeInProgress)
      }
    } else {
      allTradesInDashboard.unshift(myTradeCreated, myTradeInProgress)
      myOldFakeCreatedTrades.unshift(myTradeCreated, myTradeInProgress)
      myOldFakeFollowedActivities.unshift(myTradeCreated, myTradeInProgress)
      if (myTradeInProgress.status !== 'decayed_game') {
        myFakeScheduledPut.results.unshift(myTradeInProgress)
        rLivePuts.results.unshift(myTradeInProgress)
        cMyLiveCalls.results.unshift(myTradeInProgress)
      } else {
        rcFailedTrades.results.unshift(myTradeInProgress)
      }
      if (myTradeCreated.status !== 'decayed_game') {
        myFakeScheduledPut.results.unshift(myTradeCreated)
        rLivePuts.results.unshift(myTradeCreated)
        cMyLiveCalls.results.unshift(myTradeCreated)
      } else {
        rcFailedTrades.results.unshift(myTradeCreated)
      }
    }

    dispatch({type: LOAD_LATEST_ACTIVITIES_OK , payload: allTradesInDashboard })
    //dispatch({type: LOAD_MY_CREATED_ACTIVITIES_OK, payload: myOldFakeCreatedTrades })
    //dispatch({type: LOAD_MY_FOLLOW_ACTIVITIES_OK , payload: myOldFakeFollowedActivities })
    //dispatch({type: LOAD_SCHEDULED_PUT_OK , payload: myFakeScheduledPut })

    if (appUser === 'retailer') {
      dispatch({type: LOAD_RETAILER_LIVE_PUTS_OK , payload: rLivePuts })
      dispatch({type: LOAD_SCHEDULED_CALL_OK , payload: myFakeScheduledCall })
      dispatch({type: LOAD_RETAILER_JOINED_LIVE_CALLS_OK, payload: rJoinedLiveCalls })
      dispatch({type: LOAD_COMPETITORS_PUT_OK, payload: rCompetitorsPut })
    } else {
      dispatch({type: LOAD_ALL_LIVE_PUTS_OK, payload: allLivePuts })
      dispatch({type: LOAD_CUSTOMER_MY_WATCHLIST_LIVE_PUTS_OK, payload: cMyWatchlistLivePuts })
      dispatch({type: LOAD_CUSTOMER_MY_JOINED_LIVE_PUTS_OK, payload: cMyJoinedLivePuts })
      dispatch({type: LOAD_CUSTOMER_MY_LIVE_CALLS_OK, payload: cMyLiveCalls })
    }

    dispatch({type: LOAD_MY_MATCHED_TRADES_OK, payload: rcMatchedTrades })
    dispatch({type: LOAD_MY_FAILED_TRADES_OK, payload: rcFailedTrades })

  }
}

export function GameBidPageUpdate(appUser) {
  return function(dispatch, getState) {
    if (getState().bidInfo.currentBidDetails.id === 500) {
      //sto visualizzando trade di default già presente
      let myTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
      dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeInProgress})
      dispatch(updateGraphDataOnUpdate(myTradeInProgress))
    } else {
      //sto visualizzando nuova trade creata
      let myTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)
      dispatch({type: "GAME_LOAD_CURRENT_BID", payload: myTradeCreated})
      dispatch(updateGraphDataOnUpdate(myTradeCreated))
    }
  }
}

/*
export function GameReferencePageUpdate(refId) {
  return function(dispatch, getState) {

    let myTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)
    let myTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
    let fakeOthersTrade = Object.assign({}, getState().gameInfo.fakeOthersTrade)

    let fakeReferencesMyActivities = []
    if (fakeOthersTrade.reference.id === refId) {
      fakeReferencesMyActivities = [ ...fakeReferencesMyActivities, fakeOthersTrade]
    }

    if (Object.keys(myTradeCreated).length > 0) {
      if (myTradeCreated.reference.id === refId) {
        fakeReferencesMyActivities = [ ...fakeReferencesMyActivities, myTradeCreated]
      }
    }

    if (myTradeInProgress.reference.id === refId) {
      fakeReferencesMyActivities = [ ...fakeReferencesMyActivities, myTradeInProgress]
    }

    dispatch({ type: LOAD_REFERENCE_MY_ACTIVITIES_OK, payload: fakeReferencesMyActivities })

    let referenceOptions = Object.assign({}, getState().referenceInfo.referenceData.selectedOption)
    let fakeReferencesOtherActivities = require("../_game/referencesOtherActivities.js")(referenceOptions)
    dispatch({type: LOAD_REFERENCE_OTHER_ACTIVITIES_OK, payload: fakeReferencesOtherActivities})

  }
}
*/

export function GameUpdateDaemon(gameTimePassed, timeSecondCall, appUser) {

    return function(dispatch, getState) {
      let updateTradeStatus = function(tradeObj, gameTimePassed, fakeTradeKind ) {
        switch(tradeObj.status) {
          case "first_call_open":
            tradeObj.time_remain -= gameTimePassed //seconds
            if (tradeObj.time_remain<=0) {
              tradeObj.status = "first_call"
              tradeObj.time_remain = 60
              //tradeObj.time_remain = 6000000
            }
            break
          case "first_call":
            tradeObj.time_remain -= gameTimePassed //seconds
            if (tradeObj.time_remain<=0) {
              if (fakeTradeKind === (appUser === 'retailer' ? "put" : "call")) {

                tradeObj.status = "first_call_selection"
                tradeObj.time_remain = GAME_FIRST_SEL_TIME
                //tradeObj.time_remain = 6000000
              } else {
                //fake Other Trade non si azzera mai, ricreiamola
                if (!tradeObj.joined_by_this_user) {
                  let fakeOthersTrade = require("../_game/createFakeOthersTrade.js")()
                  tradeObj.time_remain = fakeOthersTrade.time_remain
                } else {
                  tradeObj.status = "first_call_selection"
                  tradeObj.time_remain = 20
                  //tradeObj.time_remain = 2000000
                }

              }

            }
            break
          case "first_call_selection":
            tradeObj.time_remain -= gameTimePassed //seconds
            if (tradeObj.time_remain<=0) {
              if (fakeTradeKind === (appUser === 'retailer' ? "put" : "call")) {

                if (tradeObj.game_proceed_to_second_call) {

                  tradeObj.status = "second_call"
                  tradeObj.time_remain = 60

                  dispatch(GameSecondCallStarting(tradeObj.id , tradeObj.game_bidders_array, tradeObj.game_relaunch_order_array, tradeObj.game_second_call_on_goingFutureOrders))

                } else {
                  tradeObj.status = "decayed_game"
                  tradeObj.time_remain = 0
                  //tradeObj.time_remain = 2000000
                }


              } else {
                tradeObj.status = "second_call"
                tradeObj.first_call_selection_for_this_user = true
                tradeObj.time_remain = timeSecondCall
                //tradeObj.time_remain = 2000000

              }
            }
            break
          case 'second_call_open':
            break
          case 'second_call':
            tradeObj.time_remain -= gameTimePassed //seconds
            if (tradeObj.time_remain<=0) {
              tradeObj.status = "second_call_selection"
              if (fakeTradeKind === (appUser === 'retailer' ? "put" : "call")) {
                tradeObj.time_remain = 60
                //tradeObj.time_remain = 6000000
              } else {
                tradeObj.time_remain = 30
                //tradeObj.time_remain = 3000000
              }
            }
            break
          case 'second_call_selection':
            tradeObj.time_remain -= gameTimePassed //seconds
            if (tradeObj.time_remain<=0) {
              tradeObj.time_remain = 0
              //tradeObj.time_remain = 2000000
              if (fakeTradeKind === (appUser === 'retailer' ? "put" : "call")) {
                tradeObj.status = "decayed_game"

              } else {
                tradeObj.status = "winner_selected"
                tradeObj.won_by_this_user = true
                tradeObj.time_remain = "1210117.481053"
              }
            }
            break
          case 'winner_selected':
            break
          default:
        }
        return tradeObj
      }

      let myTradeInProgressPrev = Object.assign({}, getState().gameInfo.myTradeInProgress)
      let myTradeCreatedPrev = Object.assign({}, getState().gameInfo.myCreatedTrade)
      let fakeOthersTradePrev = Object.assign({}, getState().gameInfo.fakeOthersTrade)

      let timeSecondCall = 60
      let myTradeInProgress = updateTradeStatus(myTradeInProgressPrev, gameTimePassed, appUser === 'retailer' ? "put" : "call", timeSecondCall)
      let myTradeCreated = updateTradeStatus(myTradeCreatedPrev, gameTimePassed, appUser === 'retailer' ? "put" : "call", timeSecondCall)
      let fakeOthersTrade = updateTradeStatus(fakeOthersTradePrev, gameTimePassed, appUser === 'retailer' ? "call" : "put", timeSecondCall)

      if ( myTradeCreated.status === "decayed_game" || myTradeCreated.status === "winner_selected" ) {
        dispatch({type: "GAME_CAN_CREATE_TRADE" , payload: true })
      }
      dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: myTradeInProgress })
      dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: myTradeCreated })
      dispatch({type: "GAME_STORE_FAKE_OTHERS_TRADE" , payload: fakeOthersTrade })

      dispatch(GameDashboardUpdate(process.env.REACT_APP_USER))

      /*
      if (fakeCallTrade.joined_by_this_user && fakeCallTrade.status === "second_call" && fakeCallTrade.time_remain === timeSecondCall ) {
        let payload = {
          "count": 1,
          "next": null,
          "previous": null,
          "results": [
            {
              "id": 1001,
              "notification_type": 3,
              "get_type": "first_call_user_selected",
              "auction": {
                "id": 499,
                "status": "second_call",
                "time_remain": "487.602557",
                "price": "5100.00"
              },
              "reference": 1,
              "reference_string": "Cartier Tank Solo W5200004",
              "new_status": null,
              "creation_date": "1544707619"
            }
          ]
        }

        dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL , payload: payload.results })
      }

      if (fakeCallTrade.won_by_this_user === true && getState().gameInfo.winnerCallSelectedNotificationSent === false) {
        let payload = {
          "count": 1,
          "next": null,
          "previous": null,
          "results": [
            {
              "id": 1002,
              "notification_type": 4,
              "get_type": "winner_selected",
              "auction": {
                "id": 499,
                "status": "winner_selected",
                "time_remain": "487.602557",
                "price": "5100.00"
              },
              "reference": 1,
              "reference_string": "Cartier Tank Solo W5200004",
              "new_status": null,
              "creation_date": "1544707619"
            }
          ]
        }

        dispatch({type: "GAME_WINNER_CALL_SELECTED_NOTIFICATION_SENT" , payload: true })
        dispatch({type: SELECT_NOTIFICATIONS_ESSENTIAL , payload: payload.results })
      }

      */

      if (getState().userInfo.currentPage === 'bid') {
        dispatch(GameBidPageUpdate(process.env.REACT_APP_USER))
      }
    }
}

export function GameFirstCallSelection2SecondCall(auctionId, offersArray, raise_price, biddersArray) {
  return function(dispatch, getState) {
    let MyTradeViewed
    if (auctionId === 500) { MyTradeViewed=Object.assign({}, getState().gameInfo.myTradeInProgress) }
      else { MyTradeViewed=Object.assign({}, getState().gameInfo.myCreatedTrade) }
    if (raise_price>0 && raise_price!=null) {
      MyTradeViewed.raise_price = raise_price
    }


    let relaunchOrderArray = []
    for (let i = 0; i < biddersArray.length ; i++) {
      relaunchOrderArray.push(i);
    }
    relaunchOrderArray=require("../_utilities/shuffle.js")(relaunchOrderArray)
    console.log(relaunchOrderArray)

    /* create second_call_on_going */
    biddersArray.sort() //mantiene ordine bidders in base a prima call
    let second_call_on_going = []
    let rilancianoIn = biddersArray.length
    let second_call_on_goingFutureOrders = []
    biddersArray.forEach(function(bidderIndex, index) {
      console.log(bidderIndex);
      console.log(MyTradeViewed.first_call_offers[bidderIndex])
      let Obj = {
        "user_id": MyTradeViewed.first_call_offers[bidderIndex].user_id,
        "user_country": MyTradeViewed.first_call_offers[bidderIndex].user_country,
        "user_city": MyTradeViewed.first_call_offers[bidderIndex].user_city,
        "price_first_call": parseInt(MyTradeViewed.first_call_offers[bidderIndex].price, 10),
        "price_second_call": "awaiting",
        "first_call_offer_id": MyTradeViewed.first_call_offers[bidderIndex].offer_id,
        "second_call_offer_id": null
      }
      second_call_on_going.push(Obj)
      second_call_on_goingFutureOrders.push({...Obj, second_call_offer_id: 900+relaunchOrderArray[index]})
    });

    MyTradeViewed.second_call_on_going = second_call_on_going
    MyTradeViewed.game_proceed_to_second_call = true
    MyTradeViewed.game_bidders_array = biddersArray
    MyTradeViewed.game_relaunch_order_array = relaunchOrderArray
    MyTradeViewed.game_second_call_on_goingFutureOrders = second_call_on_goingFutureOrders

    if (auctionId === 500) { dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: MyTradeViewed }) }
      else { dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: MyTradeViewed }) }

      /*
      setTimeout(function() {
        dispatch(GameSecondCallStarting(auctionId, biddersArray, relaunchOrderArray, second_call_on_goingFutureOrders))
      }, MyTradeViewed.time_remain * 1000)
      */

  }
}


export function GameSecondCallStarting(auctionId, biddersArray, relaunchOrderArray, second_call_on_goingFutureOrders) {
  return function(dispatch, getState) {


    let MyTradeViewed
    if (auctionId === 500) { MyTradeViewed=Object.assign({}, getState().gameInfo.myTradeInProgress) }
      else { MyTradeViewed=Object.assign({}, getState().gameInfo.myCreatedTrade) }

    /*
    MyTradeViewed.status = "second_call"
    MyTradeViewed.time_remain = 60

    if (auctionId === 500) { dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: MyTradeViewed }) }
      else { dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: MyTradeViewed }) }
    */

    dispatch({type: LOAD_CURRENT_BID, payload: MyTradeViewed})
    dispatch({type: RESET_GRAPH_DATA_SECOND_CALL, payload: MyTradeViewed.second_call_on_going.length})
    dispatch({type: CALCULATE_GRAPH_DATA_SECOND_CALL, payload: MyTradeViewed.second_call_on_going})

    let fakeSecondCallDemo = require("../_game/createFakeSecondCallDemo.js")(MyTradeViewed.time_remain, MyTradeViewed.price, MyTradeViewed.raise_price, second_call_on_goingFutureOrders, relaunchOrderArray )
    dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS_SECOND_CALL_DEMO" , payload: fakeSecondCallDemo })
    if (auctionId === 500) { dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS_SECOND_CALL_DEMO" , payload: fakeSecondCallDemo }) }
      else { dispatch({type: "GAME_STORE_MY_TRADE_CREATED_SECOND_CALL_DEMO" , payload: fakeSecondCallDemo }) }

    let rilancianoIn = biddersArray.length
    /* Time out per invio offerte in real time */
    if (auctionId === 500) {
      biddersArray.forEach(function(bidderIndex, index) {
        setTimeout(function(){
          dispatch({type: "GAME_UPDATE_MY_TRADE_IN_PROGRESS_SECOND_CALL_OFFERS", payload: { offerToReplace: fakeSecondCallDemo.fakeSecondCallOffers[relaunchOrderArray[index]], itemNum: relaunchOrderArray[index] }})
          let MyTradeInProgress = Object.assign({}, getState().gameInfo.myTradeInProgress)
          if (index===rilancianoIn-1) {
             MyTradeInProgress.all_second_call_offer_completed = true
             dispatch({type: "GAME_STORE_MY_TRADE_IN_PROGRESS" , payload: MyTradeInProgress})
          }
          if (getState().userInfo.currentPage === 'bid' && getState().bidInfo.currentBidDetails.id === 500) {
              //sto visualizzando trade di default già presente
              dispatch({type: "GAME_LOAD_CURRENT_BID", payload: MyTradeInProgress})
              dispatch(updateGraphDataOnUpdate(MyTradeInProgress))

          }
        }, fakeSecondCallDemo.randomProgressionTimeSec[index]*1000);
      })
    } else {
      biddersArray.forEach(function(bidderIndex, index) {
        setTimeout(function(){

          dispatch({type: "GAME_UPDATE_MY_TRADE_CREATED_SECOND_CALL_OFFERS", payload: { offerToReplace: fakeSecondCallDemo.fakeSecondCallOffers[relaunchOrderArray[index]], itemNum: relaunchOrderArray[index] }})
          let MyTradeCreated = Object.assign({}, getState().gameInfo.myCreatedTrade)

          if (index===rilancianoIn-1) {

             MyTradeCreated.all_second_call_offer_completed = true
             dispatch({type: "GAME_STORE_MY_TRADE_CREATED" , payload: MyTradeCreated})
          }
          if (getState().userInfo.currentPage === 'bid' && getState().bidInfo.currentBidDetails.id === 501) {
              //sto visualizzando trade di default già presente
              dispatch({type: "GAME_LOAD_CURRENT_BID", payload: MyTradeCreated})
              dispatch(updateGraphDataOnUpdate(MyTradeCreated))

          }

        }, fakeSecondCallDemo.randomProgressionTimeSec[index]*1000);
      })
    }

  }
}
