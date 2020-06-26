from django.core.cache import cache
from django.shortcuts import Http404
from django.db.models.base import ModelBase
from django.db.models.manager import Manager
from django.db.models.query import QuerySet


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class CacheMiddleware(dict):

    class NotInCacheError(Exception):
        pass

    class NullKeyError(Exception):
        pass

    def __getitem__(self, key):
        if not key:
            raise self.NullKeyError()

        cached = cache.get(key)
        if cached is None:
            raise KeyError

        return cached

    def _get_queryset(self, klass):
        """
        Returns a QuerySet from a Model, Manager, or QuerySet. Created to make
        get_object_or_404 and get_list_or_404 more DRY.
        Raises a ValueError if klass is not a Model, Manager, or QuerySet.
        """
        if isinstance(klass, QuerySet):
            return klass
        elif isinstance(klass, Manager):
            manager = klass
        elif isinstance(klass, ModelBase):
            manager = klass._default_manager
        else:
            if isinstance(klass, type):
                klass__name = klass.__name__
            else:
                klass__name = klass.__class__.__name__
            raise ValueError(
                "Object is of type '%s', but must be a Django Model, "
                "Manager, or QuerySet" % klass__name
            )
        return manager.all()

    def cache_or_get_or_404(self, cache_key, model, *args, **params):
        try:
            return self[cache_key]
        except KeyError:
            queryset = self._get_queryset(model)
            try:
                to_cache = queryset.get(*args, **params)
            except queryset.model.DoesNotExist:
                raise Http404
            cache.set(cache_key, to_cache, None)
            return to_cache

    def cache_or_get(self, cache_key, model, *args, **params):
        try:
            return self[cache_key]
        except KeyError:
            to_cache = model.objects.get(*args, **params)
            cache.set(cache_key, to_cache, None)
            return to_cache

    def get_or_set(self, cache_key, to_set, *args, **params):
        try:
            return self[cache_key]
        except KeyError:
            to_cache = to_set
            cache.set(cache_key, to_cache, None)
            return to_cache

    def get(self, cache_key, default=None, timeout=None):
        try:
            return self[cache_key]
        except KeyError:
            cache.set(cache_key, default, timeout)
            return default

    def simple_get(self, cache_key, default=None):
        try:
            return self[cache_key]
        except KeyError:
            return None

    def remove(self, cache_key):
        cache.delete(cache_key)

    def set(self, cache_key, default):
        cache.set(cache_key, default, None)
        return default

    def simple_set(self, cache_key, value, timeout):
        cache.set(cache_key, value, timeout)
        return value

    def is_in_cache(self, cache_key):
        try:
            return self[cache_key]
        except KeyError:
            return None
