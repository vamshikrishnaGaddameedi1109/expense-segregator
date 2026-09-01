import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import IsolationForest
import re
from datetime import datetime

from ocr_utils import extract_text_from_image, parse_transactions_from_text
from categorizer import categorize_transactions, MLCategorizer

# ---------------------------------------------------------
# Page Configuration & Modern Fintech Theme
# ---------------------------------------------------------
st.set_page_config(
    page_title="Expense Segregator — Personal Expense Intelligence",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for polished dashboard
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    .kpi-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        padding: 18px 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        margin-bottom: 12px;
    }
    
    .kpi-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
    }
    
    .kpi-value {
        font-size: 1.75rem;
        font-weight: 800;
        color: #f8fafc;
        margin-bottom: 2px;
    }
    
    .kpi-subtitle {
        font-size: 0.8rem;
        color: #64748b;
    }
    
    .insight-pill {
        background: rgba(30, 41, 59, 0.6);
        border-left: 4px solid #6366f1;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        font-size: 0.92rem;
        color: #e2e8f0;
    }
    
    .warning-pill {
        background: rgba(245, 158, 11, 0.1);
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        color: #fde68a;
    }

    .danger-pill {
        background: rgba(239, 68, 68, 0.1);
        border-left: 4px solid #ef4444;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        color: #fca5a5;
    }
