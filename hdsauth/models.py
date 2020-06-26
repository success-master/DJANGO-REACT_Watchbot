# -*- coding: utf-8 -*-
from django.utils.translation import ugettext_lazy as _
from django.db import models
import datetime
import time
from django.contrib.auth.models import *
from django.db import IntegrityError
from django.utils import timezone
from reference.models import Brand
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class HDSUserManager(BaseUserManager):
    def create_user(self, email, first_name=None, last_name=None, password=None, **extra_fields):
        now = datetime.datetime.now()
        now = timezone.make_aware(now, timezone.get_current_timezone())
        if not first_name:
            raise ValueError(_(u'Campo nome obbligatorio'))
        if not last_name:
            raise ValueError(_(u'Campo cognome obbligatorio'))
        user = self.model(email=email, first_name=first_name, last_name=last_name,
                          is_staff=False, is_active=True, is_superuser=False, date_joined=now,
                          last_login=now, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password, **extra_fields):
        u = self.create_user(email, first_name, last_name, password, **extra_fields)
        u.is_staff = True
        u.is_active = True
        u.is_superuser = True
        u.save(using=self._db)
        return u


class HDSAuthUser(AbstractBaseUser, PermissionsMixin, models.Model):
    date_joined = models.DateTimeField(verbose_name=_(u"Data registrazione"), default=timezone.now)
    email = models.EmailField(verbose_name=_(u'E-mail'), unique=True, db_index=True)
    first_name = models.CharField(verbose_name=_(u'Nome'), max_length=100, blank=True, null=True)
    last_name = models.CharField(verbose_name=_(u'Cognome'), max_length=100, blank=True, null=True)
    ip_address = models.CharField(verbose_name=_(u'Indirizzo IP registrazione'), blank=True, null=True, max_length=255)
    sign_up_user_agent = models.CharField("User Agent Registrazione", max_length=255, null=True, blank=True)
    last_mine_seen = models.DateTimeField(verbose_name=_(u"Data ultima visualizzazione notifiche mine"), default=timezone.now)
    last_follow_seen = models.DateTimeField(verbose_name=_(u"Data ultima visualizzazione notifiche follow"), default=timezone.now)
    show_splash = models.BooleanField('Show Splash Screen', default=True)
    avatar = models.ImageField(upload_to='uploads', verbose_name=_(u"Avatar"), max_length=250, blank=True, null=True)
    default_language = models.CharField("Default Language", max_length=50, default="en", choices=(
        ("en", "English"),
        ("it", "Italian"),
    ))
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    is_staff = models.BooleanField('staff', default=False, help_text=_(u'Indica se l\'utente può accedere all\'interfaccia di admin.'))
    is_active = models.BooleanField('attivo', default=False)

    objects = HDSUserManager()

    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name

    @property
    def get_type(self):
        try:
            return self.customer
        except Customer.DoesNotExist:
            pass
        try:
            return self.retailer
        except Retailer.DoesNotExist:
            pass
        try:
            return self.customergame
        except CustomerGame.DoesNotExist:
            pass
        return None

    @property
    def get_user_type(self):
        try:
            self.customer
            return "customer"
        except Customer.DoesNotExist:
            pass
        try:
            self.customergame
            return "customergame"
        except CustomerGame.DoesNotExist:
            pass
        try:
            self.retailer
            return "retailer"
        except Retailer.DoesNotExist:
            pass
        return "other"

    @property
    def get_gestpay_token(self):
        today = datetime.date.today()
        tokens = GestpayToken.objects.filter(user=self)
        token = None
        for _token in tokens:
            is_expired = int(_token.tokenExpiryMonth) >= int(today.month) and int(_token.tokenExpiryYear) >= int(today.strftime('%y'))
            if _token.preferred == True and is_expired == False:
                token = _token
                break
        if token is None:
            for _token in tokens:
                is_expired = int(_token.tokenExpiryMonth) >= int(today.month) and int(_token.tokenExpiryYear) >= int(today.strftime('%y'))
                if is_expired == False:
                    token = _token
                    break
        return token

    def __str__(self):
        if self.first_name and self.last_name:
            return "%s %s (%s)" % (self.first_name, self.last_name, self.email)
        else:
            return "%s" % self.email

    class Meta:
        verbose_name = _(u'Utente')
        verbose_name_plural = _(u'Utenti')
        ordering = ('email',)


