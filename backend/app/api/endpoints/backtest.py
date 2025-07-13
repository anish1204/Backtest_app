from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import schemas
from app.schemas.schemas import BacktestRunRequest
from app.models import models
from datetime import datetime
import pandas as pd
import numpy as np
from datetime import datetime

router = APIRouter()




@router.post("/backtest/run")
def run_backtest(req: BacktestRunRequest, db: Session = Depends(get_db)):
    # Call your backtest engine here
    # Save results to BacktestResult table
    return {"message": "Backtest started", "strategy_id": req.strategy_id}


@router.post("/run")
def run_backtest(req: BacktestRunRequest, db: Session = Depends(get_db)):
    strategy = db.query(models.Strategy).get(req.strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    # Load top 10 companies by market cap (or you can adapt this to strategy.params)
    companies = (
        db.query(models.Company)
        .order_by(models.Company.market_cap.desc())
        .limit(10)
        .all()
    )
    company_ids = [c.id for c in companies]

    # Load price data
    prices = (
        db.query(models.Price)
        .filter(models.Price.company_id.in_(company_ids))
        .filter(models.Price.date >= req.start_date)
        .filter(models.Price.date <= req.end_date)
        .all()
    )

    if not prices:
        raise HTTPException(status_code=400, detail="No price data in selected period")

    # Prepare DataFrame
    df = pd.DataFrame([
        {'date': p.date, 'company_id': p.company_id, 'close': float(p.close)}
        for p in prices
    ])
    df_pivot = df.pivot(index='date', columns='company_id', values='close').sort_index()
    df_pivot.fillna(method='ffill', inplace=True)

    returns = df_pivot.pct_change().fillna(0)
    portfolio_returns = returns.mean(axis=1)
    equity_curve = (1 + portfolio_returns).cumprod()

    # Metrics
    total_return = equity_curve.iloc[-1] - 1
    n_years = (equity_curve.index[-1] - equity_curve.index[0]).days / 365
    cagr = (equity_curve.iloc[-1])**(1/n_years) - 1 if n_years > 0 else 0
    sharpe = (portfolio_returns.mean() / portfolio_returns.std()) * np.sqrt(252)

    result = models.BacktestResult(
        strategy_id=strategy.id,
        start_date=req.start_date,
        end_date=req.end_date,
        equity_curve={
            "dates": [str(d) for d in equity_curve.index],
            "values": [round(v, 4) for v in equity_curve.tolist()]
        },
        performance_metrics={
            "CAGR": round(cagr*100, 2),
            "Sharpe": round(sharpe, 2),
            "Total Return": round(total_return*100, 2)
        },
        logs={"trades": []},
        created_at=datetime.now()
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "message": "✅ Backtest completed",
        "backtest_id": result.id,
        "strategy_id": strategy.id,
        "metrics": result.performance_metrics
    }


@router.get("/")
def list_backtests(db: Session = Depends(get_db)):
    return db.query(models.BacktestResult).all()

@router.post("/")
def run_backtest(strategy_id: int, start_date: str, end_date: str, db: Session = Depends(get_db)):
    strategy = db.query(models.Strategy).get(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    result = models.BacktestResult(
        strategy_id=strategy.id,
        start_date=start_date,
        end_date=end_date,
        equity_curve={"dates": [], "values": []},  # Dummy
        performance_metrics={"CAGR": 12.5, "Sharpe": 1.1, "MaxDrawdown": -0.2},  # Dummy
        logs={"trades": []},
        created_at=datetime.now()
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result