</style>
""", unsafe_allow_html=True)


# ---------------------------------------------------------
# Sample Data Generators for Instant Demo / Testing
# ---------------------------------------------------------
def get_sample_data():
    """Generates standard sample transactions matching typical PhonePe/GPay OCR output."""
    sample_records = [
        {"Date": "2024-07-02", "Description": "SWIGGY BANGALORE", "Amount": -450.00},
        {"Date": "2024-07-04", "Description": "INDIAN OIL PETROL PUMP", "Amount": -1800.00},
        {"Date": "2024-07-05", "Description": "AMAZON INDIA RETAIL", "Amount": -2499.00},
        {"Date": "2024-07-08", "Description": "STARBUCKS COFFEE", "Amount": -380.00},
        {"Date": "2024-07-10", "Description": "AIRTEL BROADBAND BILL", "Amount": -1179.00},
        {"Date": "2024-07-12", "Description": "UBER RIDES", "Amount": -340.00},
        {"Date": "2024-07-14", "Description": "APOLLO PHARMACY", "Amount": -850.00},
        {"Date": "2024-07-16", "Description": "ZOMATO ONLINE MEAL", "Amount": -620.00},
        {"Date": "2024-07-18", "Description": "NETFLIX SUBSCRIPTION", "Amount": -649.00},
        {"Date": "2024-07-20", "Description": "DMART SUPERMARKET", "Amount": -3450.00},
        {"Date": "2024-07-22", "Description": "BESCOM ELECTRICITY", "Amount": -1420.00},
        {"Date": "2024-07-25", "Description": "BOOKMYSHOW PVR CINEMA", "Amount": -980.00},
        {"Date": "2024-07-28", "Description": "APPLE STORE ONLINE", "Amount": -18900.00}, # Anomaly
        {"Date": "2024-07-30", "Description": "BURGER KING DINING", "Amount": -320.00},
        {"Date": "2024-08-02", "Description": "SWIGGY INSTAMART", "Amount": -560.00},
        {"Date": "2024-08-05", "Description": "HPCL AUTO FUEL", "Amount": -2100.00},
        {"Date": "2024-08-09", "Description": "MYNTRA FASHION", "Amount": -1890.00},
        {"Date": "2024-08-12", "Description": "SALARY CREDIT TECH CORP", "Amount": 85000.00}, # Income
        {"Date": "2024-08-15", "Description": "SPOTIFY PREMIUM", "Amount": -119.00},
        {"Date": "2024-08-18", "Description": "ZEPTO GROCERIES", "Amount": -410.00},
    ]
    return pd.DataFrame(sample_records)


# ---------------------------------------------------------
# ML Anomaly Detection Engine
# ---------------------------------------------------------
def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """Uses IsolationForest from scikit-learn to detect statistically unusual transactions."""
    df = df.copy()
    if "Anomaly" not in df.columns:
        df["Anomaly"] = "Normal"

    if len(df) < 4:
        # Fallback if too few records: flag transactions > 3x mean as unusual
        mean_amt = df["Amount"].mean() if not df.empty else 0
        df["Anomaly"] = df["Amount"].apply(lambda x: "⚠️ Unusual" if x > (mean_amt * 3.0) and x > 2000 else "Normal")
        return df

    try:
        # Train IsolationForest on absolute expense amounts
        X = df[["Amount"]].values
        # Contamination estimated around 10-15% or auto
        iso = IsolationForest(contamination=0.1, random_state=42)
        preds = iso.fit_predict(X)
        # IsolationForest returns -1 for anomalies and 1 for normal
        df["Anomaly"] = np.where(preds == -1, "⚠️ Unusual", "Normal")
    except Exception as e:
        # Graceful fallback heuristic
        threshold = df["Amount"].quantile(0.92)
        df["Anomaly"] = df["Amount"].apply(lambda x: "⚠️ Unusual" if x >= threshold and x > 2500 else "Normal")

    return df


# ---------------------------------------------------------
# Header & Navigation
# ---------------------------------------------------------
st.title("📱 Expense Segregator")
st.caption("AI-powered Personal Expense Intelligence Dashboard • OCR, Categorization & Anomaly Detection")

# ---------------------------------------------------------
# Sidebar Controls
# ---------------------------------------------------------
st.sidebar.header("⚙️ Data & Controls")

data_source = st.sidebar.radio(
    "Select Input Mode:",
    ["Upload Payment Screenshot", "Use Demo Transaction Data"],
    index=0
)

uploaded_image = None
raw_text = ""
df_raw = pd.DataFrame()

if data_source == "Upload Payment Screenshot":
    uploaded_image = st.sidebar.file_uploader("Upload screenshot", type=["png", "jpg", "jpeg"])
    if uploaded_image:
        with st.spinner("🔍 Reading text from image with Tesseract OCR..."):
            raw_text = extract_text_from_image(uploaded_image)
        df_raw = parse_transactions_from_text(raw_text)
        
        with st.sidebar.expander("🔍 Show Raw OCR Text"):
            st.text(raw_text if raw_text else "No OCR text extracted.")
else:
    df_raw = get_sample_data()
    st.sidebar.success("✅ Loaded 20 demo transactions")

# If no data is available, show welcoming placeholder state
if df_raw.empty:
    st.info("👋 Welcome! Please upload a payment screenshot (PhonePe, Google Pay, Paytm) or switch to 'Use Demo Transaction Data' in the sidebar to view your intelligence dashboard.")
    st.stop()

# Categorize extracted data
df_categorized = categorize_transactions(df_raw)

# Separate expenses and income
expenses_all = df_categorized[df_categorized["Amount"] < 0].copy()
expenses_all["Amount"] = expenses_all["Amount"].abs()

if expenses_all.empty:
    # If all amounts are positive, treat as expenses
    expenses_all = df_categorized.copy()
    expenses_all["Amount"] = expenses_all["Amount"].abs()

# Run Anomaly Detection
expenses_all = detect_anomalies(expenses_all)

# ---------------------------------------------------------
# Sidebar Filters
# ---------------------------------------------------------
st.sidebar.markdown("---")
st.sidebar.subheader("🔍 Filter Transactions")

# Category Filter
all_categories = sorted(expenses_all["Category"].unique().tolist())
selected_categories = st.sidebar.multiselect(
    "Filter by Category",
    options=all_categories,
    default=all_categories
)

# Minimum Amount Filter
max_val = float(expenses_all["Amount"].max()) if not expenses_all.empty else 1000.0
min_amt = st.sidebar.slider(
    "Minimum Transaction Amount (₹)",
    min_value=0.0,
    max_value=max(100.0, max_val),
    value=0.0,
    step=50.0
)

# Date Filter if available
has_dates = "Date" in expenses_all.columns and expenses_all["Date"].str.strip().ne("").any()
selected_date_range = None

if has_dates:
    valid_dates = expenses_all[expenses_all["Date"] != ""]["Date"].dropna().unique()
    if len(valid_dates) > 0:
        st.sidebar.caption(f"📅 Date range: {min(valid_dates)} to {max(valid_dates)}")

# Reset Filters Button
if st.sidebar.button("🔄 Reset Filters"):
    st.experimental_rerun() if hasattr(st, "experimental_rerun") else st.rerun()

# Apply Filters to dataset
filtered_expenses = expenses_all[
    (expenses_all["Category"].isin(selected_categories if selected_categories else all_categories)) &
    (expenses_all["Amount"] >= min_amt)
].copy()

if filtered_expenses.empty:
    st.warning("No transactions match the selected filter criteria. Try adjusting the filters.")
    st.stop()

# ---------------------------------------------------------
# Top Metric / KPI Cards
# ---------------------------------------------------------
total_spending = filtered_expenses["Amount"].sum()
num_transactions = len(filtered_expenses)
top_category = filtered_expenses.groupby("Category")["Amount"].sum().idxmax() if not filtered_expenses.empty else "N/A"
top_cat_spending = filtered_expenses.groupby("Category")["Amount"].sum().max() if not filtered_expenses.empty else 0.0
avg_transaction = filtered_expenses["Amount"].mean() if num_transactions > 0 else 0.0

col_m1, col_m2, col_m3, col_m4 = st.columns(4)

with col_m1:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">💰 Total Spending</div>
        <div class="kpi-value">₹{total_spending:,.2f}</div>
        <div class="kpi-subtitle">Across filtered view</div>
    </div>
    """, unsafe_allow_html=True)

