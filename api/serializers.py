# -*- coding: utf-8 -*-
from rest_framework import serializers
import datetime


class TimeStampField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return int(datetime.datetime.now().timestamp())


class FireBaseTokenSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, max_length=500)
