/* eslint-disable */

export function hystoricalNoPastData(price, range) {

  const openingTimeGMTArr = [9,10,11,12,13,14,15,16,17,18,19,20]
  let historicalNoPastData = [];
  let _range = range !== undefined ? range : "YTD";
  let date_from = new Date();
  let date_to = new Date(date_from);
  let fakePrice = 0;

  switch (_range) {
    case "1D": // current day
      let end = openingTimeGMTArr[openingTimeGMTArr.length-1],
          start = openingTimeGMTArr[0],
          dateToHours = date_to.getHours(),
          tick_hour = 0;
      //let tick_hour = Math.ceil(dateToHours / 6);
      tick_hour = (dateToHours > start && dateToHours < end) ? Math.ceil((dateToHours - start) / 6) : Math.ceil((end - start) / 6);

      for (let i = end; i >= start; i--) {
      //for (let i = 23; i >= 0; i--) {
        if (date_to.getHours() === i) {
          let d = ("00" + date_to.getHours()).slice(-2) + ":" + ("00" + date_to.getMinutes()).slice(-2);
          fakePrice = fakePrice === 0 ? price : getFakePrice(fakePrice);

          historicalNoPastData.push({ "month": d, "price": fakePrice })
          date_to.setTime(date_to.getTime() - (tick_hour * 60 * 60 * 1000));

          //console.log(date_to.getHours(), "--------------- hours-------------")
        }
      }

      historicalNoPastData.length > 0 ? historicalNoPastData.reverse() : [];

      //console.log(historicalNoPastData, "arrDates");
      break;

    case "1Dxx": // 24 ore
      date_from.setTime(date_from.getTime() - (24 * 60 * 60 * 1000));

      while (date_to >= date_from) {
        let d = ("00" + date_to.getDate()).slice(-2) + " " + getMonthName(date_to.getMonth()) + " " + ("00" + date_to.getHours()).slice(-2) + ":" + ("00" + date_to.getMinutes()).slice(-2);
        fakePrice = fakePrice === 0 ? price : getFakePrice(fakePrice);
        historicalNoPastData.push({ "month": d, "price": fakePrice })
        date_to.setTime(date_to.getTime() - (1 * 60 * 60 * 1000));
      }
      historicalNoPastData.length > 0 ? historicalNoPastData.reverse() : [];
      //console.log(historicalNoPastData, "arrDates");
      break;

    case "1M":
    case "6M":
      let newMonth = _range === "6M" ? date_from.getMonth() - 6 : date_from.getMonth() - 1;

      if (newMonth < 0) {
        newMonth += 12;
        date_to.setYear(date_to.getFullYear() - 1);
      }
      date_to.setMonth(newMonth, 1);

      while (date_to <= date_from) {
        //console.log(date_to.toISOString().substring(0, 7), " *********")
        date_to.setMonth(date_to.getMonth() + 1, 1);
        fakePrice = fakePrice === 0 ? price : getFakePrice(fakePrice);

        historicalNoPastData.push({ "month": getMonthName(date_to.getMonth() - 1 >= 0 ? date_to.getMonth() - 1 : 11) + " " + date_to.getFullYear().toString().substr(-2), "price": fakePrice })
      }
      //console.log(historicalNoPastData, "arrDates");
      break;

    case "YTD":
      for (let i = 11; i >= 0; i--) {
        if (date_to.getMonth() === i) {
          fakePrice = fakePrice === 0 ? price : getFakePrice(fakePrice);
          historicalNoPastData.push({ "month": getMonthName(date_to.getMonth()) + " " + date_to.getFullYear().toString().substr(-2), "price": fakePrice })
          date_to.setMonth(date_to.getMonth() - 1, 1);
        }
      }
      historicalNoPastData.length > 0 ? historicalNoPastData.reverse() : [];
      //console.log(historicalNoPastData, "arrDates");
      break;

    default:
      break;
  }

  return historicalNoPastData
}



export function hystoricalNoPastData_OLD(price) {

  let d = new Date();
  let month = ('0' + (d.getMonth() + 1)).slice(-2)
  let year = d.getFullYear().toString().substr(-2)
  let shortDateThisMonth = month + '/' + year

  let newMonth = d.getMonth() - 1;
  if (newMonth < 0) {
    newMonth += 12;
    d.setYear(d.getYear() - 1);
  }
  d.setMonth(newMonth);
  month = ('0' + (d.getMonth() + 1)).slice(-2)
  year = d.getFullYear().toString().substr(-2)
  let shortDateLastMonth = month + '/' + year

  let historicalNoPastData = [{ "month": shortDateLastMonth, "price": price }, { "month": shortDateThisMonth, "price": price }]

  return historicalNoPastData
}



function getMonthName(i) {
  const month = [];
  month[0] = "Jan";
  month[1] = "Feb";
  month[2] = "Mar";
  month[3] = "Apr";
  month[4] = "May";
  month[5] = "Jun";
  month[6] = "Jul";
  month[7] = "Aug";
  month[8] = "Sep";
  month[9] = "Oct";
  month[10] = "Nov";
  month[11] = "Dec";

  return month[i];
}

function getFakePrice(price) {
  let random = (price / 100) * (Math.floor(Math.random() * 10) + 1);
  return Math.round(price - random) // x% off
}
