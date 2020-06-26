from . cartier_scraper import CartierWatchFinderScraper
from . chopard_scraper import ChopardWatchFinderScraper
from . jlc_scraper import JlcWatchFinderScraper
from . panerai_scraper import PaneraiWatchFinderScraper
from . hublot_scraper import HublotWatchFinderScraper
from . iwc_scraper import IwcWatchFinderScraper
from . piaget_scraper import PiagetWatchFinderScraper
import os
import argparse


IMAGES_DIR = 'images/'
DEFAULT_PAGES = "all"


def fake_print(*args, **kwargs):
    pass


def main():
    parser = argparse.ArgumentParser(description='Cartier Info Scraping')

    parser.add_argument('brand',
                        nargs=1,
                        choices=['cartier', 'chopard', 'jlc', 'panerai', 'hublot', 'iwc', 'piaget'],
                        help='brand')

    parser.add_argument('source',
                        help='input pdf file',
                        nargs=1,
                        type=str)

    parser.add_argument('target',
                        help='output CSV file',
                        nargs=1,
                        type=str)

    parser.add_argument('-i', '--images-directory',
                        nargs='?',
                        default=IMAGES_DIR,
                        type=str,
                        help='directory for image files (default: %(default)s)')

    parser.add_argument('-p', '--pages',
                        nargs='+',
                        help='<Required> Pages',
                        required=False)

    parser.add_argument('-a', '--append',
                        action="store_true",
                        default=False,
                        help='append info to CSV file (default: %(default)s)')

    parser.add_argument('-d', '--debug',
                        action="store_true",
                        default=False,
                        help='debug mode (default: %(default)s)')

    parser.add_argument('-b', '--browser',
                        action="store_true",
                        default=False,
                        help='show browser during image search (default: %(default)s)')

    args = parser.parse_args()
    # print("ARGS", args)

    source_file = args.source[0]
    target_file = args.target[0]
    pages = args.pages
    if pages:
        pages_str = ""
        for p in pages:
            pages_str += '{},'.format(p)
        pages_str = pages_str[:-1] #skip last comma
    else:
        pages_str = DEFAULT_PAGES

    if source_file == target_file:
        raise argparse.ArgumentError(source_file, "Invalid Invocation: source and target files are the same!")

    images_directory = args.images_directory
    if not os.path.isdir(images_directory):
        raise argparse.ArgumentError(None, 'Invalid Invocation: images directory "{}" not found!'.format(images_directory))
    if not images_directory.endswith('/'):
        images_directory += '/'

    if not args.debug:
        import builtins
        builtins.print = fake_print

    headless = not args.browser

    brand = args.brand[0]
    if brand == 'cartier':
        scraper = CartierWatchFinderScraper()
    elif brand == 'chopard':
        scraper = ChopardWatchFinderScraper()
    elif brand == 'jlc':
        scraper = JlcWatchFinderScraper()
    elif brand == 'panerai':
        scraper = PaneraiWatchFinderScraper()
    elif brand == 'hublot':
        scraper = HublotWatchFinderScraper()
    elif brand == 'iwc':
        scraper = IwcWatchFinderScraper()
    elif brand == 'piaget':
        scraper = PiagetWatchFinderScraper()
    else:
        raise argparse.ArgumentError(brand, "Invalid Invocation: invalid brand!")

    scraper.scrape(source_file, target_file, images_directory, pages_str, args.append, headless)
