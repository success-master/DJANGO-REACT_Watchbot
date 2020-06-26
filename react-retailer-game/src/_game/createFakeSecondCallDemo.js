function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}

module.exports = function(time_remain_iniziale, price, raise_price, second_call_on_going, relaunchOrderArray){
  let numTestBiddersSurvived= second_call_on_going.length
  let finalSuggestedPrice = (raise_price != null && raise_price>0 ? raise_price : price)

  let nextTime = 5
  let maxRandomNextTime = Math.floor((time_remain_iniziale-nextTime)/numTestBiddersSurvived)

  let randomProgressionTimeSec = []
  let fakeSecondCallOffers = []

  //let maxScartoOffertaSimulata= Math.floor(finalSuggestedPrice/1000)
  let maxScartoOffertaSimulata = 5 //%

  for (let i = 0; i < numTestBiddersSurvived; i++) {
    let offerObj = second_call_on_going[i]
    let relaunchOrNot = getRandomInt(1,100)
    if (relaunchOrNot>0) {
      let priceOffered = Number(finalSuggestedPrice) - getRandomInt(0,maxScartoOffertaSimulata)*100
      if (priceOffered < offerObj.price_first_call) {
        priceOffered = offerObj.price_first_call
      }
      offerObj.price_second_call = priceOffered
    }

    randomProgressionTimeSec.push(nextTime)

    if (getRandomInt(0,100)>20) { nextTime += getRandomInt(1,maxRandomNextTime) }

    fakeSecondCallOffers.push(offerObj)
  }

  let fakeSecondCallDemo = {
   "numTestBiddersSurvived": numTestBiddersSurvived,
   "relaunchOrderArray": relaunchOrderArray,
   "randomProgressionTimeSec": randomProgressionTimeSec,
   "fakeSecondCallOffers" : fakeSecondCallOffers
  }
  return fakeSecondCallDemo
}
