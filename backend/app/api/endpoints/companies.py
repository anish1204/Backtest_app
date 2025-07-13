from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models import models
from app.schemas.schemas import CompanyCreate, Company

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.post("/", response_model=Company)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Company).filter_by(symbol=company.symbol).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    
    db_company = models.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/", response_model=list[Company])
def list_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()
