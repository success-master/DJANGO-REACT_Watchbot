from rest_framework import status
import datetime
import hashlib
from hdsauth.gestpay import Gestpay
from auction.models import Auction, Offer, Payment, AuctionWinner
from hdsauth.models import Transactions, HDSAuthUser, GestpayToken
from xml.etree import ElementTree

def obfuscate(s):
    m = hashlib.sha256()
    m.update(s)
    return m.hexdigest()

class PaymentService(object):
    def __init__(self):
      self.gestpay = Gestpay()

    def settleTransaction(self, transaction: Transactions):
      response = self.gestpay.settle_transaction(
        transaction.amount / 100,
        transaction.bank_transaction_id,
        transaction.shop_transaction_id
      )
      if response.find('TransactionResult').text == 'KO':
        transaction.status = 'failed'
        transaction.failed_date = datetime.datetime.now()
        transaction.save()
        return {
          'error': True,
          'response': {
            'status': status.HTTP_400_BAD_REQUEST,
            'data': {
              'payment_state': 'error',
              "payment_message": response.find('TransactionErrorDescription').text if response.find('TransactionErrorDescription') is not None else response.find('ErrorDescription').text
            }
          }
        }
      return {
        'error': False,
      }

    def createTransaction(self, gestpayToken: GestpayToken, user: HDSAuthUser, type, amount, transaction_id):
      transaction = Transactions(
          user=user,
          shop_transaction_id=transaction_id,
          gestpay_token=gestpayToken,
          status='pending',
          type=type,
          amount=amount,
      )
      transaction.save()
      response = self.gestpay.token_transaction(
          transaction.amount,
          transaction_id,
          gestpayToken.ccToken,
      )
      transaction.bank_transaction_id = response.find('BankTransactionID').text if response.find('BankTransactionID') is not None else None
      transaction.authorization_code = response.find('AuthorizationCode').text if response.find('AuthorizationCode') is not None else None
      transaction.risk_code = response.find('RiskResponseCode').text if response.find('RiskResponseCode') is not None else None
      transaction.currency = response.find('Currency').text if response.find('Currency') is not None else None
      transaction.error_code = response.find('ErrorCode').text
      transaction.alert_code = response.find('AlertCode').text if response.find('AlertCode') is not None else None
      transaction.masked_pan = response.find('MaskedPAN').text if response.find('MaskedPAN') is not None else None
      transaction.transaction_key = response.find('TransactionKey').text if response.find('TransactionKey') is not None else None
      if response.find('TransactionResult').text == 'KO':
        # xml_str = ElementTree.tostring(response).decode()
        # print(xml_str)
        if response.find('ErrorCode').text == '8006':
          transaction.status = 'check_secure_transaction'
          transaction.check_secure_transaction_date = datetime.datetime.now()
          transaction.save()
          return {
            'error': True,
            '3ds': True,
            'transaction': transaction,
            'response': {
              'status': status.HTTP_400_BAD_REQUEST,
              'data': {
                'payment_state': '3ds_check',
                'token': response.find('VbV').find('VbVRisp').text,
                'url': self.gestpay.getUrlSecureTransaction(),
                'shop_login': self.gestpay.shop_login,
                "payment_message": response.find('TransactionErrorDescription').text if response.find('TransactionErrorDescription') is not None else response.find('ErrorDescription').text
              }
            }
          }
        else:
          transaction.status = 'failure'
          transaction.failed_date = datetime.datetime.now()
          transaction.save()
          return {
            'error': True,
            '3ds': False,
            'response': {
              'status': status.HTTP_400_BAD_REQUEST,
              'data': {
                'payment_state': 'error',
                "payment_message": response.find('TransactionErrorDescription').text if response.find('TransactionErrorDescription') is not None else response.find('ErrorDescription').text
              }
            }
          }
      else:
        transaction.status = 'authorized'
        transaction.authorized_date = datetime.datetime.now()
        transaction.save()
        return {
          'error': False,
          '3ds': False,
          'transaction': transaction,
        }

    def secureTransaction(self, transaction: Transactions, pares):
      response = self.gestpay.secure_transaction(amount=transaction.amount, transaction_id=transaction.shop_transaction_id, transKey=transaction.transaction_key, pares=pares)

      transaction.error_code = response.find('ErrorCode').text
      if response.find('ErrorCode').text == '0':
        transaction.bank_transaction_id = response.find('BankTransactionID').text if response.find('BankTransactionID') is not None else None
        transaction.authorization_code = response.find('AuthorizationCode').text if response.find('AuthorizationCode') is not None else None
        transaction.currency = response.find('Currency').text if response.find('Currency') is not None else None
        transaction.status = 'authorized'
        transaction.authorized_date = datetime.datetime.now()
        transaction.save()
        return {
          "error": False,
          "transaction": transaction,
        }
      else:
        transaction.status = 'failed'
        transaction.failed_date = datetime.datetime.now()
        transaction.save()
        return {
          "error": True,
          "transaction": transaction,
          "message": response.find('ErrorDescription').text
        }

    def auctionDeposit(self, auction: Auction, user: HDSAuthUser, creditCardData=None, offer: Offer=None):
      if 'credit_card_token_id' in creditCardData:
        gestpayToken = GestpayToken.objects.get(
          user=user,
          pk=creditCardData['credit_card_token_id']
        )
      else:
        gestpayToken = user.get_gestpay_token
      if gestpayToken is None and 'cc' not in creditCardData:
        if offer is not None:
          offer.delete()
        else:
          auction.delete()
        return {
          'error': True,
          'response': {
            'status': status.HTTP_400_BAD_REQUEST,
            'data': {
              'payment_state': 'error',
              "payment_message": 'Expired token credit card  or missing credit card'
            }
          }
        }
      transaction_id = str(auction.pk) + '_' + str(user.pk) + '_deposit'
      if 'cc' in creditCardData:
        response = self.gestpay.request_token(
            creditCardData['cc'],
            creditCardData['expmm'],
            creditCardData['expyy'],
            creditCardData['cvv2'],
        )
        if response.find('TransactionResult').text == 'KO':
          if offer is not None:
            offer.delete()
          else:
            auction.delete()
          return {
            'error': True,
            'response': {
              'status': status.HTTP_400_BAD_REQUEST,
              'data': {
                'payment_state': 'error',
                "payment_message": response.find('TransactionErrorDescription').text
              }
            }
          }
        else:
          gestpayToken = GestpayToken(
              ccToken=response.find('Token').text,
              tokenExpiryYear=response.find('TokenExpiryYear').text,
              tokenExpiryMonth=response.find('TokenExpiryMonth').text,
              user=user,
          )
          gestpayToken.save()
      response = self.createTransaction(gestpayToken, user, 'deposit_auction', auction.deposit, transaction_id)
      print('RESPONSE GESTPAY: ', response)
      if 'transaction' in response:
        print('RESPONSE W TRANSACTION: OK')
        if offer is not None:
          offer.deposit_transaction = response['transaction']
          offer.save()
        else:
          auction.deposit_transaction = response['transaction']
          auction.save()
      if response['error'] == True:
          if response['3ds'] == True:
            if offer is not None:
              offer.payment_3ds_check = True
              offer.save()
            else:
              auction.payment_3ds_check = True
              auction.save()
            return response
          else:
            if offer is not None:
              offer.delete()
            else:
              auction.delete()
            return response
      else:
        return {
          'error': False,
        }

    def completePaymentAuction(self, auction: Auction, auction_winner: AuctionWinner, payment: Payment, user: HDSAuthUser, creditCardData):
      if 'credit_card_token_id' in creditCardData:
        gestpayToken = GestpayToken.objects.get(
          user=user,
          pk=creditCardData['credit_card_token_id']
        )
      else:
        gestpayToken = user.get_gestpay_token
      if auction.type == 'call':
        transaction_deposit = auction.deposit_transaction
      else:
        offer = auction_winner.offer
        if offer.is_first_offer:
          transaction_deposit = offer.deposit_transaction
        else:
          transaction_deposit = offer.first_offer.deposit_transaction

      if gestpayToken is None and 'cc' not in creditCardData:
        return {
          'error': True,
          'response': {
            'status': status.HTTP_400_BAD_REQUEST,
            'data': {
              'payment_state': 'error',
              "payment_message": 'Expired token credit card or missing'
            }
          }
        }
      if 'cc' in creditCardData:
        response = self.gestpay.request_token(
            creditCardData['cc'],
            creditCardData['expmm'],
            creditCardData['expyy'],
            creditCardData['cvv2'],
        )
        if response.find('TransactionResult').text == 'KO':
          return {
            'error': True,
            'response': {
              'status': status.HTTP_400_BAD_REQUEST,
              'data': {
                'payment_state': 'error',
                "payment_message": response.find('TransactionErrorDescription').text
              }
            }
          }
        else:
          gestpayToken = GestpayToken(
              ccToken=response.find('Token').text,
              tokenExpiryYear=response.find('TokenExpiryYear').text,
              tokenExpiryMonth=response.find('TokenExpiryMonth').text,
              user=user,
          )
          gestpayToken.save()
      self.settleTransaction(transaction_deposit)
      transaction_id = str(auction.pk) + '_' + str(user.pk) + '_balance'
      response = self.createTransaction(gestpayToken, user, 'balance_auction', auction_winner.price, transaction_id)
      if 'transaction' in response:
        auction.balance_transaction = response['transaction']
        auction.payment_3ds_check = True
        payment.status = 'secure_check'
        payment.save()
        auction.save()
      if response['error'] == True:
        return response
      else:
        self.settleTransaction(response['transaction'])
        auction.payment_3ds_check = False
        payment.status = 'settled'
        auction.status = 'closed'
        payment.save()
        auction.save()
        return {
          'error': False,
        }

