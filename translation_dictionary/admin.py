# -*- coding: utf-8 -*-
from django.contrib import admin
from django.conf import settings
from .models import *
from modeltranslation.admin import TranslationAdmin


class PositionAdmin(admin.ModelAdmin):
    """
    Abstract admin option class for PositionModel
    """
    list_display = ('position', 'pk')
    list_editable = ('position',)
    list_display_links = ('pk',)
    ordering = ('position',)
    exclude = ('position',)

    class Media:
        js = (
            #settings.JQUERY_LIB,
            #settings.JQUERYUI_LIB,
            #  u'{}sortable/js/admin-list-reorder.js'.format(settings.STATIC_URL),
        )

    class Meta:
        abstract = True


class TranslationDictionaryAdmin(TranslationAdmin):
    class Media:
        js = (
            'modeltranslation/js/force_jquery.js',
            'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js',
            'modeltranslation/js/tabbed_translation_fields.js',
        )
        css = {
            'screen': ('modeltranslation/css/tabbed_translation_fields.css',),
        }


admin.site.register(TranslationDictionary, TranslationDictionaryAdmin)
