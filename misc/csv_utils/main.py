import argparse
from . csv_correction import change_price


def fake_print(*args, **kwargs):
    pass


def main():
    parser = argparse.ArgumentParser(description='Csv Price')

    parser.add_argument('source_csv',
                        nargs=1,
                        help='')

    parser.add_argument('source_prices',
                        help='input list original',
                        nargs=1,
                        type=str)

    parser.add_argument('target',
                        help='output CSV file',
                        nargs=1,
                        type=str)

    parser.add_argument('-d', '--debug',
                        action="store_true",
                        default=False,
                        help='debug mode (default: %(default)s)')

    args = parser.parse_args()
    # print("ARGS", args)

    source_csv = args.source_csv[0]
    source_prices = args.source_prices[0]
    target_file = args.target[0]

    if source_csv == target_file:
        raise argparse.ArgumentError(source_csv, "Invalid Invocation: source and target files are the same!")

    if not args.debug:
        import builtins
        builtins.print = fake_print

    change_price(source_csv, source_prices, target_file)
