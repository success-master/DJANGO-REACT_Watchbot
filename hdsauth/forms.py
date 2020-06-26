from .models import *
from django import forms
from django.contrib.auth import authenticate
from django.core.validators import validate_email as email_re
from django.contrib.auth.forms import PasswordResetForm
from django.core.exceptions import ValidationError
from django.utils.encoding import force_text
from hdsauth.gestpay import Gestpay
import re
from pprint import pprint


class MyEmailValidator(object):
    message = "Insert a valid e-mail address"
    code = 'invalid'
    user_regex = re.compile(
        r"(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$"  # dot-atom
        r'|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*"$)', # quoted-string
        re.IGNORECASE)
    domain_regex = re.compile(
        r'(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}|[A-Z0-9-]{2,})\.?$'  # domain
        # literal form, ipv4 address (SMTP 4.1.3)
        r'|^\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$',
        re.IGNORECASE)
    domain_whitelist = ['localhost']

    def __init__(self, message=None, code=None, whitelist=None):
        if message is not None:
            self.message = message
        if code is not None:
            self.code = code
        if whitelist is not None:
            self.domain_whitelist = whitelist

    def __call__(self, value):
        value = force_text(value)

        if not value or '@' not in value:
            raise ValidationError(self.message, code=self.code)

        user_part, domain_part = value.rsplit('@', 1)

        if not self.user_regex.match(user_part):
            raise ValidationError(self.message, code=self.code)

        if (not domain_part in self.domain_whitelist and
                not self.domain_regex.match(domain_part)):
            # Try for possible IDN domain-part
            try:
                domain_part = domain_part.encode('idna').decode('ascii')
                if not self.domain_regex.match(domain_part):
                    raise ValidationError(self.message, code=self.code)
                else:
                    return
            except UnicodeError:
                pass
            raise ValidationError(self.message, code=self.code)


validate_email = MyEmailValidator()


