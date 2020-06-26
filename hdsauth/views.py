# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, redirect, render
from .forms import *
from .models import *
from django.http import Http404, HttpResponseRedirect
from .decorators import *
from .utils import *
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from hdsauth.forms import HDSLoginForm
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import base36_to_int, is_safe_url, urlsafe_base64_decode, urlsafe_base64_encode
from django.shortcuts import resolve_url


def logout(request):
    auth_logout(request)
    redirect_url = "/"
    try:
        if "/admin/" in request.META['HTTP_REFERER']:
            redirect_url = "/admin/"
    except KeyError:
        pass
    return HttpResponseRedirect(redirect_url)


def login(request):
    login_form = HDSLoginForm(request)
    if request.method == "POST":
        login_form = HDSLoginForm(request, data=request.POST)
        if login_form.is_valid():
            auth_login(request, login_form.get_user())
            if request.session.test_cookie_worked():
                request.session.delete_test_cookie()
            next_url = request.GET.get("next", "/")
            return HttpResponseRedirect(next_url)
    return render(request, "login.html", {
        "authenticate": authenticate,
        "company": settings.COMPANY,
        "login_form": login_form})


def password_recovery(request):
    form = HDSPasswordReset()
    if request.method == "POST":
        form = HDSPasswordReset(data=request.POST)
        if form.is_valid():
            opts = {
                'use_https': request.is_secure(),
                'token_generator': default_token_generator,
                'from_email': settings.EMAIL_HOST_USER,
                'email_template_name': 'password_reset_email.html',
                'subject_template_name': 'password_reset_email_subject.txt',
                'request': request,
            }
            form.save(**opts)
            return redirect(reverse_lazy("password_recovery_completed"))
    return render(request, "password_recovery.html", {
        "authenticate": authenticate,
        "company": settings.COMPANY,
        "form": form})


def password_recovery_completed(request):
    return render(request, "password_recovery.html", {"completed": True, "company": settings.COMPANY,})


def password_reset_confirm(request, uidb64=None, token=None,
                           template_name="password_reset_confirm.html",
                           token_generator=default_token_generator,
                           set_password_form=HDSSetPasswordForm,
                           post_reset_redirect="/user/password_reset_completed/",
                           current_app=None, extra_context=None):
    """
    View that checks the hash in a password reset link and presents a
    form for entering a new password.
    """
    assert uidb64 is not None and token is not None  # checked by URLconf
    if post_reset_redirect is None:
        post_reset_redirect = reverse_lazy('password_reset_complete')
    else:
        post_reset_redirect = resolve_url(post_reset_redirect)
    try:
        uid = urlsafe_base64_decode(uidb64)
        user = HDSAuthUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, HDSAuthUser.DoesNotExist):
        user = None

    if user is not None and token_generator.check_token(user, token):
        validlink = True
        if request.method == 'POST':
            form = set_password_form(user, request.POST)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(post_reset_redirect)
        else:
            form = set_password_form(None)
    else:
        validlink = False
        form = None

    context = {
        'form': form,
        'validlink': validlink,
        "company": settings.COMPANY,
    }
    if extra_context is not None:
        context.update(extra_context)
    return render(request, template_name, context)


def password_reset_complete(request, template_name):
    return render(request, template_name, {"company": settings.COMPANY,})


@my_login_required
def password_change(request, template_name, post_change_redirect):
    return main_render(request, template_name, {"company": settings.COMPANY,})


@my_login_required
def password_change_done(request, template_name):
    return main_render(request, template_name, {"company": settings.COMPANY,})


@superuser_permission
def manage_admin(request):
    admin_queryset = HDSAuthUser.objects.filter(deleted=False, permission=2, is_superuser=False)
    return main_render(request, "admin_list.html", {
        "users_list": admin_queryset,
    }, 'manage_admin', 'user_management',  "Utenti", "Admin")


@superuser_permission
def add_admin(request):
    form = AdminForm()
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        password = request.POST.get("password1", None)
        form = AdminForm(data=request.POST)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.ip_address = get_client_ip(request)
            new_user.permission = 2
            new_user.is_active = True
            if password:
                new_user.set_password(password)
            new_user.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_admin", kwargs={"admin_id": new_user.pk}))
            return redirect(reverse_lazy("users:manage_admin"))
    return main_render(request, "admin_add.html", {
        "form": form,
    }, 'manage_admin', 'user_management', "Admin", "Aggiungi")


@superuser_permission
def edit_admin(request, admin_id):
    save = request.GET.get("save", 0)
    try:
        admin = HDSAuthUser.objects.get(pk=admin_id, permission=2)
    except HDSAuthUser.DoesNotExist:
        raise Http404
    form = AdminForm(instance=admin, edit=True)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        form = AdminForm(data=request.POST, instance=admin, edit=True)
        if form.is_valid():
            form.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_admin", kwargs={"admin_id": admin.pk})+"?save=1")
            return redirect(reverse_lazy("users:manage_admin"))
    return main_render(request, "admin_add.html", {
        "form": form,
        "save": save
    }, 'manage_admin', 'user_management', "Admin", "Modifica %s" % admin.get_full_name())


