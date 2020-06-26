# -*- coding: utf-8 -*-
from django.db import models, IntegrityError
from django.utils.translation import ugettext_lazy as _


class TranslationDictionary(models.Model):
    key_index = models.CharField(_("Key"), max_length=255, unique=True)
    description = models.CharField(_("Description"), blank=True, null=True, max_length=255)
    translated_text = models.CharField(_("Translation"), max_length=255)

    def __str__(self):
        return "Translation %s" % (self.key_index, )

    class Meta:
        verbose_name = _(u"Translation Dictionary")
        verbose_name_plural = _(u"Translations Dictionary")
        ordering = ["key_index"]
