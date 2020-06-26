# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import *


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = (
            "id",
            "country",
            "address",
            "zip_code",
            "city",
            "state",
            "preferred_billing_addr",
            "preferred_shipping_addr"
        )


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = (
            "id",
            "name"
        )

class RetailerSerializer(serializers.ModelSerializer):
    brands = BrandSerializer(many=True, read_only=True)

    class Meta:
        model = Retailer
        fields = (
            'company_name',
            "vat",
            "brands",
            'document_type',
            'document_number',
            'document_issuer',
            'document_expiry_date',
            'phone_number',
            'mobile_number',
            'primary_country',
            'primary_city',
            'primary_state',
            'primary_address',
            'primary_second_line_address',
            'primary_zip_code',
            'secondary_country',
            'secondary_city',
            'secondary_state',
            'secondary_address',
            'secondary_second_line_address',
            'secondary_zip_code',
            'privacy_consent',
            'trading_rules_acceptance',
            'terms_and_conditions',
        )


class CustomerSerializer(serializers.ModelSerializer):
    addresses = CustomerAddressSerializer(many=True)

    def update(self, instance, validated_data):
        addresses_data = validated_data.pop('addresses')
        super(CustomerSerializer, self).update(instance=instance, validated_data=validated_data)
        CustomerAddress.objects.filter(customer=instance).delete()
        for address in addresses_data:
            CustomerAddress.objects.create(customer=instance, **address)
        return instance

    class Meta:
        model = Customer
        fields = (
            'tax_id',
            'gender',
            'birth_date',
            "city",
            'phone_number',
            'email_contact',
            'addresses',
            'country',
            'address',
            'zip_code',
            'city',
            'state',
            'document_type',
            'document_number',
            'document_issuer',
            'document_expiry_date',
        )

class CreditCardDataField(serializers.ReadOnlyField):
    def to_representation(self, value):
        token = value.get_gestpay_token
        if token is not None:
            return {
                "id": token.pk,
                "number": '**** **** **** ' + token.ccToken[-4:],
                "preferred": token.preferred,
            }
        return None

class UserSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(required=False, allow_null=True)
    retailer = RetailerSerializer(required=False, allow_null=True)
    credit_card_data = CreditCardDataField(source="*")

    def update(self, instance, validated_data):
        customer_data = validated_data.pop('customer')
        retailer_data = validated_data.pop('retailer')
        if customer_data:
            customer = instance.customer
            serialized_customer = CustomerSerializer(instance=customer, data=customer_data)
            if serialized_customer.is_valid():
                serialized_customer.save()
            #customer.update(**customer_data)
        super(UserSerializer, self).update(instance=instance, validated_data=validated_data)
        '''
        CustomerAddress.objects.filter(customer=instance).delete()
        for address in addresses_data:
            CustomerAddress.objects.create(customer=instance, **address)
        '''
        return instance

    class Meta:
        model = HDSAuthUser
        fields = (
            'email',
            'first_name',
            'last_name',
            "retailer",
            "customer",
            "show_splash",
            "credit_card_data",
            #"last_mine_seen",
            #"last_follow_seen"
        )
        read_only_fields = ("email",)


class UserLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HDSAuthUser
        fields = (
            'default_language',
        )

class NumberCreditCardField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return '**** **** **** ' + value.ccToken[-4:]

class UserCreditCardsSerializer(serializers.ModelSerializer):
    number = NumberCreditCardField(source='*')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = GestpayToken
        fields = (
            'id',
            'number',
            'preferred'
        )

class UserCreditCardUpdateSerializer(serializers.Serializer):
    preferred = serializers.BooleanField()

class FireBaseTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FireBaseToken
        fields = ('token',)
