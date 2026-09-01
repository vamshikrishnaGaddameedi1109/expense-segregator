import pytesseract
from PIL import Image
import re
import pandas as pd

# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

MONTHS = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"


def extract_text_from_image(image_file) -> str:
    image = Image.open(image_file)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

    lines = {}
    for i in range(len(data["text"])):
        word = data["text"][i].strip()
        if not word:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        lines.setdefault(key, []).append((data["left"][i], data["top"][i], word))

    reconstructed = []
    for words in lines.values():
        avg_top = sum(w[1] for w in words) / len(words)
        words_sorted = sorted(words, key=lambda w: w[0])
        line_text = " ".join(w[2] for w in words_sorted)
        reconstructed.append((avg_top, line_text))

    reconstructed.sort(key=lambda x: x[0])
    return "\n".join(line for _, line in reconstructed)


def parse_transactions_from_text(text: str) -> pd.DataFrame:
    """Parse GPay-style OCR text into Description/Amount rows.
    Handles noise tokens (misread icons as short digit/letter blobs)
    and variable ordering of amount vs. date."""
    flat_text = " ".join(text.split())  # collapse newlines into spaces

    pattern = re.compile(
        r"(Paid to|Received from)\s+(.*?)\s+(Debited from|Credited to)",
        re.IGNORECASE
    )

    number_pattern = re.compile(r"[+%=]?\d[\d,]*\.?\d*")
    date_pattern = re.compile(rf"\d{{1,2}}\s+{MONTHS}", re.IGNORECASE)

    records = []

    for match in pattern.finditer(flat_text):
        direction = match.group(1)
        middle = match.group(2)
        is_debit = direction.lower().startswith("paid")

        # Remove date fragments like "16 Jul" so they don't get mistaken for the amount
        middle_clean = date_pattern.sub("", middle)

        numbers = list(number_pattern.finditer(middle_clean))
        if not numbers:
            continue
        amount_match = numbers[-1]  # amount is the last remaining number
        amount = float(re.sub(r"[+%=,]", "", amount_match.group()))
        if is_debit:
            amount = -amount

        # Name = words before the amount, dropping short noise tokens (icons misread as junk)
        name_part = middle_clean[:amount_match.start()]
        tokens = name_part.split()
        name_tokens = [t for t in tokens if sum(c.isalpha() for c in t) >= 3]
        name = " ".join(name_tokens).strip() or "UNKNOWN"

        records.append({"Description": name.upper(), "Amount": amount})

    return pd.DataFrame(records)