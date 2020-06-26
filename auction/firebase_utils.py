# -*- coding: utf-8 -*-
import datetime
import firebase_admin
from firebase_admin import credentials, messaging
from hdsauth.models import *
#from auction.models import *
from django.conf import settings
import time


def firebase_update_auction_status(auction):
    owner = auction.owner
    token_list = FireBaseToken.objects.filter(user=owner.user)
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
    auction.create_notification(
        user=owner.user,
        mine_follow=1,
        notification_type=1,
        new_status=auction.status,
    )
    try:
        default_app = firebase_admin.initialize_app(cred)
    except ValueError:
        pass
    for token in token_list:
        try:
            message = messaging.Message(
                data={
                    'type': 'auction_status_changed',
                    'payload': "changed",
                    'new_status': "%s" % auction.status,
                    'auction_id': "%s" % auction.id,
                    'reference_id': "%s" % auction.reference.id,
                },
                token=token.token,
            )
            response = messaging.send(message)
        except messaging.ApiCallError:
            token.delete()
            continue
    if auction.joined_list:
        joined_list = auction.joined_list.split(",")
    else:
        joined_list = []
    for user_id in joined_list:
        try:
            user = HDSAuthUser.objects.get(pk=user_id)
            user_token_list = FireBaseToken.objects.filter(user=user)
            for token in user_token_list:
                try:
                    message = messaging.Message(
                        data={
                            'type': 'auction_status_changed',
                            'payload': "changed",
                            'new_status': "%s" % auction.status,
                            'auction_id': "%s" % auction.id,
                            'reference_id': "%s" % auction.reference.id,
                        },
                        token=token.token,
                    )
                    response = messaging.send(message)
                except messaging.ApiCallError:
                    token.delete()
                    continue
        except HDSAuthUser.DoesNotExist:
            pass


def firebase_new_offer(offer):
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
    try:
        default_app = firebase_admin.initialize_app(cred)
    except ValueError:
        pass
    token_list = FireBaseToken.objects.filter(user=offer.auction.owner.user)
    offer.auction.create_notification(
        user=offer.auction.owner.user,
        mine_follow=1,
        notification_type=2
    )
    for token in token_list:
        try:
            message = messaging.Message(
                data={
                    'type': 'auction_new_offer',
                    'payload': "new_offer",
                    'auction_id': "%s" % offer.auction.id,
                    'offer_id': "%s" % offer.id
                },
                token=token.token,
            )
            response = messaging.send(message)
        except messaging.ApiCallError:
            token.delete()
            continue


def firebase_offer_selected(offer):
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
    try:
        default_app = firebase_admin.initialize_app(cred)
    except ValueError:
        pass
    token_list = FireBaseToken.objects.filter(user=offer.user.user)
    for token in token_list:
        try:
            message = messaging.Message(
                data={
                    'type': 'auction_offer_selected',
                    'payload': "offer_selected",
                    'auction_id': "%s" % offer.auction.id,
                    'offer_id': "%s" % offer.id
                },
                token=token.token,
            )
            response = messaging.send(message)
        except messaging.ApiCallError:
            token.delete()
            continue


def firebase_winner_selected(offer):
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
    try:
        default_app = firebase_admin.initialize_app(cred)
    except ValueError:
        pass
    if offer.auction.type == "put":
        token_list = FireBaseToken.objects.filter(user=offer.user.user)
    else:
        token_list = FireBaseToken.objects.filter(user=offer.auction.owner.user)
    for token in token_list:
        try:
            message = messaging.Message(
                data={
                    'type': 'auction_winner_selected',
                    'payload': "winner_selected",
                    'auction_id': "%s" % offer.auction.id,
                    'offer_id': "%s" % offer.id
                },
                token=token.token,
            )
            response = messaging.send(message)
        except messaging.ApiCallError:
            token.delete()
            continue


def firebase_auction_created(auction, user_follow):
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
    try:
        default_app = firebase_admin.initialize_app(cred)
    except ValueError:
        pass
    token_list = FireBaseToken.objects.filter(
        user__in=user_follow
    )
    for token in token_list:
        try:
            message = messaging.Message(
                data={
                    'type': 'new_auction_created',
                    'payload': "winner_selected",
                    'auction_id': "%s" % auction.id,
                    'reference_id': "%s" % auction.reference.id
                },
                token=token.token,
            )
            response = messaging.send(message)
        except messaging.ApiCallError:
            token.delete()
            continue
