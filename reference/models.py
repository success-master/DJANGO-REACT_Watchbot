# -*- coding: utf-8 -*-
from django.db import models, IntegrityError
from django.utils.translation import ugettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.template.defaultfilters import slugify
import datetime


GENDER_CHOICE = (
    ('woman', 'Woman'),
    ('man', 'Man'),
    ('unisex', 'Unisex'),
)


class Brand(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, unique=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)
    description = models.TextField(_(u"Description"), blank=True, null=True)

    def __str__(self):
        return "%s" % self.name

    def save(self, *args, **kwargs):
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = slugify(self.name)
        super(Brand, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Brand")
        verbose_name_plural = _(u"Brands")
        ordering = ["name"]


class Model(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    name = models.CharField(_(u"Name"), max_length=255, unique=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)
    label = models.CharField(_("Label"), max_length=255, blank=True, null=True)
    description = models.TextField(_(u"Description"), blank=True, null=True)

    def __str__(self):
        return "%s" % self.label

    def save(self, *args, **kwargs):
        self.label = "%s %s" % (self.brand.name, self.name)
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = slugify(self.name)
        super(Model, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Model")
        verbose_name_plural = _(u"Models")
        ordering = ["name"]


class Movement(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, null=True, blank=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)

    def __str__(self):
        return "%s" % self.name

    def save(self, *args, **kwargs):
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = slugify(self.name)
        super(Movement, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Movement")
        verbose_name_plural = _(u"Movements")
        ordering = ["name"]


class CaseMaterial(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, null=True, blank=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)

    def __str__(self):
        return "%s" % self.name

    def save(self, *args, **kwargs):
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = slugify(self.name)
        super(CaseMaterial, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Case Material")
        verbose_name_plural = _(u"Case Materials")
        ordering = ["name"]


class WatchstrapMaterial(models.Model):
    name = models.CharField(_(u"Name"), max_length=255, null=True, blank=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)

    def __str__(self):
        return "%s" % self.name

    def save(self, *args, **kwargs):
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = slugify(self.name)
        super(WatchstrapMaterial, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Watchstrap Material")
        verbose_name_plural = _(u"Watchstrap Materials")
        ordering = ["name"]


class Reference(models.Model):
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    brand = models.ForeignKey(Brand, blank=True, null=True, on_delete=models.SET_NULL)
    model_name = models.CharField(_(u"Model Name"), max_length=255, blank=True, null=True)
    brand_name = models.CharField(_(u"Brand Name"), max_length=255, blank=True, null=True)
    reference_base = models.CharField(_(u"Reference"), max_length=255)
    reference_ext = models.CharField(_(u"Reference Extension"), max_length=25, blank=True, null=True)
    label = models.CharField(_(u"Label"), max_length=255, blank=True, null=True)
    picture_url = models.ImageField(upload_to='uploads', verbose_name=_(u"Photo"), max_length=250)
    dial_color = models.CharField(_(u"Dial Color"), max_length=255, blank=True, null=True)
    bracelet_material = models.CharField(_(u"Bracelet Material"), max_length=255, blank=True, null=True)
    case_size = models.CharField(_(u"Case Size"), max_length=255, blank=True, null=True)
    note = models.CharField(_(u"Note"), max_length=255, blank=True, null=True)
    slug = models.SlugField(_(u"Slug"), max_length=255, unique=True)
    description = models.TextField(_(u"Description"), blank=True, null=True)
    movement = models.ManyToManyField(Movement)
    case_material = models.ForeignKey(CaseMaterial, on_delete=models.CASCADE)
    watchstrap_material = models.ForeignKey(WatchstrapMaterial, on_delete=models.CASCADE, blank=True, null=True)
    year = models.PositiveIntegerField(_(u"Production Year"), validators=[
        MinValueValidator(1900), MaxValueValidator(datetime.datetime.now().year)],
        blank=True, null=True,
        help_text="Use the following format: &lt;YYYY&gt;")
    gender = models.CharField(_("Gender"), max_length=100, choices=GENDER_CHOICE)
    price = models.PositiveIntegerField(_(u"Price"), default=0)

    @property
    def reference(self):
        return self.reference_base

    @property
    def full_reference(self):
        return '{}[{}]'.format(self.reference_base, self.reference_ext)

    @property
    def full_reference_slug(self):
        if self.reference_ext:
            reference_name = '{}-{}'.format(self.reference_base, self.reference_ext)
            # print('[0] FULL REFERENCE SLUG', reference_name)
        else:
            reference_name = self.reference_base
            # print('[1]FULL REFERENCE SLUG', reference_name)
        return slugify(reference_name)

    def __str__(self):
        return "%s" % self.label

    def save(self, *args, **kwargs):
        if not self.id and not self.slug:
            # Newly created object, so set slug
            self.slug = self.full_reference_slug
            # print('SAVE REFERENCE SLUG', self.slug)
        self.brand = self.model.brand
        self.label = "%s %s %s" % (self.brand.name, self.model.name, self.full_reference)
        self.brand_name = self.brand.name
        self.model_name = self.model.name
        super(Reference, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Reference")
        verbose_name_plural = _(u"References")
        ordering = ["label"]
        unique_together = [['reference_base', 'reference_ext']]