with col_m2:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">📊 Transactions</div>
        <div class="kpi-value">{num_transactions}</div>
        <div class="kpi-subtitle">Extracted & categorized</div>
    </div>
    """, unsafe_allow_html=True)

with col_m3:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">🏷️ Top Spending Category</div>
        <div class="kpi-value">{top_category}</div>
        <div class="kpi-subtitle">₹{top_cat_spending:,.2f} ({(top_cat_spending/total_spending*100 if total_spending else 0):.1f}%)</div>
    </div>
    """, unsafe_allow_html=True)

with col_m4:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">📈 Avg Transaction</div>
        <div class="kpi-value">₹{avg_transaction:,.2f}</div>
        <div class="kpi-subtitle">Per expense item</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ---------------------------------------------------------
# Primary Navigation Tabs
# ---------------------------------------------------------
tab_dash, tab_txns, tab_ml, tab_analysis = st.tabs([
    "📊 Dashboard",
    "💳 Transactions",
    "🤖 ML Insights",
    "📈 Spending Analysis"
])

# =========================================================
# TAB 1: DASHBOARD
# =========================================================
with tab_dash:
    col_left, col_right = st.columns([1, 1])

    category_totals = filtered_expenses.groupby("Category")["Amount"].sum().reset_index()
    category_totals = category_totals.sort_values("Amount", ascending=False)
    category_totals["Percentage"] = (category_totals["Amount"] / total_spending * 100).round(1)

    with col_left:
        st.subheader("🍩 Spending Breakdown (Donut Chart)")
        
        # Color palette for financial categories
        color_map = {
            "Food": "#f97316",
            "Shopping": "#ec4899",
            "Transport": "#06b6d4",
            "Bills": "#3b82f6",
            "Entertainment": "#a855f7",
            "Healthcare": "#10b981",
            "Personal Transfer": "#64748b",
            "Other": "#94a3b8"
        }

        fig_pie = px.pie(
            category_totals,
            names="Category",
            values="Amount",
            hole=0.55,
            color="Category",
            color_discrete_map=color_map,
            hover_data={"Amount": ":.2f", "Percentage": ":.1f%"}
        )
        fig_pie.update_traces(
            textposition='inside',
            textinfo='percent+label',
            hovertemplate="<b>%{label}</b><br>Amount: ₹%{value:,.2f}<br>Share: %{percent}<extra></extra>"
        )
        fig_pie.update_layout(
            showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
            margin=dict(t=20, b=20, l=10, r=10),
            height=360
        )
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_right:
        st.subheader("📊 Category Totals (Sorted)")
        fig_bar = px.bar(
            category_totals,
            x="Amount",
            y="Category",
            orientation="h",
            color="Category",
            color_discrete_map=color_map,
            text=category_totals["Amount"].apply(lambda x: f"₹{x:,.0f}")
        )
        fig_bar.update_layout(
            yaxis={'categoryorder': 'total ascending'},
            xaxis_title="Total Spent (₹)",
            yaxis_title="",
            showlegend=False,
            margin=dict(t=20, b=20, l=10, r=10),
            height=360
        )
        fig_bar.update_traces(textposition='outside')
        st.plotly_chart(fig_bar, use_container_width=True)

    st.markdown("---")

    col_insights, col_top5 = st.columns([1, 1])

    with col_insights:
        st.subheader("💡 Dynamic Spending Insights")
        
        # Calculate dynamic insights
        if not category_totals.empty:
            top_cat_row = category_totals.iloc[0]
            top_name = top_cat_row["Category"]
            top_amt = top_cat_row["Amount"]
            top_pct = top_cat_row["Percentage"]

            icon_dict = {
                "Food": "🍔", "Shopping": "🛍️", "Transport": "🚗",
                "Bills": "💡", "Entertainment": "🍿", "Healthcare": "🏥",
                "Personal Transfer": "💸", "Other": "📦"
            }
            cat_icon = icon_dict.get(top_name, "🏷️")

            st.markdown(f"""
            <div class="insight-pill">
                {cat_icon} <b>{top_name}</b> is your largest expense category. You spent <b>₹{top_amt:,.2f}</b>, representing <b>{top_pct:.1f}%</b> of your total spending.
            </div>
            """, unsafe_allow_html=True)

            potential_saving = top_amt * 0.10
            st.markdown(f"""
            <div class="insight-pill">
                💡 <b>Smart Savings:</b> Reducing <b>{top_name}</b> spending by 10% could save approximately <b>₹{potential_saving:,.2f}</b> this cycle.
            </div>
            """, unsafe_allow_html=True)

            # Anomaly alert insight
            unusual_count = len(filtered_expenses[filtered_expenses["Anomaly"] == "⚠️ Unusual"])
            if unusual_count > 0:
                st.markdown(f"""
                <div class="warning-pill">
                    ⚠️ <b>Anomaly Detected:</b> You have <b>{unusual_count} unusually large transaction(s)</b> that deviate significantly from your baseline average.
                </div>
                """, unsafe_allow_html=True)

            # Shopping / discretionary spending check
            if "Shopping" in category_totals["Category"].values:
                shop_pct = category_totals[category_totals["Category"] == "Shopping"]["Percentage"].values[0]
                if shop_pct > 25:
                    st.markdown(f"""
                    <div class="warning-pill">
                        ⚠️ Your <b>Shopping</b> expenses ({shop_pct:.1f}%) are unusually high compared with your other essential categories.
                    </div>
                    """, unsafe_allow_html=True)

    with col_top5:
        st.subheader("🔥 Top 5 Transactions")
        top_5_df = filtered_expenses.sort_values("Amount", ascending=False).head(5)
        display_top5 = top_5_df[["Description", "Category", "Amount", "Anomaly"]].copy()
        display_top5["Amount"] = display_top5["Amount"].apply(lambda x: f"₹{x:,.2f}")
        st.dataframe(display_top5, use_container_width=True, hide_index=True)


