# -*- coding: utf-8 -*-
import datetime
import re

from django.utils.translation import ugettext_lazy as _
from django.db import models, IntegrityError
from image_cropping import ImageRatioField
from imagekit.models import ImageSpecField
from pilkit.processors import *
from django.utils import timezone
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.contrib.sitemaps import ping_google
from ckeditor.fields import RichTextField
from ckeditor_uploader.fields import RichTextUploadingField
from django.conf import settings


class PositionModel(models.Model):
    """
    It's an abstract model to create sortable items in list_display or in inline admin
    """
    position = models.PositiveIntegerField(_(u'Position'), default=0)

    def __str__(self):
        return u"%s %s" % (self.__class__.__name__, self.position)

    @property
    def max_pos(self):
        max_number_instance = self.__class__.objects.aggregate(models.Max('position'))['position__max']
        if max_number_instance:
            return max_number_instance + 1
        else:
            return 1

    def save(self, *args, **kwargs):
        if self.position == 0:
            self.position = self.max_pos
        super(PositionModel, self).save(*args, **kwargs)

    class Meta:
        abstract = True


class Keyword(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, unique=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)

    def __str__(self):
        return "%s" % self.name

    class Meta:
        verbose_name = _(u"Keyword")
        verbose_name_plural = _(u"Keywords")
        ordering = ["name"]


class Tag(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, unique=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)

    def __str__(self):
        return "%s" % self.name

    class Meta:
        verbose_name = _(u"Tag")
        verbose_name_plural = _(u"Tags")
        ordering = ["name"]


class StaticElement(models.Model):
    title = models.CharField(_(u"Title"), max_length=255)
    text = RichTextUploadingField(_(u"Text"), blank=True, null=True)

    def __str__(self):
        return "%s" % self.title

    class Meta:
        verbose_name = _(u"Pagina Statica")
        verbose_name_plural = _(u"Pagine Statiche")
        ordering = ["title"]


class MediaImage(models.Model):
    image = models.ImageField(upload_to='uploads', verbose_name=_(u"Media Image"), blank=True, max_length=250)
    name = models.CharField(_(u"Name"), null=True, blank=True, max_length=255)
    resize_150 = ImageSpecField(
        source='image',
        processors=[ResizeToFill(150, 150)],
        format='JPEG',
        options={'quality': 99}
    )

    def __str__(self):
        return "%s: %s" % (self.pk, self.image)

    class Meta:
        verbose_name = _(u"Media Image")
        verbose_name_plural = _(u"Media Images")
        ordering = ["id"]


class Category(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, unique=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)
    description = models.TextField(_(u"Description"), blank=True, null=True)

    def __str__(self):
        return "%s" % self.name

    class Meta:
        verbose_name = _(u"Categoria")
        verbose_name_plural = _(u"Categorie")
        ordering = ["name"]


class Article(models.Model):
    category = models.ForeignKey(Category, verbose_name=_(u"Categoria"), blank=True, null=True,
                                 on_delete=models.SET_NULL)
    title = models.CharField(_(u"Titolo"), max_length=255)
    subtitle = models.CharField(_(u"Sottotitolo"), max_length=255, blank=True, null=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)
    img_name = models.CharField(_(u"Titolo immagine principale"), max_length=250)
    img_author = models.CharField(_(u"Autore immagine principale"), max_length=250)
    img = models.ImageField(upload_to='uploads', verbose_name=_(u"Immagine principale"), max_length=250)
    img_secondary_name = models.CharField(_(u"Titolo immagine secondaria"), max_length=250, null=True, blank=True,)
    img_secondary_author = models.CharField(_(u"Autore immagine secondaria"), max_length=250, null=True, blank=True,)
    img_secondary = models.ImageField(upload_to='uploads', verbose_name=_(u"Immagine secondaria"), max_length=250, null=True, blank=True,)
    description = models.TextField(_(u"Descrizione"), blank=True, null=True)
    text = RichTextUploadingField(verbose_name=_(u"Testo"))
    keywords = models.ManyToManyField(Keyword, verbose_name=_(u"Parole chiave"), blank=True)
    tags = models.ManyToManyField(Tag, verbose_name=_(u"Tag"), blank=True)
    published = models.BooleanField(_(u"Pubblica"), default=False)
    date = models.DateTimeField(_(u"Data di pubblicazione"), default=datetime.datetime.now)
    creation_date = models.DateTimeField(_(u"Data di creazione"), auto_now_add=True)
    last_update_date = models.DateTimeField(_(u"Data ultimo aggiornamento"), auto_now=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 null=True, blank=True, on_delete=models.SET_NULL)
    resize_150 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(150, 150)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_home_370 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(370, 211)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_370_254 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(370, 254)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_home_270_310 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(270, 310)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_single_page_644 = ImageSpecField(
        source='img',
        processors=[ResizeToFit(644, 611)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_home_72_66 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(72, 66)],
        format='JPEG',
        options={'quality': 99}
    )
    resize_120_92 = ImageSpecField(
        source='img',
        processors=[ResizeToFill(120, 92)],
        format='JPEG',
        options={'quality': 99}
    )

    def __str__(self):
        return "%s" % self.title

    @property
    def get_url(self):
        return "articles/%s/" % self.slug

    def get_absolute_url(self):
        return reverse_lazy("articles", kwargs={"slug": self.slug})

    def save(self, *args, **kwargs):
        super(Article, self).save(*args, **kwargs)
        if self.published:
            try:
                self.newsletterqueue
            except NewsletterQueue.DoesNotExist:
                # if NewsletterQueue.objects.filter(article=self).count() == 0:
                newsletter_article = NewsletterQueue()
                newsletter_article.article = self
                newsletter_article.save()
        try:
            ping_google()
        except Exception:
            # Bare 'except' because we could get a variety
            # of HTTP-related exceptions.
            pass

    class Meta:
        verbose_name = _(u"Articolo")
        verbose_name_plural = _(u"Articoli")
        ordering = ["-date"]


class NewsletterQueue(models.Model):
    article = models.OneToOneField(Article, on_delete=models.CASCADE)
    datetime = models.DateTimeField("Data inserimento", auto_now_add=True)
    completed = models.BooleanField("Completed", default=False)
    timestamp_completed = models.DateTimeField("Completion timestamp", blank=True, null=True)
    under_cron_processing = models.BooleanField("Currently under processing", default=False)
    error = models.BooleanField("Error during process", default=False)
    error_text = models.TextField("Messaggio di errore", blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.completed and self.timestamp_completed is None:
            raise IntegrityError('Cannot save completed job if completion timestamp is None')
        if self.completed and self.under_cron_processing:
            raise IntegrityError('Cannot save job if under cron processing')
        super(NewsletterQueue, self).save(*args, **kwargs)

    def begin(self):
        if not self.completed and not self.under_cron_processing:
            self.under_cron_processing = True
            self.save()

    def complete(self):
        if not self.completed and self.under_cron_processing:
            self.under_cron_processing = False
            self.timestamp_completed = datetime.datetime.now()
            self.completed = True
            self.save()

    def reset(self):
        if self.under_cron_processing:
            self.under_cron_processing = False
            self.timestamp_completed = None
            self.completed = False
            self.save()

    def set_error(self):
        if self.under_cron_processing:
            self.under_cron_processing = False
        self.timestamp_completed = None
        self.completed = False
        self.error = True
        self.save()

    def processable(self):
        if self.completed or self.under_cron_processing:
            return False
        return True

    class Meta:
        verbose_name = _(u'Invio Newsletter')
        verbose_name_plural =(u'Invio Newsletter')
        ordering = ["-datetime"]