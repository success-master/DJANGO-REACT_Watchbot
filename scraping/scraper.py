import requests
import csv
import os.path
from bs4 import BeautifulSoup
from . image_search import get_driver
from . image_search import google_search_image as search_image


class WatchScraper:
    URL = None
    SEARCH_URL = None
    images_directory = None
    brand = None
    web_driver = None
    headless = None
    csv_fieldnames = ['Image',
                      'Brand',
                      'Model',
                      'Reference',
                      'Movement',
                      'Case material',
                      'Case size',
                      'Dial color',
                      'Bracelet material',
                      'Gender',
                      'Price',
                      'Refext']


    def scrape(self, source_file, target_file, images_directory, pages, append, headless=True):
        print("SCRAPE", source_file, target_file, images_directory, pages, append, headless)
        self.headless = headless
        self.images_directory = images_directory

        if append:
            mode = 'a'
        else:
            mode = 'w'

        with open(target_file, mode, newline='') as csvfile:

            writer = csv.DictWriter(csvfile, fieldnames=self.csv_fieldnames)

            if not append:
                # skip rewrite header if in append mode
                writer.writeheader()

            ref_price_dict_list = self.parse_input(source_file, pages)
            for ref_price_dict in ref_price_dict_list:
                reference = ref_price_dict['Reference']
                reference_links = self.get_reference_links(reference)
                print(reference, reference_links)
                for ref_link in reference_links:
                    reference_info = self.get_reference_info(ref_link)
                    reference_info.update(ref_price_dict)

                    reference_info['Dial color'] = reference_info['Dial type']
                    del reference_info['Dial type']

                    print(reference_info)

                    self.brand = reference_info['Brand']
                    refext = reference_info['Refext']
                    image_url = reference_info.pop('image_url', None)
                    if image_url:
                        image = self.retrieve_and_save_image(reference, refext, image_url)
                        reference_info['Image'] = image
                        print("FOUND IMAGE '{}' FOR REFERENCE '{}' [INFO]".format(image, reference))
                    else:
                        print("SEARCHING IMAGE FOR REFERENCE '{}' [SEARCH]".format(reference))
                        image = self.search_and_save_image(reference, refext)
                        reference_info['Image'] = image
                        print("FOUND IMAGE '{}' FOR REFERENCE '{}' [SEARCH]".format(image, reference))
                    if not image:
                        print("WARNING SKIPPING IMAGE FOR REFERENCE '{}' [NOT FOUND IN INFO/SEARCH]".format(reference))
                    writer.writerow(reference_info)
        if self.web_driver:
            self.web_driver.quit()

    def image_filename(self, reference, refext, image_extension=None, image_url=None):
        if not image_extension:
            image_extension = os.path.splitext(image_url)[1]
            image_filename = '{}-{}-{}{}'.format(self.brand, reference, refext, image_extension)
        return image_filename

    def retrieve_and_save_image(self, reference, refext, image_url):
        try:
            image_filename = self.image_filename(reference, refext, image_url=image_url)
            image_pathname = self.images_directory + image_filename
            session = requests.Session()
            content = session.get(image_url).content
            with open(image_pathname, 'wb') as image:
                image.write(content)
            return image_filename
        except Exception as e:
            print('retrieve_and_save_image: ERROR')
            print(e)
            return None

    def search_and_save_image(self, reference, refext):
        print('search_and_save_image', reference)
        try:
            if not self.web_driver:
                self.web_driver = get_driver(self.headless)

            image_url = search_image(self.brand,reference,self.web_driver)
            print('GOOGLE RESULT URL', image_url)
            if image_url:
                return self.retrieve_and_save_image(reference, refext, image_url)
        except Exception as e:
            print('search_and_save_image: ERROR')
            print(e)
            return None

    def parse_input(self, source_file, pages):
        raise NotImplemented

    def get_reference_links(self, reference, multiple_results=False):
        raise NotImplemented

    def get_reference_info(self, reference_url):
        raise NotImplemented

    def clean_reference(self, reference):
        raise NotImplemented

    def clean_price(self, price):
        raise NotImplemented

    def clean_image_url(self, image_url):
        raise NotImplemented

    def clean_gender(self, gender):
        raise NotImplemented


class WatchFinderScraper(WatchScraper):
    URL = 'https://www.watchfinder.co.uk'
    SEARCH_URL = URL + '/search?q='

    required_fields = ['Gender',
                       'Movement',
                       'Case size',
                       'Case material',
                       'Bracelet material',
                       'Dial type'
                       ]

    def get_reference_links(self, reference, multiple_results=False):
        reference_search_url = self.SEARCH_URL + reference
        session = requests.Session()
        response = session.get(reference_search_url)
        soup = BeautifulSoup(response.content, 'html.parser')
        ret = []

        if multiple_results:
            products = soup.find(class_='products_')
            if products:
                items = products.findAll(class_='prods_image')
                for item in items:
                    links = item.findAll(class_='redirect')
                    for link in links:
                        href = link.attrs['href']
                        ret.append(href)
            catalogue = soup.find(class_='catalogue_')
            if catalogue:
                items = catalogue.findAll(class_='prods_image')
                for item in items:
                    links = item.findAll(class_='redirect')
                    for link in links:
                        href = link.attrs['href']
                        ret.append(href)
        else: # Single result
            products = soup.find(class_='products_')
            if products:
                item = products.find(class_='prods_image')
                if item:
                    link = item.find(class_='redirect')
                    href = link.attrs['href']
                    ret.append(href)
            else:
                catalogue = soup.find(class_='catalogue_')
                if catalogue:
                    item = catalogue.find(class_='prods_image')
                    if item:
                        link = item.find(class_='redirect')
                        href = link.attrs['href']
                        ret.append(href)
        if not ret:
            print("WARNING REFERENCE '{}' [EMPTY PRODUCTS OR CATALOGUE LIST]".format(reference))

        return ret

    def get_reference_info(self, reference_url):
        url = self.URL + reference_url
        session = requests.Session()
        content = session.get(url).content

        soup = BeautifulSoup(content, 'html.parser')
        ret = dict()

        picture = soup.find('picture', class_='prod_image')
        if picture:
            image = picture.find('img')
            if image:
                image_url = image['srcset']
                image_url = self.clean_image_url(image_url)
                ret['image_url'] = image_url
            else:
                print("WARNING REFERENCE URL '{}' [EMPTY IMAGE]".format(reference_url))
        else:
            print("WARNING REFERENCE URL '{}' [EMPTY PICTURE]".format(reference_url))

        product_description = soup.find(id='stock_info')
        product_table = product_description.find(class_='table prod_info-table')

        product_name = soup.find('h1', class_='prod_name')
        brand = product_name.find(class_='prod_brand').text
        model = product_name.find(class_='prod_series').text

        rows = product_table.findAll('tr')

        product_code = soup.find(class_='prod_label-code').text
        product_code = product_code.split()[-1] # last part of string
        ret['Refext'] = product_code

        ret['Brand'] = brand
        ret['Model'] = model

        for row in rows:
            content = row.findAll('td')
            if len(content) > 1:
                key = content[0].text.strip()
                if key in self.required_fields:
                    value = content[1].text.strip()
                    if key == 'Gender':
                        ret[key] = self.clean_gender(value)
                    else: # FIXME clean all required fields!!
                        ret[key] = value
                # else:
                # print('key not in required field', key)
        return ret
