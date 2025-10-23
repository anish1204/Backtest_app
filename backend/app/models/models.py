from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, JSON, BigInteger, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    market_cap = Column(BigInteger)
    sector = Column(String, nullable=True)

    prices = relationship("Price", back_populates="company")
    fundamentals = relationship("Fundamental", back_populates="company")


class Price(Base):
    __tablename__ = "prices"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    date = Column(Date)
    open = Column(Numeric)
    high = Column(Numeric)
    low = Column(Numeric)
    close = Column(Numeric)
    volume = Column(BigInteger)

    company = relationship("Company", back_populates="prices")


class Fundamental(Base):
    __tablename__ = "fundamentals"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    date = Column(Date)
    metric = Column(String)
    value = Column(Numeric)

    company = relationship("Company", back_populates="fundamentals")


class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    created_at = Column(TIMESTAMP)
    parameters = Column(JSON)


class BacktestResult(Base):
    __tablename__ = "backtest_results"
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    equity_curve = Column(JSON)
    performance_metrics = Column(JSON)
    logs = Column(JSON)
    created_at = Column(TIMESTAMP)
