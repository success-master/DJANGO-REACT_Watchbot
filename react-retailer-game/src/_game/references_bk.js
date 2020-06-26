module.exports = function(searchText){

let fakeReferences = [
    {
      "id": 1,
      "reference": "H38525881",
      "label": "Hamilton Jazzmaster Thinline Auto H38525881",
      "brand": "Hamilton",
      "price": 795
    },
    {
      "id": 2,
      "reference": "H82305331",
      "label": "Hamilton Khaki Navy Scuba Auto H82305331",
      "brand": "Hamilton",
      "price": 695
    },
    {
      "id": 3,
      "reference": "01.657.0129.3.431",
      "label": "Rado Diamaster Grande Seconde 01.657.0129.3.431",
      "brand": "Rado",
      "price": 2950
    },
    {
      "id": 4,
      "reference": "01.420.0006.3.091",
      "label": "Rado True Thinline Nature 01.420.0006.3.091",
      "brand": "Rado",
      "price": 2070
    },
    {
      "id": 5,
      "reference": "50535",
      "label": "Omega Bellini Moonphase 50535",
      "brand": "Omega",
      "price": 24900
    },
    {
      "id": 6,
      "reference": "50505",
      "label": "Omega Bellini Time 50505",
      "brand": "Omega",
      "price": 14150
    },
    {
      "id": 7,
      "reference": "326933",
      "label": "Omega Sky-Teller 326933",
      "brand": "Omega",
      "price": 15900
    },
    {
      "id": 8,
      "reference": "326934",
      "label": "Omega Sky-Teller 326934",
      "brand": "Omega",
      "price": 13350
    }
  ]

  if (searchText === '') {
    return fakeReferences
  }

  //altrimenti filtra l'array
  let results = fakeReferences.filter(function (elem) {
    return elem.label.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  })
  return results
}
