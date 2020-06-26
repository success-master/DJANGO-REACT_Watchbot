from django.urls import path, include
from api import views
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from rest_framework.authtoken import views as rest_framework_views

#from api.swagger_schema import SwaggerSchemaView
#from rest_framework.urlpatterns import format_suffix_patterns
#from rest_framework.schemas import get_schema_view
#from rest_framework_swagger.views import get_swagger_view
#schema_view = get_swagger_view(title='Watchbot API')

schema_view = get_schema_view(
   openapi.Info(
      title="WatchBot API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   validators=['flex', 'ssv'],
   public=True,
   permission_classes=(AllowAny,),
)

router = DefaultRouter()
#router.register(r'alert', views.AlertView)
#router.register(r'user/me', views.CustomerView)


app_name = 'api'
urlpatterns = [
    path('', schema_view.with_ui('swagger', cache_timeout=None), name='schema-swagger-ui'),
    path('', include(router.urls)),
    path('3ds-check/<str:type>/<int:pk>/<str:token>/', views.SecureTransactionView.as_view({"post": "update"}), name='secure_transaction'),
    path('is-authenticated/', views.ObtainToken.as_view(), name='is_authenticated'),
    path('api-auth-token/', rest_framework_views.obtain_auth_token, name='obtain_auth_token'),
    path('user/me/', views.UserView.as_view({"get": "get", "post": "post"}), name='user'),
    path('user/language/', views.UserLanguageView.as_view({"get": "get", "post": "post"}), name='user_language'),
    path('user/credit-cards/', views.UserCreditCardsView.as_view({"get": "get"}), name='user_credit_cards'),
    path('user/credit-cards/<int:id>/',
         views.UserCreditCardUpdateView.as_view({"put": "put"}),
         name='user_credit_cards_update'),
    path('notification/mine/new/', views.NotificationMineView.as_view({"get": "list"}), name='notification_mine_new'),
    path('notification/mine/read/', views.NotificationMineReadView.as_view({"get": "list"}), name='notification_mine_read'),
    path('notification/mine/set-read/', views.NotificationMineView.as_view({"post": "update"}), name='notification_mine_set'),
    path('notification/mine/important/',
         views.NotificationMineImportantView.as_view({"get": "list"}),
         name='notification_mine_important'),
    path('notification/follow/new/',
         views.NotificationFollowView.as_view({"get": "list"}),
         name='notification_follow_new'),
    path('notification/follow/read/',
         views.NotificationFollowReadView.as_view({"get": "list"}),
         name='notification_follow_read'),
    path('notification/follow/set-read/',
         views.NotificationFollowView.as_view({"post": "update"}),
         name='notification_follow_set'),
    path('notification/set-read-by-id/',
         views.NotificationSetReadView.as_view({"put": "create"}),
         name='notification_set_read'),
    path('auction/set-delay/<int:id>/',
         views.AutcionSetDelayView.as_view({"post": "update"}),
         name='auction_set_delay'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('auction/by-reference/<int:id>/self/', views.AuctionReferenceSelfView.as_view({"get": "list"}),
         name='auction_reference_self'),
    path('auction/by-reference/<int:id>/my-offer/', views.AuctionReferenceCallView.as_view({"get": "list"}),
         name='auction_reference_call'),
    path('auction/by-reference/<int:id>/', views.AuctionReferenceListView.as_view({"get": "list"}),
         name='auction_reference_list'),
    path('auction/by-reference/<int:id>/not-mine/', views.AuctionReferenceNotMineView.as_view({"get": "list"}),
         name='auction_not_mine_reference_list'),
    path('reference/', views.ReferenceListView.as_view({"get": "list"}), name='reference_list'),
    path('reference/<int:id>/', views.ReferenceListView.as_view({"get": "retrieve"}), name='reference_detail'),
    path('auction/', views.AuctionView.as_view({
        "get": "list",
        "put": "create"
    }), name='auction'),
    path('auction/all-live-puts', views.AuctionAllLiveView.as_view({"get": "list"}), name='auction_all_live_puts'),
    path('auction/my-live-puts', views.AuctionMyLiveView.as_view({"get": "list"}), name='auction_my_live_puts'),
    path('auction/my-live-calls', views.AuctionMyLiveCallsView.as_view({"get": "list"}), name='auction_my_live_calls'),
    path('auction/my-failed-trades', views.AuctionMyFailedTrades.as_view({"get": "list"}), name='auction_my_failed_trades'),
    path('auction/my-matched-trades', views.AuctionMyMatchedTrades.as_view({"get": "list"}), name='auction_my_matched_trades'),
    path('auction/my-watchlist-live-puts', views.AuctionMyWatchListLivePuts.as_view({"get": "list"}), name='auction_my-watch-list-live-puts'),
    path('auction/my-joined-live-puts', views.AuctionMyJoinedListLivePuts.as_view({"get": "list"}), name='auction_my-joined-list-live-puts'),
    path('auction/joined-live-calls', views.AuctionJoinedListLiveCalls.as_view({"get": "list"}), name='auction_joined-list-live-calls'),
    path('auction/competitors-put/', views.AuctionCompetitorsPutView.as_view({"get": "list"}),name='auction_competitors_put_list'),
    path('auction/offer/', views.AuctionOfferView.as_view({"put": "create"}), name='auction_offer'),
    path('auction/selection/', views.AuctionSelectionView.as_view({"put": "create"}), name='auction_selection'),
    path('auction/winner/', views.AuctionWinnerView.as_view({"put": "create"}), name='auction_winner'),
    path('auction/self/', views.AuctionView.as_view({"get": "list_self"}), name='auction_self'),
    path('auction/pay/', views.AuctionPaymentView.as_view({"put": "create"}), name='auction_pay'),
    path('auction/live/', views.AuctionLiveView.as_view({"get": "list"}), name='auction_live'),
    path('transactions/', views.AuctionTransactionView.as_view({"get": "list"}), name='auction_transactions_smart2pay'),
    path('programming/', views.ProgrammingView.as_view({"get": "list"}), name='programming'),
    path('programming/call/', views.ProgrammingCallView.as_view({"get": "list"}), name='programming_call'),
    path('programming/call/by-brand/<int:brand_id>', views.ProgrammingCallView.as_view({"get": "list_filtered"}), name='programming_call_filtered'),
    path('programming/by-brand/<int:brand_id>', views.ProgrammingView.as_view({"get": "list_filtered"}), name='programming_filtered'),
    path('auction/my-offer/', views.AuctionView.as_view({"get": "list_offer"}), name='auction_offer'),
    path('auction/by-follow/', views.AuctionView.as_view({"get": "list_follow"}), name='auction_follow'),
    path('auction/by-alert/', views.AuctionView.as_view({"get": "list_alert"}), name='auction_alert'),
    path('auction/set-raise-price', views.AuctionRaisePriceView.as_view({
        "put": "edit",
    }), name='auction_amounts'),
    path('auction/<int:id>/', views.AuctionView.as_view({"get": "retrieve"}), name='auction_by_id'),
    path('auction/delete/<int:id>/', views.AuctionView.as_view({"delete": "destroy"}), name='auction_delete_by_id'),
    path('auction/<int:id>/amounts/', views.AuctionAmountsView.as_view({
        "get": "get",
    }), name='auction_amounts'),
    path('alert/', views.AlertView.as_view({"get": "list", "put": "create"}), name='alert'),
    path('alert/<int:reference_id>/', views.AlertView.as_view({"delete": "destroy"}), name='alert'),
    path('follow/', views.FollowView.as_view({"get": "list", "put": "create"}), name='follow'),
    path('follow/<int:reference_id>/', views.FollowView.as_view({"delete": "destroy"}), name='follow_delete'),
    path('dashboard/', views.DashboardView.as_view({"get": "list", "put": "create"}), name='dashboard'),
    path('dashboard/<int:reference_id>/', views.DashboardView.as_view({"delete": "destroy"}), name='dashboard_delete'),
    path('firebase-token/', views.FireBaseTokenView.as_view({"put": "create"}), name='firebase_token'),
    path('topic-subscribtion/', views.TokenSubscription.as_view(), name='firebase_token_subscribe'),
    path('topic-unsubscribtion/', views.TokenUnSubscription.as_view(), name='firebase_token_unsubscribe'),
    path('brand/', views.BrandList.as_view({"get": "list"}), name='brand_list'),
    path('brand/<slug:first_letter>/', views.BrandList.as_view({"get": "list_by_first_letter"}), name='brand_by_first_letter'),
    path('reference-by-brand/<int:brand_id>/', views.ReferenceByBrandListView.as_view({"get": "list"}), name='reference_by_brand_list'),

]

#urlpatterns = format_suffix_patterns(urlpatterns)
'''
path('translations/', views.translation_list, name='translation_list'),
path('last-auctions/', views.last_auctions, name='last_auctions'),
path('reference-list/', views.reference_list, name='reference_list'),
path('followed-reference/', views.followed_reference, name='followed_reference'),
path('auction/put', views.put_auction, name='put_auction'),
path('follow/put', views.put_follow, name='put_follow'),
path('alert/put', views.put_alert, name='put_alert'),
'''
