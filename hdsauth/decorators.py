from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, redirect, render
from django.core.urlresolvers import reverse_lazy


def superuser_permission(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.superuser_permission:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('login')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    return decorated_function


def admin_permission(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.admin_permission:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('login')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    return decorated_function


def back_office_permission(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.back_office_permission:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('login')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    return decorated_function


def agency_permission(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.agency_permission:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('login')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    return decorated_function


def agent_permission(func):
    def decorated_function(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.agent_permission:
            return func(request, *args, **kwargs)
        next_url = reverse_lazy(request.resolver_match.view_name)
        redirect_url = reverse_lazy('login')
        try:
            return redirect("%s?next=%s" % (redirect_url, next_url))
        except Exception as e:
            try:
                return redirect("%s?next=%s" % (redirect_url, request.META['REQUEST_URI']))
            except Exception as e:
                return redirect(redirect_url)
    return decorated_function