@receiver(post_save, sender=HDSAuthUser)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Customer(models.Model):
    user = models.OneToOneField(HDSAuthUser, on_delete=models.CASCADE)
    tax_id = models.CharField("Tax ID", max_length=250, blank=True, null=True)
    gender = models.CharField("Gender", max_length=40, choices=(
        ("male", "Male"),
        ("female", "Female"),
    ), blank=True, null=True)
    birth_date = models.DateField("Date of Birth", blank=True, null=True)
    phone_number = models.CharField("Phone Number", max_length=250, blank=True, null=True)
    country = models.CharField("Country", max_length=250, blank=True, null=True)
    address = models.CharField("Address", max_length=250, blank=True, null=True)
    address_2 = models.CharField("Second line of Address", max_length=250, blank=True, null=True)
    zip_code = models.CharField("Zip Code", max_length=250, blank=True, null=True)
    city = models.CharField("City", max_length=250, blank=True, null=True)
    state = models.CharField("State", max_length=250, blank=True, null=True)
    document_type = models.CharField("Document Type", max_length=40, choices=(
        ("passport", "Passport"),
        ("other", "Other"),
    ), blank=True, null=True)
    document_number = models.CharField("Document Number", max_length=250, blank=True, null=True)
    document_issuer = models.CharField('Document Issuer', max_length=250, blank=True, null=True)
    document_expiry_date = models.DateField("Document expiry date", blank=True, null=True)
    email_contact = models.EmailField("Email")


    def __str__(self):
        return "%s" % self.user

    class Meta:
        verbose_name = _(u'Customer')
        verbose_name_plural = _(u'Customers')
        ordering = ('user',)


class CustomerGame(models.Model):
    user = models.OneToOneField(HDSAuthUser, on_delete=models.CASCADE)
    country = models.CharField("Country", max_length=250, blank=True, null=True)
    city = models.CharField("City", max_length=250, blank=True, null=True)
    tax_id = models.CharField("Tax ID", max_length=250, blank=True, null=True)
    gender = models.CharField("Gender", max_length=40, choices=(
        ("male", "Male"),
        ("female", "Female"),
    ), blank=True, null=True)
    birth_date = models.DateField("Date of Birth", blank=True, null=True)
    phone_number = models.CharField("Phone Number", max_length=250, blank=True, null=True)
    email_contact = models.EmailField("Email")

    def __str__(self):
        return "%s" % self.user

    class Meta:
        verbose_name = _(u'Customer Game')
        verbose_name_plural = _(u'Customers Game')
        ordering = ('user',)


class Retailer(models.Model):
    user = models.OneToOneField(HDSAuthUser, on_delete=models.CASCADE)
    company_name = models.CharField("Company Name", max_length=250)
    phone_number = models.CharField("Phone Number", max_length=250, blank=True, null=True)
    mobile_number = models.CharField("Mobile Number", max_length=250, blank=True, null=True)
    primary_country = models.CharField("Country", max_length=250, blank=True, null=True)
    primary_city = models.CharField("City", max_length=250, blank=True, null=True)
    primary_state = models.CharField("State", max_length=250, blank=True, null=True)
    primary_address = models.CharField("Address", max_length=250, blank=True, null=True)
    primary_second_line_address = models.CharField("Second line Address", max_length=250, blank=True, null=True)
    primary_zip_code = models.CharField("Zip Code", max_length=250, blank=True, null=True)
    secondary_country = models.CharField("Secondary Country", max_length=250, blank=True, null=True)
    secondary_city = models.CharField("Secondary City", max_length=250, blank=True, null=True)
    secondary_state = models.CharField("Secondary State", max_length=250, blank=True, null=True)
    secondary_address = models.CharField("Secondary Address", max_length=250, blank=True, null=True)
    secondary_second_line_address = models.CharField("Secondary Second line Address", max_length=250, blank=True, null=True)
    secondary_zip_code = models.CharField("Secondary Zip Code", max_length=250, blank=True, null=True)
    vat = models.CharField("VAT number", max_length=250, blank=True, null=True)
    shop_id = models.CharField("Shop id Smart2pay", max_length=250, blank=True, null=True)
    brands = models.ManyToManyField(Brand, verbose_name="Managed Brands")
    document_type = models.CharField("Document Type", max_length=40, choices=(
        ("passport", "Passport"),
        ("other", "Other"),
    ), blank=True, null=True)
    document_number = models.CharField("Document Number", max_length=250, blank=True, null=True)
    document_issuer = models.CharField('Document Issuer', max_length=250, blank=True, null=True)
    document_expiry_date = models.DateField("Document expiry date", blank=True, null=True)
    privacy_consent = models.BooleanField("Privacy Consent", default=False)
    trading_rules_acceptance = models.BooleanField("Trading Rules Acceptance", default=False)
    terms_and_conditions = models.BooleanField("Terms & Conditions", default=False)

    @property
    def city(self):
        ## print('>' * 80, 'Retailer CITY', self.primary_city)
        return self.primary_city

    @property
    def country(self):
        ## print('>' * 80, 'Retailer COUNTRY', self.primary_country)
        return self.primary_country

    def __str__(self):
        return "%s" % self.company_name

    class Meta:
        verbose_name = _(u'Retailer')
        verbose_name_plural = _(u'Retailers')
        ordering = ('company_name',)


