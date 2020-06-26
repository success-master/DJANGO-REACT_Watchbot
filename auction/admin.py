# -*- coding: utf-8 -*-
from django.contrib import admin
from django.conf import settings
from .models import *


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


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', )
    prepopulated_fields = {'slug': ('name',), }


admin.site.register(Auction)
admin.site.register(Offer)
admin.site.register(AuctionWinner)
admin.site.register(Payment)
admin.site.register(TransactionsSmart2Pay)
admin.site.register(Delivery)
admin.site.register(Notification)