@admin_permission
def manage_back_office(request):
    admin_queryset = HDSAuthUser.objects.filter(deleted=False, permission=3, is_superuser=False)
    return main_render(request, "back_office_list.html", {
        "users_list": admin_queryset,
    }, 'manage_back_office', 'user_management',  "Utenti", "Back Office")


@admin_permission
def add_back_office(request):
    form = BackOfficeForm()
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        password = request.POST.get("password1", None)
        form = BackOfficeForm(data=request.POST)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.ip_address = get_client_ip(request)
            new_user.permission = 3
            new_user.is_active = True
            if password:
                new_user.set_password(password)
            new_user.save()
            form.save_m2m()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_back_office", kwargs={"back_office_id": new_user.pk}))
            return redirect(reverse_lazy("users:manage_back_office"))
    return main_render(request, "admin_add.html", {
        "form": form,
    }, 'manage_back_office', 'user_management', "Back Office", "Aggiungi")


@admin_permission
def edit_back_office(request, back_office_id):
    save = request.GET.get("save", 0)
    try:
        back_office = HDSAuthUser.objects.get(pk=back_office_id, permission=3)
    except HDSAuthUser.DoesNotExist:
        raise Http404
    form = BackOfficeForm(instance=back_office, edit=True)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        form = BackOfficeForm(data=request.POST, instance=back_office, edit=True)
        if form.is_valid():
            form.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_back_office",
                                             kwargs={"back_office_id": back_office.pk})+"?save=1")
            return redirect(reverse_lazy("users:manage_back_office"))
    return main_render(request, "admin_add.html", {
        "form": form,
        "save": save
    }, 'manage_back_office', 'user_management', "Back Office", "Modifica %s" % back_office.get_full_name())


@admin_permission
def manage_area_manager(request):
    admin_queryset = HDSAuthUser.objects.filter(deleted=False, permission=6, is_superuser=False)
    return main_render(request, "area_manager_list.html", {
        "users_list": admin_queryset,
    }, 'manage_area_manager', 'user_management',  "Utenti", "Area Manager")


@admin_permission
def add_area_manager(request):
    form = AreaManagerForm()
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        password = request.POST.get("password1", None)
        form = AreaManagerForm(data=request.POST)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.ip_address = get_client_ip(request)
            new_user.permission = 6
            new_user.is_active = True
            if password:
                new_user.set_password(password)
            new_user.save()
            form.save_m2m()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_area_manager", kwargs={"area_manager_id": new_user.pk}))
            return redirect(reverse_lazy("users:manage_area_manager"))
    return main_render(request, "admin_add.html", {
        "form": form,
    }, 'manage_area_manager', 'user_management', "Area Manager", "Aggiungi")


@admin_permission
def edit_area_manager(request, area_manager_id):
    save = request.GET.get("save", 0)
    try:
        area_manager = HDSAuthUser.objects.get(pk=area_manager_id, permission=6)
    except HDSAuthUser.DoesNotExist:
        raise Http404
    form = AreaManagerForm(instance=area_manager, edit=True)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        form = AreaManagerForm(data=request.POST, instance=area_manager, edit=True)
        if form.is_valid():
            form.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_area_manager",
                                             kwargs={"area_manager_id": area_manager.pk})+"?save=1")
            return redirect(reverse_lazy("users:manage_area_manager"))
    return main_render(request, "admin_add.html", {
        "form": form,
        "save": save
    }, 'manage_area_manager', 'user_management', "Area Manager", "Modifica %s" % area_manager.get_full_name())


@back_office_permission
def manage_agency(request):
    admin_queryset = HDSAuthUser.objects.filter(deleted=False, permission=4, is_superuser=False)
    if request.user.permission == 3 and request.user.restricted_back_office:
        admin_queryset = admin_queryset.filter(agency__in=request.user.restricted_back_office_agencies.all())
    return main_render(request, "agency_list.html", {
        "users_list": admin_queryset,
    }, 'manage_agency', 'user_management',  "Utenti", "Agenzie")


@back_office_permission
def add_agency(request):
    form = AgencyUserForm()
    agency_form = AgencyForm()
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        password = request.POST.get("password1", None)
        form = AgencyUserForm(data=request.POST)
        agency_form = AgencyForm(data=request.POST, files=request.FILES)
        if form.is_valid() and agency_form.is_valid():
            new_user = form.save(commit=False)
            new_agency = agency_form.save(commit=False)
            new_agency.save()
            new_user.ip_address = get_client_ip(request)
            new_user.permission = 4
            new_user.agency = new_agency
            new_user.first_name = "Agenzia %s" % new_agency.pk
            new_user.last_name = "Agenzia %s" % new_agency.pk
            new_user.is_active = True
            if password:
                new_user.set_password(password)
            new_user.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_agency", kwargs={"agency_id": new_user.pk}))
            return redirect(reverse_lazy("users:manage_agency"))
    return main_render(request, "agency_add.html", {
        "form": form,
        "agency_form": agency_form,
    }, 'manage_agency', 'user_management', "Agenzia", "Aggiungi")


