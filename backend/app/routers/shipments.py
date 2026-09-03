from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/shipments",
    tags=["Shipments"]
)

@router.get("/", response_model=List[schemas.ShipmentResponse])
def get_shipments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Role based filtering can be applied here
    # Operators might only see their assigned shipments
    if current_user.role == models.RoleEnum.OPERATOR:
        shipments = db.query(models.Shipment).filter(models.Shipment.assigned_operator_id == current_user.id).offset(skip).limit(limit).all()
    else:
        shipments = db.query(models.Shipment).offset(skip).limit(limit).all()
    return shipments

@router.post("/", response_model=schemas.ShipmentResponse, status_code=status.HTTP_201_CREATED)
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_manager)):
    db_shipment = db.query(models.Shipment).filter(models.Shipment.shipment_id == shipment.shipment_id).first()
    if db_shipment:
        raise HTTPException(status_code=400, detail="Shipment ID already registered")
    
    new_shipment = models.Shipment(**shipment.model_dump())
    db.add(new_shipment)
    db.commit()
    db.refresh(new_shipment)
    return new_shipment

@router.get("/{shipment_id}", response_model=schemas.ShipmentResponse)
def get_shipment(shipment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    # Check operator access
    if current_user.role == models.RoleEnum.OPERATOR and shipment.assigned_operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this shipment")
    return shipment

@router.delete("/{shipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipment(shipment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    db.delete(shipment)
    db.commit()
    return None
