# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import *


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranslationDictionary
        fields = ('key_index', 'description', 'translated_text_it', 'translated_text_en')
