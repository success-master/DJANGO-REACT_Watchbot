from django.core.management.base import BaseCommand, CommandError
from reference.models import Reference
from math import floor, ceil

SCALE_FACTOR = 1/1.22

class Command(BaseCommand):
    help = 'Scale Reference Prices by a factor'
    mod_count = 0
    factor = SCALE_FACTOR
    dry_run = False
    to_int = round
    use_floor = False
    use_ceil = False


    def add_arguments(self, parser):

        parser.add_argument('factor',
                            default=SCALE_FACTOR,
                            nargs='?',
                            type=float,
                            help='Scale Factor (default: %(default)s)')
        parser.add_argument('-d','--dry-run',
                            action="store_true",
                            default=False,
                            help='Dry Run: Only Print New Prices (default: %(default)s)')
        parser.add_argument('-f','--floor',
                            action="store_true",
                            default=False,
                            help='Use Floor function instead of Round (default: %(default)s)')
        parser.add_argument('-c','--ceil',
                            action="store_true",
                            default=False,
                            help='Use Ceil function instead of Round (default: %(default)s)')

    def scale(self, price):
        return self.to_int(price * self.factor)

    def handle(self, *args, **options):
        # print(options)
        self.factor =  options['factor']
        self.dry_run =  options['dry_run']
        self.use_floor =  options['floor']
        self.use_ceil =  options['ceil']
        self.mod_count = 0

        if self.use_floor and self.use_ceil:
            raise CommandError("Invalid Invocation. See help.")
        if self.use_floor:
            self.to_int = floor
        if self.use_ceil:
            self.to_int = ceil

        for ref in Reference.objects.all():
            old_price = ref.price
            new_price = self.scale(old_price)
            print(ref.reference, old_price, new_price)
            if not self.dry_run:
                # if not in test mode ==> do it
                ref.price = new_price
                ref.save()
                self.mod_count += 1

        self.stdout.write('Modificate ' + str(self.mod_count) + ' reference.', ending='\n')
