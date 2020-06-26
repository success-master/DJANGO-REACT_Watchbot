from django.core.management.base import BaseCommand, CommandError
from reference.models import Reference
import os


UPLOADS_DIR = 'uploads/'


class Command(BaseCommand):
    help = 'Reset images dir path'
    mod_count = 0
    uploads = UPLOADS_DIR
    directory = None

    def add_arguments(self, parser):

        parser.add_argument('directory',
                            default=UPLOADS_DIR,
                            nargs='?',
                            type=str,
                            help='load image data from specified directory (default: %(default)s)')

    def handle(self, *args, **options):
        # print(options)
        self.directory =  options['directory']
        if not self.directory.endswith(os.path.sep):
            self.directory = self.directory + os.path.sep

        self.mod_count = 0

        for ref in Reference.objects.all():
            print(ref.reference, ref.picture_url)
            if not ref.picture_url.name.startswith(self.directory):
                picture_url = self.new_picture_url(ref.picture_url.name)
                print(ref.reference, ref.picture_url, picture_url)
                ref.picture_url.name = picture_url
                ref.save()
                self.mod_count += 1

        self.stdout.write('Modificate ' + str(self.mod_count) + ' reference.', ending='\n')

    def new_picture_url(self, picture_url):
        return self.directory + os.path.basename(picture_url)
