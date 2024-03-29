"""
Django settings for watchbot project.

Generated by 'django-admin startproject' using Django 2.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os
from django.utils.translation import ugettext_lazy as _

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'n_4+&amhu+qs=o_4vg4@omc3jn^qdbh%h6#*u%-zlh7j6wj5k1'

# SECURITY WARNING: don't run with debug turned on in production!


# Application definition

INSTALLED_APPS = [
    'modeltranslation',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    'corsheaders',
    'hdsauth',
    'blog',
    'ckeditor',
    'ckeditor_uploader',
    'reference',
    'notification',
    'auction',
    'translation_dictionary',
    'rest_framework.authtoken',
    #'rest_framework_swagger',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'watchbot.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'watchbot.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'watchbot',
        'USER': 'watchbot',
        'PASSWORD': 'watchbot',
        'HOST': '127.0.0.1',
        'PORT': '5432',
        "OPTIONS": {'sslmode': 'disable'}
    }
}

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DEBUG = True

AUTH_USER_MODEL = 'hdsauth.HDSAuthUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.JSONParser',
    ],
    'DATETIME_FORMAT': '%s',
}

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Rome'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LOCALE_PATHS = (
    os.path.abspath(os.path.join(BASE_DIR, 'conf/locale')),
)

LANGUAGES = (
    ('it', _('Italian')),
    ('en', _('English')),
)

MODELTRANSLATION_DEFAULT_LANGUAGE = 'it'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, 'static'))
MEDIA_ROOT = os.path.abspath(os.path.join(BASE_DIR, 'media'))
STATIC_URL = '/static/'
MEDIA_URL = '/media/'


JQUERY_LIB = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'
JQUERY_UI_LIB = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
CKEDITOR_JQUERY_URL = JQUERY_LIB
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_IMAGE_BACKEND = "pillow"

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Custom',
        'enterMode': 2,
        'toolbar_Custom': [
            ['Bold', 'Italic', 'Underline', '-', 'Link', 'Unlink', '-', 'Source'],
            ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent'],
            ['Image', ],
            ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
            ['Subscript', 'Superscript'],
            ['Styles', 'Format', 'Font', 'FontSize'],
            ['TextColor'],
        ]
    }
}

LOGIN_URL = 'login'
LOGOUT_URL = 'logout'

SWAGGER_SETTINGS = {
    'JSON_EDITOR': True,
    #'SHOW_REQUEST_HEADERS': True,
    'USE_SESSION_AUTH': True,
    'SECURITY_DEFINITIONS': {
        'Token Authentication': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
        }
    },
}

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.zoho.eu'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'watchbot@zohomail.eu'
EMAIL_HOST_PASSWORD = 'nopassword13'
DEFAULT_FROM_EMAIL = 'watchbot@zohomail.eu'
ADMINS = [
    ("Errors - HDS", "watchbot@zohomail.eu")
]

CSRF_TRUSTED_ORIGINS = ['watchbot.local']

CORS_ORIGIN_ALLOW_ALL = True
#CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_METHODS = (
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
)

CORS_ALLOW_HEADERS = (
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
)

AUCTION_DEFAULT_SETTINGS = {
    "x1": 60 * 10,  # First call duration
    "x2": 60 * 5,  # First call selection time duration
    "x3": 60 * 0,  # Second call preload duration
    "x4": 60 * 10,  # Second call duration
    "x5": 60 * 10,  # Second call selection time duration
    "x6": 60 * 60 * 24 * 14,  # Payment time duration
    "minimum_call_first": 1, # Minimum number of calls needed to close the first call
}

FIREBASE_CREDENTIALS_FILE = "watchbot-afbb0-firebase-adminsdk-3hqrt-6d67384502.json"

LOG_FILE = os.path.join(os.path.abspath(BASE_DIR), "debug.log")

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'console': {
            'format': '%(levelname)s | %(asctime)s | %(module)s | %(name)s | %(pathname)s | %(message)s',
            'datefmt': "%d/%b/%Y %H:%M:%S"
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'formatter': 'console',
            'filename': LOG_FILE,
        },
    },
    'loggers': {
        'bc.log': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}


#### GESTPAY CONFIG ####
GPAY_TEST_ENABLED = True
GPAY_SHOP_LOGIN = "GESPAY78988"
GPAY_TEST_URL = "https://sandbox.gestpay.net/gestpay/gestpayws/WSs2s.asmx?WSDL"
GPAY_PRODUCTION_URL = "https://ecomms2s.sella.it/gestpay/gestpayws/WSs2s.asmx?WSDL"
GPAY_APIKEY = "R0VTUEFZNzg5ODgjI0VzZXJjZW50ZSBUZXN0IGRpIENhcmVuYSMjMTgvMDMvMjAyMCAxNzoxODo1MQ=="
GPAY_SECURE_TRANSACTION_URL = "https://ecomm.sella.it/pagam/pagam3d.aspx"
GPAY_TEST_SECURE_TRANSACTION_URL = "https://sandbox.gestpay.net/pagam/pagam3d.aspx"

GPAY_DEFAULT_CURRENCY = 242  # UicCode


##########################################
###### DEVONO STARE ALLA FINE DEL FILE ###
##########################################
try:
    from . local_settings import *
    print('IMPORTED LOCAL SETTINGS')
except ImportError:
    pass

try:
    from . production_settings import *
    print('IMPORTED PRODUCTION SETTINGS')
except ImportError:
    pass
##########################################
##########################################
