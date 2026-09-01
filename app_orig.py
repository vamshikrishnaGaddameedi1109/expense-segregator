import streamlit as st
import pandas as pd
import plotly.express as px

from ocr_utils import extract_text_from_image, parse_transactions_from_text
from categorizer import categorize_transactions

st.set_page_config(page_title="Expense Segregator", layout="wide")
st.title("📱 Expense Segregator")
st.caption("Upload a screenshot of your PhonePe/GPay transaction history.")

uploaded_image = st.file_uploader("Upload screenshot", type=["png", "jpg", "jpeg"])

if not uploaded_image:
    st.stop()

with st.spinner("Reading text from image..."):
    raw_text = extract_text_from_image(uploaded_image)

with st.expander("Show raw OCR text (for debugging)"):
    st.text(raw_text)

df = parse_transactions_from_text(raw_text)

if df.empty:
    st.warning("No transactions detected. Try a clearer, cropped screenshot.")
    st.stop()

df = categorize_transactions(df)

st.subheader("Detected Transactions")
st.dataframe(df, use_container_width=True)

expenses = df[df["Amount"] < 0].copy()
expenses["Amount"] = expenses["Amount"].abs()

col1, col2 = st.columns(2)

with col1:
    st.subheader("Spending by Category")
    category_totals = expenses.groupby("Category")["Amount"].sum().reset_index()
    fig_pie = px.pie(category_totals, names="Category", values="Amount")
    st.plotly_chart(fig_pie, use_container_width=True)

with col2:
    st.subheader("Category Totals")
    st.dataframe(category_totals.sort_values("Amount", ascending=False))

st.subheader("Summary")
total_income = df[df["Amount"] > 0]["Amount"].sum()
total_spent = expenses["Amount"].sum()
st.metric("Total Income", f"₹{total_income:,.2f}")
st.metric("Total Spent", f"₹{total_spent:,.2f}")
st.metric("Net", f"₹{total_income - total_spent:,.2f}")