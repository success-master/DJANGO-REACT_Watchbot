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
from django.conf import settings
import traceback
from notification.models import Follow


logger = logging.getLogger('Check new auctions')
#hdlr = logging.FileHandler('video_duration.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
handler = RotatingFileHandler('check_new_auctions.log', maxBytes=100000000, backupCount=5)
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
        while True:
            try:
                now = datetime.datetime.now()
                ten_seconds_ago = now - datetime.timedelta(seconds=10)
                auction_list = Auction.objects.filter(insert_date__gte=ten_seconds_ago)
                #if auction_list.count() > 0:
                #    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
                #    try:
                #        default_app = firebase_admin.initialize_app(cred)
                #    except ValueError:
                #        pass
                #    message_to_topic = messaging.Message(
                #        data={
                #            'type': 'auction_list',
                #            'payload': "refresh",
                #        },
                #        topic="auction_list",
                #    )
                #    response = messaging.send(message_to_topic)
                #    #print('Successfully sent message:', response)
                for a in auction_list:
                    for f in Follow.objects.filter(
                        reference__in=auction_list.values_list("reference", flat=True)
                    ):
                        notification = Notification(
                            user=f.user,
                            auction=a,
                            mine_follow=2,
                            notification_type=5,
                            reference=a.reference
                        )
                        notification.save()
                time.sleep(10)
            except Exception as e:
                log_message(sys.exc_info()[0], True)
                log_message(traceback.format_exc(), False)
                log_message(e, False)
