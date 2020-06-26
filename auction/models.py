# -*- coding: utf-8 -*-
from django.db import models, IntegrityError
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
import datetime
from django.utils import timezone
from reference.models import Reference
from hdsauth.models import HDSAuthUser, Transactions
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .firebase_utils import *
import sys
import traceback


AUCTION_STATUS = (
    ("first_call_open", "Auction created"),
    ("first_call", "First call started"),
    ("first_call_selection", "First call completed - on selection"),
    ("decayed_first_call", "Decayed - not enough call"),
    ("decayed_first_call_selection", "Decayed - no selection done"),
    ("second_call_open", "Second call ready - preload started"),
    ("second_call", "Second call started"),
    ("second_call_selection", "Second call completed - on selection"),
    ("decayed_second_call", "Decayed second call - no selection done"),
    ("winner_selected", "Auction completed - winner selected"),
    ("decayed_second_call_selection", "Decayed second call - no winner selected"),
    ("closed", "Payment completed"),
    ("decayed_not_payed", "Decayed - Payment not completed"),
    ("error", "Closed because of an error"),
)

PAYMENT_METHODS = (
    ("creditCard", "Credit Card"),
    ("bitcoin", "Bitcoin"),
    ("moneyTransfer", "Money Transfer")
)


class Auction(models.Model):
    type = models.CharField(_("Auction type"), max_length=255, choices=(
        ("put", "Put"),
        ("call", "Call"),
    ))
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)
    balance_transaction = models.OneToOneField(Transactions, on_delete=models.CASCADE, blank=True, null=True, related_name="balance_transaction")
    deposit_transaction = models.OneToOneField(Transactions, on_delete=models.CASCADE, blank=True, null=True, related_name="deposit_transaction")
    price = models.DecimalField(_(u"Price asked"), default=0, decimal_places=2, max_digits=10)
    wb_fee = models.DecimalField(_(u"WB Fee"), default=0, decimal_places=2, max_digits=10)
    deposit = models.DecimalField(_(u"Deposit"), default=0, decimal_places=2, max_digits=10)
    raise_price = models.DecimalField(
        _(u"Raise Price asked"), decimal_places=2, max_digits=10,
        null=True, blank=True
    )
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)
    call_1_start_date = models.DateTimeField(_("First Call Start Date"), blank=True, null=True)
    call_1_end_date = models.DateTimeField(_("First Call End Date"), blank=True, null=True)
    call_1_end_selection = models.DateTimeField(_("First Call End Selection"), blank=True, null=True)
    call_2_start_date = models.DateTimeField(_("Second Call Start Date"), blank=True, null=True)
    call_2_end_date = models.DateTimeField(_("Second Call End Date"), blank=True, null=True)
    call_2_end_selection = models.DateTimeField(_("Second Call End Selection"), blank=True, null=True)
    payment_expiry = models.DateTimeField(_("Payment time expiry"), blank=True, null=True)
    status = models.CharField(_(u"Status"), max_length=255, choices=AUCTION_STATUS, default="first_call_open")
    payment_method = models.CharField(_(u"Payment Method"), max_length=255, choices=PAYMENT_METHODS, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    owner = GenericForeignKey('content_type', 'object_id')
    winner_content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, blank=True, null=True,
                                            related_name="won_auction")
    winner_object_id = models.PositiveIntegerField(blank=True, null=True)
    winner = GenericForeignKey('winner_content_type', 'winner_object_id')
    joined_list = models.CharField("Joined", blank=True, null=True, max_length=250)
    second_call_joined_list = models.CharField("Second call Joined", blank=True, null=True, max_length=250)
    first_call_selection_list = models.CharField("User selected", blank=True, null=True, max_length=250)
    first_call_selection_date = models.DateTimeField("First call selection date", blank=True, null=True)
    first_call_selection_completed = models.BooleanField("First Call Selection Completed", default=False)
    raised_by_owner = models.BooleanField("Raised by owner", default=False)
    main_image = models.ImageField("Main Image", blank=True, null=True)
    closed = models.BooleanField("Closed or decayed", default=False)
    closed_date = models.DateTimeField("Closed date", blank=True, null=True)
    delay_used = models.PositiveSmallIntegerField("Delay used", default=0)
    payment_3ds_check = models.BooleanField("Payment 3ds check", default=False)

    def __str__(self):
        return "Auction %s - %s" % (self.reference, self.call_1_start_date)

    def create_notification(self, user, mine_follow, notification_type,
                            new_status=None):
        notification = Notification(
            user=user,
            auction=self,
            mine_follow=mine_follow,
            notification_type=notification_type,
            reference=self.reference,
            new_status=new_status
        )
        notification.save()

    @property
    def time_remain(self):
        try:
            return_value = 0
            now = timezone.now()
            if self.status == "first_call_open":
                return_value = self.call_1_start_date - now
            elif self.status == "first_call":
                return_value = self.call_1_end_date - now
            elif self.status == "first_call_selection":
                if self.first_call_selection_completed:
                    return_value = self.call_2_start_date - now
                else:
                    return_value = self.call_1_end_selection - now
            elif self.status == "second_call_open":
                return_value = self.call_2_start_date - now
            elif self.status == "second_call":
                return_value = self.call_2_end_date - now
            elif self.status == "second_call_selection":
                return_value = self.call_2_end_selection - now
            elif self.status == "winner_selected":
                return_value = self.payment_expiry - now
            return return_value
        except TypeError:
            return 0

    def update_status(self, logger=False):
        """
        ("first_call_open", "Auction created"),
        ("first_call", "First call started"),
        ("first_call_selection", "First call completed - on selection"),
        ("decayed_first_call", "Decayed - not enough call"),
        ("decayed_first_call_selection", "Decayed - no selection done"),
        ("second_call_open", "Second call ready - preload started"),
        ("second_call", "Second call started"),
        ("second_call_selection", "Second call completed - on selection"),
        ("decayed_second_call", "Decayed second call - not enough call"),
        ("winner_selected", "Auction completed - winner selected"),
        ("decayed_second_call_selection", "Decayed second call - no winner selected"),
        ("closed", "Payment completed"),
        ("decayed_not_payed", "Decayed - Payment not completed"),
        """
        #now = datetime.datetime.now()
        now = timezone.now()
        try:
            if self.status == "first_call_open" and now >= self.call_1_start_date:
                self.status = "first_call"
                # firebase_update_auction_status(self)
                self.save()
            elif self.status == "first_call" and now >= self.call_1_end_date:
                if self.offers.filter(
                        call_number="first_call", approved=True
                ).count() >= settings.AUCTION_DEFAULT_SETTINGS["minimum_call_first"]:
                    self.status = "first_call_selection"
                    self.save()
                    # firebase_update_auction_status(self)
                else:
                    self.status = "decayed_first_call"
                    self.closed = True
                    self.closed_date = now
                    self.save()
                # firebase_update_auction_status(self)
            elif self.status == "first_call_selection" and now >= self.call_1_end_selection:
                if self.first_call_selection_completed == True:
                    if self.raise_price is None:
                        self.raise_price = self.price
                        now = datetime.datetime.now()
                        self.call_2_start_date = now
                        self.call_2_end_date = now + datetime.timedelta(
                            seconds=settings.AUCTION_DEFAULT_SETTINGS["x4"])
                        self.call_2_end_selection = self.call_2_end_date + datetime.timedelta(
                            seconds=settings.AUCTION_DEFAULT_SETTINGS["x5"])
                        self.payment_expiry = self.call_2_end_selection + datetime.timedelta(
                            seconds=settings.AUCTION_DEFAULT_SETTINGS["x6"])
                    self.status = "second_call_open"
                    self.save()
                    # firebase_update_auction_status(self)
                else:
                    self.status = "decayed_first_call_selection"
                    self.closed = True
                    self.closed_date = now
                    self.save()
                # firebase_update_auction_status(self)
            elif self.status == "second_call_open" and now >= self.call_2_start_date:
                self.status = "second_call"
                self.save()
                # firebase_update_auction_status(self)
            elif self.status == "second_call" and now >= self.call_2_end_date:
                if self.offers.filter(
                    call_number="second_call", approved=True
                ).count() > 0:
                    self.status = "second_call_selection"
                    self.save()
                    # firebase_update_auction_status(self)
                else:
                    self.status = "decayed_second_call"
                    self.closed = True
                    self.closed_date = now
                    self.save()
                    # firebase_update_auction_status(self)
            elif self.status == "second_call_selection" and now >= self.call_2_end_selection:
                try:
                    auction_winner = self.auctionwinner
                    self.status = "winner_selected"
                    self.winner = auction_winner.winner
                    self.save()
                    # firebase_update_auction_status(self)
                except AuctionWinner.DoesNotExist:
                    self.status = "decayed_second_call_selection"
                    self.closed = True
                    self.closed_date = now
                    self.save()
                    # firebase_update_auction_status(self)
            elif self.status == "second_call_selection" and now < self.call_2_end_selection:
                try:
                    auction_winner = self.auctionwinner
                    self.status = "winner_selected"
                    self.winner = auction_winner.winner
                    self.save()
                    # firebase_update_auction_status(self)
                except AuctionWinner.DoesNotExist:
                    pass
            elif self.status == "winner_selected":
                if now >= self.payment_expiry:
                    try:
                        auction_winner = self.auctionwinner
                        if auction_winner.payment_set.filter(status="completed").count() > 0:
                            self.status = "closed"
                            self.save()
                            # firebase_update_auction_status(self)
                        else:
                            self.status = "decayed_not_payed"
                            self.closed = True
                            self.closed_date = now
                            self.save()
                            # firebase_update_auction_status(self)
                    except AuctionWinner.DoesNotExist:
                        self.status = "decayed_second_call_selection"
                        self.closed = True
                        self.closed_date = now
                        self.save()
                        # firebase_update_auction_status(self)
                elif self.payment_3ds_check and self.balance_transaction.status == 'check_secure_transaction':
                    reset_date = self.balance_transaction.check_secure_transaction_date + datetime.timedelta(minutes=5)
                    if now > reset_date:
                        self.payment_method = None
                        self.balance_transaction = None
                        self.payment_3ds_check = False
                        self.save()
        except TypeError:
            self.closed = True
            self.closed_date = now
            self.status = "error"
            if logger:
                logger.error(sys.exc_info()[0])
                logger.error(traceback.format_exc())
                logger.error(TypeError)
            self.save()

    class Meta:
        verbose_name = _(u"Auction")
        verbose_name_plural = _(u"Auctions")
        ordering = ["-call_1_start_date"]


