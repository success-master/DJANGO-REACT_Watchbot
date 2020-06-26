from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand, CommandError
from sys import stdin
from argparse import FileType
from reference.models import Model, Brand, Movement, CaseMaterial, Reference, GENDER_CHOICE
from django.template.defaultfilters import slugify
import csv


UPLOADS_DIR = 'uploads/'


class Command(BaseCommand):
    """
    Formato File CSV Per Import Delle Reference Orologi

0  - nome file imagine (default codice reference orologio con prefisso codice marca) .estenzione (jpg/png/svg...ecc): es (CRW5200004.jpg)
1  - Brand (es. Cartier)
2  - Model (es. Tank Solo)
3  - Reference, codice reference orologio (es. W5200004)
4  - Movement (es. Quartz/Automatic/Manual)
5  - Case Material (es. Steel/Titanium/Gold)
6  - Case Size (es. 27 x 37 mm)
7  - Dial Color (es. Black/White/Blue)
8  - Bracelet Material (es. Transparent/Alligator)
9 - Gender (es. man/woman/unisex)
10 - Price (es. 6750)
11 - Reference Extension, estensione al codice reference orologio (Stringa Opzioanle Max 25 Char)

    """
    help = 'Import reference from csv'
    add_count = 0
    mod_count = 0
    uploads = UPLOADS_DIR
    overwrite = False


    def add_arguments(self, parser):
        parser.add_argument('input',
                            nargs='?',
                            type=FileType('r'),
                            default=stdin)
        parser.add_argument('-o','--overwrite',
                            action="store_true",
                            default=False,
                            help='overwrite data (default: %(default)s)')
        parser.add_argument('-u','--uploads',
                            default=UPLOADS_DIR,
                            nargs='?',
                            type=str,
                            help='load image data from specified directory (default: %(default)s)')

    def handle(self, *args, **options):
        # print(options)
        if options['input'] is None:
            raise CommandError("Invalid Invocation. See help.")
        self.overwrite = options['overwrite']
        self.uploads = options['uploads']

        try:
            # reader = csv.reader(options['input'], delimiter=';')
            reader = csv.reader(options['input'])
        except Exception as e:
            raise CommandError(e)
        self.add_count = 0
        self.mod_count = 0

        next(reader)  # FIXME: skip header?!!

        for row in reader:
            row = self._strip_row_data(row)
            try:
                reference_ext = row[11]
                # print('REF_EXT "{}" FOUND IN {}'.format(reference_ext, row))
                if not reference_ext:
                    reference_ext = None
            except IndexError as e:
                # print('REF_EXT NOT FOUND IN ', row)
                reference_ext = None
            reference_base = row[3]
            reference = Reference.objects.filter(reference_base=reference_base,
                                                 reference_ext=reference_ext).first()
            if reference is not None:
                if self.overwrite:
                    self._overwrite_data(row, reference_ext)
                else:
                    self.stdout.write('Reference ' + str(row[3]) + ' is already present.', ending='\n')
                    # skip already inserted data
                    continue
            else:
                self._add_data(row, reference_ext)
        self.stdout.write('Inserite ' + str(self.add_count) + ' reference.', ending='\n')
        self.stdout.write('Modificate ' + str(self.mod_count) + ' reference.', ending='\n')

    def _strip_row_data(self, row):
        ret = []
        for data in row:
            ret.append(data.strip())
        return ret

    def _clean_picture_url(self, picture_url):
        return picture_url.replace('/',' ')

    def _add_subreference(self, model, name):
        slug = slugify(name)
        try:
            obj = model.objects.get(slug=slug)
        except ObjectDoesNotExist:
            obj = model.objects.create(name=name)
        return obj

    def _add_subreference_model(self, brand, name):
        slug = slugify(name)
        try:
            obj = Model.objects.get(slug=slug)
        except ObjectDoesNotExist:
            obj = Model.objects.create(name=name, brand=brand)
        return obj

    def _add_data(self, row, reference_ext):
        brand = self._add_subreference(Brand, row[1])
        movement = self._add_subreference(Movement, row[4])
        case_material = self._add_subreference(CaseMaterial, row[5])
        model = self._add_subreference_model(brand, row[2])
        picture_url = self.uploads + self._clean_picture_url(row[0])

        data = {
            'model': model,
            'brand': brand,
            'movement': movement,
            'case_material': case_material,
        }

        reference = Reference(
            model=(data['model']),
            brand=(data['brand']),
            case_material=(data['case_material']),
            reference_base=row[3],
            picture_url=picture_url,
            case_size=row[6],
            bracelet_material=row[8],
            price=row[10],
            gender=(row[9] if row[9] in dict(GENDER_CHOICE) else 'unisex'),
        )
        if reference_ext:
            reference.reference_ext = reference_ext
        reference.save()
        reference.movement.add(data['movement'])
        # print('SAVING REFERENCE', reference, reference_ext)
        reference.save()
        self.add_count += 1

    def _overwrite_data(self, row, reference_ext):
        reference_base = row[3]
        if reference_ext:
            Reference.objects.filter(reference_base=reference_base,
                                     reference_ext=reference_ext).all().delete()
        else:
            Reference.objects.filter(reference_base=reference_base).all().delete()

        self.stdout.write('Overwrite Data {}[{}]'.format(reference_base, reference_ext), ending='\n')

        self._add_data(row, reference_ext)
        self.mod_count += 1
