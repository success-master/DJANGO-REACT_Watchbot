# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import *
from reference.serializers import *
from api.serializers import TimeStampField
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class JoinedByThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user = request.user
        if value.joined_list:
            joined_list = value.joined_list.split(",")
            if "%s" % user.pk in joined_list:
                return True
        return False


class DelayField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return 3 - value.delay_used


class SecondCallOfferCompletedField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        selected_count = SelectedOffer.objects.filter(
            auction=value, offer__call_number="first_call", offer__approved=True
        ).count()
        second_call_offer_count = Offer.objects.filter(
            auction=value, call_number="second_call", approved=True
        ).count()
        if selected_count == second_call_offer_count and selected_count > 0:
            return True
        return False


class SecondCallJoinedByThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user = request.user
        if value.second_call_joined_list:
            joined_list = value.second_call_joined_list.split(",")
            if "%s" % user.pk in joined_list:
                return True
        return False


class FirstCallSelThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user = request.user
        if value.first_call_selection_list:
            first_call_selection_list = value.first_call_selection_list.split(",")
            if "%s" % user.pk in first_call_selection_list:
                return True
        return False


class OwnedByThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user_type = request.user.get_type
        if not user_type:
            return False
        if value.owner == user_type:
            return True
        return False


class WonByThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user_type = request.user.get_type
        if not user_type:
            return False
        if value.winner == user_type:
            return True
        return False


class SellerField(serializers.ReadOnlyField):
    def to_representation(self, value):
        if value.owner.__class__.__name__ == "Customer":
            return {
                "country": value.owner.country,
                "city": value.owner.city,
            }
        else:
            return {
                "country": value.owner.primary_country,
                "city": value.owner.primary_city,
            }


class WinnerMatchField(serializers.ReadOnlyField):
    def to_representation(self, value):
        try:
            auction_winner = AuctionWinner.objects.get(
                auction=value
            )
            matched_price = auction_winner.price
        except AuctionWinner.DoesNotExist:
            matched_price = None
        return matched_price


class BuyerField(serializers.ReadOnlyField):
    def to_representation(self, value):
        auction_winner = AuctionWinner.objects.get(
            auction=value
        )
        if value.winner.__class__.__name__ == "Customer":
            customer = value.winner
            customer_address = CustomerAddress.objects.filter(
                customer=customer,
            )
            try:
                data = customer_address.get(preferred_shipping_addr=True)
                address = data.address
                zip_code = data.zip_code
                country = data.country
                city = data.city
            except CustomerAddress.DoesNotExist:
                if customer_address.count() == 0:
                    address = customer.address
                    zip_code = customer.zip_code
                    country = customer.country
                    city = customer.city
                else:
                    address = customer_address[0].address
                    zip_code = customer_address[0].zip_code
                    country = customer_address[0].country
                    city = customer_address[0].city
        else:
            address = value.winner.primary_address
            zip_code = value.winner.primary_zip_code
            country = value.winner.primary_country
            city = value.winner.primary_city
        try:
            payment = Payment.objects.get(
                auction_winner=auction_winner
            )
            payment_status = payment.status
        except Payment.DoesNotExist:
            payment_status = None

        try:
            delivery = Delivery.objects.get(
                auction_winner=auction_winner
            )
            delivery_status = delivery.status
        except Delivery.DoesNotExist:
            delivery_status = None

        return {
            "matched_price": auction_winner.price,
            "vat": auction_winner.offer.vat,
            "shipping": auction_winner.offer.shipping,
            "insurance": auction_winner.offer.insurance,
            "duties": auction_winner.offer.duties,
            "payment_status": payment_status,
            "shipping_status": delivery_status,
            "buyer_address": address,
            "buyer_zip_code": zip_code,
            "buyer_country": country,
            "buyer_city": city,
            "buyer_id": auction_winner.winner.pk,
        }

class OfferVatField(serializers.ReadOnlyField):
    def to_representation(self, value):
        auction_winner = AuctionWinner.objects.get(
            auction=value
        )

        return auction_winner.offer.vat


class OfferShippingField(serializers.ReadOnlyField):
    def to_representation(self, value):
        auction_winner = AuctionWinner.objects.get(
            auction=value
        )

        return auction_winner.offer.shipping


class OfferInsuranceField(serializers.ReadOnlyField):
    def to_representation(self, value):
        auction_winner = AuctionWinner.objects.get(
            auction=value
        )

        return auction_winner.offer.insurance


class OfferDutiesField(serializers.ReadOnlyField):
    def to_representation(self, value):
        auction_winner = AuctionWinner.objects.get(
            auction=value
        )

        return auction_winner.offer.duties


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retailer
        fields = ("city", "country")


