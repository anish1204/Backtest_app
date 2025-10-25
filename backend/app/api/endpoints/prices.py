from fastapi import APIRouter, Depends,HTTPException,Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import models, schemas
import yfinance as yf
from datetime import datetime, timedelta

from app.schemas.schemas import PriceCreate
from app.models.models import Price
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/prices/{symbol}")
def get_prices(
    symbol: str,
    start_date: str | None = Query(None, description="YYYY-MM-DD"),
    end_date: str | None = Query(None, description="YYYY-MM-DD"),
):
    try:
        # If dates not provided → default to last 6 months
        if not start_date and not end_date:
            data = yf.download(symbol, period="6mo", interval="1d")
        else:
            # Parse dates
            if not start_date:
                start_date = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y-%m-%d")

            data = yf.download(symbol, start=start_date, end=end_date, interval="1d")

        if data.empty:
            raise HTTPException(status_code=404, detail=f"No price data found for {symbol}")

        # Convert to JSON-friendly format
        prices = [
            {
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for index, row in data.iterrows()
        ]

        return {
            "symbol": symbol.upper(),
            "count": len(prices),
            "data": prices,
            "range": {"start": start_date, "end": end_date},
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {symbol}: {str(e)}")


@router.post("/prices/")
def create_price():
    raise HTTPException(status_code=405, detail="Manual price creation disabled — data fetched live from yfinance")
