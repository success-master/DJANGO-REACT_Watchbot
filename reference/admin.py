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


class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', )
    prepopulated_fields = {'slug': ('name',), }


class ReferenceAdmin(admin.ModelAdmin):
    list_display = ('label', 'brand', 'model_name',  'reference')
    exclude = ('brand',)
    filter_horizontal = ('movement', )

    def model_name(self, instance):
        return instance.model.name
    model_name.short_description = 'Model'
    model_name.admin_order_field = 'model__name'


admin.site.register(Brand, ModelAdmin)
admin.site.register(Model, ModelAdmin)
admin.site.register(Reference, ReferenceAdmin)
admin.site.register(Movement)
admin.site.register(CaseMaterial)
admin.site.register(WatchstrapMaterial)
