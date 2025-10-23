from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
import pandas as pd
from app.models import models
import yfinance as yf
from app.schemas.schemas import CompanyCreate, Company

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.post("/", response_model=Company)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Company).filter_by(symbol=company.symbol).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    
    db_company = models.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/search/{query}")
def search_stock(query: str):
    try:
        ticker = yf.Ticker(query)
        info = ticker.info
        return {
            "symbol": info.get("symbol", query),
            "name": info.get("longName", query),
            "sector": info.get("sector", "Unknown"),
        }
    except Exception:
        return {"error": "Not found"}


@router.get("/", response_model=list[Company])
def list_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()

@router.get("/{company_id}/monthly_pnl")
def company_monthly_pnl(company_id: int, db: Session = Depends(get_db)):
    prices = (
        db.query(models.Price)
        .filter(models.Price.company_id == company_id)
        .order_by(models.Price.date)
        .all()
    )

    if not prices:
        raise HTTPException(status_code=404, detail="No price data")

    df = pd.DataFrame([{"date": p.date, "close": float(p.close)} for p in prices])
    df.set_index("date", inplace=True)
    df.index = pd.to_datetime(df.index)
    df = df.resample("M").last()
    df["monthly_return"] = df["close"].pct_change().fillna(0)

    return {
        "dates": [str(d.date()) for d in df.index],
        "returns": [round(v*100, 2) for v in df["monthly_return"]]
    }

@router.get("/top10")
def get_top_10_companies(db: Session = Depends(get_db)):
    companies = (
        db.query(models.Company)
        .order_by(models.Company.market_cap.desc())
        .limit(10)
        .all()
    )
    return [
        {"id": c.id, "name": c.name, "symbol": c.symbol, "market_cap": c.market_cap}
        for c in companies
    ]