# -*- coding: utf-8 -*-
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.schemas import SchemaGenerator
from rest_framework.generics import get_object_or_404
from django.shortcuts import redirect
from django.urls import reverse_lazy
import hashlib
#from rest_framework_swagger import renderers
from django.utils import timezone
from rest_framework import viewsets
from auction.serializers import *
from auction.models import Auction
from rest_framework.parsers import MultiPartParser, JSONParser
from django.utils.html import strip_tags
from django.template.loader import get_template
from django.core.mail import send_mail
from hdsauth.serializers import *
from reference.serializers import *
from notification.serializers import *
from rest_framework.renderers import JSONRenderer
from django.conf import settings
from firebase_admin import credentials, messaging, initialize_app
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from hdsauth.utils import CacheMiddleware
from auction.fee_utils import calc_put_wb_fee, calc_put_deposit, calc_final_price, calc_vat_auction
from hdsauth.gestpay import Gestpay
from api.payment import PaymentService
from django.core import serializers
from api.auction_utils import completePayment
import logging

logger = logging.getLogger(__name__)
'''
from django.http import HttpResponse, JsonResponse
from translation_dictionary.serializers import *
from translation_dictionary.models import TranslationDictionary
from rest_framework.authtoken.models import Token
'''


def obfuscate(s):
    m = hashlib.sha256()
    m.update(s)
    return m.hexdigest()

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ObtainToken(APIView):
    """
    Check if user is authenticated and return Access Token
    """

    def get(self, request, format=None):
        if request.user.is_authenticated:
            token, create = Token.objects.get_or_create(user=request.user)
            # print(token)
            return Response({
                "is_authenticated": True,
                "token": token.key,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            })
        else:
            return Response({
                "is_authenticated": False
            })


class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = Customer.objects.all()
    #filter_backends = (DjangoFilterBackend,)
    #filter_fields = ('sth',)
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    renderer_classes = [
        JSONRenderer,
        #renderers.OpenAPIRenderer,
        #renderers.SwaggerUIRenderer
    ]

    def get(self, request, format=None):
        user = request.user
        serialized = UserSerializer(user)
        return Response(serialized.data)

    def post(self, request, format=None):
        user = request.user
        serialized = UserSerializer(instance=user, data=request.data)
        if serialized.is_valid(raise_exception=True):
            serialized.save()
            return Response(serialized.data)
        else:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class UserLanguageView(viewsets.ModelViewSet):
    serializer_class = UserLanguageSerializer
    queryset = Customer.objects.all()
    # filter_backends = (DjangoFilterBackend,)
    # filter_fields = ('sth',)
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    renderer_classes = [
        JSONRenderer,
        # renderers.OpenAPIRenderer,
        # renderers.SwaggerUIRenderer
    ]

    def get(self, request, format=None):
        user = request.user
        serialized = UserLanguageSerializer(user)
        return Response(serialized.data)

    def post(self, request, format=None):
        user = request.user
        serialized = UserLanguageSerializer(instance=user, data=request.data)
        if serialized.is_valid(raise_exception=True):
            serialized.save()
            return Response(serialized.data)
        else:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

class UserCreditCardsView(viewsets.ModelViewSet):
    serializer_class = UserCreditCardsSerializer
    queryset = GestpayToken.objects.all()
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, JSONParser)
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = UserCreditCardsSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = UserCreditCardsSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

class UserCreditCardUpdateView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = UserCreditCardUpdateSerializer
    lookup_field = "id"
    renderer_classes = [
        JSONRenderer,
    ]

    def put(self, request, *args, **kwargs):
        id = kwargs.get("id", None)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        token = get_object_or_404(
            GestpayToken.objects.all(), **{
                "user": request.user,
                "id": id
            })
        serializer = UserCreditCardUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token.preferred = serializer.validated_data['preferred']
        token.save()
        return Response(status=status.HTTP_200_OK)


class ReferenceListView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ReferenceListSerializer
    filter_backends =(SearchFilter,)
    search_fields = ['label',]
    queryset = Reference.objects.all()
    lookup_field = "id"

    def get_queryset(self, **kwargs):
        request = kwargs.pop("request", None)
        reference_list = Reference.objects.none()
        try:
            customer = self.request.user.customer
            reference_list = Reference.objects.all()
        except Customer.DoesNotExist:
            pass
        try:
            retailer = self.request.user.retailer
            reference_list = Reference.objects.filter(brand__in=retailer.brands.all())
        except Retailer.DoesNotExist:
            pass
        num_follow = Count('follow', filter=Q(follow__user=request.user))
        reference_list = reference_list.annotate(
            total_follow=num_follow
        )
        return reference_list

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset(request=request))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_object(self, **kwargs):
        request = kwargs.pop("request", None)
        queryset = self.filter_queryset(self.get_queryset(request=request))
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object(request=request)
        serializer = ReferenceSerializer(instance, context={"request": request})
        return Response(serializer.data)


