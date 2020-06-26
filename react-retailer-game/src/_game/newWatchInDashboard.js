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

  let result = {
    "id": referenceOptions.id,
    "model": {
      "id": 1,
      "name": refModel,
      "slug": "-",
      "brand": {
        "id": 2,
        "name": referenceOptions.brand,
        "slug": referenceOptions.brand
      }
    },
    "reference": referenceOptions.reference,
    "label": referenceOptions.label,
    "description": "",
    "movement": [
      "Automatic"
    ],
    "case_material": "Steel",
    "watchstrap_material": "Leather with EasyClick device",
    "year": 2018,
    "gender": "unisex",
    "price": referenceOptions.price,
    "followed_by_this_user": false
  }

  return result
}
