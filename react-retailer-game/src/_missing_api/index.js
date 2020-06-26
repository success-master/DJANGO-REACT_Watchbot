function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}

let numTestBidders= getRandomInt(7,21)
let testPrice = getRandomInt(10,200)

let countries=["Italy", "France", "United Kingdom", "Luxembourg", "Spain", "Germany", "Usa", "Japan", "China", "Panama", "Canada", "South Korea", "Russia", "Mexico", "Brazil", "Venezuela", "India", "Ireland", "Malta", "Monaco", "Andorra", "Sweden", "Finland"]
let testBidders=[]

for (var i = 0; i < numTestBidders; i++) {
  testBidders.push({"bidder": getRandomInt(1000,9999), "country": countries[getRandomInt(0,countries.length-1)], "offerUsd": testPrice*1000-testPrice*1000/5+getRandomInt(0,testPrice/2,5)*1000})
}

let testProgression=[
  { "state_with_final_bidders" : "bid_test_call_1_opening", "new_bidders_total": 0, "total_states_time": 10000, "state_time_remain": 10000, "note": "initial state" },
  { "state_with_final_bidders" : "bid_test_call_1_final", "new_bidders_total": 0, "total_states_time": 71000, "state_time_remain": 60000, "note": "initial changed state" },
]

var xtime=60000
var scostTime= Math.trunc(60000/numTestBidders)


for (var i = 1; i <= numTestBidders; i++) {
  var scostRandom= getRandomInt(0,3)*1000
  xtime=xtime-scostTime+scostRandom
  testProgression.push({ "state_with_final_bidders" : "bid_test_call_1_final", "new_bidders_total": i, "total_states_time": 71000, "state_time_remain": xtime },
)
}

testProgression.push({ "state_with_final_bidders" : "bid_test_call_1_selection", "new_bidders_total": numTestBidders, "total_states_time": 132000, "state_time_remain": 60000, "note": "initial changed state"  }
)

console.log( "random", testBidders, testProgression)