class AuctionReferenceSelfView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    #filter_backends =(SearchFilter,)
    #search_fields = ['label',]
    queryset = Auction.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        reference_list = Reference.objects.none()
        try:
            customer = self.request.user.customer
            reference_list = Reference.objects.all()
        except Customer.DoesNotExist:
            pass
        try:
            retailer = self.request.user.retailer
            reference_list = Reference.objects.filter(brand__in=retailer.brands.all())
        except Retailer.DoesNotExist:
            pass
        obj = get_object_or_404(reference_list, **filter_kwargs)
        #print(obj)
        user_type = self.request.user.get_type
        if user_type:
            auction_list = Auction.objects.filter(
                payment_3ds_check=False,
                reference=obj,
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type)
            )
        else:
            auction_list = Auction.objects.none()
        return auction_list


class AuctionReferenceCallView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    # filter_backends =(SearchFilter,)
    # search_fields = ['label',]
    queryset = Auction.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        reference_list = Reference.objects.none()
        try:
            customer = self.request.user.customer
            reference_list = Reference.objects.all()
        except Customer.DoesNotExist:
            pass
        try:
            retailer = self.request.user.retailer
            reference_list = Reference.objects.filter(brand__in=retailer.brands.all())
        except Retailer.DoesNotExist:
            pass
        obj = get_object_or_404(reference_list, **filter_kwargs)
        user_type = self.request.user.get_type
        auction_id_by_offers = Offer.objects.filter(
            payment_3ds_check=False,
            auction__reference=obj,
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).values_list("auction__id", flat=True)
        auction_list = Auction.objects.filter(pk__in=auction_id_by_offers)
        return auction_list


class AuctionReferenceListView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    queryset = Auction.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        reference_list = Reference.objects.none()
        try:
            customer = self.request.user.customer
            reference_list = Reference.objects.all()
        except Customer.DoesNotExist:
            pass
        try:
            retailer = self.request.user.retailer
            reference_list = Reference.objects.filter(brand__in=retailer.brands.all())
        except Retailer.DoesNotExist:
            pass
        obj = get_object_or_404(reference_list, **filter_kwargs)
        auction_list = Auction.objects.filter(reference=obj, payment_3ds_check=False,)
        return auction_list


class AuctionReferenceNotMineView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    queryset = Auction.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        reference_list = Reference.objects.none()
        try:
            customer = self.request.user.customer
            reference_list = Reference.objects.all()
        except Customer.DoesNotExist:
            pass
        try:
            retailer = self.request.user.retailer
            reference_list = Reference.objects.filter(brand__in=retailer.brands.all())
        except Retailer.DoesNotExist:
            pass
        user_type = self.request.user.get_type
        obj = get_object_or_404(reference_list, **filter_kwargs)
        auction_list = Auction.objects.filter(payment_3ds_check=False, reference=obj).exclude(
            pk__in=Offer.objects.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type)
            ).values_list("auction__id", flat=True),
        ).exclude(
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        )
        return auction_list


class ProgrammingCallView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            closed=False,
            type="call",
        ).order_by("call_1_start_date")
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(
                reference__brand__in=user_type.brands.all()
            )
        else:
            queryset = queryset.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True,
                                           context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = AuctionSerializer(queryset, many=True,
                                       context={"request": request})
        return Response(serializer.data)

    def list_filtered(self, request, *args, **kwargs):
        brand_id = kwargs.pop("brand_id", None)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            closed=False,
            type="call",
            reference__brand__id=brand_id
        ).order_by("call_1_start_date")
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(
                reference__brand__in=user_type.brands.all()
            )
        else:
            queryset = queryset.exclude(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True,
                                           context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = AuctionSerializer(queryset, many=True,
                                       context={"request": request})
        return Response(serializer.data)


class ProgrammingView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            closed=False
        ).order_by("call_1_start_date")
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        else:
            queryset = queryset.exclude(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True,
                                           context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = AuctionSerializer(queryset, many=True,
                                       context={"request": request})
        return Response(serializer.data)

    def list_filtered(self, request, *args, **kwargs):
        brand_id = kwargs.pop("brand_id", None)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            closed=False,
            reference__brand__id=brand_id
        ).order_by("call_1_start_date")
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        else:
            queryset = queryset.exclude(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type),
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True,
                                           context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = AuctionSerializer(queryset, many=True,
                                       context={"request": request})
        return Response(serializer.data)


