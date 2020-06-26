module.exports = function(tipoTrade, referenceOptions, priceAsked, putOrCallTrade ){
  let currentTime = Math.floor(Date.now() / 1000)
  let insertTime = currentTime - 48*60*60 //2 days ago
  let time_remain = ( tipoTrade === 'new' ? 30 : 40 )  // in sec
  console.log(referenceOptions)
  let refModel = ''
  if ( tipoTrade === 'new' ) {
    //estrae model name fittizio
    var parts = referenceOptions.label.split(' ');
    parts.shift(); // parts is modified to remove first word
      if (parts instanceof Array) {
        parts.pop() // remove ref
        refModel = parts.join(' ');
      }
      else {
        refModel = parts;
      }
  }
  let fakeTrade={
      "id": 500 + (1 && tipoTrade === 'new'), //500 trade in progress di default //501 trade create
      "type": putOrCallTrade,
      "reference": (tipoTrade === 'new' ?
        {
          "id": referenceOptions.id,
          "reference": referenceOptions.reference,
          "model_name": refModel,
          "brand_name": referenceOptions.brand,
          "price": referenceOptions.price
        }
        :
        {
          "id": 11,
          "reference": "PAM00424",
          "label": "Panerai Radiomir California - 47mm PAM00424",
          "brand_name": "Panerai",
          "price": 7500,
          "model_name": "Radiomir California - 47mm",
          "picture_url": "https://watchbot.acconsulting.digital/media/uploads/PAM00424.png",
          "movement": "Manual" ,
          "case_material": "Steel",
          "case_size": "48 mm",
          "dial_color": "Black",
          "bracelet_material": "-"
        }
      ),
      "price": (tipoTrade === 'new' ? (priceAsked > 0 ? priceAsked.toString() : referenceOptions.price.toString() ) : "7000"),
      "raise_price": null,
      "insert_date": insertTime.toString(),
      "closed_date": null,
      "delay_available": 3,
      "call_1_start_date": currentTime.toString(),
      "call_1_end_date": "1544094600",
      "call_1_end_selection": "1544094900",
      "call_2_start_date": "1544094900",
      "call_2_end_date": "1544095500",
      "call_2_end_selection": "1544096100",
      "payment_expiry": "1544096700",
      "raised_by_owner": false,
      "game_proceed_to_second_call": false,
      "status": ( tipoTrade === 'inProgress' ? "first_call" : "first_call_open" ),
      "won_by_this_user": false,
      "owned_by_this_user": true,
      "joined_by_this_user": false,
      "second_call_joined_by_this_user": false,
      "first_call_selection_for_this_user": false,
      "first_call_selection_completed": false,
      "server_timestamp": currentTime,
      "first_call_offers": ( tipoTrade === 'inProgress' ?
        [
          {
            "offer_id": 414,
            "user_id": 2,
            "user_city": "Roma",
            "user_country": "Italy",
            "price": "6900.00",
            "call_number": "first_call"
          },
          {
            "offer_id": 415,
            "user_id": 3,
            "user_city": "Paris",
            "user_country": "France",
            "price": "7000.00",
            "call_number": "first_call"
          }
        ]:
        [
        ]
      ),
      "second_call_on_going": [],
      "time_remain": time_remain,
      "first_call_selection_date": null,
      "main_image": null
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
