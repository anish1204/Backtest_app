from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import companies, prices, fundamentals, strategies, backtest ,news
import requests


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(prices.router)
app.include_router(fundamentals.router)
app.include_router(strategies.router)
app.include_router(backtest.router)
app.include_router(news.router)


@app.get("/test-yf")
def test_yf():
    try:
        r = requests.get("https://query1.finance.yahoo.com/v8/finance/chart/AAPL")
        return {"status": r.status_code, "length": len(r.text)}
    except Exception as e:
        return {"error": str(e)}