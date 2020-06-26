module.exports = function(referenceOptions){
let refModel = ''

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

let results = [
  {
    "id": 444,
    "type": "call",
    "reference": {
      "id": referenceOptions.id,
      "reference": referenceOptions.reference,
      "model_name": refModel,
      "brand_name": referenceOptions.brand,
      "price": referenceOptions.brand.price
    },
    "price": "795.00",
    "raise_price": null,
    "insert_date": "1543912699",
    "closed_date": "1544087400",
    "call_1_start_date": "1544086800",
    "call_1_end_date": "1544087400",
    "call_1_end_selection": "1544087700",
    "call_2_start_date": "1544087700",
    "call_2_end_date": "1544088300",
    "call_2_end_selection": "1544088900",
    "payment_expiry": "1544089500",
    "status": "decayed_first_call",
    "won_by_this_user": false,
    "owned_by_this_user": false,
    "joined_by_this_user": false,
    "second_call_joined_by_this_user": false,
    "first_call_selection_for_this_user": false,
    "first_call_selection_completed": false,
    "server_timestamp": 1544626791,
    "time_remain": 0,
    "first_call_selection_date": null,
    "main_image": null
  },
  {
    "id": 441,
    "type": "call",
    "reference": {
      "id": referenceOptions.id,
      "reference": referenceOptions.reference,
      "model_name": refModel,
      "brand_name": referenceOptions.brand,
      "price": referenceOptions.brand.price
    },
    "price": "795.00",
    "raise_price": null,
    "insert_date": "1543412019",
    "closed_date": "1543413300",
    "call_1_start_date": "1543412700",
    "call_1_end_date": "1543413300",
    "call_1_end_selection": "1543413600",
    "call_2_start_date": "1543413600",
    "call_2_end_date": "1543414200",
    "call_2_end_selection": "1543414800",
    "payment_expiry": "1543415400",
    "status": "decayed_first_call",
    "won_by_this_user": false,
    "owned_by_this_user": false,
    "joined_by_this_user": false,
    "second_call_joined_by_this_user": false,
    "first_call_selection_for_this_user": false,
    "first_call_selection_completed": false,
    "server_timestamp": 1544626791,
    "time_remain": 0,
    "first_call_selection_date": null,
    "main_image": null
  },
  {
    "id": 428,
    "type": "call",
    "reference": {
      "id": referenceOptions.id,
      "reference": referenceOptions.reference,
      "model_name": refModel,
      "brand_name": referenceOptions.brand,
      "price": referenceOptions.brand.price
    },
    "price": "795.00",
    "raise_price": null,
    "insert_date": "1543320820",
    "closed_date": "1543321500",
    "call_1_start_date": "1543320900",
    "call_1_end_date": "1543321500",
    "call_1_end_selection": "1543321800",
    "call_2_start_date": "1543321800",
    "call_2_end_date": "1543322400",
    "call_2_end_selection": "1543323000",
    "payment_expiry": "1543323600",
    "status": "decayed_first_call",
    "won_by_this_user": false,
    "owned_by_this_user": false,
    "joined_by_this_user": false,
    "second_call_joined_by_this_user": false,
    "first_call_selection_for_this_user": false,
    "first_call_selection_completed": false,
    "server_timestamp": 1544626791,
    "time_remain": 0,
    "first_call_selection_date": null,
    "main_image": null
  }
]

  results[referenceOptions.id%3].status = "winner_selected"

  return results
}
