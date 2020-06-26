import argparse
import codecs
BLOCKSIZE = 1048576 # or some other, desired size in bytes


def reencode(source, target, source_encoding, target_encoding):

    with codecs.open(source, "r", source_encoding) as source_file:
        with codecs.open(target, "w", target_encoding) as target_file:
            while True:
                contents = source_file.read(BLOCKSIZE)
                if not contents:
                    break
                target_file.write(contents)


def main():
    parser = argparse.ArgumentParser(description='Translate Encoding')

    parser.add_argument('source',
                    nargs=1,
                    type=str)
    parser.add_argument('target',
                    nargs=1,
                    type=str)
    parser.add_argument('--source-encoding',
                    nargs='?',
                    default='iso-8859-1',
                    type=str)

    parser.add_argument('--target-encoding',
                    nargs='?',
                    default='utf-8',
                    type=str)

    args = parser.parse_args()

    source_file = args.source[0]
    target_file = args.target[0]
    if source_file == target_file:
        raise argparse.ArgumentError("Invalid Invocation: source and target files are the same!")

    source_encoding = args.source_encoding
    target_encoding = args.target_encoding
    if source_encoding == target_encoding:
        raise argparse.ArgumentError("Invalid Invocation: source and target encodings are the same!")

    print(source_file, source_encoding, target_file, target_encoding)
    reencode(source_file, target_file, source_encoding, target_encoding)


if __name__ == "__main__":
    main()