class HDSLoginForm(forms.Form):
    email = forms.EmailField(label="E-mail", max_length=75)
    password = forms.CharField(label="Password", widget=forms.PasswordInput)

    error_messages = {
        'invalid_login': "E-mail o password errati.",
        'no_cookies': "Your Web browser doesn't appear to have cookies "
                        "enabled. Cookies are required for logging in.",
        'inactive': "Account non attivo.",
    }

    def __init__(self, request=None, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        self.request = request
        self.user_cache = None
        super(HDSLoginForm, self).__init__(*args, **kwargs)
        self.fields['email'].widget.attrs.update({'class': 'form-control'})
        self.fields['password'].widget.attrs.update({'class': 'form-control'})

    def get_form_kwargs(self):
        kwargs = super(HDSLoginForm, self).get_form_kwargs()
        kwargs.update({
            'request': self.request
        })
        return kwargs

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        if email and password:
            try:
                user = HDSAuthUser.objects.get(email=email)
            except HDSAuthUser.DoesNotExist:
                raise forms.ValidationError(self.error_messages['invalid_login'])
            self.user_cache = authenticate(username=email, password=password)
            self.request.session.set_test_cookie()
            if self.user_cache is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'])
            elif not self.user_cache.is_active:
                raise forms.ValidationError(self.error_messages['inactive'])
        self.check_for_test_cookie()
        return self.cleaned_data

    def check_for_test_cookie(self):
        if self.request and not self.request.session.test_cookie_worked():
            raise forms.ValidationError(self.error_messages['no_cookies'])

    def get_user_id(self):
        if self.user_cache:
            return self.user_cache.id
        return None

    def get_user(self):
        return self.user_cache

    class Meta:
        model = HDSAuthUser
        fields = ['email', 'password']


class HDSPasswordReset(PasswordResetForm):
    error_messages = {
        'invalid_login': "Please enter a correct e-mail and password. "
                           u"Note that both fields are case-sensitive.",
        'no_cookies': "Your Web browser doesn't appear to have cookies "
                        u"enabled. Cookies are required for logging in.",
        'inactive': "Questo account è inattivo, contatta l'assistenza.",
        'unknown': "Non esiste nessun utente con questa email",
        'unusable': "Unusable",
    }

    def __init__(self, *args, **kwargs):
        super(HDSPasswordReset, self).__init__(*args, **kwargs)
        self.fields['email'].widget.attrs.update({'class': 'form-control'})

    def clean_email(self):
        """
        Validates that an active user exists with the given email address.
        """
        email = self.cleaned_data["email"]
        self.users_cache = HDSAuthUser.objects.filter(email__iexact=email, is_active=True)
        if not len(self.users_cache):
            raise forms.ValidationError(self.error_messages['unknown'])
        if any((user.password == '!') for user in self.users_cache):
            raise forms.ValidationError(self.error_messages['unusable'])
        return email


class HDSAuthUserEditForm(forms.ModelForm):
    class Meta:
        model = HDSAuthUser
        fields = ["first_name",
                  "last_name",
                  ]


class HDSSetPasswordForm(forms.Form):
    """
       A form that lets a user change set their password without entering the old
       password
       """
    error_messages = {
        'password_mismatch': "Le due password non coincidono.",
    }
    new_password1 = forms.CharField(label="New password",
                                    widget=forms.PasswordInput)
    new_password2 = forms.CharField(label="Confirm new password",
                                    widget=forms.PasswordInput)

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(HDSSetPasswordForm, self).__init__(*args, **kwargs)
        self.fields['new_password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['new_password2'].widget.attrs.update({'class': 'form-control'})

    def clean_new_password2(self):
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        if password1 and password2:
            if password1 != password2:
                raise forms.ValidationError(
                    self.error_messages['password_mismatch'],
                    code='password_mismatch',
                )
        return password2

    def save(self, commit=True):
        self.user.set_password(self.cleaned_data['new_password1'])
        if commit:
            self.user.save()
        return self.user


class HDSSignUpForm(forms.ModelForm):
    error_messages = {
        'duplicate_email': "Email address already exists.",
        'password_mismatch': "Password mismatch.",
        'password_len':  "Password should have at least 8 characters.",
        'not_email': "Please, insert a valid email address",
    }
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Confirm Password", widget=forms.PasswordInput,
        help_text="Confirm Password"
    )
    check1 = forms.BooleanField(widget=forms.CheckboxInput)
    check2 = forms.BooleanField(widget=forms.CheckboxInput)

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(HDSSignUpForm, self).__init__(*args, **kwargs)
        for myField in self.fields:
            self.fields[myField].widget.attrs['class'] = 'form-control'
            if myField in ['agreement', 'check1', 'check2']:
                self.fields[myField].widget.attrs = {'class': 'custom-checkbox required'}

    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            HDSAuthUser.objects.get(email__iexact=email)
        except HDSAuthUser.DoesNotExist:
            validate_email(email)
            return email
        raise forms.ValidationError(self.error_messages['duplicate_email'])

    def clean_password1(self):
        password1 = self.cleaned_data.get("password1", "")
        if len(password1) < 8:
            raise forms.ValidationError(self.error_messages['password_len'])
        return password1

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1", "")
        password2 = self.cleaned_data["password2"]
        if password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'])
        return password2

    def save(self, commit=True):
        user = super(HDSSignUpForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

    class Meta:
        model = HDSAuthUser
        fields = ['email', 'password1', 'password2']
        labels = {'confirm_password': u'Confirm password', }


class HDSUserForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(HDSUserForm, self).__init__(*args, **kwargs)
        for myField in self.fields:
            self.fields[myField].widget.attrs['class'] = 'input form-control'

    class Meta:
        model = HDSAuthUser
        fields = ['first_name', 'last_name', 'email']


class CustomerForm(forms.ModelForm):
    first_name = forms.CharField(widget=forms.TextInput)
    last_name = forms.CharField(widget=forms.TextInput)
    confirm_phone_number = forms.CharField(widget=forms.TextInput)
    prefix_phone_number = forms.CharField(widget=forms.TextInput)
    prefix_confirm_phone_number = forms.CharField(widget=forms.TextInput)
    shipping_country = forms.CharField(required=False, widget=forms.TextInput)
    shipping_address = forms.CharField(required=False, widget=forms.TextInput)
    shipping_zip_code = forms.CharField(required=False, widget=forms.TextInput)
    shipping_city = forms.CharField(required=False, widget=forms.TextInput)
    shipping_state = forms.CharField(required=False, widget=forms.TextInput)
    card_number = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '---- ---- ---- ----'}), required=False, max_length=19)
    card_cvc = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '---'}), required=False, max_length=3)
    card_expiration = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '-- / --'}), required=False, max_length=7)
    card_expiration_month = forms.CharField(required=False, widget=forms.HiddenInput)
    card_expiration_year = forms.CharField(required=False, widget=forms.HiddenInput)
    terms_and_privacy_policy = forms.BooleanField(widget=forms.CheckboxInput)
    trading_rules = forms.BooleanField(widget=forms.CheckboxInput)
    # terms_and_conditions = forms.BooleanField(widget=forms.CheckboxInput)

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(CustomerForm, self).__init__(*args, **kwargs)
        for myField in self.fields:
            self.fields[myField].widget.attrs['class'] = 'input form-control'
            if myField in [
                'phone_number',
                'document_type',
                'document_number',
                'document_issuer',
                'document_expiry_date',
            ]:
                self.fields[myField].widget.attrs['required'] = True
            if myField == 'birth_date' or myField == 'document_expiry_date':
                self.fields[myField].widget.attrs['class'] = 'datepicker input form-control'
            if myField in [
                'country',
                'address',
                'zip_code',
                'city',
                'state',
                'shipping_country',
                'shipping_address',
                'shipping_zip_code',
                'shipping_city',
                'shipping_state',
                'card_expiration_month',
                'card_expiration_year',
            ]:
                self.fields[myField].widget = forms.HiddenInput()
                self.fields[myField].widget.attrs['class'] = ''
            if myField in ['terms_and_privacy_policy', 'trading_rules']:
                self.fields[myField].widget.attrs = {'class': 'custom-checkbox input'}

    def clean_card_number(self):
        card_number = self.cleaned_data.get("card_number", "")
        return card_number.replace(' ', '')

    def clean_card_expiration_year(self):
        card_expiration_year = self.cleaned_data.get("card_expiration_year", "")

        if len(card_expiration_year) > 0:
            try:
                card_expiration_year = int(card_expiration_year)
                card_expiration_year = card_expiration_year % 100
                return card_expiration_year
            except Exception as e:
                raise forms.ValidationError('The field is invalid')
        return card_expiration_year

    def clean_card_expiration_month(self):
        card_expiration_month = self.cleaned_data.get("card_expiration_month", "")

        if len(card_expiration_month) > 0 and len(card_expiration_month) == 1:
            try:
                card_expiration_month = '0' + card_expiration_month
                return card_expiration_month
            except Exception as e:
                raise forms.ValidationError('The field is invalid')
        return card_expiration_month

    def clean_card_cvv(self):
        card_cvc = self.cleaned_data.get("card_cvv", "")
        card_number = self.cleaned_data.get("card_number", "")
        if len(card_number) > 0 and len(card_cvc) < 1:
            raise forms.ValidationError('The field is required!')
        return card_cvc

    def clean_card_expiration(self):
        card_expiration = self.cleaned_data.get("card_expiration", "")
        card_number = self.cleaned_data.get("card_number", "")
        if len(card_number) > 0 and len(card_expiration) < 1:
            raise forms.ValidationError('The field is required!')
        return card_expiration

    def clean(self):
        super().clean()
        card_number = self.cleaned_data.get("card_number", "")
        if len(card_number) > 0:
            card_expiration_month = self.cleaned_data.get("card_expiration_month", "")
            card_expiration_year = self.cleaned_data.get("card_expiration_year", "")
            card_cvc = self.cleaned_data.get("card_cvc", "")
            gest_pay = Gestpay()
            response = gest_pay.check_card(card_number, card_expiration_month, card_expiration_year, card_cvc)
            if response.find('TransactionResult').text == 'KO':
                raise forms.ValidationError(response.find('TransactionErrorDescription').text)
            if response.find('AuthorizationResult').text == 'KO' or response.find('AuthorizationResult').text == 'NULL':
                raise forms.ValidationError(response.find('AuthorizationCodeDescription').text)
        shipping_country = self.cleaned_data.get("shipping_country", "")
        country = self.cleaned_data.get("country")

        if len(shipping_country) > 0 and shipping_country != country:
            raise forms.ValidationError(
                "Address and shipping address must have the same country"
            )
        phone_number = self.cleaned_data.get("phone_number")
        prefix_phone_number = self.cleaned_data.get("prefix_phone_number")
        confirm_phone_number = self.cleaned_data.get("confirm_phone_number")
        prefix_confirm_phone_number = self.cleaned_data.get("prefix_confirm_phone_number")

        if prefix_phone_number + phone_number != prefix_confirm_phone_number + confirm_phone_number:
            raise forms.ValidationError(
                "Mobile number and Confirm mobile number does not match"
            )
        else:
            self.cleaned_data['phone_number'] = '+' + prefix_phone_number + phone_number

        if self.cleaned_data.get("birth_date") > datetime.datetime.date(datetime.datetime.now()):
            raise forms.ValidationError('Birth date is not valid.')
        return self.cleaned_data

    class Meta:
        model = Customer
        exclude = [
            'tax_id',
             # 'user',
            # 'email_contact'
        ]