class Offer(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='offers')
    deposit_transaction = models.OneToOneField(Transactions, on_delete=models.CASCADE, blank=True, null=True)
    call_number = models.CharField(_("Call Number"), max_length=20, choices=(
        ("first_call", "First Call"),
        ("second_call", "Second Call"),
    ), default="first_call")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    user = GenericForeignKey('content_type', 'object_id')
    price = models.DecimalField(_(u"Price called"), default=0, decimal_places=2, max_digits=10)
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)
    approved = models.BooleanField("Approved", default=False)
    vat = models.DecimalField(_(u"VAT"), default=0, decimal_places=2, max_digits=10)
    duties = models.DecimalField(_(u"Duties"), default=0, decimal_places=2, max_digits=10)
    shipping = models.DecimalField(_(u"Shipping"), default=0, decimal_places=2, max_digits=10)
    insurance = models.DecimalField(_(u"Insurance"), default=0, decimal_places=2, max_digits=10)
    payment_3ds_check = models.BooleanField("Payment 3ds check", default=False)

    def __str__(self):
        return "Offer %s - %s" % (self.user, self.auction)

    @property
    def check_validity(self):
        return True
        # if self.user == self.auction.owner:
        #     print(1)
        #     return False
        # if self.auction.closed:
        #     print(2)
        #     return False
        # user_type_class_name = self.user.__class__.__name__
        # if user_type_class_name.lower() == "retailer" and self.auction.reference.brand not in self.user.brands.all():
        #     print(3)
        #     return False
        # if user_type_class_name.lower() == "retailer" and self.auction.type == "put":
        #     print(4)
        #     return False
        # if user_type_class_name.lower() == "customer" and self.auction.type == "call":
        #     print(5)
        #     return False
        # if self.auction.status not in [
        #     "first_call_open", "first_call", "second_call",
        # ]:
        #     print(6)
        #     return False
        # if self.auction.status == "second_call" and SelectedOffer.objects.filter(
        #     offer__object_id=self.object_id,
        #     offer__content_type=self.content_type,
        #     offer__call_number="first_call",
        #     offer__approved=True
        # ).count() == 0:
        #     print(7)
        #     return False
        # if Offer.objects.filter(
        #     auction=self.auction,
        #     object_id=self.object_id,
        #     content_type=self.content_type,
        #     call_number=self.call_number
        # ).count() > 0:
        #     print(8)
        #     return False
        # return True

    @property
    def is_first_offer(self):
        return Offer.objects.filter(
            object_id=self.object_id,
            content_type=self.content_type,
            auction=self.auction
        ).count() == 1

    @property
    def first_offer(self):
        return Offer.objects.filter(
            object_id=self.object_id,
            content_type=self.content_type,
            auction=self.auction,
            call_number="first_call"
        ).first()

    def save(self, *args, **kwargs):
        super(Offer, self).save(*args, **kwargs)
        if self.call_number == "first_call":
            if self.auction.joined_list:
                joined_list = self.auction.joined_list.split(",")
            else:
                joined_list = []
            if self.content_type.model.lower() in ["customer", "retailer"] and self.approved:
                if "%s" % self.user.user.pk not in joined_list:
                    joined_list.append("%s" % self.user.user.pk)
                    joined_string = ",".join(joined_list)
                    self.auction.joined_list = joined_string
                    self.auction.save()
        else:
            if self.auction.second_call_joined_list:
                second_call_joined_list = self.auction.second_call_joined_list.split(",")
            else:
                second_call_joined_list = []
            if self.content_type.model.lower() in ["customer", "retailer"] and self.approved:
                if "%s" % self.user.user.pk not in second_call_joined_list:
                    second_call_joined_list.append("%s" % self.user.user.pk)
                    joined_string = ",".join(second_call_joined_list)
                    self.auction.second_call_joined_list = joined_string
                    self.auction.save()

    def delete(self, *args, **kwargs):
        if self.call_number == "first_call":
            if self.auction.joined_list:
                joined_list = self.auction.joined_list.split(",")
            else:
                joined_list = []
            if "%s" % self.user.user.pk in joined_list:
                joined_list.remove("%s" % self.user.user.pk)
                joined_string = ",".join(joined_list)
                self.auction.joined_list = joined_string
                self.auction.save()
        else:
            if self.auction.second_call_joined_list:
                second_call_joined_list = self.auction.second_call_joined_list.split(",")
            else:
                second_call_joined_list = []
            if "%s" % self.user.user.pk in second_call_joined_list:
                second_call_joined_list.remove("%s" % self.user.user.pk)
                joined_string = ",".join(second_call_joined_list)
                self.auction.second_call_joined_list = joined_string
                self.auction.save()
        super(Offer, self).delete(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Offer")
        verbose_name_plural = _(u"Offers")
        ordering = ["pk"]
        unique_together = ["auction", "call_number", "content_type", "object_id"]


class SelectedOffer(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='selections')
    offer = models.ForeignKey(Offer, limit_choices_to={"call_number": "first_call"}, on_delete=models.CASCADE)
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)

    def save(self, *args, **kwargs):
        super(SelectedOffer, self).save(*args, **kwargs)

    class Meta:
        verbose_name = _(u"Offers Selection")
        verbose_name_plural = _(u"Offers Selections")
        ordering = ["pk"]
        unique_together = ["auction", "offer"]


