"""watchbot URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
import ckeditor_uploader.urls
from blog import views as blog_views
from django.views import generic
from rest_framework.schemas import get_schema_view
from rest_framework.authtoken import views as rest_views
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor/', include(ckeditor_uploader.urls)),
    path('', blog_views.home, name='home'),
    path('home_old/', blog_views.home_old, name='home_old'),
    path('article_old/', blog_views.article_old, name='article_old'),
    path('about/', blog_views.about, name='about'),
    path('retailers/', blog_views.retailers, name='retailers'),
    path('search/', blog_views.filter, name='search'),
    path('articles/<slug:slug>/', blog_views.article, name='articles'),
    path('app/', blog_views.app, name='app'),
    path('login_old/', blog_views.login_old, name='login_old'),
    path('login/', blog_views.login, name='login'),
    path('forgot-password/', blog_views.forgot_password, name='forgot_password'),
    path('reset-password/<int:pk>/<str:token>/', blog_views.reset_password, name='reset_password'),
    path('registration/<int:type>', blog_views.registration, name='registration'),
    path('email-confirmation/<int:pk>/<str:token>/', blog_views.email_confirmation, name='email_confirmation'),
    path('step2/', blog_views.step2, name='step2'),
    path('full-access/', blog_views.step2, name='full_access'),
    path('logout/', blog_views.logout, name='logout'),
    path('profile/', blog_views.profile, name='profile'),
    path('contact-us/', blog_views.contact, name='contact-us'),
    path('api/', include('api.urls', namespace='api')),
    path('api-rest-fw/', get_schema_view()),
    path('api-rest-fw/auth/', include('rest_framework.urls', namespace='rest_framework')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

'''
urlpatterns += [
    path('api-token-auth/', rest_views.obtain_auth_token)
]
'''