class CustomerProfileForm(forms.ModelForm):
    first_name = forms.CharField(widget=forms.TextInput)
    last_name = forms.CharField(widget=forms.TextInput)
    confirm_phone_number = forms.CharField(required=False, widget=forms.TextInput)
    prefix_phone_number = forms.CharField(widget=forms.TextInput)
    #shipping_country = forms.CharField(required=False, widget=forms.TextInput)
    #shipping_address = forms.CharField(required=False, widget=forms.TextInput)
    #shipping_zip_code = forms.CharField(required=False, widget=forms.TextInput)
    #shipping_city = forms.CharField(required=False, widget=forms.TextInput)
    #shipping_state = forms.CharField(required=False, widget=forms.TextInput)
    # card_number = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '---- ---- ---- ----'}), required=False, max_length=19)
    # card_cvc = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '---'}), required=False, max_length=3)
    # card_expiration = forms.CharField(widget=forms.TextInput(attrs={'placeholder': '-- / --'}), required=False, max_length=7)
    # card_expiration_month = forms.CharField(required=False, widget=forms.HiddenInput)
    # card_expiration_year = forms.CharField(required=False, widget=forms.HiddenInput)
    terms_and_privacy_policy = forms.BooleanField(required=False, widget=forms.CheckboxInput)

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(CustomerProfileForm, self).__init__(*args, **kwargs)
        for myField in self.fields:
            self.fields[myField].widget.attrs['class'] = 'input form-control'
            if myField in [
                'phone_number',
                'document_type',
                'document_number',
                'document_issuer',
                'document_expiry_date',
            ]:
                self.fields[myField].widget.attrs['required'] = True
            if myField == 'birth_date' or myField == 'document_expiry_date':
                self.fields[myField].widget.attrs['class'] = 'datepicker input form-control'
            if myField in [
                'country',
                'address',
                'zip_code',
                'city',
                'state',
                'shipping_country',
                'shipping_address',
                'shipping_zip_code',
                'shipping_city',
                'shipping_state',
                # 'card_expiration_month',
                # 'card_expiration_year',

            ]:
                self.fields[myField].widget = forms.HiddenInput()
                self.fields[myField].widget.attrs['class'] = ''

    def clean_card_number(self):
        card_number = self.cleaned_data.get("card_number", "")
        return card_number.replace(' ', '')

    def clean_card_expiration_year(self):
        card_expiration_year = self.cleaned_data.get("card_expiration_year", "")

        if len(card_expiration_year) > 0:
            try:
                card_expiration_year = int(card_expiration_year)
                card_expiration_year = card_expiration_year % 100
                return card_expiration_year
            except Exception as e:
                raise forms.ValidationError('The field is invalid')
        return card_expiration_year

    def clean_card_expiration_month(self):
        card_expiration_month = self.cleaned_data.get("card_expiration_month", "")

        if len(card_expiration_month) > 0 and len(card_expiration_month) == 1:
            try:
                card_expiration_month = '0' + card_expiration_month
                return card_expiration_month
            except Exception as e:
                raise forms.ValidationError('The field is invalid')
        return card_expiration_month

    def clean_card_cvv(self):
        card_cvc = self.cleaned_data.get("card_cvv", "")
        card_number = self.cleaned_data.get("card_number", "")
        if len(card_number) > 0 and len(card_cvc) < 1:
            raise forms.ValidationError('The field is required!')
        return card_cvc

    def clean_card_expiration(self):
        card_expiration = self.cleaned_data.get("card_expiration", "")
        card_number = self.cleaned_data.get("card_number", "")
        if len(card_number) > 0 and len(card_expiration) < 1:
            raise forms.ValidationError('The field is required!')
        return card_expiration

    def clean(self):
        super().clean()
        # card_number = self.cleaned_data.get("card_number", "")
        # if len(card_number) > 0:
        #     card_expiration_month = self.cleaned_data.get("card_expiration_month", "")
        #     card_expiration_year = self.cleaned_data.get("card_expiration_year", "")
        #     card_cvc = self.cleaned_data.get("card_cvc", "")
        #     gest_pay = Gestpay()
        #     response = gest_pay.check_card(card_number, card_expiration_month, card_expiration_year, card_cvc)
        #     if response.find('TransactionResult').text == 'KO':
        #         raise forms.ValidationError(response.find('TransactionErrorDescription').text)
        #     if response.find('AuthorizationResult').text == 'KO' or response.find('AuthorizationResult').text == 'NULL':
        #         raise forms.ValidationError(response.find('AuthorizationCodeDescription').text)
        '''
        shipping_country = self.cleaned_data.get("shipping_country", "")
        country = self.cleaned_data.get("country")

        if len(shipping_country) > 0 and shipping_country != country:
            raise forms.ValidationError(
                "Address and shipping address must have the same country"
            )
        phone_number = self.cleaned_data.get("phone_number")
        prefix_phone_number = self.cleaned_data.get("prefix_phone_number")
        confirm_phone_number = self.cleaned_data.get("confirm_phone_number")
        # prefix_confirm_phone_number = self.cleaned_data.get("prefix_confirm_phone_number")

        if confirm_phone_number != '':
            if phone_number != '+' + prefix_phone_number + confirm_phone_number:
                raise forms.ValidationError(
                    "Mobile number and Confirm mobile number does not match"
                )
            else:
                self.cleaned_data['phone_number'] = phone_number

        if self.cleaned_data.get("birth_date") > datetime.datetime.date(datetime.datetime.now()):
            raise forms.ValidationError('Birth date is not valid.')
        return self.cleaned_data
'''
    class Meta:
        model = Customer
        exclude = [
            'tax_id',
             # 'user',
            # 'email_contact'
        ]


class CustomerAddressForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(CustomerAddressForm, self).__init__(*args, **kwargs)
        for myField in self.fields:
            self.fields[myField].widget.attrs['class'] = 'input form-control'

    class Meta:
        model = CustomerAddress
        exclude = ['customer', 'type']
