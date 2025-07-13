from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import companies, prices, fundamentals, strategies, backtest

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
