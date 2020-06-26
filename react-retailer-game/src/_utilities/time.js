export function timestamp2date (UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  //var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min.toString().padStart(2, '0');
  return time;
}

export function getTimeZone() {
  var offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
  return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
}

export function unixTime(unixtime) {
  var u = new Date(unixtime*1000);
  return u.getUTCFullYear().toString().substr(-2) +
        '-' + ('0' + u.getUTCMonth()).slice(-2) +
        '-' + ('0' + u.getUTCDate()).slice(-2) +
        ' ' + ('0' + u.getUTCHours()).slice(-2) +
        ':' + ('0' + u.getUTCMinutes()).slice(-2) // +
        //':' + ('0' + u.getUTCSeconds()).slice(-2)
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
