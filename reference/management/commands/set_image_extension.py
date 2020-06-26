from django.core.management.base import BaseCommand
from reference.models import Reference
from os.path import splitext

EXTENSION = '.png'

class Command(BaseCommand):
    help = 'Scale Reference Prices by a extension'
    mod_count = 0
    extension = EXTENSION
    dry_run = False


    def add_arguments(self, parser):

        parser.add_argument('extension',
                            default=EXTENSION,
                            nargs='?',
                            type=str,
                            help='Extension (default: %(default)s)')
        parser.add_argument('-d','--dry-run',
                            action="store_true",
                            default=False,
                            help='Dry Run: Only Print New Filename (default: %(default)s)')

    def change_extension(self, filename):
        name, _ = splitext(filename)
        return name + self.extension

    def handle(self, *args, **options):
        # print(options)
        self.extension =  options['extension']
        self.dry_run =  options['dry_run']
        self.mod_count = 0

        if not self.extension.startswith('.'):
            self.extension = '.' + self.extension

        for ref in Reference.objects.all():
            old_name = ref.picture_url.name

            new_name = self.change_extension(old_name)
            print(ref.reference, old_name, new_name)
            if not self.dry_run:
                # if not in test mode ==> do it
                ref.picture_url.name = new_name
                ref.save()
                self.mod_count += 1

        self.stdout.write('Modificate ' + str(self.mod_count) + ' reference.', ending='\n')
