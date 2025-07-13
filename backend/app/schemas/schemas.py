from pydantic import BaseModel,field_validator
from datetime import date
from typing import Optional, List, Dict
import math


class CompanyCreate(BaseModel):
    symbol: str
    name: str
    market_cap: int
    sector: Optional[str]


class PriceCreate(BaseModel):
    company_id: int
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int


class FundamentalCreate(BaseModel):
    company_id: int
    date: date
    metric: str
    value: float


class StrategyCreate(BaseModel):
    name: str
    description: Optional[str]
    parameters: dict


class BacktestRunRequest(BaseModel):
    strategy_id: int
    start_date: date
    end_date: date

class FundamentalResponse(BaseModel):
    id: int
    company_id: int
    date: date
    metric: str
    value: Optional[float]

    @field_validator("value", mode="before")
    def clean_value(cls, v):
        if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
            return 0.0  # or None, if you prefer
        return v
model_config = {
        "from_attributes": True
    }



class Company(CompanyCreate):
    id: int

    class Config:
        orm_mode = True
