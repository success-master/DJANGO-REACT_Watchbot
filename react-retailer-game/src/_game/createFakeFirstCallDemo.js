function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}

module.exports = function(time_remain_iniziale, price){
  let numTestBidders= getRandomInt(13,35)
  let city_countries=[["Rome","Italy"], ["Paris","France"], ["London","UK"], ["Munich","Germany"], ["Berlin","Germany"],
["Milan","Italy"], ["Brixton","UK"], ["Amsterdam","Netherland"], ["Bruges","Belgium"], ["Oslo","Norway"], ["Moskow","Russia"], ["Bruxelles","Belgium"], ["Brixton","UK"]
]

  let nextTime = 5

  let maxRandomNextTime = Math.floor(time_remain_iniziale/numTestBidders)

  let randomProgressionTimeSec = []
  let fakeFirstCallOffers = []

  for (let i = 0; i < numTestBidders; i++) {
    let random_citycountry=city_countries[getRandomInt(0,city_countries.length-1)]
    let maxScartoOffertaSimulata = 2 //per i retailer quando user è customer
    if (process.env.REACT_APP_USER === 'retailer') {
      maxScartoOffertaSimulata = Math.floor(price/200)
    }

    let priceOffered = price - getRandomInt(0,maxScartoOffertaSimulata)*100
    let offerObj = {
      "offer_id": 800+i,
      "user_id": 4+i,
      "user_city": random_citycountry[0],
      "user_country": random_citycountry[1],
      "price": priceOffered.toString(),
      "call_number": "first_call"
    }

    randomProgressionTimeSec.push(nextTime)

    if (getRandomInt(0,100)>20) { nextTime += getRandomInt(1,maxRandomNextTime) }

    fakeFirstCallOffers.push(offerObj)
  }

  let fakeFirstCallDemo = {
   "added": 0,
   "numTestBidders": numTestBidders,
   "randomProgressionTimeSec": randomProgressionTimeSec,
   "fakeFirstCallOffers" : fakeFirstCallOffers
  }
  return fakeFirstCallDemo
}
