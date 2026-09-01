import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Standard primary categories
CATEGORIES = [
    "Food",
    "Shopping",
    "Transport",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Personal Transfer",
    "Other"
]

# Comprehensive keyword lookup rules for common merchants
KEYWORD_RULES = {
    # Food & Dining
    "FOOD": "Food",
    "RESTAURANT": "Food",
    "CAFE": "Food",
    "COFFEE": "Food",
    "ZOMATO": "Food",
    "SWIGGY": "Food",
    "DOMINOS": "Food",
    "PIZZA": "Food",
    "MCDONALD": "Food",
    "BURGER": "Food",
    "STARBUCKS": "Food",
    "BAKERY": "Food",
    "SWEETS": "Food",
    "DHABA": "Food",
    "KITCHEN": "Food",
    "BIRYANI": "Food",
    "TEA": "Food",
    "CHAI": "Food",
    "JUICE": "Food",
    "EATCLUB": "Food",
    "FOOD COURT": "Food",

    # Shopping & Groceries
    "STORES": "Shopping",
    "MART": "Shopping",
    "SUPERMARKET": "Shopping",
    "AMAZON": "Shopping",
    "FLIPKART": "Shopping",
    "MYNTRA": "Shopping",
    "AJIO": "Shopping",
    "BLINKIT": "Shopping",
    "ZEPTO": "Shopping",
    "INSTAMART": "Shopping",
    "BIGBASKET": "Shopping",
    "DMART": "Shopping",
    "RELIANCE RETAIL": "Shopping",
    "DECATHLON": "Shopping",
    "ZARA": "Shopping",
    "H&M": "Shopping",
    "CROMA": "Shopping",
    "SHOP": "Shopping",
    "MALL": "Shopping",
    "CLOTHING": "Shopping",
    "FOOTWEAR": "Shopping",

    # Transport & Fuel
    "SERVICE STATION": "Transport",
    "PETROL": "Transport",
    "DIESEL": "Transport",
    "FUEL": "Transport",
    "INDIAN OIL": "Transport",
    "HPCL": "Transport",
    "BPCL": "Transport",
    "SHELL": "Transport",
    "UBER": "Transport",
    "OLA": "Transport",
    "RAPIDO": "Transport",
    "METRO": "Transport",
    "RAILWAY": "Transport",
    "IRCTC": "Transport",
    "PARKING": "Transport",
    "FASTAG": "Transport",
    "TOLL": "Transport",
    "AUTO": "Transport",
    "CAB": "Transport",
    "AIRLINES": "Transport",
    "INDIGO": "Transport",

    # Bills & Utilities
    "ELECTRICITY": "Bills",
    "BESCOM": "Bills",
    "TSSPDCL": "Bills",
    "MSEDCL": "Bills",
    "AIRTEL": "Bills",
    "JIO": "Bills",
    "VI PREPAID": "Bills",
    "VODAFONE": "Bills",
    "BROADBAND": "Bills",
    "WIFI": "Bills",
    "ACT FIBERNET": "Bills",
    "GAS": "Bills",
    "INDANE": "Bills",
    "HP GAS": "Bills",
    "BHARAT GAS": "Bills",
    "WATER": "Bills",
    "RECHARGE": "Bills",
    "CRED": "Bills",
    "INSURANCE": "Bills",
    "LIC": "Bills",
    "RENT": "Bills",
    "MAINTENANCE": "Bills",

    # Entertainment & Leisure
    "NETFLIX": "Entertainment",
    "SPOTIFY": "Entertainment",
    "PRIME VIDEO": "Entertainment",
    "HOTSTAR": "Entertainment",
    "BOOKMYSHOW": "Entertainment",
    "PVR": "Entertainment",
    "INOX": "Entertainment",
    "CINEMA": "Entertainment",
    "MOVIE": "Entertainment",
    "GAMING": "Entertainment",
    "STEAM": "Entertainment",
    "PLAYSTATION": "Entertainment",
    "YOUTUBE": "Entertainment",
    "THEATRE": "Entertainment",
    "CLUB": "Entertainment",
    "RESORT": "Entertainment",

    # Healthcare & Wellness
    "PHARMACY": "Healthcare",
    "APOLLO": "Healthcare",
    "MEDPLUS": "Healthcare",
    "NETMEDS": "Healthcare",
    "PHARMEASY": "Healthcare",
    "1MG": "Healthcare",
    "HOSPITAL": "Healthcare",
    "CLINIC": "Healthcare",
    "DOCTOR": "Healthcare",
    "LAB": "Healthcare",
    "DIAGNOSTICS": "Healthcare",
    "DENTAL": "Healthcare",
    "OPTICAL": "Healthcare",
    "GYM": "Healthcare",
    "CULT FIT": "Healthcare",

    # Personal Transfers
    "UPI": "Personal Transfer",
    "TRANSFER": "Personal Transfer",
    "SENT TO": "Personal Transfer",
    "FRIEND": "Personal Transfer",
}

