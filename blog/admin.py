# -*- coding: utf-8 -*-
from django.contrib import admin
from django.conf import settings
from .models import *
from image_cropping import ImageCroppingMixin
from django.utils.html import format_html_join
from django.utils.safestring import mark_safe
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect


csrf_protect_m = method_decorator(csrf_protect)


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


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'slug', 'author')
    filter_horizontal = ('tags', 'keywords',)
    search_fields = ('title', 'slug',)
    #list_editable = ('popular',)
    prepopulated_fields = {'slug': ('title',), }

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            # Only set added_by during the first save.
            obj.author = request.user
        super().save_model(request, obj, form, change)

    class Media:
        js = (
            #settings.JQUERY_LIB,
            #settings.JQUERYUI_LIB,
            #u'{}tab_translation/js/tab_translation.js'.format(settings.STATIC_URL),
            #u'{0}select2/js/select2__init.js'.format(settings.STATIC_URL),
            #'/static/js/custom_admin.js'
        )
        css = {
            "all": (
                #settings.SELECT2_CSS_LIB,
            ),
            'screen': (
                #settings.JQUERYUI_CSSLIB,
                #"/static/custom_admin/custom_admin.css"
            ),
        }


class StaticElementAdmin(admin.ModelAdmin):
    list_display = ('title', )
    readonly_fields = ('title',)
    fieldsets = (
        ('', {
            'classes': ('',),
            'fields': (('title',),
                       )
        }),
        ('Text', {
            'classes': ('trans-fieldset',),
            'fields': (('text', ),)
        }),
    )
    group_fieldsets = True

    class Media:
        js = (
            #settings.JQUERY_LIB,
            #settings.JQUERYUI_LIB,
            #u'{}tab_translation/js/tab_translation.js'.format(settings.STATIC_URL),
            u'{0}select2/js/select2__init.js'.format(settings.STATIC_URL),
        )
        css = {
            "all": (
                #settings.SELECT2_CSS_LIB,
            ),
            'screen': (
                #settings.JQUERYUI_CSSLIB,
                "/static/custom_admin/custom_admin.css"
            ),
        }


class NewsletterUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscription_date', 'is_active',)


class MediaImageAdmin(admin.ModelAdmin):
    readonly_fields = ('image_url', 'id_image', 'image_thumb', 'image_short')
    list_display = ('image_short', 'image_url', 'id_image', 'name', 'image_thumb',)
    list_filter = ('image',)
    search_fields = ('name', 'id', 'image')

    def image_short(self, instance):
        if instance.image:
            return "%s..." % instance.image.url[:25]
        else:
            return ""
    image_short.short_description = u"Image URL"

    def image_url(self, instance):
        if instance.image:
            return "%s" % instance.image.url
        else:
            return ""
    image_url.short_description = u"Image URL"

    def id_image(self, instance):
        return "%s" % instance.pk
    id_image.short_description = u"Image ID"

    def image_thumb(self, instance):
        if instance.image:
            return u'<img src="%s" style="width:150px" />' % instance.image.url
        else:
            return ""
    image_thumb.short_description = u'Image'
    image_thumb.allow_tags = True

admin.site.site_header ="Watchbot administration"
admin.site.register(Article, ArticleAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(MediaImage, MediaImageAdmin)
admin.site.register(Keyword)
admin.site.register(Tag)
admin.site.register(StaticElement, StaticElementAdmin)