class AuctionLiveView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionLiveSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(
            payment_3ds_check=False,
            closed=False,
            type="put"
        ).order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionLiveSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionLiveSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyLiveCallsView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        #if user_type.__class__.__name__ == "Retailer":
        #queryset = queryset.filter(reference__brand__in=user_type.brands.all())
        # logger.error(user_type.id)
        queryset = queryset.filter(
            type='call',
            payment_3ds_check=False,
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection'
            ],
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionAllLiveView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(reference__brand__in=user_type.brands.all())
        #logger.error(user_type.id)
        queryset = queryset.filter(
            type='put',
            payment_3ds_check=False,
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection'
            ],
        ).order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyLiveView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(reference__brand__in=user_type.brands.all())
        # logger.error(user_type.id)
        queryset = queryset.filter(
            type='put',
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection'
            ],
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyFailedTrades(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(type='put')
        else:
            queryset = queryset.filter(type='call')
        queryset = queryset.filter(
            status__in=[
                'decayed_first_call',
                'decayed_first_call_selection',
                'decayed_second_call',
                'decayed_second_call_selection',
                'decayed_not_payed',
            ],
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).order_by("call_1_start_date")
        # logger.error(user_type.id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyWatchListLivePuts(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(
            reference__id__in=Follow.objects.filter(user=request.user).values_list("reference__id", flat=True),
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection',
            ],
        ).order_by("call_1_start_date")
        # logger.error(user_type.id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyMatchedTrades(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionMatchedTradesSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(
                Q(
                    status__in=[
                        'winner_selected',
                        'closed',
                        'shipped',
                    ],
                    object_id=user_type.id,
                    content_type=ContentType.objects.get_for_model(user_type)
                ) |
                Q(
                    type="call",
                    status__in=[
                        'winner_selected',
                        'closed',
                        'shipped',
                    ],
                    winner_object_id=user_type.id,
                    winner_content_type=ContentType.objects.get_for_model(user_type)
                )
            )
        else:
            queryset = queryset.filter(
                Q(
                    type="call",
                    status__in=[
                        'winner_selected',
                        'closed',
                        'shipped',
                    ],
                    object_id=user_type.id,
                    content_type=ContentType.objects.get_for_model(user_type)
                ) |
                Q(
                    type="put",
                    status__in=[
                        'winner_selected',
                        'closed',
                        'shipped',
                    ],
                    winner_object_id=user_type.id,
                    winner_content_type=ContentType.objects.get_for_model(user_type)
                )
            )
        queryset = queryset.order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionMatchedTradesSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionMatchedTradesSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionMyJoinedListLivePuts(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionJoinedSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(
            pk__in=Offer.objects.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type)
            ).values_list("auction__id", flat=True),
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection',
            ],
        ).order_by("call_1_start_date")
        # logger.error(user_type.id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionJoinedSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionJoinedSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionJoinedListLiveCalls(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionJoinedSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(
            type='call',
            pk__in=Offer.objects.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type)
            ).values_list("auction__id", flat=True),
            status__in=[
                'first_call_open',
                'first_call',
                'first_call_selection',
                'second_call_open',
                'second_call',
                'second_call_selection',
            ],
        ).order_by("call_1_start_date")
        # logger.error(user_type.id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionJoinedSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionJoinedSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AuctionView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == 'create':
            return AuctionCreateWithCardSerializer
        return AuctionSerializer

    def create(self, request, *args, **kwargs):
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        retailer = False
        if user_type_class_name == "Retailer":
            retailer = True
        serializer = AuctionCreateWithCardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        call_1_start_date = serializer.validated_data['call_1_start_date']
        reference = serializer.validated_data['reference']
        if retailer and reference.brand not in user_type.brands.all():
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        #call_1_start_date = datetime.datetime.fromtimestamp(int(call_1_start_date))
        call_1_end_date = call_1_start_date + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x1"])
        call_1_end_selection = call_1_end_date + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x2"])
        call_2_start_date = call_1_end_selection + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x3"])
        call_2_end_date = call_2_start_date + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x4"])
        call_2_end_selection = call_2_end_date + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x5"])
        payment_expiry = call_2_end_selection + datetime.timedelta(seconds=settings.AUCTION_DEFAULT_SETTINGS["x6"])

        auction_info = {
            "reference": reference,
            "call_1_start_date": call_1_start_date,
            "main_image": serializer.validated_data['main_image'] if 'main_image' in serializer.validated_data else None,
            "price": serializer.validated_data['price'],
            "owner": user_type,
            "type": "put" if retailer else "call",
            "call_1_end_date": call_1_end_date,
            "call_1_end_selection": call_1_end_selection,
            "call_2_start_date": call_2_start_date,
            "call_2_end_date": call_2_end_date,
            "call_2_end_selection": call_2_end_selection,
            "payment_expiry": payment_expiry,
            "status": "first_call_open",
            "wb_fee": calc_put_wb_fee(serializer.validated_data['price']),
            # 'tax': calc_put_wb_fee(serializer.validated_data['price']) * 1.22,
            "deposit": calc_put_deposit(reference)
        }
        new_auction = Auction(**auction_info)
        new_auction.save()
        if retailer is not True:
            paymentService = PaymentService()
            result = paymentService.auctionDeposit(new_auction, request.user, serializer.validated_data)
            if result['error'] == True:
                if result['3ds'] == True:
                    string_for_token = "%s" % (new_auction.pk)
                    string_for_token = string_for_token.encode('utf-8')
                    token = obfuscate(string_for_token)
                    server_name = request.get_host()
                    url = "%s://%s/api/3ds-check/%s/%s/%s/" % (
                        "https" if request.is_secure() else "http",
                        server_name,
                        'deposit',
                        new_auction.pk,
                        token
                    )
                    result['response']['data']['return_url'] = url
                return Response(**result['response'])
        #user_follow = Follow.objects.filter(
        #    reference=new_auction.reference
        #).values_list("user", flat=True)
        # firebase_auction_created(new_auction, user_follow)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user_type = request.user.get_type
        is_owner = False
        if instance.content_type == ContentType.objects.get_for_model(user_type) and instance.object_id == user_type.pk:
            is_owner = True
        serializer = GetAuctionByIdSerializer(instance, context={
            "request": request,
            "auction_id": instance.id,
            "is_owner": is_owner,
            "user_type": request.user.get_type.__class__.__name__.lower(),
            "user_type_id": request.user.get_type.pk
        })
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(payment_3ds_check=False)
        if user_type.__class__.__name__ == "Retailer":
            queryset = queryset.filter(reference__brand__in=user_type.brands.all())
        queryset = queryset.order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def list_self(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).order_by("call_1_start_date")
        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def list_offer(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            pk__in=Offer.objects.filter(
                object_id=user_type.id,
                content_type=ContentType.objects.get_for_model(user_type)
            ).values_list("auction__id", flat=True),
        ).order_by("call_1_start_date")
        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def list_follow(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            reference__id__in=Follow.objects.filter(user=request.user).values_list("reference__id", flat=True)
        ).order_by("call_1_start_date")
        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def list_alert(self, request, *args, **kwargs):
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = Auction.objects.filter(
            payment_3ds_check=False,
            reference__id__in=Alert.objects.filter(user=request.user).values_list("reference__id", flat=True)
        ).order_by("call_1_start_date")
        serializer = AuctionSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def get_object_for_delete(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        user_type = request.user.get_type
        filter_kwargs = {
            self.lookup_field: self.kwargs[lookup_url_kwarg],
            "object_id": user_type.id,
            "content_type": ContentType.objects.get_for_model(user_type),
            #"call_1_start_date__gt": datetime.datetime.now()
        }
        obj = get_object_or_404(queryset, **filter_kwargs)
        if obj.call_1_start_date > datetime.datetime.now():
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY, data={
                "error_message": "Trade already started."
            })
        # May raise a permission denied
        return obj

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object_for_delete(request)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AuctionCompetitorsPutView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionCompetitorsPutSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type or user_type.__class__.__name__ != "Retailer":
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        queryset = queryset.filter(
            type="put",
            reference__brand__in=user_type.brands.all()
        )
        queryset = queryset.exclude(
            object_id=user_type.id,
            content_type=ContentType.objects.get_for_model(user_type)
        ).order_by("call_1_start_date")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuctionCompetitorsPutSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = AuctionCompetitorsPutSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class AutcionSetDelayView(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionSerializer
    lookup_field = "id"
    renderer_classes = [
        JSONRenderer,
    ]

    def update(self, request, *args, **kwargs):
        id = kwargs.get("id", None)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        auction = get_object_or_404(
            Auction.objects.all(), **{
                "object_id": user_type.id,
                "content_type": ContentType.objects.get_for_model(user_type),
                "id": id
            })
        if auction.status in ["first_call_selection", "second_call_selection"] and auction.delay_used <3:
            auction.delay_used += 1
            auction.call_1_end_selection = auction.call_1_end_selection + \
                                           datetime.timedelta(seconds=300)
            auction.call_2_start_date = auction.call_2_start_date + \
                                        datetime.timedelta(seconds=300)
            auction.call_2_end_date = auction.call_2_end_date + \
                                      datetime.timedelta(seconds=300)
            auction.call_2_end_selection = auction.call_2_end_selection + \
                                           datetime.timedelta(seconds=300)
            auction.payment_expiry = auction.payment_expiry + \
                                     datetime.timedelta(seconds=300)
            auction.save()
            serializer = AuctionSerializer(data=auction)
            return Response({"success": True}, status=status.HTTP_202_ACCEPTED)
        else:
            if auction.delay_used >= 3:
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE, data={
                    "error_message": "Max delay num exceeded"
                })
            else:
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE)


