import yfinance as yf

df = yf.download("AAPL", start="2024-01-01", end="2024-10-18")
print(df.head())
