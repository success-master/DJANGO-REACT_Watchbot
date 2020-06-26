from zeep import Client
from django.conf import settings


class Gestpay(object):
    def __init__(self, test=settings.GPAY_TEST_ENABLED):
        self.ws_url = settings.GPAY_TEST_URL if test else settings.GPAY_PRODUCTION_URL
        self.shop_login = settings.GPAY_SHOP_LOGIN
        self.api_key = settings.GPAY_APIKEY
        self.test = test
        try:
            self.client = Client(self.ws_url)
        except Exception as e:
            raise Exception("GestPay WS Endpoint not reachable: {}".format(e))

    def _prepare_request(self):
        data = {}
        data['shopLogin'] = self.shop_login
        data['apikey'] = self.api_key
        return data

    def verify_card(self, card_number, exp_month, exp_year, cvv=False, transaction_id=False):
        data = self._prepare_request()
        data['cardNumber'] = card_number
        data['expMonth'] = exp_month
        data['expYear'] = exp_year
        if cvv:
            data['CVV2'] = cvv
        if transaction_id:
            data['shopTransactionId'] = transaction_id

        return self.make_request('callVerifycardS2S', data)

    def check_card(self, card_number, exp_month, exp_year, cvv=False, transaction_id=False, card_auth="N"):
        data = self._prepare_request()
        data['cardNumber'] = card_number
        data['expMonth'] = exp_month
        data['expYear'] = exp_year
        if cvv:
            data['CVV2'] = cvv
        if transaction_id:
            data['shopTransactionId'] = transaction_id

        data['withAuth'] = card_auth

        return self.make_request('callCheckCartaS2S', data)

    def request_token(self, card_number, exp_month, exp_year, cvv=False, card_auth="N"):
        data = self._prepare_request()
        data['requestToken'] = "MASKEDPAN"
        data['cardNumber'] = card_number
        data['expiryMonth'] = exp_month
        data['expiryYear'] = exp_year

        if cvv:
            data['cvv'] = cvv

        data['withAuth'] = card_auth

        return self.make_request('CallRequestTokenS2S', data)

    def token_transaction(self, amount, transaction_id, token, currencyCode=settings.GPAY_DEFAULT_CURRENCY):
        data = self._prepare_request()
        data['uicCode'] = currencyCode
        data['amount'] = amount if self.test is False else round(amount / 100, 2)
        data['shopTransactionId'] = transaction_id
        data['tokenValue'] = token

        return self.make_request('callPagamS2S', data)

    def secure_transaction(self, amount, transaction_id, transKey, pares, currencyCode=settings.GPAY_DEFAULT_CURRENCY):
        data = self._prepare_request()
        data['uicCode'] = currencyCode
        data['amount'] = amount if self.test is False else round(amount / 100, 2)
        data['shopTransactionId'] = transaction_id
        data['transKey'] = transKey
        data['PARes'] = pares

        return self.make_request('callPagamS2S', data)

    ## Currency Code https://api.gestpay.it/#currency-codes
    def card_transaction(self, amount, transaction_id, card_number, exp_month, exp_year, cvv, currencyCode=settings.GPAY_DEFAULT_CURRENCY):
        data = self._prepare_request()
        data['uicCode'] = currencyCode
        data['amount'] = amount if self.test is False else round(amount / 100, 2)
        data['shopTransactionId'] = transaction_id
        data['cardNumber'] = card_number
        data['expiryMonth'] = exp_month
        data['expiryYear'] = exp_year
        data['cvv'] = cvv

        return self.make_request('callPagamS2S', data)

    def delete_transaction(self, bank_transaction_id, shop_transaction_id, reason):
        data = self._prepare_request()
        data['bankTransactionId'] = bank_transaction_id
        data['shopTransactionId'] = shop_transaction_id
        data['CancelReason'] = reason

        return self.make_request('callDeleteS2S', data)

    def settle_transaction(self, amount, bank_transaction_id, shop_transaction_id, currencyCode=settings.GPAY_DEFAULT_CURRENCY):
        data = self._prepare_request()
        data['uicCode'] = currencyCode
        data['amount'] = amount if self.test is False else round(amount / 100, 2)
        data['shopTransID'] = shop_transaction_id
        data['bankTransID'] = bank_transaction_id

        return self.make_request('callSettleS2S', data)

    def getUrlSecureTransaction(self):
        return settings.GPAY_TEST_SECURE_TRANSACTION_URL if self.test else settings.GPAY_SECURE_TRANSACTION_URL

    def make_request(self, method, data):
        with self.client.settings(raw_response=False):
            res = getattr(self.client.service, method)(**data)
            # **data equivale a res = client.service.callCheckCartaS2S(shopLogin="GESPAY72663", cardNumber="4775718800002026", expMonth="05", expYear="27", shopTransactionId="xxx1", withAuth="N")
        #for child in res.getchildren():
        #    print(child, child.text)
        return res
