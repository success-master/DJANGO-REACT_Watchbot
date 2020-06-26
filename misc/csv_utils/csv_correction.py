import csv


def prices_dict(csv_file):
    d = dict()
    with open(csv_file) as i:
        reader = csv.reader(i)
        next(reader, None)
        for row in reader:
            d[row[0]] = row[2]
    return d


def change_price(input_csv, input_prices, output):
    with open(input_csv) as i, open(output, 'w') as o:
        records = csv.DictReader(i)
        fieldnames = records.fieldnames

        writer = csv.DictWriter(o, fieldnames=fieldnames)
        writer.writeheader()
        print(fieldnames)
        for row in records:
            reference = row['Reference'].strip()
            prices = prices_dict(input_prices)
            if reference in prices:
                row['Price'] = prices[reference]
                writer.writerow(row)
            else:
                print('no reference', reference)