# =========================================================
# TAB 2: TRANSACTIONS
# =========================================================
with tab_txns:
    st.subheader("💳 Filterable Transaction Ledger")
    
    col_s1, col_s2 = st.columns([2, 1])
    with col_s1:
        search_query = st.text_input("🔎 Search transaction merchant or description:", "")
    with col_s2:
        sort_order = st.selectbox("Sort Order", ["Amount (High to Low)", "Amount (Low to High)", "Description (A-Z)"])

    display_df = filtered_expenses.copy()

    if search_query:
        display_df = display_df[display_df["Description"].str.contains(search_query, case=False, na=False)]

    if sort_order == "Amount (High to Low)":
        display_df = display_df.sort_values("Amount", ascending=False)
    elif sort_order == "Amount (Low to High)":
        display_df = display_df.sort_values("Amount", ascending=True)
    else:
        display_df = display_df.sort_values("Description", ascending=True)

    # Format dataframe for presentation
    formatted_table = display_df.copy()
    formatted_table["Formatted Amount"] = formatted_table["Amount"].apply(lambda x: f"₹{x:,.2f}")
    
    if "Confidence" in formatted_table.columns:
        formatted_table["Confidence"] = formatted_table["Confidence"].apply(lambda x: f"{x*100:.0f}%")

    cols_to_show = ["Date", "Description", "Formatted Amount", "Category", "Confidence", "Anomaly"]
    available_cols = [c for c in cols_to_show if c in formatted_table.columns]
    
    st.dataframe(
        formatted_table[available_cols].rename(columns={"Formatted Amount": "Amount"}),
        use_container_width=True,
        hide_index=True
    )

    # Export to CSV
    csv_data = filtered_expenses.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Transactions CSV",
        data=csv_data,
        file_name=f"expense_segregator_export_{datetime.now().strftime('%Y%m%d')}.csv",
        mime="text/csv"
    )


