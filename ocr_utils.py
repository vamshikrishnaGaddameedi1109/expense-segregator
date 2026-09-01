import pytesseract
from PIL import Image
import re
import pandas as pd
from datetime import datetime

# Optional local path configuration for Tesseract OCR if on Windows
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

MONTHS = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)"
MONTH_MAP = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "september": 9, "oct": 10, "october": 10,
    "nov": 11, "november": 11, "dec": 12, "december": 12
}


def extract_text_from_image(image_file) -> str:
    """Extract spatial text from an uploaded image using pytesseract."""
    try:
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
    except Exception as e:
        # Graceful fallback in case image cannot be read
        print(f"Error in OCR extraction: {e}")
        return ""


def parse_date_string(text: str) -> str:
    """Helper to extract and normalize date string from text fragment."""
    date_match = re.search(
        rf"(\d{{1,2}})\s+{MONTHS}(?:\s+(\d{{4}}))?",
        text,
        re.IGNORECASE
    )
    if date_match:
        day = int(date_match.group(1))
        month_str = date_match.group(2).lower()
        month = MONTH_MAP.get(month_str, 1)
        year = int(date_match.group(3)) if date_match.group(3) else datetime.now().year
        try:
            dt = datetime(year, month, min(day, 28))
            return dt.strftime("%Y-%m-%d")
        except Exception:
            return f"{year:04d}-{month:02d}-{min(day, 28):02d}"

    # Numerical date formats DD/MM/YYYY or YYYY-MM-DD
    num_date = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})", text)
    if num_date:
        d, m, y = num_date.groups()
        if len(y) == 2:
            y = "20" + y
        try:
            dt = datetime(int(y), int(m), int(d))
            return dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    return ""


def parse_transactions_from_text(text: str) -> pd.DataFrame:
    """Parse GPay / PhonePe / Paytm style OCR text into structured transaction rows.
    Handles noise tokens, dates, direction (debit vs credit), and amounts.
    Backward-compatible with the original interface while adding Date support."""
    if not text or not text.strip():
        return pd.DataFrame(columns=["Date", "Description", "Amount"])

    flat_text = " ".join(text.split())

    # Standard PhonePe / GPay pattern: Paid to ... Debited from / Credited to
    pattern = re.compile(
        r"(Paid to|Received from|Payment to|Transfer to|Money Sent to)\s+(.*?)\s+(Debited from|Credited to|Completed|Successful|Failed|$)",
        re.IGNORECASE
    )

    number_pattern = re.compile(r"[+%=₹Rs\.]*\s*(\d[\d,]*\.?\d*)")
    date_regex = re.compile(rf"\d{{1,2}}\s+{MONTHS}(?:\s+\d{{4}})?", re.IGNORECASE)

    records = []

    for match in pattern.finditer(flat_text):
        direction = match.group(1)
        middle = match.group(2)
        is_debit = any(k in direction.lower() for k in ["paid", "sent", "payment to", "transfer to"])

        # Extract date from middle snippet if present
        date_str = parse_date_string(middle)

        # Remove date fragments so they don't get mistaken for amount
        middle_clean = date_regex.sub("", middle)

        numbers = list(number_pattern.finditer(middle_clean))
        if not numbers:
            continue

        amount_match = numbers[-1]
        try:
            raw_amt = amount_match.group(1).replace(",", "")
            amount = float(raw_amt)
            if amount <= 0:
                continue
        except ValueError:
            continue

        if is_debit:
            amount = -amount

        # Name = words before the amount, dropping short noise tokens
        name_part = middle_clean[:amount_match.start()]
        tokens = name_part.split()
        name_tokens = [t for t in tokens if sum(c.isalpha() for c in t) >= 2 and not t.lower().startswith("ref")]
        name = " ".join(name_tokens).strip() or "UPI MERCHANT"

        records.append({
            "Date": date_str if date_str else "",
            "Description": name.upper(),
            "Amount": amount
        })

    # Graceful fallback: If standard pattern didn't capture enough rows, try line-by-line heuristic parser
    if len(records) == 0:
        lines = text.split("\n")
        current_date = ""
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            extracted_d = parse_date_string(line_str)
            if extracted_d:
                current_date = extracted_d

            # Check if line contains an amount with currency indicators or digits
            amt_match = re.search(r"(?:₹|Rs\.?|INR)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)", line_str)
            if amt_match:
                try:
                    amt_val = float(amt_match.group(1).replace(",", ""))
                    if 1.0 <= amt_val <= 500000.0:
                        # Extract description from text around it
                        desc_text = re.sub(r"(?:₹|Rs\.?|INR|\d[\d,\.]*|Paid to|Received from)", "", line_str).strip()
                        desc_tokens = [t for t in desc_text.split() if len(t) > 1 and t.isalpha()]
                        merchant_name = " ".join(desc_tokens).upper() or "TRANSACTION"
                        is_credit = any(c in line_str.lower() for c in ["credited", "received", "+", "cashback"])
                        final_amt = amt_val if is_credit else -amt_val

                        records.append({
                            "Date": current_date,
                            "Description": merchant_name,
                            "Amount": final_amt
                        })
                except Exception:
                    continue

    if not records:
        return pd.DataFrame(columns=["Date", "Description", "Amount"])

    return pd.DataFrame(records)
