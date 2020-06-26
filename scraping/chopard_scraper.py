__all__ = ['ChopardWatchFinderScraper']

from . scraper import WatchFinderScraper
import xlrd


class ChopardWatchFinderScraper(WatchFinderScraper):

    def clean_reference(self, reference):
        return reference.split()[0]

    def clean_price(self, price):
        try:
            price = price.split()[-1]
            price = float(price.replace(',', ''))
            price = int(round(price))
            price = int(price)
        except:
            price = 0
        finally:
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
        for x in range(9, total_rows):
            reference = sheet.cell(x, 0).value
            if not reference:
                print("SKIPPING REFERENCE '{}' [EMPTY]".format(reference))
                continue
            else:
                reference = self.clean_reference(reference)

            price = sheet.cell(x, 4).value

            if not price:
                # print("SKIPPING REFERENCE '{}' PRICE '{}' [EMPTY PRICE]".format(reference, price))
                # continue
                price = ''
            else:
                price = self.clean_price(price)

            if isinstance(price, int):
                ret.append(dict(Reference=reference, Price=price))
        return ret