class OffersField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user_type = request.user.get_type
        try:
            offer_first_call = Offer.objects.get(
                auction=value,
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
                call_number='first_call'
            )
            offer_first_call = offer_first_call.price
        except Offer.DoesNotExist:
            offer_first_call = None
        try:
            offer_second_call = Offer.objects.get(
                auction=value,
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
                call_number='second_call'
            )
            offer_second_call = offer_second_call.price
        except Offer.DoesNotExist:
            offer_second_call = None

        return {
            "bid_price_1": offer_first_call,
            "bid_price_2": offer_second_call
        }


class AuctionSerializer(serializers.ModelSerializer):
    reference = ReferenceSmallSerializer()
    owned_by_this_user = OwnedByThisUserField(source='*')
    owner_address = SellerField(source='*')
    won_by_this_user = WonByThisUserField(source='*')
    joined_by_this_user = JoinedByThisUserField(source='*')
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(source='*')
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    server_timestamp = TimeStampField(source='*')
    offer = OffersField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #print(kwargs)

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'raised_by_owner',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'owner_address',
            'joined_by_this_user',
            'second_call_joined_by_this_user',
            'first_call_selection_for_this_user',
            'first_call_selection_completed',
            'server_timestamp',
            'time_remain',
            'first_call_selection_completed',
            'first_call_selection_date',
            'main_image',
            'offer',
        )


class AuctionCompetitorsPutSerializer(serializers.ModelSerializer):
    reference = ReferenceSmallSerializer()
    owned_by_this_user = OwnedByThisUserField(source='*')
    owner_address = SellerField(source='*')
    won_by_this_user = WonByThisUserField(source='*')
    joined_by_this_user = JoinedByThisUserField(source='*')
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(source='*')
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    server_timestamp = TimeStampField(source='*')
    matched_price = WinnerMatchField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #print(kwargs)

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'matched_price',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'owner_address',
            'joined_by_this_user',
            'second_call_joined_by_this_user',
            'first_call_selection_for_this_user',
            'first_call_selection_completed',
            'server_timestamp',
            'time_remain',
            'first_call_selection_completed',
            'first_call_selection_date',
            'main_image',
        )


class AuctionJoinedSerializer(serializers.ModelSerializer):
    reference = ReferenceSmallSerializer()
    owned_by_this_user = OwnedByThisUserField(source='*')
    owner_address = SellerField(source='*')
    won_by_this_user = WonByThisUserField(source='*')
    joined_by_this_user = JoinedByThisUserField(source='*')
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(source='*')
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    server_timestamp = TimeStampField(source='*')
    offer = OffersField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #print(kwargs)

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'owner_address',
            'joined_by_this_user',
            'second_call_joined_by_this_user',
            'first_call_selection_for_this_user',
            'first_call_selection_completed',
            'server_timestamp',
            'time_remain',
            'first_call_selection_completed',
            'first_call_selection_date',
            'main_image',
            'offer',
        )


class AuctionMatchedTradesSerializer(serializers.ModelSerializer):
    reference = ReferenceSmallSerializer()
    owned_by_this_user = OwnedByThisUserField(source='*')
    owner_address = SellerField(source='*')
    won_by_this_user = WonByThisUserField(source='*')
    joined_by_this_user = JoinedByThisUserField(source='*')
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(source='*')
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    server_timestamp = TimeStampField(source='*')
    buyer = BuyerField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #print(kwargs)

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'owner_address',
            'joined_by_this_user',
            'second_call_joined_by_this_user',
            'first_call_selection_for_this_user',
            'first_call_selection_completed',
            'server_timestamp',
            'time_remain',
            'first_call_selection_completed',
            'first_call_selection_date',
            'main_image',
            'buyer',
        )


class AuctionLiveSerializer(serializers.ModelSerializer):
    reference = ReferenceSmallSerializer()
    seller = SellerField(source='*')
    owned_by_this_user = OwnedByThisUserField(source='*')
    won_by_this_user = WonByThisUserField(source='*')
    joined_by_this_user = JoinedByThisUserField(source='*')
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(source='*')
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    server_timestamp = TimeStampField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        #print(kwargs)

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'joined_by_this_user',
            'second_call_joined_by_this_user',
            'first_call_selection_for_this_user',
            'first_call_selection_completed',
            'server_timestamp',
            'time_remain',
            'first_call_selection_completed',
            'first_call_selection_date',
            'main_image',
            'seller',
        )

class AuctionAmountsSerializer(serializers.ModelSerializer):
    price=WinnerMatchField(source='*')
    vat= OfferVatField(source='*')
    duties=OfferDutiesField(source='*')
    insurance=OfferInsuranceField(source='*')
    shipping=OfferShippingField(source='*')

    class Meta:
        model = Auction
        fields = (
            'deposit',
            'price',
            'vat',
            'wb_fee',
            'insurance',
            'duties',
            'shipping',
        )