# Pre-seeded training corpus for high-accuracy TF-IDF + Logistic Regression
SEED_CORPUS = [
    # Food
    ("SWIGGY BANGALORE ORDER FOOD", "Food"),
    ("ZOMATO ONLINE ORDER MEAL", "Food"),
    ("DOMINOS PIZZA DINING", "Food"),
    ("MCDONALDS BURGER COMBO", "Food"),
    ("STARBUCKS COFFEE CAFE", "Food"),
    ("CHAI POINT TEA SNACKS", "Food"),
    ("UDUPI VEG RESTAURANT MEALS", "Food"),
    ("PARADISE BIRYANI DINNER", "Food"),
    ("LOCAL BAKERY CAKES BREAD", "Food"),
    ("EATCLUB MEALS BOX", "Food"),
    ("SUBWAY SANDWICH", "Food"),
    ("HALDIRAMS SWEETS SNACKS", "Food"),

    # Shopping
    ("AMAZON INDIA SHOPPING RETAIL", "Shopping"),
    ("FLIPKART INTERNET PVT LTD", "Shopping"),
    ("MYNTRA FASHION APPAREL", "Shopping"),
    ("BLINKIT GROCERY DELIVERY", "Shopping"),
    ("ZEPTO QUICK COMMERCE", "Shopping"),
    ("INSTAMART SWIGGY GROCERY", "Shopping"),
    ("DMART AVENUE SUPERMARTS", "Shopping"),
    ("RELIANCE DIGITAL ELECTRONICS", "Shopping"),
    ("DECATHLON SPORTS GEAR", "Shopping"),
    ("ZARA CLOTHING STORE", "Shopping"),
    ("IKEA FURNITURE HOME", "Shopping"),
    ("BIGBASKET SUPERMARKET", "Shopping"),

    # Transport
    ("UBER INDIA RIDES TRIP", "Transport"),
    ("OLA CABS PRIVATE LIMITED", "Transport"),
    ("RAPIDO BIKE TAXI COMMUTE", "Transport"),
    ("INDIAN OIL PETROL PUMP", "Transport"),
    ("HPCL AUTO FUEL STATION", "Transport"),
    ("BPCL DIESEL REFUEL", "Transport"),
    ("SHELL PETROL STATION FUEL", "Transport"),
    ("FASTAG TOLL PLAZA HIGHWAY", "Transport"),
    ("METRO RAIL SMART CARD RECHARGE", "Transport"),
    ("IRCTC TRAIN TICKET BOOKING", "Transport"),
    ("INDIGO FLIGHT TICKET AIRPORT", "Transport"),
    ("PARKING FEE MALL ENTRY", "Transport"),

    # Bills
    ("AIRTEL POSTPAID MOBILE BILL", "Bills"),
    ("JIO TELECOM RECHARGE PREPAID", "Bills"),
    ("BESCOM ELECTRICITY BILL", "Bills"),
    ("ACT FIBERNET BROADBAND INTERNET", "Bills"),
    ("INDANE LPG GAS CYLINDER", "Bills"),
    ("TATA PLAY DTH RECHARGE", "Bills"),
    ("HDFC CREDIT CARD PAYMENT", "Bills"),
    ("LIC LIFE INSURANCE PREMIUM", "Bills"),
    ("SOCIETY APARTMENT MAINTENANCE RENT", "Bills"),
    ("CRED BILL PAYMENT UTILITY", "Bills"),

    # Entertainment
    ("NETFLIX SUBSCRIPTION STREAMING", "Entertainment"),
    ("SPOTIFY MUSIC PREMIUM", "Entertainment"),
    ("BOOKMYSHOW MOVIE TICKETS", "Entertainment"),
    ("PVR CINEMAS MULTIPLEX", "Entertainment"),
    ("INOX LEISURE THEATRE", "Entertainment"),
    ("HOTSTAR VIP ANNUAL PLAN", "Entertainment"),
    ("SONY LIV ENTERTAINMENT", "Entertainment"),
    ("STEAM GAMES STORE", "Entertainment"),
    ("WONDERLA AMUSEMENT PARK", "Entertainment"),

    # Healthcare
    ("APOLLO PHARMACY MEDICINES", "Healthcare"),
    ("MEDPLUS CHEMIST DRUGS", "Healthcare"),
    ("PHARMEASY ONLINE MEDICINE", "Healthcare"),
    ("MAX HEALTHCARE CLINIC DOCTOR", "Healthcare"),
    ("LAL PATHLABS BLOOD TEST", "Healthcare"),
    ("CULT FIT GYM SUBSCRIPTION", "Healthcare"),
    ("LENSKART EYEWEAR GLASSES", "Healthcare"),
    ("DENTAL CARE CLINIC", "Healthcare"),

    # Personal Transfer / Other
    ("PAYMENT TO RAHUL SHARMA UPI", "Personal Transfer"),
    ("SENT TO PRIYA VERMA PHONEPE", "Personal Transfer"),
    ("TRANSFER TO VIKRAM SINGH GPAY", "Personal Transfer"),
    ("CASH WITHDRAWAL ATM BANK", "Other"),
    ("GENERAL MISCELLANEOUS EXPENSE", "Other"),
]


