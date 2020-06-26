from __future__ import division
from django.core.management.base import BaseCommand, CommandError
from hdsauth.models import HDSAuthUser
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = 'Visualizza/modifica tag versione'

    def handle(self, *args, **options):
        for user in HDSAuthUser.objects.all():
            Token.objects.get_or_create(user=user)