# =========================================================
# TAB 3: ML INSIGHTS
# =========================================================
with tab_ml:
    st.subheader("🤖 Machine Learning Intelligence")

    col_ml1, col_ml2 = st.columns([1, 1])

    with col_ml1:
        st.markdown("### 🌲 Anomaly Detection (IsolationForest)")
        unusual_txns = filtered_expenses[filtered_expenses["Anomaly"] == "⚠️ Unusual"]
        st.metric("Detected Unusual Transactions", f"{len(unusual_txns)} / {len(filtered_expenses)}")

        st.info(
            "💡 **Note on Anomaly Detection:** Scikit-learn's `IsolationForest` identifies transactions that statistically "
            "deviate in amount from your general spending distribution. This highlights large, rare, or outlier purchases "
            "for your review, and does **not** necessarily indicate fraud."
        )

        # Scatter plot of transactions highlighting anomalies
        fig_anomaly = px.strip(
            filtered_expenses,
            x="Category",
            y="Amount",
            color="Anomaly",
            color_discrete_map={"Normal": "#3b82f6", "⚠️ Unusual": "#ef4444"},
            hover_name="Description",
            hover_data={"Amount": ":.2f"}
        )
        fig_anomaly.update_layout(
            height=320,
            margin=dict(t=10, b=20, l=10, r=10),
            yaxis_title="Amount (₹)"
        )
        st.plotly_chart(fig_anomaly, use_container_width=True)

    with col_ml2:
        st.markdown("### 🎯 TF-IDF + Logistic Regression Categorizer")
        st.write("Confidence score distribution for classified transactions:")

        if "Confidence" in filtered_expenses.columns:
            fig_conf = px.histogram(
                filtered_expenses,
                x="Confidence",
                nbins=10,
                color_discrete_sequence=["#8b5cf6"],
                labels={"Confidence": "Model Prediction Confidence"}
            )
            fig_conf.update_layout(
                height=320,
                margin=dict(t=10, b=20, l=10, r=10),
                yaxis_title="Count of Transactions"
            )
            st.plotly_chart(fig_conf, use_container_width=True)

        st.markdown("""
        **Pipeline Architecture:**
        1. **Text Normalization:** Cleans UPI noise tokens and handles spatial OCR line groupings.
        2. **TF-IDF Feature Extractor:** N-gram vectorizer (1-2 words) capturing merchant keywords.
        3. **Logistic Regression Classifier:** Multi-class probabilistic model outputting category probability distributions.
        """)


