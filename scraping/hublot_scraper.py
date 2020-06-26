__all__ = ['HublotWatchFinderScraper']

from . scraper import WatchFinderScraper
import camelot


class HublotWatchFinderScraper(WatchFinderScraper):

    def clean_reference(self, reference):
        return reference.split()[0]

    def clean_price(self, price):
        price = price.rstrip("\n\r")
        price = price.split()[-1]
        price = price.replace('.', '')
        price = price[:price.find(',')]
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
        tables = camelot.read_pdf(source_file, pages=pages)
        # print("TABLES", tables)
        ret = []
        for table in tables:
            # print("TABLE", table)
            # print(table.data)
            for row in table.cells:
                reference = row[3].text.strip()
                if not reference:
                    print("SKIPPING REFERENCE '{}' [EMPTY]".format(reference))
                    continue
                else:
                    reference = self.clean_reference(reference)

                if row[4].text:
                    try:
                        price = self.clean_price(row[4].text)
                    except ValueError as e:
                        print(e)
                        price = 0

                ret.append(dict(Reference=reference, Price=price))
        return ret