export const MISSING_API = {
  "settings": {
      "first_name": "Alessandro",
      "last_name": "Calastri",
      "gender": "male",
      "birth_date" : "1979-10-10",
      "email_login" : "alessandro@alessandro.it",
      "phone" : "340/0000000",
      "email_contact" : "alessandro@alessandro.it",
      "addresses" : [
        {
          "country" : "Italy",
          "address" : "Via Viali, 1",
          "zip" : "02100",
          "city" : "Milano",
          "state" : "MI",
          "preferred_billing_addr": true,
          "preferred_shipping_addr": true
        },
        {
          "country" : "France",
          "address" : "Via Viali, 2",
          "zip" : "02100",
          "city" : "Paris",
          "state" : "",
          "preferred_billing_addr": false,
          "preferred_shipping_addr": false
        }
      ]
  },
  "test":
    {
    "token": "8f4868",
    "price": 200000
    },
  "is-authenticated": {
    "is_authenticated": true,
    "token": "8f4868",
    "email": "test@test.com",
    "first_name": "M",
    "last_name": "B"
  },
  "searchable-watches": [
    {
      "value": "123456",
      "label": "Rolex 123456",
      "brand": "Rolex"
    },
    {
      "value": "789012",
      "label": "Lange 789012",
      "brand": "Lange"
    },
    {
      "value": "789032",
      "label": "Rolex 789032",
      "brand": "Rolex"
    }
  ],
  "watches": [
    {
      "ref": "760.032f",
      "brand": "Lange & Söhne",
      "suggestedPriceDollars" : 132000
    },
    {
      "ref": "1ATAS.U01A.C121S",
      "brand": "Arnold & Son",
      "suggestedPriceDollars" : 25000
    },
    {
      "ref": "720025",
      "brand": "Lange & Söhne",
      "suggestedPriceDollars" : 133000
    }
  ],
  "activities": [
    {
    "id": 5,
    "type": "put",
    "reference": {
      "id": 1,
      "reference": "H38525881",
      "model_name": "Jazzmaster Thinline Auto",
      "brand_name": "Hamilton"
    },
    "price": "790.00",
    "call_1_start_date": "1533632330",
    "call_1_end_date": "1533632333",
    "call_1_end_selection": "1533632335",
    "call_2_start_date": "1533632337",
    "call_2_end_date": "1533632339",
    "call_2_end_selection": "1533632341",
    "payment_expiry": "1533632343",
    "status": "first_call_open",
    "created_by_this_user": false,
    "winned_by_this_user": false
  },
  {
    "id": 6,
    "type": "call",
    "reference": {
      "id": 2,
      "reference": "H82305331",
      "model_name": "Khaki Navy Scuba Auto",
      "brand_name": "Hamilton"
    },
    "price": "690.00",
    "call_1_start_date": "1533633527",
    "call_1_end_date": "1533633528",
    "call_1_end_selection": "1533633531",
    "call_2_start_date": "1533633533",
    "call_2_end_date": "1533633534",
    "call_2_end_selection": "1533633536",
    "payment_expiry": "1533633538",
    "status": "second_call_selection",
    "created_by_this_user": true,
    "winned_by_this_user": false
  }
  ],
  "my_put_activities": [
    {
      "id": "0123",
      "step": "A",
      "ref": "234234",
      "model": "Lange",
      "descr": "1 call",
      "time": "8m"
    },
    {
      "id": "0901",
      "step": "C",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "12m",
      "created_by_this_user": true,
      "winned_by_this_user": false
    },
    {
      "id": "0678",
      "step": "A",
      "ref": "234234",
      "model": "Lange",
      "descr": "80.000 €",
      "time": "2h 8m"
    },
    {
      "id": "0901",
      "step": "C",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "2h 34m",
      "created_by_this_user": true,
      "winned_by_this_user": false
    }
  ],
  "reference_my_activities": [
    {
      "id": "my123",
      "step": "A",
      "ref": "234234",
      "model": "Lange",
      "descr": "1 call",
      "time": "8m"
    },
    {
      "id": "my1456",
      "step": "C",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    },
    {
      "id": "my1789",
      "step": "C",
      "ref": "234234",
      "model": "Lange",
      "descr": "90.000 €",
      "time": "8m"
    }
  ],
  "reference_other_activities": [
    {
      "id": "other123",
      "step": "A",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "1 call",
      "time": "8m"
    },
    {
      "id": "other1456",
      "step": "C",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    },
    {
      "id": "other1789",
      "step": "C",
      "tipo": "put",
      "ref": "234234",
      "model": "Lange",
      "descr": "90.000 €",
      "time": "8m"
    },
    {
      "id": "other1112",
      "step": "D",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "1 call",
      "time": "8m"
    },
    {
      "id": "other0345",
      "step": "V",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "1 call",
      "time": "8m"
    },
    {
      "id": "other0678",
      "step": "A",
      "tipo": "put",
      "ref": "234234",
      "model": "Lange",
      "descr": "80.000 €",
      "time": "8m"
    },
    {
      "id": "other0901",
      "step": "C",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    },
    {
      "id": "other0901",
      "step": "C",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    },
    {
      "id": "other0901",
      "step": "C",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    },
    {
      "id": "other0901",
      "step": "C",
      "tipo": "call",
      "ref": "234234",
      "model": "Lange",
      "descr": "100.000 €",
      "time": "8m"
    }
  ],
  "refhistoricaldata": [
    { "ref": "H38525881",
      "historicalData": [
        {
          "month": "01/17",
          "price": 790
        },
        {
          "month": "02/17",
          "price": 750
        },
        {
          "month": "03/17",
          "price": 770
        },
        {
          "month": "04/17",
          "price": 772
        },
        {
          "month": "05/17",
          "price": 780
        },
        {
          "month": "06/17",
          "price": 785
        },
        {
          "month": "07/17",
          "price": 800
        }
      ]
    },
    { "ref": "X2345234525",
      "historicalData": [
        {
          "month": "01/17",
          "price": 130000
        },
        {
          "month": "02/17",
          "price": 132000
        },
        {
          "month": "03/17",
          "price": 131500
        },
        {
          "month": "04/17",
          "price": 133000
        },
        {
          "month": "05/17",
          "price": 139000
        }
      ]
    },
    { "ref": "L3423472342",
      "historicalData": [
        {
          "month": "01/17",
          "price": 130000
        },
        {
          "month": "02/17",
          "price": 132000
        },
        {
          "month": "03/17",
          "price": 131500
        },
        {
          "month": "04/17",
          "price": 133000
        }
      ]
    },
    { "ref": "L3423472343",
      "historicalData": [
        {
          "month": "01/17",
          "price": 130000
        },
        {
          "month": "02/17",
          "price": 132000
        },
        {
          "month": "03/17",
          "price": 131500
        },
        {
          "month": "04/17",
          "price": 133000
        },
        {
          "month": "05/17",
          "price": 141000
        },
        {
          "month": "06/17",
          "price": 134000
        }
      ]
    },
    { "ref": "760.032f",
      "historicalData": [
        {
          "month": "01/17",
          "price": 130000
        },
        {
          "month": "02/17",
          "price": 132000
        },
        {
          "month": "03/17",
          "price": 131500
        },
        {
          "month": "04/17",
          "price": 133000
        },
        {
          "month": "05/17",
          "price": 139000
        },
        {
          "month": "06/17",
          "price": 134000
        },
        {
          "month": "10/17",
          "price": 139000
        }
      ]
    },
    { "ref": "1ATAS.U01A.C121S",
      "historicalData": [
        {
          "month": "04/17",
          "price": 25300
        },
        {
          "month": "05/17",
          "price": 24900
        },
        {
          "month": "06/17",
          "price": 24400
        },
        {
          "month": "07/17",
          "price": 24400
        },
        {
          "month": "08/17",
          "price": 24400
        },
        {
          "month": "09/17",
          "price": 24400
        },
        {
          "month": "10/17",
          "price": 20100
        }
      ]
    },
    { "ref": "720025",
      "historicalData": [
        {
          "month": "04/17",
          "price": 153000
        },
        {
          "month": "05/17",
          "price": 149000
        },
        {
          "month": "06/17",
          "price": 144000
        },
        {
          "month": "07/17",
          "price": 121000
        },
        {
          "month": "08/17",
          "price": 144000
        },
        {
          "month": "09/17",
          "price": 144000
        },
        {
          "month": "10/17",
          "price": 141000
        }
      ]
    }
  ],
  "bids": [
    {
      "id": "0678",
      "step": "A",
      "ref": "234234",
      "model": "Lange",
      "bidders": [
        {
          "bidder": "543234",
          "country": "Ita/Milano",
          "offerUsd": 125000
        },
        {
          "bidder": "543235",
          "country": "Fr/Paris",
          "offerUsd": 120000
        },
        {
          "bidder": "543235",
          "country": "Fr/Paris",
          "offerUsd": 120000
        }
      ],
      "time_remain": 10000
    }
  ],
  "bid_test_call_1_opening" : { "id": "XXXX", "step": "first_call_open", "ref":"234234", "suggestedPrice": testPrice*1000, "model":"Lange", "bidders":
    [
    ],
    "time_remain" : 12000 },
  "bid_test_call_1_final" : { "id": "XXXX", "step": "first_call", "ref":"234234", "suggestedPrice": testPrice*1000, "model":"Lange", "bidders": testBidders,
    "time_remain" : 12000 },
  "bid_test_call_1_selection" : { "id": "XXXX", "step": "first_call_selection", "ref":"234234", "suggestedPrice": testPrice*1000, "model":"Lange", "bidders": testBidders,
    "time_remain" : 60000 },
  "bid_test_progression": testProgression,
  "bid_0678_call_1_opening" : { "id": "0123", "step": "first_call_open", "ref":"234234", "suggestedPrice": 100000, "model":"Lange", "bidders":
    [
    ],
    "time_remain" : 12000 },
  "bid_0678_call_1_final" : { "id": "0123", "step": "first_call", "ref":"234234", "suggestedPrice": 100000, "model":"Lange", "bidders":
    [
      { "bidder": "543234", "country": "Italy", "offerUsd": 118000 },
      { "bidder": "543235", "country": "France", "offerUsd": 110000 },
      { "bidder": "543236", "country": "France", "offerUsd": 100000 },
      { "bidder": "543237", "country": "Germany", "offerUsd": 113000 },
      { "bidder": "543238", "country": "Spain", "offerUsd": 111000 },
      { "bidder": "543239", "country": "Usa", "offerUsd": 92000 },
      { "bidder": "543240", "country": "United Kingdom", "offerUsd": 113000 },
      { "bidder": "543241", "country": "France", "offerUsd": 105000 },
      { "bidder": "543242", "country": "Germany", "offerUsd": 119000 },
      { "bidder": "543243", "country": "Luxembourg", "offerUsd": 118000 },
      { "bidder": "543244", "country": "Usa", "offerUsd": 99000 }
    ],
    "time_remain" : 12000 },
  "bid_0678_call_1_selection" : { "id": "0123", "step": "first_call_selection", "ref":"234234", "suggestedPrice": 100000, "model":"Lange", "bidders":
    [
      { "bidder": "543234", "country": "Italy", "offerUsd": 118000 },
      { "bidder": "543235", "country": "France", "offerUsd": 110000 },
      { "bidder": "543236", "country": "France", "offerUsd": 100000 },
      { "bidder": "543237", "country": "Germany", "offerUsd": 113000 },
      { "bidder": "543238", "country": "Spain", "offerUsd": 111000 },
      { "bidder": "543239", "country": "Usa", "offerUsd": 92000 },
      { "bidder": "543240", "country": "United Kingdom", "offerUsd": 113000 },
      { "bidder": "543241", "country": "France", "offerUsd": 105000 },
      { "bidder": "543242", "country": "Germany", "offerUsd": 119000 },
      { "bidder": "543243", "country": "Luxembourg", "offerUsd": 118000 },
      { "bidder": "543244", "country": "Usa", "offerUsd": 99000 }
    ],
    "time_remain" : 60000 },
  "bid_0678_progression": [
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 3, "total_states_time": 43000, "state_time_remain": 43000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 4, "total_states_time": 43000, "state_time_remain": 39000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 5, "total_states_time": 43000, "state_time_remain": 35000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 6, "total_states_time": 43000, "state_time_remain": 32000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 7, "total_states_time": 43000, "state_time_remain": 29000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 8, "total_states_time": 43000, "state_time_remain": 22000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 9, "total_states_time": 43000, "state_time_remain": 20000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 10, "total_states_time": 43000, "state_time_remain": 15000 },
    { "state_with_final_bidders" : "bid_0678_call_1_final", "new_bidders_total": 11, "total_states_time": 43000, "state_time_remain": 12000 },
    { "state_with_final_bidders" : "bid_0678_call_1_selection", "new_bidders_total": 11, "total_states_time": 104000, "state_time_remain": 60000, "note": "initial changed state"  }
  ],
  "bid_0123_call_1_opening" : { "id": "0123", "step": "first_call_open", "ref":"234234", "suggestedPrice": 54000, "model":"Lange", "bidders":
    [
    ],
    "time_remain" : 12000 },
  "bid_0123_call_1_final" : { "id": "0123", "step": "first_call", "ref":"234234", "suggestedPrice": 54000, "model":"Lange", "bidders":
    [
      { "bidder": "543234", "country": "Italy", "offerUsd": 48000 },
      { "bidder": "543235", "country": "France", "offerUsd": 50000 },
      { "bidder": "543236", "country": "France", "offerUsd": 50000 },
      { "bidder": "543237", "country": "Germany", "offerUsd": 53000 },
      { "bidder": "543238", "country": "Spain", "offerUsd": 51000 },
      { "bidder": "543239", "country": "Usa", "offerUsd": 52000 }
    ],
    "time_remain" : 12000 },
  "bid_0123_call_1_selection" : { "id": "0123", "step": "first_call_selection", "ref":"234234", "suggestedPrice": 54000, "model":"Lange", "bidders":
    [
      { "bidder": "543234", "country": "Italy", "offerUsd": 48000 },
      { "bidder": "543235", "country": "France", "offerUsd": 50000 },
      { "bidder": "543236", "country": "France", "offerUsd": 50000 },
      { "bidder": "543237", "country": "Germany", "offerUsd": 53000 },
      { "bidder": "543238", "country": "Spain", "offerUsd": 51000 },
      { "bidder": "543239", "country": "Usa", "offerUsd": 52000 }
    ],
    "time_remain" : 60000 },
  "bid_0123_progression": [
{ "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 0, "total_states_time": 25000, "state_time_remain": 25000, "note": "initial changed state" },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 1, "total_states_time": 25000, "state_time_remain": 23000 },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 2, "total_states_time": 25000, "state_time_remain": 21000 },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 3, "total_states_time": 25000, "state_time_remain": 15000 },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 4, "total_states_time": 25000, "state_time_remain": 11000 },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 5, "total_states_time": 25000, "state_time_remain": 9000 },
    { "state_with_final_bidders" : "bid_0123_call_1_final", "new_bidders_total": 6, "total_states_time": 25000, "state_time_remain": 3000 },
    { "state_with_final_bidders" : "bid_0123_call_1_selection", "new_bidders_total": 6, "total_states_time": 86000, "state_time_remain": 60000, "note": "initial changed state"  }
  ]
}