class AuctionWinner(models.Model):
    auction = models.OneToOneField(Auction, on_delete=models.CASCADE)
    offer = models.OneToOneField(Offer, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    winner = GenericForeignKey('content_type', 'object_id')
    price = models.DecimalField(_(u"Final Price"), default=0, decimal_places=2, max_digits=10)
    insert_date = models.DateTimeField("Insert date", auto_now_add=True)

    def __str__(self):
        return "Auction Winner %s - %s" % (self.winner, self.auction)

    class Meta:
        verbose_name = _(u"Auction Winner")
        verbose_name_plural = _(u"Auction Winner")
        ordering = ["pk"]


class Payment(models.Model):
    auction_winner = models.ForeignKey(AuctionWinner, on_delete=models.CASCADE)
    price = models.DecimalField(_(u"Price asked"), default=0, decimal_places=2, max_digits=10)
    status = models.CharField(_(u"Status"), max_length=255)

    def __str__(self):
        return "Payment %s" % (self.auction_winner, )

    class Meta:
        verbose_name = _(u"Payment")
        verbose_name_plural = _(u"Payments")
        ordering = ["pk"]


class Delivery(models.Model):
    auction_winner = models.ForeignKey(AuctionWinner, on_delete=models.CASCADE)
    delivery_asked_date = models.DateTimeField(_("Delivery asked date"), blank=True, null=True)
    shipment_id = models.CharField(_(u"Shipment ID"), max_length=255, null=True)
    status = models.CharField(_(u"Status"), max_length=255)
    notes = models.CharField(_(u"Notes"), max_length=255, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    sender = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return "Delivery %s" % (self.auction_winner, )

    class Meta:
        verbose_name = _(u"Delivery")
        verbose_name_plural = _(u"Deliveries")
        ordering = ["pk"]


class Notification(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE)
    mine_follow = models.PositiveSmallIntegerField("Mine/Follow", choices=(
        (1, "Mine"),
        (2, "Follow"),
    ))
    notification_type = models.PositiveSmallIntegerField("Type", choices=(
        (1, "status_changed"),
        (2, "new_offer"),
        (3, "first_call_user_selected"),
        (4, "winner_selected"),
        (5, "auction_created"),
        (6, 'auction_decayed_or_cancelled'),
        (7, 'auction_payed'),
        (8, 'auction_decayed_not_payed'),
    ))
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)
    creation_date = models.DateTimeField("Date", auto_now_add=True)
    new_status = models.CharField("New status", blank=True, null=True,
                                  max_length=200)
    read = models.BooleanField("Read", default=False)

    def __str__(self):
        return "Notification %s - %s" % (self.user, self.auction)

    @property
    def reference_string(self):
        return "%s - %s - %s" % (self.reference.brand_name,
                                 self.reference.model_name,
                                 self.reference.reference)

    @property
    def get_type(self):
        return self.get_notification_type_display()

    class Meta:
        verbose_name = _(u"Notification")
        verbose_name_plural = _(u"Notifications")
        ordering = ["-creation_date"]


class Alert(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)
    price = models.PositiveIntegerField(_(u"Price"), default=0)
    deviation = models.CharField(_(u"Deviation"), blank=True, null=True, max_length=255)

    def __str__(self):
        return "Alert %s - %s" % (self.user, self.reference)

    class Meta:
        verbose_name = _(u"Alert")
        verbose_name_plural = _(u"Alerts")
        ordering = ["pk"]
        unique_together = ["user", "reference"]


class Follow(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)

    def __str__(self):
        return "Follow %s - %s" % (self.user, self.reference)

    class Meta:
        verbose_name = _(u"Follow")
        verbose_name_plural = _(u"Follows")
        ordering = ["pk"]
        unique_together = ["user", "reference"]


class Dashboard(models.Model):
    user = models.ForeignKey(HDSAuthUser, on_delete=models.CASCADE)
    reference = models.ForeignKey(Reference, on_delete=models.CASCADE)

    def __str__(self):
        return "Dashboard %s - %s" % (self.user, self.reference)

    class Meta:
        verbose_name = _(u"Dashboard Reference")
        verbose_name_plural = _(u"Dashboard References")
        ordering = ["reference"]
        unique_together = ["user", "reference"]

class TransactionsSmart2Pay(models.Model):
    order_id = models.ForeignKey(Auction, on_delete=models.CASCADE)
    order_line_id = models.CharField(_(u"Order line ID"), blank=True, null=True, max_length=255)
    amount = models.DecimalField(_(u"Amount"), default=0, decimal_places=2, max_digits=10)
    currency = models.CharField(_(u"Currency"), blank=True, null=True, max_length=255)
    payment_state = models.CharField(_(u"Payment state"), blank=True, null=True, max_length=255)
    payment_batch_number = models.CharField(_(u"Payment batch number"), blank=True, null=True, max_length=255)
    refund_id = models.CharField(_(u"Refund id"), blank=True, null=True, max_length=255)
    shop_id = models.CharField(_(u"Shop id"), blank=True, null=True, max_length=255)
    shop_name = models.CharField(_(u"Shop name"), blank=True, null=True, max_length=255)
    transaction_type = models.CharField(_(u"Transaction type"), blank=True, null=True, max_length=255)
    vat_rate = models.DecimalField(_(u"Vat rate"), default=0, decimal_places=2, max_digits=10)
    date_created = models.DateTimeField("Date created", auto_now_add=True)
    last_updated = models.DateTimeField("Last updated", auto_now_add=True)

    def __str__(self):
        return "Transaction Smart2Pay - %s" % (self.order_id)

    class Meta:
        verbose_name = _(u"Transaction Smart2Pay")
        verbose_name_plural = _(u"Transaction Smart2Pay")
        ordering = ["pk"]