@back_office_permission
def edit_agency(request, agency_id):
    save = request.GET.get("save", 0)
    try:
        agency = HDSAuthUser.objects.get(pk=agency_id, permission=4)
    except HDSAuthUser.DoesNotExist:
        raise Http404
    form = AgencyUserForm(instance=agency, edit=True)
    agency_form = AgencyForm(instance=agency.agency, edit=True)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        form = AgencyUserForm(data=request.POST, instance=agency, edit=True)
        agency_form = AgencyForm(data=request.POST, files=request.FILES, instance=agency.agency, edit=True)
        if form.is_valid() and agency_form.is_valid():
            form.save()
            agency_form.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_agency", kwargs={"agency_id": agency.pk})+"?save=1")
            return redirect(reverse_lazy("users:manage_agency"))
    return main_render(request, "agency_add.html", {
        "form": form,
        "agency_form": agency_form,
        "save": save
    }, 'manage_agency', 'user_management', "Agenzia", "Modifica %s" % agency.get_full_name())


@agency_permission
def manage_agent(request):
    admin_queryset = HDSAuthUser.objects.filter(deleted=False, permission=5, is_superuser=False)
    if request.user.is_agency:
        admin_queryset = admin_queryset.filter(agency=request.user.agency)
    if request.user.permission == 3 and request.user.restricted_back_office:
        admin_queryset = admin_queryset.filter(agency__in=request.user.restricted_back_office_agencies.all())
    return main_render(request, "agent_list.html", {
        "users_list": admin_queryset,
    }, 'manage_agent', 'user_management',  "Utenti", "Agenti")


@agency_permission
def add_agent(request):
    form = AgentForm(is_agency=request.user.is_agency)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        password = request.POST.get("password1", None)
        form = AgentForm(data=request.POST, is_agency=request.user.is_agency)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.ip_address = get_client_ip(request)
            new_user.permission = 5
            new_user.is_active = True
            if request.user.is_agency:
                new_user.agency = request.user.agency
            if password:
                new_user.set_password(password)
            new_user.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_agent", kwargs={"agent_id": new_user.pk}))
            return redirect(reverse_lazy("users:manage_agent"))
    return main_render(request, "admin_add.html", {
        "form": form,
    }, 'manage_agent', 'user_management', "Agente", "Aggiungi")


@agency_permission
def edit_agent(request, agent_id):
    save = request.GET.get("save", 0)
    try:
        agent = HDSAuthUser.objects.get(pk=agent_id, permission=5)
        if request.user.is_agency and agent.agency != request.user.agency:
            raise Http404
    except HDSAuthUser.DoesNotExist:
        raise Http404
    form = AgentForm(instance=agent, edit=True, is_agency=request.user.is_agency)
    if request.method == "POST":
        submit_button = request.POST.get("submit_button", None)
        form = AgentForm(data=request.POST, instance=agent, edit=True, is_agency=request.user.is_agency)
        if form.is_valid():
            form.save()
            if submit_button and submit_button == "2":
                return redirect(reverse_lazy("users:edit_agent", kwargs={"agent_id": agent.pk})+"?save=1")
            return redirect(reverse_lazy("users:manage_agent"))
    return main_render(request, "admin_add.html", {
        "form": form,
        "save": save
    }, 'manage_agent', 'user_management', "Agente", "Modifica %s" % agent.get_full_name())


@agency_permission
def manage_all(request):
    user_queryset = HDSAuthUser.objects.filter(deleted=False, permission__gt=1, is_superuser=False)
    if request.user.permission == 2:
        user_queryset = user_queryset.filter(permission__gt=2)
    elif request.user.permission == 3:
        user_queryset = user_queryset.filter(permission__gt=3)
    elif request.user.is_agency:
        user_queryset = user_queryset.filter(permission=5, agency=request.user.agency)
    if request.user.permission == 3 and request.user.restricted_back_office:
        user_queryset = user_queryset.filter(agency__in=request.user.restricted_back_office_agencies.all())
    return main_render(request, "users_list.html", {
        "users_list": user_queryset,
    }, 'manage_all', 'user_management',  "Utenti", "Tutti")


@my_login_required
def profile_edit(request):
    dict = {}
    if request.user.is_agency:
        agency_form = AgencyProfileForm(instance=request.user.agency, edit=True)
        dict['form'] = agency_form
    else:
        form = HDSAuthUserEditForm(instance=request.user)
        dict['form'] = form
    if request.method == "POST":
        if request.user.is_agency:
            form = AgencyProfileForm(data=request.POST, instance=request.user.agency, files=request.FILES)
        else:
            form = HDSAuthUserEditForm(data=request.POST, instance=request.user, files=request.FILES)
        if form.is_valid():
            form.save()
            return redirect(reverse_lazy("users:profile_edit"))
    return main_render(request, "profile_edit.html", dict, 'profile_edit', '', "Profilo", "Modifica")