class AuctionRaisePriceSerializer(serializers.Serializer):
    auction = serializers.IntegerField()
    price = serializers.DecimalField(decimal_places=2, max_digits=10)

class AuctionCreateSerializer(serializers.ModelSerializer):
    server_timestamp = TimeStampField(source='*')

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Insert a positive price")
        elif not value % 100 == 0:
            raise serializers.ValidationError("Insert a valid price")
        return value

    def validate_call_1_start_date(self, value):
        max_date = timezone.now() + timezone.timedelta(days=5)
        if value > max_date:
            raise serializers.ValidationError("The date must not exceed 5 days starting today")
        return value


    class Meta:
        model = Auction
        fields = (
            'id',
            'reference',
            'call_1_start_date',
            'server_timestamp',
            'main_image',
            'price',
        )

class AuctionCreateWithCardSerializer(serializers.ModelSerializer):
    server_timestamp = TimeStampField(source='*')
    cc = serializers.CharField(max_length=200, required=False)
    expmm = serializers.CharField(max_length=2, required=False)
    expyy = serializers.CharField(max_length=4, required=False)
    cvv2 = serializers.CharField(max_length=10, required=False)
    credit_card_token_id = serializers.IntegerField(required=False)

    def validate(self, data):
        if 'cc' in data and ('expmm' not in data or 'expyy' not in data or 'cvv2' not in data):
            raise serializers.ValidationError("Missing credit card fields")
        return data

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Insert a positive price")
        elif not value % 100 == 0:
            raise serializers.ValidationError("Insert a valid price")
        return value

    def validate_call_1_start_date(self, value):
        max_date = (timezone.now() + timezone.timedelta(days=7)).replace(hour=23, minute=59)
        # min_date = (timezone.now() + timezone.timedelta(days=2)).replace(hour=0, minute=0)
        min_date = timezone.now().replace(hour=0, minute=0)
        if value < min_date:
            raise serializers.ValidationError("The date must start at least 2 days from today")
        if value >= max_date:
            raise serializers.ValidationError("The date must not exceed 7 days starting today")
        return value


    class Meta:
        model = Auction
        fields = (
            'id',
            'reference',
            'call_1_start_date',
            'server_timestamp',
            'main_image',
            'price',
            'cc',
            'expmm',
            'expyy',
            'cvv2',
            'credit_card_token_id',
        )


class AuctionCustomerCreateSerializer(serializers.ModelSerializer):
    server_timestamp = TimeStampField(source='*')

    class Meta:
        model = Auction
        fields = (
            'id',
            'reference',
            'call_1_start_date',
            'server_timestamp',
        )

class AuctionPaymentSerializer(serializers.Serializer):
    payment_method = serializers.CharField(max_length=50)
    cc = serializers.CharField(max_length=200, required=False)
    expmm = serializers.CharField(max_length=2, required=False)
    expyy = serializers.CharField(max_length=4, required=False)
    cvv2 = serializers.CharField(max_length=10, required=False)
    credit_card_token_id = serializers.IntegerField(required=False)
    auction = serializers.IntegerField()
    price = serializers.DecimalField(decimal_places=2, max_digits=10)

    def validate_price(self, value):
        if float(value) <= 0:
            raise serializers.ValidationError("Insert a positive price")
        return float(value)

    def validate_payment_method(self, value):
        payment_methods = [
            'creditCard',
            'bitcoin',
            'moneyTransfer'
        ]
        if value not in payment_methods:
            raise serializers.ValidationError("Wrong payment method")
        return value

    def validate(self, data):
        if 'cc' in data and ('expmm' not in data or 'expyy' not in data or 'cvv2' not in data):
            raise serializers.ValidationError("Missing credit card fields")
        return data


class WinnerSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuctionWinner
        fields = ('auction', 'offer', )


class SelectionSerializer(serializers.ModelSerializer):
    offers = serializers.ListField(allow_empty=False, child=serializers.IntegerField(), min_length=1)
    raise_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True, required=False)

    class Meta:
        model = SelectedOffer
        fields = ('auction', 'offers', 'raise_price')


class OfferSerializer(serializers.ModelSerializer):
    server_timestamp = TimeStampField(source='*')
    cc = serializers.CharField(max_length=20, required=False)
    expmm = serializers.CharField(max_length=2, required=False)
    expyy = serializers.CharField(max_length=4, required=False)
    cvv2 = serializers.CharField(max_length=10, required=False)
    credit_card_token_id = serializers.IntegerField(required=False)

    def validate(self, data):
        if 'cc' in data and ('expmm' not in data or 'expyy' not in data or 'cvv2' not in data):
            raise serializers.ValidationError("Missing credit card fields")
        return data

    class Meta:
        model = Offer
        fields = ('auction', 'price', 'server_timestamp', 'cc', 'expmm', 'expyy', 'cvv2', 'credit_card_token_id')

class TransactionsGetSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    class Meta:
        model = TransactionsSmart2Pay
        fields = (
            'start_date',
            'end_date',
        )

class TransactionsViewSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        """Convert `username` to lowercase."""
        ret = super().to_representation(instance)
        ret['date_created'] = datetime.fromtimestamp(int(ret['date_created'])).isoformat()
        ret['last_updated'] = datetime.fromtimestamp(int(ret['last_updated'])).isoformat()
        return ret

    class Meta:
        model = TransactionsSmart2Pay
        fields = (
            'amount',
            'currency',
            'payment_state',
            'payment_batch_number',
            'refund_id',
            'shop_id',
            'shop_name',
            'transaction_type',
            'vat_rate',
            'order_id',
            'order_line_id',
            'date_created',
            'last_updated',
        )

class OfferField(serializers.Field):
    def to_representation(self, value):
        ## print('>' *  80, 'OfferField.to_representation:', type(value), value)
        return {
            "offer_id": value.id,
            "user_id": value.user.user.id,
            "user_city": value.user.city,
            "user_country": value.user.country,
            'price': "%s" % value.price,
            'call_number': value.call_number
        }


class FirstCallList(serializers.ListSerializer):
    def to_representation(self, data):
        """
        List of object instances -> List of dicts of primitive datatypes.
        """
        data = data.offers.filter(call_number="first_call")
        is_owner = self.context.get("is_owner", False)
        request = self.context['request']
        user_type = request.user.get_type
        if not is_owner:
            data = data.filter(
                content_type=ContentType.objects.get_for_model(user_type),
                object_id=user_type.pk
            )
        return [self.child.to_representation(item) if item is not None else None for item in data]


class SecondCallList(serializers.ListSerializer):
    def to_representation(self, data):
        """
        List of object instances -> List of dicts of primitive datatypes.
        """
        data = data.offers.filter(call_number="second_call")
        is_owner = self.context.get("is_owner", False)
        request = self.context['request']
        user_type = request.user.get_type
        if not is_owner:
            data = data.filter(
                content_type=ContentType.objects.get_for_model(user_type),
                object_id=user_type.pk
            )
        return [self.child.to_representation(item) if item is not None else None for item in data]


class OnGoingField(serializers.Field):
    def to_representation(self, value):
        second_call = Offer.objects.filter(
            call_number="second_call",
            auction=value.auction,
            content_type=value.offer.content_type,
            object_id=value.offer.object_id,
            approved=True
        ).first()
        return {
            "user_id": value.offer.user.user.id,
            "user_country": value.offer.user.country,
            "user_city": value.offer.user.city,
            "price_first_call": value.offer.price,
            "price_second_call": "awaiting" if not second_call else second_call.price,
            "first_call_offer_id": value.offer.id,
            "second_call_offer_id": None if not second_call else second_call.id
        }


class SecondCallOnGoingList(serializers.ListSerializer):
    def to_representation(self, data):
        """
        List of object instances -> List of dicts of primitive datatypes.
        """
        data = data.selections.all()
        is_owner = self.context.get("is_owner", False)
        request = self.context['request']
        user_type = request.user.get_type
        if not is_owner:
            data = data.none()
        return [self.child.to_representation(item) if item is not None else None for item in data]


class GetAuctionByIdSerializer(AuctionSerializer):
    first_call_offers = FirstCallList(allow_empty=True, source='*', child=OfferField())
    first_call_selection_for_this_user = FirstCallSelThisUserField(source='*')
    second_call_offers = SecondCallList(allow_empty=True, source='*', child=OfferField())
    second_call_on_going = SecondCallOnGoingList(allow_empty=True, source='*', child=OnGoingField())
    second_call_joined_by_this_user = SecondCallJoinedByThisUserField(
        source='*')
    all_second_call_offer_completed = SecondCallOfferCompletedField(
        source='*')
    delay_available = DelayField(source='*')

    class Meta:
        model = Auction
        fields = (
            'id',
            'type',
            'reference',
            'price',
            'deposit',
            'wb_fee',
            'raise_price',
            'raised_by_owner',
            'insert_date',
            'closed_date',
            'call_1_start_date',
            'call_1_end_date',
            'call_1_end_selection',
            'call_2_start_date',
            'call_2_end_date',
            'call_2_end_selection',
            'payment_expiry',
            'status',
            'won_by_this_user',
            'owned_by_this_user',
            'joined_by_this_user',
            'server_timestamp',
            'first_call_offers',
            'first_call_selection_completed',
            'first_call_selection_date',
            'first_call_selection_for_this_user',
            'second_call_offers',
            'second_call_on_going',
            'second_call_joined_by_this_user',
            'all_second_call_offer_completed',
            'time_remain',
            'main_image',
            'delay_available',
        )
