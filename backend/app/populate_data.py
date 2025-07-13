from datetime import datetime
from app.data.nifty100 import NIFTY_100_SYMBOLS
from app.core.db import SessionLocal
from app.models import models
from sqlalchemy.orm import Session
import yfinance as yf
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def save_fundamentals(ticker, company_id, db):
    statements = {
        "balance_sheet": ticker.balance_sheet,
        "financials": ticker.financials,
        "cashflow": ticker.cashflow,
    }

    for name, df in statements.items():
        if df.empty:
            print(f"⚠️ No {name} for company_id {company_id}")
            continue

        for metric in df.index:
            for date, value in df.loc[metric].items():
                db.add(models.Fundamental(
                    company_id=company_id,
                    date=date.date(),
                    metric=f"{name}_{metric}",
                    value=float(value) if value is not None else 0
                ))
    db.commit()
    print(f"📊 Fundamentals saved for company_id {company_id}")


def fetch_and_save_top_100():
    db: Session = SessionLocal()
    print("🚀 Starting data population...")
    for symbol in NIFTY_100_SYMBOLS:
        print(f"🔷 Processing {symbol}...")
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            name = info.get("longName") or info.get("shortName") or symbol
            market_cap = info.get("marketCap") or 0
            sector = info.get("sector") or "Unknown"

            # insert into companies
            company = db.query(models.Company).filter_by(symbol=symbol).first()
            if not company:
                company = models.Company(
                    symbol=symbol,
                    name=name,
                    market_cap=market_cap,
                    sector=sector
                )
                db.add(company)
                db.commit()
                db.refresh(company)
                print(f"✅ Added company: {symbol}")
            company_id = company.id

            # fetch & save price history (last 1y)
            hist = ticker.history(period="1y")
            if hist.empty:
                print(f"⚠️ No price data for {symbol}")
                continue

            count = 0
            for date, row in hist.iterrows():
                existing_price = db.query(models.Price).filter_by(
                    company_id=company_id, date=date.date()).first()
                if not existing_price:
                    price = models.Price(
                        company_id=company_id,
                        date=date.date(),
                        open=float(row["Open"]),
                        high=float(row["High"]),
                        low=float(row["Low"]),
                        close=float(row["Close"]),
                        volume=int(row["Volume"])
                    )

                    db.add(price)
                    count += 1
            db.commit()
            print(f"📈 {count} price rows saved for {symbol}")

            # save fundamentals
            save_fundamentals(ticker, company_id, db)

            time.sleep(1)  # to avoid rate limit

        except Exception as e:
            db.rollback()
            print(f"❌ Error processing {symbol}: {e}")

    db.close()
    print("🎉 Companies, prices, fundamentals populated.")


def insert_dummy_strategy_and_backtest():
    db: Session = SessionLocal()
    try:
        strategy = models.Strategy(
            name="Top ROE Strategy",
            description="Selects top 10 companies by ROE quarterly.",
            created_at=datetime.now(),
            parameters={
                "filter": {"market_cap_min": 1000, "ROE_min": 15},
                "ranking": ["ROE DESC"],
                "position_sizing": "equal_weight",
            }
        )
        db.add(strategy)
        db.commit()
        db.refresh(strategy)
        print(f"📝 Strategy '{strategy.name}' saved (id={strategy.id})")

        result = models.BacktestResult(
            strategy_id=strategy.id,
            start_date=datetime(2023, 1, 1),
            end_date=datetime(2024, 1, 1),
            equity_curve={"dates": [], "values": []},
            performance_metrics={"CAGR": 12.5,
                                 "Sharpe": 1.1, "MaxDrawdown": -0.2},
            logs={"trades": []},
            created_at=datetime.now()
        )
        db.add(result)
        db.commit()
        print(f"📈 Backtest result saved (id={result.id})")

    except Exception as e:
        db.rollback()
        print(f"❌ Error inserting strategy/backtest: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    fetch_and_save_top_100()
    insert_dummy_strategy_and_backtest()
    print("✅ All data populated.")
