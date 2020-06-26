import time
from os import path
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options

BASE_DIR = path.dirname(path.abspath(__file__))

IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
GOOGLE_SEARCH_URL = "https://images.google.com"
DRIVER = "geckodriver"
DRIVER_PATH =  BASE_DIR + '/' + DRIVER
print("DRIVER_PATH",DRIVER_PATH)
WINDOW_SIZE = "1920,1080"
SLEEP1 = 3
SLEEP2 = 2 * SLEEP1
HEADLESS = True


def get_driver(headless=HEADLESS):
    options = Options()
    options.headless = headless
    options.binary = None
    driver = webdriver.Firefox(executable_path=DRIVER_PATH,
                               options=options)
    return driver


def google_search_image(brand, reference, web_driver=None):
    # site = self.brand + '.com'
    # query = '"{}" "{}"'.format(site, reference)
    query = '"{}" "{}"'.format(brand, reference)
    print('SEARCH GOOGLE IMAGE FOR:', query)

    if web_driver:
        driver = web_driver
    else:
        driver = get_driver()

    driver.get(GOOGLE_SEARCH_URL)
    search = driver.find_element_by_name("q")
    search.send_keys(query)
    search.send_keys(Keys.RETURN)  # hit return after you enter search text

    time.sleep(SLEEP1)  # sleep so you can see the results
    xpath1 ='//img[starts-with(@src, "data:image/jpeg;base64")]'
    results = driver.find_elements_by_xpath(xpath1)
    for result in results:
        # Get parent of parent element
        pp_elem = result.find_elements_by_xpath('..')[0].find_elements_by_xpath('..')[0]
        pp_elem_tag = pp_elem.tag_name
        if not pp_elem_tag == 'a':
            # if parent of parent element is not an "a"
            # ==> is a sponsored link ==> skip
            print("SKIPPING SPONSORED LINK")
            continue

        # print(result.get_attribute('src'))
        result.click()

        time.sleep(SLEEP2)
        xpath2 ='//img[starts-with(@src, "http")]'
        results = driver.find_elements_by_xpath(xpath2)
        for result in results:
            src = result.get_attribute('src')
            _, src_extension = path.splitext(src)
            src_extension = src_extension.lower()[1:]
            # print(src_extension, src)
            if src_extension in IMAGE_EXTENSIONS:
                # print('FOUND', src, '<' * 80)
                return src

    if not web_driver:
        driver.quit()

    return None
