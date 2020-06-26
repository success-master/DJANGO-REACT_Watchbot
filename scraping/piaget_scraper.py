__all__ = ['PiagetWatchFinderScraper']

from . scraper import WatchFinderScraper
import xlrd


class PiagetWatchFinderScraper(WatchFinderScraper):

    def clean_reference(self, reference):
        return reference.split()[0]

    def clean_price(self, price):
        price = int(price)
        return price

    def clean_image_url(self, image_url):
        return image_url.split(';')[0]

    def clean_gender(self, gender):
        gender_low = gender.lower()
        if gender_low.startswith('lad'):
            return 'Woman'
        if gender_low.startswith('man') or gender_low.startswith('men'):
            return 'Man'
        else:
            return gender

    def parse_input(self, source_file, pages):
        file_location = source_file
        workbook = xlrd.open_workbook(file_location)
        sheet = workbook.sheet_by_index(0)
        total_rows = sheet.nrows

        ret = []
        for x in range(3, total_rows):
            reference = sheet.cell(x, 0).value[2:] # skip 2 char
            if not reference:
                print("SKIPPING REFERENCE '{}' [EMPTY]".format(reference))
                continue
            else:
                reference = self.clean_reference(reference)

            try:
                price = self.clean_price(sheet.cell(x, 2).value)
            except ValueError as e:
                print(e)
                price = 0

            if isinstance(price, int):
                ret.append(dict(Reference=reference, Price=price))
        return ret
