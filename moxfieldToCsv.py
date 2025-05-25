import csv


def convert_txt_to_csv_sorted(txt_path, csv_path):
    rows = []
    max_tags = 0

    # Parse and collect all lines with their tag counts
    with open(txt_path, "r", encoding="utf-8") as infile:
        for line in infile:
            parts = line.strip().split(" #")
            card = parts[0].strip()
            tags = [tag.strip() for tag in parts[1:]]
            rows.append((card, tags))
            max_tags = max(max_tags, len(tags))

    # Sort by number of tags (descending)
    rows.sort(key=lambda x: len(x[1]), reverse=True)

    # Create header
    header = ["Card"] + [f"Tag{i + 1}" for i in range(max_tags)]

    # Write to CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.writer(outfile)
        writer.writerow(header)
        for card, tags in rows:
            padded_row = [card] + tags + [""] * (max_tags - len(tags))
            writer.writerow(padded_row)


# Example usage
convert_txt_to_csv_sorted("cards.txt", "cards.csv")