def rule_based_category(description: str) -> str:
    """Classify description based on instant keyword rules."""
    desc_upper = str(description).upper()
    for keyword, category in KEYWORD_RULES.items():
        if keyword in desc_upper:
            return category
    return "Uncategorized"


def apply_rules(df: pd.DataFrame) -> pd.DataFrame:
    """Apply rule-based categorization to DataFrame."""
    df = df.copy()
    if "Description" not in df.columns:
        df["Description"] = "UNKNOWN"
    df["Category"] = df["Description"].apply(rule_based_category)
    return df


class MLCategorizer:
    """TF-IDF + Logistic Regression Classifier for transaction categorization."""
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            min_df=1,
            sublinear_tf=True
        )
        self.model = LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver='lbfgs'
        )
        self.is_fitted = False
        self._init_seed_model()

    def _init_seed_model(self):
        """Fit model on standard pre-seeded transaction vocabulary."""
        try:
            texts = [item[0] for item in SEED_CORPUS]
            labels = [item[1] for item in SEED_CORPUS]
            self.train(texts, labels)
        except Exception as e:
            print(f"Failed to initialize seed model: {e}")

    def train(self, descriptions, labels):
        """Train or fine-tune model on provided descriptions and labels."""
        try:
            desc_clean = [str(d).upper() for d in descriptions]
            X = self.vectorizer.fit_transform(desc_clean)
            self.model.fit(X, labels)
            self.is_fitted = True
        except Exception as e:
            print(f"Error training MLCategorizer: {e}")

    def predict(self, descriptions):
        """Predict categories for a list of descriptions."""
        if not self.is_fitted:
            return ["Other" for _ in descriptions]
        try:
            desc_clean = [str(d).upper() for d in descriptions]
            X = self.vectorizer.transform(desc_clean)
            return self.model.predict(X)
        except Exception:
            return ["Other" for _ in descriptions]

    def predict_with_confidence(self, descriptions):
        """Predict categories along with prediction confidence probabilities."""
        if not self.is_fitted:
            return ["Other" for _ in descriptions], [0.5 for _ in descriptions]
        try:
            desc_clean = [str(d).upper() for d in descriptions]
            X = self.vectorizer.transform(desc_clean)
            preds = self.model.predict(X)
            probs = self.model.predict_proba(X)
            confidences = np.max(probs, axis=1)
            return preds, confidences
        except Exception:
            return self.predict(descriptions), [0.75 for _ in descriptions]


# Global singleton instance for fast reuse
_GLOBAL_ML_CATEGORIZER = MLCategorizer()


def categorize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Categorizes transactions using rule-based heuristics + TF-IDF ML model.
    Guarantees standard categories, assigns confidence scores, and never crashes."""
    if df.empty:
        return df.copy()

    df = df.copy()

    # Step 1: Apply keyword rules
    df = apply_rules(df)

    # Initialize Confidence column
    df["Confidence"] = 0.95  # High confidence for direct keyword matches

    # Step 2: Use ML for uncategorized or low-specificity rows
    uncategorized_mask = (df["Category"] == "Uncategorized") | (df["Category"] == "Personal Transfer")

    if uncategorized_mask.any():
        descriptions = df.loc[uncategorized_mask, "Description"].tolist()
        preds, confs = _GLOBAL_ML_CATEGORIZER.predict_with_confidence(descriptions)

        # For uncategorized, assign ML prediction directly
        exact_uncat_mask = (df["Category"] == "Uncategorized")
        if exact_uncat_mask.any():
            uncat_indices = df[exact_uncat_mask].index
            uncat_descs = df.loc[exact_uncat_mask, "Description"].tolist()
            u_preds, u_confs = _GLOBAL_ML_CATEGORIZER.predict_with_confidence(uncat_descs)
            df.loc[uncat_indices, "Category"] = u_preds
            df.loc[uncat_indices, "Confidence"] = np.round(u_confs, 2)

    # Fallback any remaining uncategorized to "Other"
    df.loc[df["Category"] == "Uncategorized", "Category"] = "Other"
    df.loc[df["Category"] == "Other", "Confidence"] = 0.60

    # Clean and standardize confidence values
    df["Confidence"] = df["Confidence"].fillna(0.85).clip(0.40, 0.99)

    return df
