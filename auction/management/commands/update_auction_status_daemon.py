# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand, CommandError
from sys import version_info
import datetime
import firebase_admin
from firebase_admin import credentials, messaging
from auction.models import *
import time
import logging
from logging.handlers import RotatingFileHandler
import sys
import traceback
from hdsauth.gestpay import Gestpay
from auction.fee_utils import calc_vat_auction


logger = logging.getLogger('Update auctions status')
#hdlr = logging.FileHandler('video_duration.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
handler = RotatingFileHandler('update_auction_status.log', maxBytes=100000000, backupCount=5)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def log_message(message, error=False):
    if error:
        logger.error(message)
    else:
        logger.info(message)


class Command(BaseCommand):
    help = 'Invio mail di prova'

    def handle(self, *args, **options):
        dicharge_status_call = [
            'decayed_first_call',
            'decayed_first_call_selection',
            'decayed_second_call',
            'decayed_second_call_selection',
        ]
        dicharge_status_put = dicharge_status_call + ['cancelled']
        while True:
            gestpay = Gestpay()
            for a in Auction.objects.filter(closed=False):
                try:
                    previous_state = a.status
                    a.update_status(logger=logger)
                    dicharge_status = dicharge_status_put if a.type == 'put' else dicharge_status_call
                    if previous_state not in dicharge_status and a.status in dicharge_status:
                        if a.type == 'put':
                            offers_to_be_canceled = Offer.objects.filter(auction=a)
                            for offer in offers_to_be_canceled:
                                transaction = offer.deposit_transaction
                                if transaction.status == 'authorized':
                                    gestpay.delete_transaction(
                                        transaction.bank_transaction_id,
                                        transaction.shop_transaction_id,
                                        'Decayed auction or cancelled'
                                    )
                                notification = Notification(
                                    user=offer.user.user,
                                    auction=a,
                                    mine_follow=2,
                                    notification_type=6,
                                    reference=a.reference
                                )
                        else:
                            transaction = a.deposit_transaction
                            if transaction.status == 'authorized':
                                gestpay.delete_transaction(
                                    transaction.bank_transaction_id,
                                    transaction.shop_transaction_id,
                                    'Decayed auction or cancelled'
                                )
                                notification = Notification(
                                    user=a.owner.user,
                                    auction=a,
                                    mine_follow=2,
                                    notification_type=6,
                                    reference=a.reference
                                )
                        notification.save()
                    if previous_state != 'decayed_not_payed' and a.status == 'decayed_not_payed':
                        if a.type == "put":
                            retailer = a.owner
                            customer = a.winner
                        else:
                            retailer = a.winner
                            customer = a.owner
                        wb_transaction = TransactionsSmart2Pay(
                            amount=a.deposit * 15 / 100,
                            currency="EUR",
                            order_id=a,
                            order_line_id=str(a.pk) + '-1',
                            payment_state="PAID",
                            shop_id="1234",
                            shop_name="Watchbot",
                            transaction_type="DEPOSIT_TRADE_NOT_PAYED",
                            vat_rate=0,
                        )
                        wb_transaction.save()
                        retailer_transaction = TransactionsSmart2Pay(
                            amount=a.deposit * 85 / 100,
                            currency="EUR",
                            order_id=a,
                            order_line_id=str(a.pk) + '-2',
                            payment_state="PAID",
                            shop_id=retailer.shop_id,
                            shop_name="Retailer " + retailer.pk,
                            transaction_type="RETAILER_DEPOSIT",
                            vat_rate=0,
                        )
                        retailer_transaction.save()
                        notification = Notification(
                            user=retailer.user,
                            auction=a,
                            mine_follow=1,
                            notification_type=8,
                            reference=a.reference
                        )
                        notification.save()
                        notification2 = Notification(
                            user=customer.user,
                            auction=a,
                            mine_follow=1,
                            notification_type=8,
                            reference=a.reference
                        )
                        notification2.save()
                except Exception as e:
                    log_message(sys.exc_info()[0], True)
                    log_message(traceback.format_exc(), False)
                    log_message(e, False)
                time.sleep(0.01)
            time.sleep(1)