class AuctionOfferView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = OfferSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        serializer = OfferSerializer(data=request.data)
        now = timezone.now()
        user = request.user
        serializer.is_valid(raise_exception=True)
        user_type = user.get_type
        auction = serializer.validated_data["auction"]
        if now < auction.call_1_end_date:
            call_number = "first_call"
            if (auction.call_1_end_date - now).total_seconds() < 60:
                return Response(status=status.HTTP_400_BAD_REQUEST, data={"msg": "Last minute - no bids allowed"})
        elif auction.call_2_start_date <= now < auction.call_2_end_date:
            call_number = "second_call"
        else:
            call_number = None
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not call_number:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        new_offer = Offer(
            user=user_type,
            call_number=call_number,
            auction=auction,
            price=serializer.validated_data["price"],
        )
        if new_offer.check_validity:
            new_offer.approved = True
            new_offer.save()
            if new_offer.is_first_offer and user_type.__class__.__name__ != "Retailer":
                paymentService = PaymentService()
                result = paymentService.auctionDeposit(auction, user, serializer.validated_data, new_offer)
                if result['error'] == True:
                    if result['3ds'] == True:
                        string_for_token = "%s" % (new_offer.pk)
                        string_for_token = string_for_token.encode('utf-8')
                        token = obfuscate(string_for_token)
                        server_name = request.get_host()
                        url = "%s://%s/api/3ds-check/%s/%s/%s/" % (
                            "https" if request.is_secure() else "http",
                            server_name,
                            'deposit_offer',
                            new_offer.pk,
                            token
                        )
                        result['response']['data']['return_url'] = url
                    return Response(**result['response'])
            headers = self.get_success_headers(serializer.data)
            # firebase_new_offer(new_offer)
            return Response(status=status.HTTP_201_CREATED, headers=headers)
        else:
            new_offer.delete()
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)


