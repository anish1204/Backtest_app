from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app import models, schemas
from app.schemas.schemas import PriceCreate
from app.models.models import Price

router = APIRouter()


@router.get("/prices/{company_id}")
def get_prices(company_id: int, db: Session = Depends(get_db)):
    prices = db.query(Price).filter_by(company_id=company_id).all()
    if not prices:
        raise HTTPException(status_code=404, detail="No prices found")
    return prices

@router.post("/prices/")
def create_price(price: PriceCreate, db: Session = Depends(get_db)):
    db_price = models.Price(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price