class CustomerAddress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    country = models.CharField("Country", max_length=250)
    address = models.CharField("Address", max_length=250)
    zip_code = models.CharField("Zip Code", max_length=250)
    city = models.CharField("City", max_length=250)
    state = models.CharField("State", max_length=250)
    preferred_shipping_addr = models.BooleanField("Preferred Shipping Address", default=False)
    preferred_billing_addr = models.BooleanField("Preferred Billing Address", default=False)

    def __str__(self):
        return "%s" % self.customer

    class Meta:
        verbose_name = _(u'Customer Address')
        verbose_name_plural = _(u'Customer Addresses')


class GestpayToken(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE, related_name='gestpay_tokens')
    ccToken = models.TextField("ccToken")
    tokenExpiryMonth = models.CharField('Token Expiry Month', max_length=2)
    tokenExpiryYear = models.CharField('Token Expiry Year', max_length=2)
    preferred = models.BooleanField("Preferred Credit Card", default=False)
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)

    @property
    def is_expired(self):
        today = datetime.date.today()
        if int(self.tokenExpiryYear) <= int(today.strftime('%y')) and int(self.tokenExpiryMonth) < int(today.month):
            return True
        return False

    def __str__(self):
        return "%s" % self.user

    class Meta:
        verbose_name = _(u'User Gestpay Token')
        verbose_name_plural = _(u'User Gestpay Tokens')
        ordering = ('-tokenExpiryYear', '-tokenExpiryMonth')


class Transactions(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE, related_name='transactions')
    gestpay_token = models.ForeignKey(GestpayToken, on_delete=models.CASCADE)
    status = models.CharField("Status", max_length=40, choices=(
        ("pending", "Pending"),
        ("authorized", "Authorized"),
        ("completed", "Completed"),
        ("discharged", "Discharged"),
        ("refunded", "Refunded"),
        ("failed", "Failed"),
        ("check_secure_transaction", "3ds Check"),
    ))
    type = models.CharField("Type transaction", max_length=40, choices=(
        ("deposit_auction", "Deposit Auction"),
        ("balance_payment_auction", "Balance Payment Auction"),
    ))
    shop_transaction_id = models.CharField("Shop Transaction ID", max_length=250, blank=True, null=True)
    bank_transaction_id = models.CharField("Bank Transaction ID", max_length=250, blank=True, null=True)
    authorization_code = models.CharField("Authorization Code", max_length=250, blank=True, null=True)
    transaction_key = models.CharField("Transaction Key", max_length=250, blank=True, null=True)
    risk_code = models.CharField("Authorization Code", max_length=250, blank=True, null=True)
    currency = models.CharField("Currency", max_length=250, blank=True, null=True)
    amount = models.DecimalField(_(u"Amount"), default=0, decimal_places=2, max_digits=10)
    error_code = models.CharField("Error Code", max_length=250, blank=True, null=True)
    alert_code = models.CharField("Alert Code", max_length=250, blank=True, null=True)
    masked_pan = models.CharField("Masked PAN", max_length=250, blank=True, null=True)
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)
    authorized_date = models.DateTimeField("Authorized date", blank=True, null=True)
    completed_date = models.DateTimeField("Completed date", blank=True, null=True)
    refunded_date = models.DateTimeField("Refunded date", blank=True, null=True)
    failed_date = models.DateTimeField("Failed date", blank=True, null=True)
    discharged_date = models.DateTimeField("Discharged date", blank=True, null=True)
    check_secure_transaction_date = models.DateTimeField("Discharged date", blank=True, null=True)

    def __str__(self):
        return "%s" % self.user

    class Meta:
        verbose_name = _(u'User Transaction')
        verbose_name_plural = _(u'User Transactions')


class FireBaseToken(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE)
    token = models.TextField("Token")
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)

    def __str__(self):
        return "Token %s" % self.user

    class Meta:
        verbose_name = _(u"FireBase Token")
        verbose_name_plural = _(u"FireBase Token")


class NewsletterUser(models.Model):
    email = models.EmailField(verbose_name=_(u"E-mail"), unique=True)
    is_active = models.BooleanField(_(u"Attivo"), default=False)
    ip_address = models.CharField(_(u"Indirizzo IP"), max_length=255)
    subscription_date = models.DateTimeField("Data iscrizione", auto_now_add=True)

    def __str__(self):
        return "%s" % self.email

    class Meta:
        verbose_name = "Newsletter User"
        verbose_name_plural = "Newsletter Users"
        ordering = ["email"]
