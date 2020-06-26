module.exports = function(putOrCallTrade){
  let currentTime = Math.floor(Date.now() / 1000)
  //let insertTime = currentTime - 48*60*60 //2 days ago
  let time_remain = 1800 // in sec

  let fakeTrade={
      "id": 499,
      "type": putOrCallTrade,
      "reference": {
        "id": 1,
        "reference": "W5200004",
        "label": "Cartier Tank Solo W5200004",
        "brand_name": "Cartier",
        "price": 5100,
        "model_name": "Tank Solo" ,
        "picture_url": "CRW5200004.jpg",
        "movement": "Quartz" ,
        "case_material": "Yellow gold 18 K ",
        "case_size": "34,8 x 27,4 mm",
        "dial_color": "White",
        "bracelet_material": "Cocco"
      },
      "price": putOrCallTrade === 'call'? "3200.00" : "5100", //se call è stata creata da customer, cifra minore del 40%
      "raise_price": null,
      "insert_date": "1543912699",
      "closed_date": null,
      "call_1_start_date": currentTime.toString(),
      "call_1_end_date": "1544087400",
      "call_1_end_selection": "1544087700",
      "call_2_start_date": "1544087700",
      "call_2_end_date": "1544088300",
      "call_2_end_selection": "1544088900",
      "payment_expiry": "1544089500",
      "status": "first_call",
      "won_by_this_user": false,
      "owned_by_this_user": false,
      "owner_address": {
        "city": "Milan",
        "country": "Italy"
      },
      "joined_by_this_user": false,
      "second_call_joined_by_this_user": false,
      "first_call_selection_for_this_user": false,
      "first_call_selection_completed": false,
      "server_timestamp": 1543917877,
      "time_remain": time_remain,
      "first_call_selection_date": null,
      "main_image": null,
      "offer": {
        "bid_price_1": null,
        "bid_price_2": null
      },

      "buyer": {
        "payment_status": "to_be_payed",
        "buyer_address": "",
        "buyer_city": "Milan",
        "buyer_zip_code": "",
        "insurance": 0,
        "buyer_country": "Italy",
        "vat": 0,
        "shipping": 0,
        "matched_price": 3200,
        "buyer_id": 7,
        "shipping_status": "to_be_delivered",
        "deposit": 159
      }


    }
  return fakeTrade
}

/*
exports.fakeTrade = {
    "id": 500,
    "type": "put",
    "reference": {
      "id": 3,
      "reference": "01.657.0129.3.431",
      "model_name": "Diamaster Grande Seconde",
      "brand_name": "Rado",
      "price": 2950
    },
    "price": "3000.00",
    "raise_price": null,
    "insert_date": "1543912749",
    "closed_date": null,
    "call_1_start_date": "1544094000",
    "call_1_end_date": "1544094600",
    "call_1_end_selection": "1544094900",
    "call_2_start_date": "1544094900",
    "call_2_end_date": "1544095500",
    "call_2_end_selection": "1544096100",
    "payment_expiry": "1544096700",
    "status": "first_call_open",
    "won_by_this_user": false,
    "owned_by_this_user": true,
    "joined_by_this_user": false,
    "second_call_joined_by_this_user": false,
    "first_call_selection_for_this_user": false,
    "first_call_selection_completed": false,
    "server_timestamp": 1543917877,
    "time_remain": "176122.551745",
    "first_call_selection_date": null,
    "main_image": null
  }
*/
