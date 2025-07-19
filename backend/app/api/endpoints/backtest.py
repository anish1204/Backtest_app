from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import schemas
from app.schemas.schemas import BacktestRunRequest
from app.models import models
from datetime import datetime
import pandas as pd
import numpy as np

router = APIRouter()

@router.post("/run")
def run_backtest(req: BacktestRunRequest, db: Session = Depends(get_db)):
    strategy = db.query(models.Strategy).get(req.strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    # 🔷 Pick top 10 companies by market cap
    companies = (
        db.query(models.Company)
        .order_by(models.Company.market_cap.desc())
        .limit(10)
        .all()
    )
    company_ids = [c.id for c in companies]

    # 🔷 Fetch price data
    prices = (
        db.query(models.Price)
        .filter(models.Price.company_id.in_(company_ids))
        .filter(models.Price.date >= req.start_date)
        .filter(models.Price.date <= req.end_date)
        .all()
    )

    if not prices:
        raise HTTPException(status_code=400, detail="No price data in selected period")

    # 🔷 Prepare dataframe
    df = pd.DataFrame([
        {'date': p.date, 'company_id': p.company_id, 'close': float(p.close)}
        for p in prices
    ])
    df_pivot = df.pivot(index='date', columns='company_id', values='close').sort_index()
    df_pivot.index = pd.to_datetime(df_pivot.index)
    df_pivot.ffill(inplace=True)

    returns = df_pivot.pct_change().fillna(0)

    # 🔷 Start with initial capital
    capital = req.initial_capital or 100_000
    rebalance_frequency = 'Q-DEC'  # quarterly

    portfolio_weights = pd.Series(1 / len(company_ids), index=company_ids)

    equity = capital
    equity_curve = []
    allocation_history = []  # 👈 new

    for rebalance_date, period_data in returns.groupby(pd.Grouper(freq=rebalance_frequency)):
        period_returns = (period_data + 1).prod() - 1
        period_return = portfolio_weights.dot(period_returns.fillna(0))

        equity *= (1 + period_return)

    # save allocation for this date
        allocations = {
            str(company_id): round(equity * weight, 2)
            for company_id, weight in portfolio_weights.items()
        }

        equity_curve.append({
            "date": rebalance_date.strftime("%Y-%m-%d"),
            "capital": round(equity, 2)
        })

        allocation_history.append({
            "date": rebalance_date.strftime("%Y-%m-%d"),
            "allocations": allocations
        })


    # 📊 Metrics
    final_value = equity
    total_return = (final_value / capital) - 1
    n_years = (df_pivot.index[-1] - df_pivot.index[0]).days / 365
    cagr = (final_value / capital) ** (1 / n_years) - 1 if n_years > 0 else 0
    portfolio_returns = returns.mean(axis=1)
    sharpe = (portfolio_returns.mean() / portfolio_returns.std()) * np.sqrt(252)

    result = models.BacktestResult(
        strategy_id=strategy.id,
        start_date=req.start_date,
        end_date=req.end_date,
        equity_curve={
            "dates": [e["date"] for e in equity_curve],
            "values": [e["capital"] for e in equity_curve]
        },
        performance_metrics={
            "CAGR": round(cagr * 100, 2),
            "Sharpe": round(sharpe, 2),
            "Total Return": round(total_return * 100, 2)
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
    "metrics": result.performance_metrics,
    "equity_curve": equity_curve,
    "allocation_history": allocation_history  # 👈 Add this
    }