class AuctionSelectionView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = SelectionSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        serializer = SelectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offers = serializer.validated_data['offers']
        auction = serializer.validated_data["auction"]
        raise_price = serializer.validated_data["raise_price"]
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not auction.owner.user == request.user:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not auction.status == "first_call_selection":
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        offer_list = []
        for o in offers:
            try:
                offer = Offer.objects.get(pk=o, auction=auction, approved=True, call_number="first_call")
                offer_list.append(offer)
            except Offer.DoesNotExist:
                return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        for offer in offer_list:
            try:
                selection = SelectedOffer.objects.get(auction=auction, offer=offer)
            except SelectedOffer.DoesNotExist:
                selection = SelectedOffer(auction=auction, offer=offer)
                selection.save()
                try:
                    notification = Notification.objects.get(
                        user=offer.user.user,
                        auction=auction,
                        mine_follow=1,
                        notification_type=3
                    )
                except Notification.MultipleObjectsReturned:
                    pass
                except Notification.DoesNotExist:
                    notification = Notification(
                        user=offer.user.user,
                        auction=auction,
                        mine_follow=1,
                        notification_type=3,
                        reference=auction.reference
                    )
                    notification.save()
            # firebase_offer_selected(offer)
        #new_selection = serializer.save()
        if raise_price:
            auction.raise_price = raise_price
        if auction.first_call_selection_list:
            first_call_selection_list = auction.first_call_selection_list.split(",")
        else:
            first_call_selection_list = []
        selection_string = ""
        for offer in offer_list:
            if "%s" % offer.user.user.pk not in first_call_selection_list:
                first_call_selection_list.append("%s" % offer.user.user.pk)
                selection_string = ",".join(first_call_selection_list)
        auction.first_call_selection_list = selection_string
        auction.first_call_selection_completed = True
        now = datetime.datetime.now()
        auction.first_call_selection_date = now
        auction.save()
        # firebase_update_auction_status(auction)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AuctionWinnerView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = WinnerSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        gestpay = Gestpay()
        serializer = WinnerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.validated_data['offer']
        auction = serializer.validated_data["auction"]
        user = request.user
        user_type = user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not auction.owner == user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if auction.status in ["first_call_selection","second_call_selection", "second_call"] \
            and offer.approved and offer.price < auction.reference.price:

            if auction.status == "second_call":
                selected_count = SelectedOffer.objects.filter(
                    auction=auction, offer__call_number="first_call", offer__approved=True
                ).count()
                second_call_offer_count = Offer.objects.filter(
                    auction=auction, call_number="second_call", approved=True
                ).count()
                if second_call_offer_count != selected_count or selected_count == 0:
                    return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            if auction.type == 'put':
                offers_to_be_canceled = Offer.objects.filter(auction=auction).exclude(pk=offer.pk)
                if offer.is_first_offer is False:
                    offers_to_be_canceled = offers_to_be_canceled.exclude(pk=offer.first_offer.pk)
                if offers_to_be_canceled.count() > 0:
                    for offer in offers_to_be_canceled:
                        transaction = offer.deposit_transaction
                        if transaction is not None and transaction.status == 'authorized':
                            response = gestpay.delete_transaction(
                                transaction.bank_transaction_id,
                                transaction.shop_transaction_id,
                                'Lose Auction, selected another winner'
                            )
                            print(response)
            winner = serializer.save(**{
                "content_type": offer.content_type,
                "object_id": offer.object_id,
                "price": calc_final_price(auction, offer)
            })
            payment = Payment(
                price=calc_final_price(auction, offer),
                status='to_be_payed',
                auction_winner_id=winner.id
            )
            payment.save()
            delivery = Delivery(
                status="to_be_delivered",
                content_type=offer.content_type,
                object_id=offer.object_id,
                auction_winner_id=winner.id
            )
            delivery.save()
            notification = Notification(
                user=offer.user.user if auction.type == "put" else auction.owner.user,
                auction=auction,
                mine_follow=1,
                notification_type=4,
                reference=auction.reference
            )
            auction.status = "winner_selected"
            auction.winner = winner.winner
            auction.save()
            notification.save()
            template_email = get_template('auction_email.html')
            server_name = request.get_host()
            url = "%s://%s/customer/" % (
                "https" if request.is_secure() else "http",
                server_name,
            )
            html_content = template_email.render({
                'username': str(user.first_name) + ' ' + str(user.last_name),
                'primary_text': 'You won the trade n°' + str(auction.pk) + ' Go to the payment page to settle the payment.',
                'secondary_text': "You have 60 minutes of time, after which you won't be able to do it anymore.",
                'action': {
                    'url': url,
                    'label': 'GO PAYMENT PAGE'
                },
                'watch': {
                    "name": auction.reference.model_name,
                    "list_price": '€' + str(auction.reference.price),
                    "brand": auction.reference.brand_name,
                    "reference": auction.reference.label,
                    "deposit": '€' + str(auction.deposit),
                    "price": '€' + str(payment.price),
                }
            })
            text_content = strip_tags(html_content)
            subject, from_email, to = "Watchbot - Request payment winner trade", settings.DEFAULT_FROM_EMAIL, user.email
            send_mail(subject=subject, message=text_content, from_email=from_email,
                            recipient_list=[to], fail_silently=False, html_message=html_content)
            # firebase_winner_selected(offer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class AuctionPaymentView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionPaymentSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        serializer = AuctionPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            auction = Auction.objects.get(pk=serializer.validated_data["auction"])
        except Auction.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        price = float(serializer.validated_data["price"])
        payment_method = serializer.validated_data["payment_method"]
        auction_winner = AuctionWinner.objects.get(auction=auction)
        user = request.user
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not auction_winner:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        payment = Payment.objects.get(
            auction_winner=auction_winner
        )
        if payment.status != 'to_be_payed' and payment.status != 'bitcoin_awaiting_payment':
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type.pk != auction_winner.object_id or ContentType.objects.get_for_model(user_type) != auction_winner.content_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if (payment_method == 'creditCard' or payment_method == 'moneyTransfer') and abs(float(auction_winner.price) - price) > 0.0:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                "payment_state": 'wrong_amount',
                "payment_message": 'The amount to be payed should be ' + str(auction_winner.price) + ' but server received a request for ' + str(price)
              })
        if payment_method == 'creditCard':
            paymentService = PaymentService()
            response = paymentService.completePaymentAuction(auction, auction_winner, payment, user, serializer.validated_data)
            auction.payment_method = payment_method
            auction.save()
            if response['error']:
                if response['3ds'] == True:
                    string_for_token = "%s" % (auction.pk)
                    string_for_token = string_for_token.encode('utf-8')
                    token = obfuscate(string_for_token)
                    server_name = request.get_host()
                    url = "%s://%s/api/3ds-check/%s/%s/%s/" % (
                        "https" if request.is_secure() else "http",
                        server_name,
                        'balance',
                        auction.pk,
                        token
                    )
                    response['response']['data']['return_url'] = url
                return Response(**response['response'])
            else:
                completePayment(auction, auction_winner)
                return Response(status=status.HTTP_201_CREATED, data={
                    'payment_state': 'settled',
                    'payment_message': 'the settlement has been completed'
                })
        #elif payment_method == 'moneyTransfer':
        #TODO: da fare
        #elif payment_method == 'bitcoin':
        #TODO: da fare

