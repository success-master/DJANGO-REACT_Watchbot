# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand, CommandError
from sys import version_info
import datetime
import firebase_admin
from firebase_admin import credentials, messaging
from auction.models import *
import time


class Command(BaseCommand):
    help = 'Invio mail di prova'

    def handle(self, *args, **options):
        now = datetime.datetime.now()
        ten_seconds_ago = now - datetime.timedelta(seconds=60)
        if Auction.objects.filter(insert_date__gte=ten_seconds_ago).count() > 0:
            cred = credentials.Certificate('watchbot-afbb0-firebase-adminsdk-3hqrt-6d67384502.json')
            default_app = firebase_admin.initialize_app(cred)
            message_to_topic = messaging.Message(
                data={
                    'type': 'auction_list',
                    'refresh': "true",
                },
                topic="auction_list",
            )
            response = messaging.send(message_to_topic)
            print('Successfully sent message:', response)