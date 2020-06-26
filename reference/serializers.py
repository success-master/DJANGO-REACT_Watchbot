# -*- coding: utf-8 -*-
from rest_framework import serializers
from reference.models import *


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug')


class ModelSerializer(serializers.ModelSerializer):
    brand = BrandSerializer()

    class Meta:
        model = Model
        fields = ('id', 'name', 'slug', 'brand')


class FollowedByThisUserField(serializers.ReadOnlyField):
    def to_representation(self, value):
        request = self.context['request']
        user = request.user
        if value.total_follow > 0:
            return True
        return False


class ReferenceSerializer(serializers.ModelSerializer):
    model = ModelSerializer()
    case_material = serializers.StringRelatedField()
    movement = serializers.StringRelatedField(many=True)
    watchstrap_material = serializers.StringRelatedField()
    followed_by_this_user = FollowedByThisUserField(
        source='*')

    class Meta:
        model = Reference
        fields = (
            'id',
            'model',
            'reference',
            'label',
            'description',
            'movement',
            'case_material',
            'watchstrap_material',
            'picture_url',
            'dial_color',
            'bracelet_material',
            'case_size',
            'note',
            'year',
            'gender',
            'price',
            'followed_by_this_user'
        )


class ReferenceSmallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = ('id', 'reference', 'model_name', 'brand_name', 'price')


class ReferenceListSerializer(serializers.ModelSerializer):
    brand = serializers.StringRelatedField()

    class Meta:
        model = Reference
        fields = (
            'id',
            'reference',
            'label',
            'brand',
            'price',
        )