class AuctionAmountsView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionAmountsSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    lookup_field = "id"

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.winner:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = AuctionAmountsSerializer(instance, context={"request": request})
        return Response(serializer.data)

class AuctionRaisePriceView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AuctionRaisePriceSerializer
    parser_classes = (MultiPartParser, JSONParser)
    queryset = Auction.objects.all()
    lookup_field = "id"

    def edit(self, request, *args, **kwargs):
        user_type = request.user.get_type
        serializer = AuctionRaisePriceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            auction = Auction.objects.get(pk=serializer.validated_data["auction"])
        except Auction.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if auction.content_type != ContentType.objects.get_for_model(user_type) or auction.object_id != user_type.pk:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if auction.status != "first_call_selection" or auction.selections.count() == 0:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        price = serializer.validated_data["price"]
        auction.raise_price = price
        now = datetime.datetime.now()
        auction.status = "second_call"
        auction.raised_by_owner = True
        auction.call_2_start_date = now
        auction.call_2_end_date = now + datetime.timedelta(
            seconds=settings.AUCTION_DEFAULT_SETTINGS["x4"])
        auction.call_2_end_selection = auction.call_2_end_date + datetime.timedelta(
            seconds=settings.AUCTION_DEFAULT_SETTINGS["x5"])
        auction.payment_expiry = auction.call_2_end_selection + datetime.timedelta(
            seconds=settings.AUCTION_DEFAULT_SETTINGS["x6"])
        auction.save()
        return Response(serializer.data)

class AuctionTransactionView(viewsets.ModelViewSet):
    serializer_class = TransactionsViewSerializer
    queryset = TransactionsSmart2Pay.objects.all()
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        serializer = TransactionsGetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if "start_date" in serializer.validated_data and "end_date" in serializer.validated_data:
            transactions = TransactionsSmart2Pay.objects.filter(
                insert_date__gte=serializer.validated_data["start_date"],
                insert_date__lte=serializer.validated_data["end_date"],
            )
        else:
            transactions = TransactionsSmart2Pay.objects.all()
        serializer = TransactionsViewSerializer(transactions, many=True)
        return Response({"transactions": serializer.data, "total_count": transactions.count()})

