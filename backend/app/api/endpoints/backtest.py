from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import schemas
from app.schemas.schemas import BacktestRunRequest,BacktestRequest,BacktestResponse
from app.models import models
from datetime import datetime
import pandas as pd
import numpy as np
import yfinance as yf

from app.service.backtest import rsi_strategy,sma_crossover,buy_hold,compute_drawdown

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



# @router.post("/backtest/{symbol}", response_model=BacktestResponse)
@router.post("/backtest/{symbol}", response_model=BacktestResponse)
def run_backtest(symbol: str, req: BacktestRequest):
    import yfinance as yf
    import pandas as pd
    import numpy as np

    print(f"🔹 Running backtest for: {symbol}")

    # --- Download data ---
    try:
        df = yf.download(symbol, start=req.start_date, end=req.end_date, progress=False, group_by='ticker')
    except Exception as e:
        print(f"⚠️ Failed to fetch {symbol}: {e}")
        return {
            "summary": {"total_return": 0.0, "win_rate": 0.0, "max_drawdown": 0.0},
            "equity_curve": [],
            "trades": [],
        }

    # --- Handle MultiIndex (Ticker/Date) ---
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[-1] for col in df.columns.to_flat_index()]  # Flatten column names
    if "Date" not in df.columns and not df.index.empty:
        df = df.reset_index().rename(columns={"index": "Date"})

    # --- Validate Data ---
    if df.empty or "Close" not in df.columns:
        print("⚠️ Empty or invalid data for", symbol)
        return {
            "summary": {"total_return": 0.0, "win_rate": 0.0, "max_drawdown": 0.0},
            "equity_curve": [],
            "trades": [],
        }

    df["Date"] = pd.to_datetime(df["Date"])

    # --- STRATEGY LOGIC ---
    if req.strategy == "sma_crossover":
        short = int(req.params.get("short_window", 20))
        long = int(req.params.get("long_window", 50))
        df["SMA_short"] = df["Close"].rolling(short).mean()
        df["SMA_long"] = df["Close"].rolling(long).mean()
        df["signal"] = 0
        df.loc[df["SMA_short"] > df["SMA_long"], "signal"] = 1
        df.loc[df["SMA_short"] < df["SMA_long"], "signal"] = -1
    elif req.strategy == "rsi":
        period = int(req.params.get("period", 14))
        delta = df["Close"].diff()
        gain = delta.clip(lower=0).rolling(window=period).mean()
        loss = (-delta.clip(upper=0)).rolling(window=period).mean()
        rs = gain / loss
        df["RSI"] = 100 - (100 / (1 + rs))
        df["signal"] = 0
        df.loc[df["RSI"] < 30, "signal"] = 1
        df.loc[df["RSI"] > 70, "signal"] = -1
    else:
        df["signal"] = 1  # buy & hold

    # --- RETURNS ---
    df["daily_return"] = df["Close"].pct_change()
    df["strategy_return"] = df["signal"].shift(1) * df["daily_return"]
    df["equity"] = (1 + df["strategy_return"].fillna(0)).cumprod() * 100

    # --- METRICS ---
    total_return = float(df["equity"].iloc[-1] - 100)
    win_rate = float((df["strategy_return"] > 0).sum() / df["strategy_return"].count() * 100)
    max_drawdown = float(((df["equity"] / df["equity"].cummax() - 1).min()) * 100)

    # --- EQUITY CURVE ---
    equity_curve = [
        {"date": str(pd.Timestamp(d).date()), "value": float(v)}
        for d, v in zip(df["Date"], df["equity"])
    ]

    # --- TRADES ---
    trades = []
    signals = df[df["signal"].diff() != 0].reset_index(drop=True)
    for i in range(1, len(signals)):
        entry = signals.iloc[i - 1]
        exit = signals.iloc[i]

        entry_date = pd.Timestamp(entry["Date"]).to_pydatetime().date()
        exit_date = pd.Timestamp(exit["Date"]).to_pydatetime().date()

        trades.append({
            "entry_date": str(entry_date),
            "exit_date": str(exit_date),
            "entry_price": round(float(entry["Close"]), 2),
            "exit_price": round(float(exit["Close"]), 2),
            "return_pct": round((float(exit["Close"]) / float(entry["Close"]) - 1) * 100, 2)
        })

    print(f"✅ Backtest complete for {symbol} — {len(trades)} trades executed")

    return {
        "summary": {
            "total_return": round(total_return, 2),
            "win_rate": round(win_rate, 2),
            "max_drawdown": round(max_drawdown, 2),
        },
        "equity_curve": equity_curve,
        "trades": trades,
    }
