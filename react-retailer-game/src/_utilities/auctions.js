export function isAuctionLive(status) {
  switch(status) {
    case 'first_call_open':
    case 'first_call':
    case 'first_call_selection':
    case 'second_call_open':
    case 'second_call':
    case 'second_call_selection':
      return true
    default:
      return false
  }
}

export function isAuctionMatched(tradeObj) {
  if (tradeObj.won_by_this_user === true) {
    return true
  }
  return false
}
