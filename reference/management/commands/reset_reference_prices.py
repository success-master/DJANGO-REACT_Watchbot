from django.core.management.base import BaseCommand
from reference.models import Reference
from misc.csv_utils.csv_correction import prices_dict


class Command(BaseCommand):
    help = 'Reset images dir path'
    mod_count = 0
    prices = {}

    def add_arguments(self, parser):

        parser.add_argument('input',
                            type=str,
                            help='CSV file with updated prices')

    def handle(self, *args, **options):
        # print(options)
        input =  options['input']
        self.mod_count = 0
        self.prices = prices_dict(input)

        for ref in Reference.objects.all():
            print(ref.reference, ref.price)
            if ref.reference in self.prices:
                price = self.prices[ref.reference]
                print(ref.reference, ref.price, price)
                ref.price = price
                ref.save()
                self.mod_count += 1

        self.stdout.write('Modificate ' + str(self.mod_count) + ' reference.', ending='\n')
