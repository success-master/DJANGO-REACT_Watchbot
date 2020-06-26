module.exports = function(searchText){

  let fakeReferences = [
      {
        "id": 1,
        "model": {
            "id": 1,
            "name": " TANK SOLO",
            "slug": "tank-solo",
            "brand": {
            "id": 4,
            "name": "Cartier",
            "slug": "cartier"
          }
        },
        "reference": "W5200004",
        "label": "Cartier Tank Solo W5200004",
        "brand_name": "Cartier",
        "price": 5100,
        "model_name": "Tank Solo" ,
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CRW5200004.png",
        "movement": "Quartz" ,
        "case_material": "Yellow gold 18 K ",
        "case_size": "34,8 x 27,4 mm",
        "dial_color": "White",
        "bracelet_material": "Cocco"
      },
      {
        "id": 2,
        "model": {
            "id": 1,
            "name": "Santos di Cartie",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Cartier",
            "slug": "cartier"
          }
        },
        "reference": "WSSA0009",
        "label": "Cartier Santos di Cartier WSSA0009",
        "brand_name": "Cartier",
        "price": 6750,
        "model_name": "Santos di Cartier",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CRWSSA0009.png",
        "movement": "Automatic" ,
        "case_material": "Opal",
        "case_size": "39,8 mm",
        "dial_color": "White",
        "bracelet_material": "Stainless Steel"
      },
      {
        "id": 3,
        "model": {
            "id": 1,
            "name": "Ballon Bleu De Cartie",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Cartier",
            "slug": "cartier"
          }
        },
        "reference": "WSBB0020",
        "label": "Cartier Ballon Bleu De Cartier WSBB0020",
        "brand_name": "Cartier",
        "price": 7100,
        "model_name": "Ballon Bleu De Cartie",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CRWSBB0020.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "37 mm",
        "dial_color": "White",
        "bracelet_material": "Cocco"
      },
      {
        "id": 4,
        "model": {
            "id": 1,
            "name": "Panthere de Cartier",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Cartier",
            "slug": "cartier"
          }
        },
        "reference": "WGPN0009",
        "label": "Cartier Panthere de Cartier WGPN0009",
        "brand_name": "Cartier",
        "price": 22600,
        "model_name": "Panthere de Cartier",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CRWGPN0009.png",
        "movement": "Quartz" ,
        "case_material": "Yellow gold 18 K ",
        "case_size": "27 x 37 mm",
        "dial_color": "White",
        "bracelet_material": "Yellow gold 18 K"
      },
      {
        "id": 5,
        "model": {
            "id": 1,
            "name": "Monaco Calibre 11",
            "slug": "tank-solo",
            "brand": {
            "id": 4,
            "name": "Tag Heuer",
            "slug": "cartier"
          }
        },
        "reference": "CAW211P.FC6356",
        "label": "Tag Heuer Monaco Calibre 11 CAW211P.FC6356",
        "brand_name": "Tag Heuer",
        "price": 5250,
        "model_name": "Monaco Calibre 11",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CAW211P-FC6356.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "39 mm",
        "dial_color": "Blue",
        "bracelet_material": "Black calf"
      },
      {
        "id": 6,
        "model": {
            "id": 1,
            "name": "Carrera Calibre Heuer 01",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Tag Heuer",
            "slug": ""
          }
        },
        "reference": "CAR2A90.FT6071",
        "label": "Tag Heuer Carrera Calibre Heuer 01 CAR2A90.FT6071",
        "brand_name": "Tag Heuer",
        "price": 5750,
        "model_name": "Carrera Calibre Heuer 01",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CAR2A90.FT6071.png",
        "movement": "Automatic" ,
        "case_material": "Black ceramic",
        "case_size": "45 mm",
        "dial_color": "Black",
        "bracelet_material": "Black  rubber"
      },
      {
        "id": 7,
        "model": {
            "id": 1,
            "name": "Carrera Calibre Heuer 01",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Tag Heuer",
            "slug": ""
          }
        },
        "reference": "CAR201P.BA0766",
        "label": "Tag Heuer Carrera Calibre Heuer 01 CAR201P.BA0766",
        "brand_name": "Tag Heuer",
        "price": 8750,
        "model_name": "Carrera Calibre Heuer 01",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/CAR201P.BA0766.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "43 mm",
        "dial_color": "Black",
        "bracelet_material": "Stainless Steel"
      },
      {
        "id": 8,
        "model": {
            "id": 1,
            "name": "Portugieser Chronograph",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "IWC",
            "slug": ""
          }
        },
        "reference": "IW371445",
        "label": "IWC Portugieser Chronograph IW371445",
        "brand_name": "IWC",
        "price": 7700,
         "model_name": "Portugieser Chronograph",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/IW371445.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "40,9 mm",
        "dial_color": "ArgentÈ",
        "bracelet_material": "Alligator"
      },
      {
        "id": 9,
        "model": {
            "id": 1,
            "name": "Portugieser Yacht Club Chronograph",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "IWC",
            "slug": ""
          }
        },
        "reference": "IW390502",
        "label": "IWC Portugieser Yacht Club Chronograph IW390502",
        "brand_name": "IWC",
        "price": 12300,
        "model_name": "Portugieser Yacht Club Chronograph",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/IW390502.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "43,5 mm",
        "dial_color": "ArgentÈ",
        "bracelet_material": "Black rubber"

      },
   {
        "id": 10,
        "model": {
            "id": 1,
            "name": "Portofino Hand-Wound Eight Days",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "IWC",
            "slug": ""
          }
        },
        "reference": "IW510103",
        "label": "IWC Portofino Hand-Wound Eight Days IW510103",
        "brand_name": "IWC",
        "price": 9950,
        "model_name": "Portofino Hand-Wound Eight Days",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/IW510103.png",
        "movement": "Manual" ,
        "case_material": "Steel",
        "case_size": "45 mm",
        "dial_color": "ArgentÈ",
        "bracelet_material": "Alligator"

      },
       {
        "id": 11,
        "model": {
            "id": 1,
            "name": "Panerai Radiomir California - 47mm PAM00424",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Panerai",
            "slug": ""
          }
        },
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

      },
   {
        "id": 12,
        "model": {
            "id": 1,
            "name": "Ingenieur Automatic",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "IWC",
            "slug": ""
          }
        },
        "reference": "IW357002",
        "label": "IWC Ingenieur Automatic IW357002",
        "brand_name": "IWC",
        "price": 6250,
        "model_name": "Ingenieur Automatic",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/IW357002.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "40 mm",
        "dial_color": "Black",
        "bracelet_material": "Stainles Steel"
        },
      {
        "id": 13,
        "model": {
            "id": 1,
            "name": "Marine Torpilleur",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Ulysse Nardin",
            "slug": ""
          }
        },
        "reference": "1183-310-3/40",
        "label": "Ulysse Nardin Marine Torpilleur 1183-310-3/40",
        "brand_name": "Ulysse Nardin",
        "price": 6900,
         "model_name": "Marine Torpilleur",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/UN1183.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "42 mm",
        "dial_color": "White",
        "bracelet_material": "Rubber"
      },
      {
        "id": 14,
        "model": {
            "id": 1,
            "name": "Diver 42 mm",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Ulysse Nardin",
            "slug": ""
          }
        },
        "reference": "8163-175-7MIL/92",
        "label": "Ulysse Nardin Diver 42 mm 8163-175-7MIL/92",
        "brand_name": "Ulysse Nardin",
        "price": 6500,
        "model_name": "Diver 42 mm",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/UN8163.png",
        "movement": "Automatic" ,
        "case_material": "Steel",
        "case_size": "42 mm",
        "dial_color": "Black",
        "bracelet_material": "Stainles Steel"
      },
        {
        "id": 15,
        "model": {
            "id": 1,
            "name": "Submersible BMG-TECH",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Panerai",
            "slug": ""
          }
        },
        "reference": "PAM00799",
        "label": "Panerai Submersible BMG-TECHô PAM00799",
        "brand_name": "Panerai",
        "price": 14900,
        "model_name": "Submersible BMG-TECH",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/PAM799.png",
        "movement": "Automatic" ,
        "case_material": "BMG-TECH",
        "case_size": "47 mm",
        "dial_color": "Black",
        "bracelet_material": "-"
      },
      {
        "id": 16,
        "model": {
            "id": 1,
            "name": "Classico Manufacture",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Ulysse Nardin",
            "slug": ""
          }
        },
        "reference": "3203-136LE-2/MANARA.07",
        "label": "Ulysse Nardin Classico Manufacture 3203-136LE-2/MANARA.07",
        "brand_name": "Ulysse Nardin",
        "price": 26900,
        "model_name": "Classico Manufacture",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/UN3203_MANARA.png",
        "movement": "Automatic" ,
        "case_material": "BMG-TECH",
        "case_size": "47 mm",
        "dial_color": "Black",
        "bracelet_material": "-"
      },
      {
        "id": 17,
        "model": {
            "id": 1,
            "name": "Freak X",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Ulysse Nardin",
            "slug": ""
          }
        },
        "reference": "2303-270.1/BLACK",
        "label": "Ulysse Nardin Freak X 2303-270.1/BLACK",
        "brand_name": "Ulysse Nardin",
        "price": 21000,
        "model_name": "Freak X",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/UN2303.png",
        "movement": "Automatic" ,
        "case_material": "Titanium",
        "case_size": "43 mm",
        "dial_color": "Black",
        "bracelet_material": "Black calf"
      },
      {
        "id": 18,
        "model": {
            "id": 1,
            "name": "Traditionelle World Hours",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Vacheron Constantin",
            "slug": ""
          }
        },
        "reference": "86060/000G-8982",
        "label": "Vacheron Constantin Traditionelle World Hours 86060/000G-8982",
        "brand_name": "Vacheron Constantin",
        "price": 51500,
        "model_name": "Traditionelle World Hours",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/VC86060.png",
        "movement": "Automatic" ,
        "case_material": "White gold 18k",
        "case_size": "42,5 mm",
        "dial_color": "Transparent",
        "bracelet_material": "Alligator"
      },
      {
        "id": 19,
        "model": {
            "id": 1,
            "name": "Patrimony Biretrogrado Day Date",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Vacheron Constantin",
            "slug": ""
          }
        },
        "reference": "4000U/000R-B110",
        "label": "Vacheron Constantin Patrimony Biretrogrado Day Date 4000U/000R-B110",
        "brand_name": "Vacheron Constantin",
        "price": 45100,
        "model_name": "Patrimony Biretrogrado Day Date",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/VC_4000U.png",
        "movement": "Automatic" ,
        "case_material": "Pink gold 18k",
        "case_size": "42,5 mm",
        "dial_color": "Transparent",
        "bracelet_material": "Alligator"

      },
      {
        "id": 20,
        "model": {
            "id": 1,
            "name": "MÈtieres D'Art MÈcaniques AjourÈes",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "Vacheron Constantin",
            "slug": ""
          }
        },
        "reference": "82020/000G-9924",
        "label": "Vacheron Constantin MÈtieres D'Art MÈcaniques AjourÈes 82020/000G-9924",
        "brand_name": "Vacheron Constantin",
        "price": 73500,
        "model_name": "MÈtieres D'Art MÈcaniques AjourÈes",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/VC82020.png",
        "movement": "Manual" ,
        "case_material": "White gold 18k",
        "case_size": "40 mm",
        "dial_color": "Transparent",
        "bracelet_material": "Alligator"
      },
      {
        "id": 21,
        "model": {
            "id": 1,
            "name": "Luminor - 47mm",
            "slug": "",
            "brand": {
            "id": 4,
            "name": "TPanerai",
            "slug": "TPanerai"
          }
        },
        "reference": "PAM00372",
        "label": "TPanerai Luminor - 47mm PAM00372",
        "brand_name": "TPanerai",
        "price": 8800,
        "model_name": "Luminor - 47mm",
        "picture_url": "https://watchbot.acconsulting.digital/media/uploads/PAM00372.png",
        "movement": "Manual" ,
        "case_material": "Steel",
        "case_size": "47 mm",
        "dial_color": "Black",
        "bracelet_material": "-"
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
