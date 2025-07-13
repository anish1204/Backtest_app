from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import models, schemas
from datetime import datetime
from app.schemas.schemas import StrategyCreate
from app.models.models import Strategy

router = APIRouter()


@router.put("/{strategy_id}")
def update_strategy(strategy_id: int, name: str, description: str, parameters: dict, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).get(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy.name = name
    strategy.description = description
    strategy.parameters = parameters
    db.commit()
    return strategy

@router.delete("/{strategy_id}")
def delete_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).get(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    db.delete(strategy)
    db.commit()
    return {"detail": "Deleted"}
@router.post("/")
def create_strategy(name: str, description: str, parameters: dict, db: Session = Depends(get_db)):
    strategy = Strategy(
        name=name,
        description=description,
        created_at=datetime.now(),
        parameters=parameters
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy

@router.post("/strategies/")
def create_strategy(strategy: StrategyCreate, db: Session = Depends(get_db)):
    db_strategy = Strategy(
        name=strategy.name,
        description=strategy.description,
        parameters=strategy.parameters,
        created_at=datetime.now()
    )
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy


@router.get("/strategies/")
def list_strategies(db: Session = Depends(get_db)):
    return db.query(Strategy).all()
