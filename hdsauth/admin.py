# -*- coding: utf-8 -*-
from django.contrib.auth.admin import *
from django.contrib.admin import *
from django.contrib.auth.forms import *
from .models import *
from django.core.validators import validate_email as email_re
from django.utils.translation import ugettext_lazy as _
from django import forms
from django.conf import settings
from rest_framework.authtoken.admin import TokenAdmin


class ProfileChangeForm(forms.ModelForm):
    email = forms.RegexField(
        label=_("E-mail"), max_length=75, regex=r"^[\w.@+-]+$",
        help_text=_("Necessario. Inserire un indirizzo e-mail valido."),
        error_messages={
            'invalid': _("This value may contain only letters, numbers and "
                         "@/./+/-/_ characters.")})
    password = ReadOnlyPasswordHashField(label=_("Password"),
        help_text=_("Raw passwords are not stored, so there is no way to see "
                    "this user's password, but you can change the password "
                    "using <a href=\"../password/\">this form</a>."))

    def __init__(self, *args, **kwargs):
        super(ProfileChangeForm, self).__init__(*args, **kwargs)
        f = self.fields.get('user_permissions', None)
        if f is not None:
            f.queryset = f.queryset.select_related('content_type')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]

    class Meta:
        model = HDSAuthUser
        exclude = ()


class ProfileAddForm(forms.ModelForm):
    error_messages = {
        'duplicate_email': _("A user with that e-mail address already exists."),
        'password_mismatch': _("The two password fields didn't match."),
        'not_email': _("Il campo E-mail non è un indirizzo e-mail valido")
    }
    email = forms.RegexField(label=_("E-mail"), max_length=75,
        regex=r'^[\w.@+-]+$',
        help_text = _("Necessario. 75 caratteri o meno. Lettere, numeri e "
                      "@/./+/-/_ soltanto."),
        error_messages = {
            'invalid': _("This value may contain only letters, numbers and "
                         "@/./+/-/_ characters.")})
    password1 = forms.CharField(label=_("Password"),
        widget=forms.PasswordInput)
    password2 = forms.CharField(label=_("Password confirmation"),
        widget=forms.PasswordInput,
        help_text = _("Enter the same password as above, for verification."))

    class Meta:
        model = HDSAuthUser
        fields = ("email",)

    def clean_email(self):
        # Since User.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        email = self.cleaned_data["email"]
        try:
            HDSAuthUser.objects.get(email=email)
        except HDSAuthUser.DoesNotExist:
            email_re(email)
            return email
        raise forms.ValidationError(self.error_messages['duplicate_email'])

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1", "")
        password2 = self.cleaned_data["password2"]
        if password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'])
        return password2

    def save(self, commit=True):
        user = super(ProfileAddForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class HDSAuthAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': (
            ('first_name', 'last_name', 'avatar'),
        )
        }
        ),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'show_splash',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    fieldsets_staff_only = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': (
            ('first_name', 'last_name'),
        )
        }
        ),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'show_splash',
                                       'groups')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')}
         ),
    )
    list_display = ('email', 'first_name', 'last_name', 'avatar', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', )
    ordering = ('last_name',)
    form = ProfileChangeForm
    add_form = ProfileAddForm
    change_password_form = AdminPasswordChangeForm

    def get_queryset(self, request):
        qs = super(HDSAuthAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs
        else:
            return qs.filter(is_superuser=False)

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        else:
            if request.user.is_superuser:
                return self.fieldsets
            else:
                return self.fieldsets_staff_only
        #return super(UserAdmin, self).get_fieldsets(request, obj)


class CustomerAddressInline(TabularInline):
    model = CustomerAddress


class CustomerAdmin(ModelAdmin):
    inlines = [CustomerAddressInline]


class RetailerAdmin(ModelAdmin):
    filter_horizontal = ("brands",)

#admin.site.register(Token, TokenAdmin)
admin.site.register(HDSAuthUser, HDSAuthAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Retailer, RetailerAdmin)
admin.site.register(CustomerGame)
admin.site.register(FireBaseToken)
admin.site.register(GestpayToken)
admin.site.register(Transactions)