# =========================================================
# TAB 4: SPENDING ANALYSIS & BUDGETS
# =========================================================
with tab_analysis:
    st.subheader("📈 Spending Trends & Budget Controls")

    col_trend, col_budget = st.columns([1, 1])

    with col_trend:
        st.markdown("### 📅 Monthly / Timeline Trend")
        if has_dates and len(filtered_expenses[filtered_expenses["Date"] != ""]) > 1:
            date_spending = filtered_expenses[filtered_expenses["Date"] != ""].groupby("Date")["Amount"].sum().reset_index()
            date_spending = date_spending.sort_values("Date")
            
            fig_trend = px.line(
                date_spending,
                x="Date",
                y="Amount",
                markers=True,
                line_shape='spline',
                color_discrete_sequence=["#10b981"]
            )
            fig_trend.update_layout(
                height=320,
                margin=dict(t=20, b=20, l=10, r=10),
                yaxis_title="Daily Spend (₹)"
            )
            st.plotly_chart(fig_trend, use_container_width=True)

            # Month comparison if multiple months exist
            filtered_expenses["Month"] = pd.to_datetime(filtered_expenses["Date"], errors='coerce').dt.strftime('%b %Y')
            monthly_agg = filtered_expenses.dropna(subset=["Month"]).groupby("Month")["Amount"].sum()
            if len(monthly_agg) >= 2:
                prev_month = monthly_agg.iloc[-2]
                curr_month = monthly_agg.iloc[-1]
                pct_chg = ((curr_month - prev_month) / prev_month) * 100
                direction_sym = "📈" if pct_chg > 0 else "📉"
                st.markdown(f"""
                <div class="insight-pill">
                    {direction_sym} <b>Period Trend:</b> Current period spending is <b>₹{curr_month:,.2f}</b> vs <b>₹{prev_month:,.2f}</b> in the previous period ({pct_chg:+.1f}% change).
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("ℹ️ Timestamps will populate this trend chart automatically when date headers are detected in the uploaded screenshot.")

    with col_budget:
        st.markdown("### 🎯 Category-wise Budget Warning")
        st.caption("Set custom budget thresholds for your active categories:")

        # Category Budget Defaults
        default_budgets = {
            "Food": 5000.0,
            "Shopping": 3000.0,
            "Transport": 2000.0,
            "Bills": 4000.0,
            "Entertainment": 1500.0,
            "Healthcare": 2500.0,
            "Other": 2000.0,
            "Personal Transfer": 5000.0
        }

        for cat_row in category_totals.itertuples():
            cat_name = cat_row.Category
            spent_amt = cat_row.Amount
            def_limit = default_budgets.get(cat_name, 3000.0)

            budget_limit = st.number_input(
                f"Budget for {cat_name} (₹):",
                min_value=100.0,
                max_value=100000.0,
                value=float(def_limit),
                step=500.0,
                key=f"budget_input_{cat_name}"
            )

            pct_used = min(1.0, spent_amt / budget_limit)
            st.progress(pct_used)

            if spent_amt > budget_limit:
                excess = spent_amt - budget_limit
                st.markdown(f"""
                <div class="danger-pill">
                    🚨 <b>{cat_name} budget exceeded</b> by <b>₹{excess:,.2f}</b> (Spent ₹{spent_amt:,.2f} of ₹{budget_limit:,.2f})
                </div>
                """, unsafe_allow_html=True)
            elif pct_used >= 0.80:
                st.markdown(f"""
                <div class="warning-pill">
                    ⚠️ <b>{cat_name} is at {(pct_used*100):.0f}%</b> of its budget limit (₹{spent_amt:,.2f} / ₹{budget_limit:,.2f}).
                </div>
                """, unsafe_allow_html=True)
            else:
                st.caption(f"✅ ₹{spent_amt:,.2f} spent of ₹{budget_limit:,.2f} limit ({(pct_used*100):.0f}%)")


# =========================================================
# FINANCIAL SUMMARY (AI-Style Deterministic)
# =========================================================
st.markdown("---")
st.subheader("🧠 Financial Summary")

unusual_n = len(filtered_expenses[filtered_expenses["Anomaly"] == "⚠️ Unusual"])
top_cat_pct = (top_cat_spending / total_spending * 100) if total_spending > 0 else 0

summary_text = f"""
**Executive Spending Intelligence:**

• **Total Outflow:** Your total spending is **₹{total_spending:,.2f}** across **{num_transactions}** transactions.
• **Primary Category:** **{top_category}** accounts for **{top_pct:.1f}%** of your overall spending (₹{top_cat_spending:,.2f}), representing your largest single expense driver.
• **Statistical Anomalies:** Detected **{unusual_n}** unusually large transaction(s) requiring review.
• **Smart Optimization:** Reducing spending in **{top_category}** by 10% would optimize monthly liquidity by approximately **₹{(top_cat_spending * 0.10):,.2f}**.
"""

st.markdown(f"""
<div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px 24px; color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">
{summary_text}
</div>
""", unsafe_allow_html=True)
