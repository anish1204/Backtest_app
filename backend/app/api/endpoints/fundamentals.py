from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import models, schemas
from app.models.models import Fundamental
from typing import List
from app.schemas.schemas import FundamentalCreate ,FundamentalResponse

router = APIRouter()

@router.get("/fundamentals/{company_id}", response_model=List[FundamentalResponse])
def get_fundamentals(company_id: int, db: Session = Depends(get_db)):
    fundamentals = db.query(Fundamental).filter_by(company_id=company_id).all()
    if not fundamentals:
        raise HTTPException(status_code=404, detail="No fundamentals found")
    return fundamentals

@router.post("/fundamentals/")
def create_fundamental(fundamental: FundamentalCreate, db: Session = Depends(get_db)):
    db_fundamental = Fundamental(**fundamental.dict())
    db.add(db_fundamental)
    db.commit()
    db.refresh(db_fundamental)
    return db_fundamental