class FollowView(viewsets.ModelViewSet):
    serializer_class = FollowSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Follow.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def get_object_for_delete(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg], "user": request.user}
        obj = get_object_or_404(queryset, **filter_kwargs)
        # May raise a permission denied
        return obj

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object_for_delete(request)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        queryset = Follow.objects.filter(user=request.user).values_list("reference_id", flat=True)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = FollowSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = FollowSerializer(queryset, many=True)
        return Response(queryset)

    def create(self, request, *args, **kwargs):
        serializer = FollowSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        reference = serializer.validated_data['reference']
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type_class_name == "Retailer":
            if not reference.brand in user_type.brands.all():
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        try:
            Follow.objects.get(user=request.user, reference=reference)
            return Response(status=status.HTTP_409_CONFLICT)
        except Follow.DoesNotExist:
            serializer.save(**{"user": request.user})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AlertView(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Alert.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def get_object_for_delete(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg], "user": request.user}
        obj = get_object_or_404(queryset, **filter_kwargs)
        # May raise a permission denied
        return obj

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object_for_delete(request)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        queryset = Alert.objects.filter(user=request.user)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AlertSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = AlertSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = AlertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        reference = serializer.validated_data['reference']
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type_class_name == "Retailer":
            if not reference.brand in user_type.brands.all():
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        try:
            Alert.objects.get(user=request.user, reference=reference)
            return Response(status=status.HTTP_409_CONFLICT)
        except Alert.DoesNotExist:
            serializer.save(**{"user": request.user})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FireBaseTokenView(viewsets.ModelViewSet):
    serializer_class = FireBaseTokenSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = FireBaseToken.objects.all()
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        serializer = FireBaseTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if FireBaseToken.objects.filter(user=request.user, token=token).count() > 0:
            return Response(status=status.HTTP_200_OK)
        serializer.save(**{"user": request.user})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DashboardView(viewsets.ModelViewSet):
    serializer_class = DashboardSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Dashboard.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def get_object_for_delete(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg], "user": request.user}
        obj = get_object_or_404(queryset, **filter_kwargs)
        # May raise a permission denied
        return obj

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object_for_delete(request)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        queryset = Dashboard.objects.filter(user=request.user).values_list("reference_id", flat=True)
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DashboardSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DashboardSerializer(queryset, many=True)
        return Response({"dashboard": queryset})

    def create(self, request, *args, **kwargs):
        serializer = DashboardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        reference = serializer.validated_data['reference']
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if user_type_class_name == "Retailer":
            if not reference.brand in user_type.brands.all():
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        try:
            Dashboard.objects.get(user=request.user, reference=reference)
            return Response(status=status.HTTP_409_CONFLICT)
        except Dashboard.DoesNotExist:
            serializer.save(**{"user": request.user})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class BrandList(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    filter_backends = (SearchFilter,)
    search_fields = ['name', ]
    queryset = Brand.objects.all()
    lookup_field = "id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = BrandSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BrandSerializer(queryset, many=True)
        return Response(serializer.data)

    def list_by_first_letter(self, request, *args, **kwargs):
        first_letter = kwargs.pop("first_letter", None)
        if len(first_letter) > 1:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        cache = CacheMiddleware()
        brand_by_letter = cache.get("brand_%s" % first_letter)
        if not brand_by_letter:
            queryset = self.queryset.filter(name__istartswith=first_letter)
            user_type = request.user.get_type
            if not user_type:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.serializer_class(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.serializer_class(queryset, many=True)
            return_value = serializer.data
            cache.set("brand_%s" % first_letter, return_value)
            return Response(serializer.data)
        else:
            return Response(brand_by_letter)


class ReferenceByBrandListView(viewsets.ModelViewSet):
    serializer_class = ReferenceSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Reference.objects.all()
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        brand_id = kwargs.pop("brand_id", None)
        if not brand_id:
            return Response(status=status.HTTP_404_NOT_FOUND)
        num_follow = Count('follow', filter=Q(follow__user=request.user))
        queryset = self.queryset.filter(brand__id=brand_id).annotate(
            total_follow=num_follow
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True,
                                               context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(queryset, many=True,
                                           context={"request": request})
        return Response(serializer.data)


class NotificationMineView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Notification.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = Notification.objects.filter(
            user=request.user,
            mine_follow=1,
            read=False
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer)

    def update(self, request, *args, **kwargs):
        now = datetime.datetime.now()
        user = request.user
        user.last_mine_seen = now
        user.save()
        Notification.objects.filter(
            user=request.user,
            mine_follow=1,
            read=False
        ).update(read=True)
        serialized = UserSerializer(user)
        return Response(data=serialized.data, status=status.HTTP_202_ACCEPTED)


class NotificationMineReadView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Notification.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = Notification.objects.filter(
            user=request.user,
            mine_follow=1,
            read=True
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer)


class NotificationMineImportantView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Notification.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = Notification.objects.filter(
            Q(Q(notification_type=1) & Q(new_status__in=["first_call_selection", "second_call_selection"])) |
            Q(notification_type__in=[3, 4]),
            user=request.user,
            mine_follow=1,
            read=False,
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer)


class NotificationFollowView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Notification.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = Notification.objects.filter(
            user=request.user,
            mine_follow=2,
            read=False
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer)

    def update(self, request, *args, **kwargs):
        now = datetime.datetime.now()
        user = request.user
        user.last_follow_seen = now
        user.save()
        Notification.objects.filter(
            user=request.user,
            mine_follow=2,
            read=False
        ).update(read=True)
        serialized = UserSerializer(user)
        return Response(serialized.data, status=status.HTTP_202_ACCEPTED)


class NotificationFollowReadView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination
    queryset = Notification.objects.all()
    lookup_field = "reference_id"
    renderer_classes = [
        JSONRenderer,
    ]

    def list(self, request, *args, **kwargs):
        queryset = Notification.objects.filter(
            user=request.user,
            mine_follow=2,
            read=True
        )
        user_type = request.user.get_type
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer)


class NotificationSetReadView(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = NotificationSetReadSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def create(self, request, *args, **kwargs):
        serializer = NotificationSetReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notifications = serializer.validated_data['notifications']
        user_type = request.user.get_type
        user_type_class_name = user_type.__class__.__name__
        if not user_type:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        notification_list = []
        Notification.objects.filter(
            user=request.user,
            read=False,
            id__in=notifications
        ).update(read=True)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TokenSubscription(GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = FireBaseTokenSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def post(self, request, format=None):
        token = request.data["token"]
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
        try:
            default_app = initialize_app(cred)
        except ValueError:
            pass
        response = messaging.subscribe_to_topic([token], "auction_list")
        if response.success_count > 0:
            return Response({"success": True})
        else:
            for e in response.errors:
                print(e.index)
                print(e.reason)
            return Response({"success": False}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class TokenUnSubscription(GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = FireBaseTokenSerializer
    renderer_classes = [
        JSONRenderer,
    ]

    def post(self, request, format=None):
        token = request.data["token"]
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_FILE)
        try:
            default_app = initialize_app(cred)
        except ValueError:
            pass
        response = messaging.unsubscribe_from_topic([token], "auction_list")
        if response.success_count > 0:
            return Response({"success": True})
        else:
            return Response({"success": False}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

class SecureTransactionView(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    renderer_classes = [
        JSONRenderer,
    ]

    def update(self, request, format=None, type=None, pk=None, token=None):
        server_name = request.get_host()
        url = "%s://%s/customer/" % (
            "https" if request.is_secure() else "http",
            server_name,
        )
        pares = None
        if 'PaRes' in request.data:
            pares = request.data["PaRes"]
        elif 'PARES' in request.data:
            pares = request.data["PaRes"]
        elif 'pares' in request.data:
            pares = request.data["pares"]
        if pares is None:
            return redirect(url)
        if type == 'deposit' or type == 'balance':
            auction = Auction.objects.filter(pk=pk).first()
            if auction is None:
                return redirect(url)
        elif type == 'deposit_offer':
            offer = Offer.objects.filter(pk=pk)
            if offer is None:
                return redirect(url)
        else:
            return redirect(url)
        string_for_token = "%s" % (pk)
        string_for_token = string_for_token.encode('utf-8')
        real_token = obfuscate(string_for_token)
        if token != real_token:
            return redirect(url)
        paymentService = PaymentService()
        if type == 'deposit':
            transaction = auction.deposit_transaction
            if transaction.status == 'check_secure_transaction':
                result = paymentService.secureTransaction(transaction=transaction, pares=pares)
                if result['error']:
                    auction.delete()
                else:
                    auction.payment_3ds_check = False
                    auction.save()
            return redirect(url)
        if type == 'deposit_offer':
            transaction = offer.deposit_transaction
            if transaction.status == 'check_secure_transaction':
                result = paymentService.secureTransaction(transaction=transaction, pares=pares)
                if result['error']:
                    offer.delete()
                else:
                    offer.payment_3ds_check = False
                    offer.save()
            return redirect(url)
        if type == 'balance':
            auction_winner = AuctionWinner.objects.get(auction=auction)
            payment = Payment.objects.get(
                auction_winner=auction_winner
            )
            transaction = auction.balance_transaction
            if transaction.status == 'check_secure_transaction':
                result = paymentService.secureTransaction(transaction=transaction, pares=pares)
                if result['error']:
                    payment.status = 'failed'
                    payment.save()
                else:
                    paymentService.settleTransaction(transaction=result['transaction'])
                    auction.payment_3ds_check = False
                    payment.status = 'settled'
                    auction.status = 'closed'
                    payment.save()
                    auction.save()
                    completePayment(auction, auction_winner)
            return redirect(url)
