module.exports = function(){

let userSettings={}

if (process.env.REACT_APP_USER === 'retailer') {
  userSettings = {
  "email": "info@info.com",
  "first_name": "RETAILER",
  "last_name": "Retailer",
  "retailer": {
    "company_name": "Company",
    "country": "Italy",
    "city": "Milano",
    "vat": "1234567890",
    "brands": [
      {
        "id": 2,
        "name": "Hamilton"
      },
      {
        "id": 1,
        "name": "Omega"
      },
      {
        "id": 3,
        "name": "Rado"
      }
    ]
  },
  "customer": null,
  "show_splash": false
  }
} else {
  userSettings= {
  "email": "customer1@gmail.com",
  "first_name": "Customer Demo",
  "last_name": "Surname",
  "retailer": null,
  "customer": {
    "tax_id": "123123123",
    "gender": "male",
    "birth_date": "2018-08-31",
    "city": "Rome",
    "phone_number": "21331231",
    "email_contact": "customer@gmail.com",
    "addresses": [
      {
        "id": 9,
        "country": "Italy",
        "address": "Via Customer1 bis2",
        "zip_code": "40100",
        "city": "Bologna",
        "state": "Bo",
        "preferred_billing_addr": false,
        "preferred_shipping_addr": true
      }
    ]
  },
  "show_splash": false
  }

}

return userSettings

}
