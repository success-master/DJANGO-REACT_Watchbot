# -*- coding: utf-8 -*-
from django.shortcuts import redirect, render, get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.urls import reverse_lazy
from django.http import HttpResponseRedirect
from hdsauth.forms import *
from django.conf import settings
import hashlib
from django.utils.html import strip_tags
from django.template.loader import get_template
from blog.models import Article, Category
from hdsauth.models import CustomerGame, Customer
from hdsauth.gestpay import Gestpay
from hdsauth.hubspot import Hubspot

from .forms import SearchForm
from django.db.models import Q
import urllib

import logging

logger = logging.getLogger('bc.log')


def app_login_required(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.get_user_type in ["customer", "retailer"]:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('home')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    decorated_function.__doc__ = func.__doc__
    decorated_function.__name__ = func.__name__
    return decorated_function


def obfuscate(s):
    m = hashlib.sha256()
    m.update(s)
    return m.hexdigest()


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def main_render(request, template, template_dict={}):
    full_access = False #
    template_dict['is_authenticated'] = request.user.is_authenticated
    if request.user.is_authenticated:
        user_type = request.user.get_type
        template_dict["user_type"] = user_type.__class__.__name__
        if template_dict['user_type'] == 'Retailer':
            template_dict['trading_url'] = request.build_absolute_uri('/retailer/')
        elif template_dict['user_type'] == 'Customer':
            template_dict['trading_url'] = request.build_absolute_uri('/customer/')
        else:
            full_access = True
            template_dict['trading_url'] = reverse_lazy('full_access')
    else:
        template_dict['user_type'] = None
        template_dict['trading_url'] = reverse_lazy('login')
    template_dict["DEBUG"] = settings.DEBUG
    template_dict["full_access"] = full_access
    response = render(request, template, template_dict)
    return response

#test upgrade



def home_old(request):
    template_dict = {}
    return main_render(request, 'home_old.html', template_dict)


def article_old(request):
    template_dict = {}
    return main_render(request, 'article_old.html', template_dict)


def home(request):
    if request.method == "POST":
        logger.info(request.POST)
        data = request.POST.copy()
        newsletter_form = NewsletterUserForm(data=data)
        if newsletter_form.is_valid():
            newsletter_form.save()
            return redirect('')

    last_articles = Article.objects.order_by("-date")[:6]
    categories = ['lifestyle', 'luxury_watch_market', 'technical_guide', 'new_releases', 'watch_guide']
    elements = []
    for category in categories:
        data = category_articles(category, 6)
        if data is None:
            continue
        elements.append({
            'type': type_section(category),
            'typeArticle': type_article(category),
            'category': data['category'],
            'advertising': advertising(category),
            'bannerRegister': banner_register(category),
            'articles': data['articles']
        })
    template_dict = {
        'news': {
            'advertising': advertising('news'),
            'articles': last_articles,
        },
        'categories': elements,
    }
    return main_render(request, 'home.html', template_dict)


def about(request):
    return main_render(request, 'about.html')


def retailers(request):
    return main_render(request, 'retailers.html')


def article(request, slug):
    data = get_object_or_404(Article, slug=slug)
    related_stories = Article.objects.exclude(id=data.id).filter(category=data.category).order_by("-date")[:2]
    last_articles = Article.objects.exclude(id=data.id).order_by("-date")[:6]
    luxury_watch_articles = category_articles('luxury_watch_market', 6)
    categories = [
        {
            'type': '',
            'typeArticle': '',
            'category': {
                'name': 'Related stories'
            },
            'advertising': advertising('related_stories'),
            'bannerRegister': None,
            'articles': last_articles
        },
        {
            'type': type_section('luxury_watch_market'),
            'typeArticle': type_article('luxury_watch_market'),
            'category': luxury_watch_articles['category'],
            'advertising': advertising('luxury_watch_market'),
            'bannerRegister': None,
            'articles': luxury_watch_articles['articles']
        }
    ]

    template_dict = {
        "article": data,
        "related_stories": related_stories,
        "categories": categories,
        'share': share(data, request)
    }
    return main_render(request, 'article.html', template_dict)


def logout(request):
    auth_logout(request)
    return redirect(reverse_lazy("home"))


def login_old(request):
    return main_render(request, 'login_old.html', {})


def email_confirmation(request, pk, token):
    user = get_object_or_404(HDSAuthUser, pk=pk)
    if user.is_active:
        return redirect(reverse_lazy("home"))
    string_for_token = "%s%s%s" % (user.email, user.last_name, user.first_name)
    string_for_token = string_for_token.encode('utf-8')
    real_token = obfuscate(string_for_token)
    if token != real_token:
        return redirect(reverse_lazy("home"))
    user_type = user.get_type
    user_type_class_name = user_type.__class__.__name__
    if user_type_class_name == 'Customer':
        response = redirect(reverse_lazy("step2"))
        expiring_seconds = 36000
        string_for_cookie = "%s-%s" % (get_client_ip(request), user.pk)
        string_for_cookie = string_for_cookie.encode('utf-8')
        cookie_value = obfuscate(string_for_cookie)
        expires = datetime.datetime.now() + datetime.timedelta(seconds=expiring_seconds)
        response.set_cookie("s2u", cookie_value, expiring_seconds, expires=expires)
        response.set_cookie("uid", user.pk, expiring_seconds, expires=expires)
        return response
    else:
        user.is_active = True
        user.save()
        auth_login(request, user)
        template_dict = {
            'user_type': user_type_class_name
        }
        return main_render(request, 'activate-success.html', template_dict)


def forgot_password(request):
    if request.user.is_authenticated:
        return redirect(reverse_lazy("home"))
    success = False
    if request.method == "POST":
        email = request.POST.get('email')
        try:
            user = HDSAuthUser.objects.get(email=email)
        except HDSAuthUser.DoesNotExist:
            user = None
        if user is not None:
            string_for_token = "%s%s" % (email, user.pk)
            string_for_token = string_for_token.encode('utf-8')
            token = obfuscate(string_for_token)
            server_name = request.get_host()
            url = "%s://%s/reset-password/%s/%s/" % (
                "https" if request.is_secure() else "http",
                server_name,
                user.pk,
                token
            )
            template_email = get_template('generic_email.html')
            msg_html = template_email.render({
                'title': 'Reset your password',
                'contents': [
                    'You have received this email because you requested to reset the password, click on the button to change it : '
                ],
                'action': {
                    'url': url,
                    'title': 'RESET PASSWORD'
                }
            })
            msg = strip_tags(msg_html)
            subject, from_email, to = "Watchbot - Reset Password", settings.DEFAULT_FROM_EMAIL, email
            text_content = msg
            html_content = msg_html
            send_mail(subject=subject, message=text_content, from_email=from_email,
                      recipient_list=[to], fail_silently=False, html_message=html_content)
        success = "We just sent an email check your inbox"

    return main_render(request, 'forgot-password.html', { 'success': success })


def reset_password(request, pk, token):
    if request.user.is_authenticated:
        return redirect(reverse_lazy("home"))

    user = get_object_or_404(HDSAuthUser, pk=pk)
    string_for_token = "%s%s" % (user.email, user.pk)
    string_for_token = string_for_token.encode('utf-8')
    real_token = obfuscate(string_for_token)
    if token != real_token:
        return redirect(reverse_lazy("login"))
    error = False
    if request.method == "POST":
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        if len(password) < 8:
            error = "The new password must be at least 8 characters"
        elif password != confirm_password:
            error = "Passwords do not match"
        else:
            user.set_password(password)
            user.save()
            return main_render(request, 'reset-success.html')

    return main_render(request, 'reset-password.html', { 'error': error })


def registration(request, type):
    if request.user.is_authenticated:
        return redirect(reverse_lazy("home"))

    signup_form = HDSSignUpForm()
    if request.method == "POST":
        signup_form = HDSSignUpForm(data=request.POST)
        if signup_form.is_valid():
            new_user = signup_form.save(commit=False)
            new_user.ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', None)
            new_user.sign_up_user_agent = user_agent
            new_user.save()
            string_for_token = "%s%s%s" % (new_user.email, new_user.last_name, new_user.first_name)
            string_for_token = string_for_token.encode('utf-8')
            token = obfuscate(string_for_token)
            server_name = request.get_host()
            url = "%s://%s/email-confirmation/%s/%s/" % (
                "https" if request.is_secure() else "http",
                server_name,
                new_user.pk,
                token
            )
            template_email = get_template('generic_email.html')
            msg_html = template_email.render({
                'title': 'Thank you for registering',
                'contents': [
                    'Please confirm your registration by clicking :'
                ],
                'action': {
                    'url': url,
                    'title': 'ACTIVATE YOUR ACCOUNT'
                }
            })
            msg = strip_tags(msg_html)
            subject, from_email, to = "Watchbot - Confirm email", settings.DEFAULT_FROM_EMAIL, new_user.email
            text_content = msg
            html_content = msg_html
            if new_user.pk:
                send_mail(subject=subject, message=text_content, from_email=from_email,
                          recipient_list=[to], fail_silently=False, html_message=html_content)
                if type == 2:
                    customer_game = CustomerGame(
                        user=new_user,
                        email_contact=new_user.email
                    )
                    customer_game.save()
                elif type == 3:
                    customer = Customer(
                        user=new_user,
                        email_contact=new_user.email
                    )
                    customer.save()
                return main_render(request, 'confirm-email.html')
    template_dict = {
        'type': type,
        'signup_form': signup_form
    }
    return main_render(request, 'registration.html', template_dict)


def login(request):
    if request.user.is_authenticated:
        return redirect(reverse_lazy("home"))

    form = HDSLoginForm()
    if request.method == "POST":
        form = HDSLoginForm(data=request.POST, request=request)
        if form.is_valid():
            auth_login(request, form.get_user())
            if request.session.test_cookie_worked():
                request.session.delete_test_cookie()
            user = form.get_user()
            user_type = user.get_type
            user_type_class_name = user_type.__class__.__name__
            if user_type_class_name == "Retailer":
                return HttpResponseRedirect("/retailer/")
            elif user_type_class_name == 'Customer':
                return HttpResponseRedirect("/customer/")
            else:
                return HttpResponseRedirect("/")
    template_dict = {
        "form": form,
    }
    return main_render(request, 'login.html', template_dict)


def step2(request):
    gestpay_data = None
    full_access = False
    if not request.user.is_authenticated:
        cookie_string = request.COOKIES.get('s2u', None)
        cookie_uid = request.COOKIES.get('uid', None)
        if cookie_string and cookie_uid:
            try:
                user = HDSAuthUser.objects.get(pk=cookie_uid)
                if user.is_active:
                    response = HttpResponseRedirect("/customer/")
                    response.delete_cookie('s2u')
                    response.delete_cookie('uid')
                    return response
                string_for_cookie = "%s-%s" % (user.ip_address, user.pk)
                string_for_cookie = string_for_cookie.encode('utf-8')
                cookie_value = obfuscate(string_for_cookie)
                if cookie_value != cookie_string:
                    return redirect(reverse_lazy("home"))
            except HDSAuthUser.DoesNotExist:
                return redirect(reverse_lazy("home"))
        else:
            return redirect(reverse_lazy("home"))
    else:
        user_type = request.user.get_user_type
        if user_type == 'customer':
            response = HttpResponseRedirect("/customer/")
            return response
        elif user_type == 'retailer':
            response = HttpResponseRedirect("/retailer/")
            return response
        else:
            full_access=True
            user = HDSAuthUser.objects.get(pk=request.user.pk)
    customer_form = CustomerForm()
    if request.method == "POST":
        user_type = user.get_user_type
        data = request.POST.copy()
        data.update({'user': user.pk, 'email_contact': user.email})
        if user_type == 'customer':
            customer_form = CustomerForm(data=data, instance=user.get_type)
        else:
            customer_form = CustomerForm(data=data)
        if customer_form.is_valid():
            error = False
            if len(customer_form.cleaned_data['card_number']) > 0:
                gestpay = Gestpay()
                response = gestpay.request_token(
                    customer_form.cleaned_data['card_number'],
                    customer_form.cleaned_data['card_expiration_month'],
                    customer_form.cleaned_data['card_expiration_year'],
                    customer_form.cleaned_data['card_cvc'],
                )
                if response.find('TransactionResult').text == 'KO':
                    error = True
                    customer_form.add_error(None, response.find('TransactionErrorDescription').text)
                else:
                    gestpay_data = {
                        'ccToken': response.find('Token').text,
                        'tokenExpiryYear': response.find('TokenExpiryYear').text,
                        'tokenExpiryMonth': response.find('TokenExpiryMonth').text,
                    }
            if not error:
                if user_type == 'customergame' or user_type == 'other':
                    if user_type == 'customergame':
                        user.get_type.delete()
                customer_form.save()
                if gestpay_data is not None:
                    getpayToken = GestpayToken(
                        ccToken=gestpay_data['ccToken'],
                        tokenExpiryYear=gestpay_data['tokenExpiryYear'],
                        tokenExpiryMonth=gestpay_data['tokenExpiryMonth'],
                        user=user,
                    )
                    getpayToken.save()
                if len(customer_form.cleaned_data['shipping_address']) > 0:
                    customer_address = CustomerAddress(
                        address=customer_form.cleaned_data['shipping_address'],
                        country=customer_form.cleaned_data['shipping_country'],
                        state=customer_form.cleaned_data['shipping_state'],
                        zip_code=customer_form.cleaned_data['shipping_zip_code'],
                        city=customer_form.cleaned_data['shipping_city'],
                        preferred_shipping_addr=True,
                        customer=user.get_type,
                    )
                    customer_address.save()
                user.is_active = True
                user.first_name = customer_form.cleaned_data['first_name']
                user.last_name = customer_form.cleaned_data['last_name']
                #HUBSPOT INTEGRATION
                user.save()
                hubspot = Hubspot()
                '''
                phonenumber = customer_form.cleaned_data['prefix_confirm_phone_number']+customer_form.cleaned_data['confirm_phone_number']
                hubspot.insert_contact(user.email,
                                       customer_form.cleaned_data['first_name'],
                                       customer_form.cleaned_data['last_name'],
                                       phonenumber,
                                       customer_form.cleaned_data['address'],
                                       customer_form.cleaned_data['city'],
                                       customer_form.cleaned_data['state'],
                                       customer_form.cleaned_data['country'],
                                       customer_form.cleaned_data['zip_code'],
                                       customer_form.cleaned_data['document_type'],
                                       customer_form.cleaned_data['document_number'],
                                       customer_form.cleaned_data['document_issuer'],
                                       (customer_form.cleaned_data['document_expiry_date']).strftime("%x"),
                                       customer_form.cleaned_data['gender'],
                                       (customer_form.cleaned_data['birth_date']).strftime("%x"),
                                       )
                '''
                hubspot.insert_contact(user.email,
                                   customer_form.cleaned_data['first_name'],
                                   customer_form.cleaned_data['last_name'],
                                   customer_form.cleaned_data['terms_and_privacy_policy']
                                       )
                auth_login(request, user)
                logger.debug("hubspot flag 2")

                response = HttpResponseRedirect("/customer/")
                response.delete_cookie('s2u')
                response.delete_cookie('uid')
                return response
    template_dict = {
        "full_access": full_access,
        "email": user.email,
        "customer_form": customer_form,
    }
    return main_render(request, 'step2.html', template_dict)


def type_section(slug):
    return {
        'technical_guide': 'blue',
        'watch_guide': 'dark'
    }.get(slug, '')


def type_article(slug):
    return {
        'technical_guide': 'secondary',
        'new_releases': 'large',
        'watch_guide': 'large secondary'
    }.get(slug, '')


def banner_register(slug):
    return {
        'lifestyle': {
            'subtitle': 'Register now for an exclusive preview',
            'title': 'Preview our real-time trading platform',
            'type': ''
        },
        'technical_guide': {
            'subtitle': 'Subscribe to our Newsletter',
            'title': 'Enter the world of Watchbot',
            'type': 'secondary'
        }
    }.get(slug, None)


def category_articles(slug, limit):
    category = Category.objects.get(slug=slug)
    if category is None:
        return None
    articles = Article.objects.filter(category=category).order_by("-date")[:limit]
    return {
        'category': category,
        'articles': articles,
    }


def advertising(slug):
    return {
        'news': '#url',
        'luxury_watch_market': '#url',
        'new_releases': '#url',
        'watch_guide': '#url',
        'related_stories': '#url',
    }.get(slug, None)


def share(data, request):
    url = request.build_absolute_uri()
    title = urllib.parse.quote(data.title)
    data = {
        'linkedin': 'https://www.linkedin.com/shareArticle?url=' + url + '&mini=true&title=' + title,
        'twitter': 'https://twitter.com/intent/tweet?text=Great%20Article&url=' + url,
        'facebook': 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    }
    return data


@app_login_required
def app(request):
    template_dict = {

    }
    return main_render(request, '%s.html' % request.user.get_user_type, template_dict, "app")

def is_valid_queryparam(param):
    return param != '' and param is not None

def filter(request):
    form = SearchForm()
    categories = Category.objects.all()
    if request.method == "POST":

        # form = SearchForm(request.POST)
        qs = Article.objects.all()

        title_contains_query = request.POST.get('title_contains')
        id_exact_query = request.POST.get('title_exact_id')
        title_or_author_query = request.POST.get('title_or_author')
        # view_count_min = request.GET.get('view_count_min')
        # view_count_max = request.GET.get('view_count_max')
        date_min = request.POST.get('pub_date_min')
        date_max = request.POST.get('pub_date_max')
        category = request.POST.get('category')
        # reviewed = request.GET.get('reviewed')
        # not_reviewed = request.GET.get('notReviewed')

        if is_valid_queryparam(title_contains_query):
            qs = qs.filter(title__icontains=title_contains_query)

        elif is_valid_queryparam(id_exact_query):
            res = id_exact_query.isdigit()
            if res:
                 qs = qs.filter(id=id_exact_query)
            #else:
                #qs = qs.filter(id=int(id_exact_query))


        elif is_valid_queryparam(title_or_author_query):
            qs = qs.filter(Q(title__icontains=title_or_author_query)
                           | Q(author__first_name__icontains=title_or_author_query)
                           ).distinct()

        # if is_valid_queryparam(view_count_min):
        #     qs = qs.filter(views__gte=view_count_min)

        # if is_valid_queryparam(view_count_max):
        #     qs = qs.filter(views__lt=view_count_max)

        if is_valid_queryparam(date_min):
            qs = qs.filter(date__gte=date_min)

        if is_valid_queryparam(date_max):
            qs = qs.filter(date__lt=date_max)

        if is_valid_queryparam(category) and category != 'Choose...':
            qs = qs.filter(category__name=category)

        # if reviewed == 'on':
        #     qs = qs.filter(reviewed=True)

        # elif not_reviewed == 'on':
        #     qs = qs.filter(reviewed=False)

        template_dict = {
            'form': SearchForm(),
            'categories': categories,
            'qs': qs,
        }
        return main_render(request, 'search.html', template_dict)

    template_dict = {
        'form': form,
        'categories': categories
    }
    return main_render(request, 'search.html', template_dict)


def contact(request):
    if request.method == 'POST':
        first_name = request.POST['first_name']
        email = request.POST['email']
        phone_number = request.POST['phone_number']
        message = request.POST['message']
        template_email = get_template('generic_email.html')
        body=" Name:"+ first_name+" \n </br> E-mail: " + email + "\n Phone: " + phone_number + "\n Message: \n" + message
        msg_html = template_email.render({
            'title': 'Contact form',
            'contents': [
                body
            ]
        })
        msg = strip_tags(msg_html)
        text_content = msg
        html_content = msg_html
        send_mail(subject='Contact form', message=text_content, from_email=settings.EMAIL_HOST_USER,
                      recipient_list=[settings.EMAIL_HOST_USER], fail_silently=False, html_message=html_content)
    return main_render(request, 'contact-us.html')

@app_login_required
def profile(request):
    user_type = request.user.get_user_type
    user= HDSAuthUser.objects.get(pk=request.user.pk)
    current_user = Customer.objects.get(user=user)
    user_form=HDSUserForm(instance=user)
    customer_address_form = CustomerAddressForm(data={'customer': current_user.pk})

    if user_type == "customer":
        if request.method == "GET":
            # customer_form = CustomerForm(instance=current_user)
            customer_form = CustomerProfileForm(instance=current_user)
            template_dict = {
                "customer_form": customer_form,
                "customer_address_form": customer_address_form,
                "user_form": user_form,
                "user_addresses": {'address':current_user.address, 'address_2': current_user.address_2}
            }
            return main_render(request, 'profile.html', template_dict)
        else:
            if request.method == "POST":
                data = request.POST.copy()
                data.update({'user': current_user.user.pk,
                             'email_contact': current_user.user.email})

                customer_form = CustomerProfileForm(data=data, instance=current_user)
                if customer_form.is_valid():
                    '''if len(customer_form.cleaned_data['shipping_country']) > 0:
                        print("shipping_address")
                        try:
                            customer_address = CustomerAddress.objects.get(customer=current_user.pk)
                        except:
                            customer_address = CustomerAddress(customer=current_user)
                        customer_address.address = customer_form.cleaned_data['shipping_address']
                        customer_address.country = customer_form.cleaned_data['shipping_country']
                        customer_address.state = customer_form.cleaned_data['shipping_state']
                        customer_address.zip_code = customer_form.cleaned_data['shipping_zip_code']
                        customer_address.city = customer_form.cleaned_data['shipping_city']
                        customer_address.preferred_shipping_addr = True
                        customer_address.save()'''

                    #current_user.address = data['address']
                    #current_user.address_2 = data['address_2']
                    current_user.save()
                    user.first_name = data['first_name']
                    user.last_name = data['last_name']
                    user.save()
                    customer_form.confirm_phone_number = data['phone_number']
                    customer_form.save()
                    hubspot = Hubspot()
                    logger.info(user.email,
                                           customer_form.cleaned_data['first_name'],
                                           customer_form.cleaned_data['last_name'],
                                           customer_form.cleaned_data['terms_and_privacy_policy'])
                    hubspot.update_contact(user.email,
                                           customer_form.cleaned_data['first_name'],
                                           customer_form.cleaned_data['last_name'],
                                           customer_form.cleaned_data['terms_and_privacy_policy'])

                    auth_login(request, user)
                    response = HttpResponseRedirect("/profile/")
                    return response
                else:
                    template_dict = {
                        "customer_form": customer_form,
                        "customer_address_form": customer_address_form,
                        "user_form": user_form,
                        "user_addresses": {'address': current_user.address, 'address_2': current_user.address_2}
                    }
                    return main_render(request, 'profile.html', template_dict)