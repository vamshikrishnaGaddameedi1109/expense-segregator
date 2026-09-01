import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

KEYWORD_RULES = {
    "SERVICE STATION": "Fuel/Transport",
    "FOOD COURT": "Dining",
    "RESTAURANT": "Dining",
    "STORES": "Shopping",
    "MART": "Shopping",
}

def rule_based_category(description: str) -> str:
    for keyword, category in KEYWORD_RULES.items():
        if keyword in description:
            return category
    return "Personal Transfer"


def apply_rules(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Category"] = df["Description"].apply(rule_based_category)
    return df


class MLCategorizer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.model = LogisticRegression(max_iter=1000)

    def train(self, descriptions, labels):
        X = self.vectorizer.fit_transform(descriptions)
        self.model.fit(X, labels)

    def predict(self, descriptions):
        X = self.vectorizer.transform(descriptions)
        return self.model.predict(X)


def categorize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    df = apply_rules(df)

    known = df[df["Category"] != "Uncategorized"]
    unknown = df[df["Category"] == "Uncategorized"]

    if len(unknown) > 0 and len(known) >= 5:
        clf = MLCategorizer()
        clf.train(known["Description"], known["Category"])
        predicted = clf.predict(unknown["Description"])
        df.loc[df["Category"] == "Uncategorized", "Category"] = predicted

    return df