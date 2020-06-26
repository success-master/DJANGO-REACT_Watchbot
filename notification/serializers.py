# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import *


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ('reference', )


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = ('reference', )


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ('reference', 'price', 'deviation')


class NotificationAuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = ("id", "status", 'time_remain', 'price', 'raise_price')

class NotificationSerializer(serializers.ModelSerializer):
    auction = NotificationAuctionSerializer(many=False, read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id',
            'notification_type',
            'get_type',
            'auction',
            'reference',
            'reference_string',
            'new_status',
            'creation_date',
        )


class NotificationSetReadSerializer(serializers.ModelSerializer):
    notifications = serializers.ListField(allow_empty=False, child=serializers.IntegerField(), min_length=1)

    class Meta:
        model = SelectedOffer
        fields = ('notifications', )


