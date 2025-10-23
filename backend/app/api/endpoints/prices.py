from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import models, schemas
import yfinance as yf
from datetime import datetime, timedelta
from app.schemas.schemas import PriceCreate
from app.models.models import Price

router = APIRouter()


@router.get("/prices/{symbol}")
def get_prices(symbol: str):
    try:
        # Download last 6 months of daily prices
        data = yf.download(symbol, period="6mo", interval="1d")

        if data.empty:
            raise HTTPException(status_code=404, detail=f"No price data found for {symbol}")

        # Convert to JSON-friendly format
        prices = []
        for index, row in data.iterrows():
            prices.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })

        return {
            "symbol": symbol.upper(),
            "count": len(prices),
            "data": prices
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {symbol}: {str(e)}")


@router.post("/prices/")
def create_price():
    raise HTTPException(status_code=405, detail="Manual price creation disabled — data fetched live from yfinance")
