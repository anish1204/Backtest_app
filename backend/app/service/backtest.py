from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import yfinance as yf


def compute_drawdown(equity: pd.Series):
    cummax = equity.cummax()
    drawdown = (equity / cummax - 1) * 100
    return drawdown.min()

# ====== STRATEGIES ======

def sma_crossover(df: pd.DataFrame, short_window: int, long_window: int):
    df["SMA_short"] = df["Close"].rolling(short_window).mean()
    df["SMA_long"] = df["Close"].rolling(long_window).mean()
    df["signal"] = 0
    df.loc[df["SMA_short"] > df["SMA_long"], "signal"] = 1
    df.loc[df["SMA_short"] < df["SMA_long"], "signal"] = -1
    return df

def rsi_strategy(df: pd.DataFrame, period: int = 14, overbought: int = 70, oversold: int = 30):
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))
    df["signal"] = 0
    df.loc[df["RSI"] < oversold, "signal"] = 1
    df.loc[df["RSI"] > overbought, "signal"] = -1
    return df

def buy_hold(df: pd.DataFrame):
    df["signal"] = 1
    return df