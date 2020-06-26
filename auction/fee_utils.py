import math

wp_fee_percent = 5

deposit_percent = 20
max_deposit = 6000


def calc_put_wb_fee(price):
  return round((price * wp_fee_percent / 100), 2)


def calc_put_deposit(reference):
  deposit = reference.price * deposit_percent / 100
  if deposit > max_deposit:
    return max_deposit
  return round(deposit, 2)


def calc_final_price(auction, offer, vat=22):
  price = offer.price - auction.deposit
  vat_price = price * vat / 100
  price += vat_price + offer.duties + offer.shipping + offer.insurance

  return round(price, 2)


def calc_vat_auction(auction):
  return 0