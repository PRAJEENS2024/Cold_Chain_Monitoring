from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import database, models, schemas
from ..alert_engine import process_telemetry

router = APIRouter(
    prefix="/api/iot",
    tags=["IoT Telemetry"]
)

@router.post("/telemetry")
def ingest_telemetry(payload: schemas.TelemetryPayload, db: Session = Depends(database.get_db)):
    # Authenticate device (simplified for prototype)
    device = db.query(models.Device).filter(models.Device.device_id == payload.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.status = models.DeviceStatusEnum.ONLINE
    device.last_seen = datetime.now(timezone.utc)
    
    # Find active shipment for this device
    shipment = db.query(models.Shipment).filter(
        models.Shipment.device_id == device.id,
        models.Shipment.status.in_(["PENDING", "IN_TRANSIT"])
    ).first()

    if shipment:
        # 1. Store Temperature
        temp_reading = models.TemperatureReading(
            shipment_id=shipment.id,
            device_id=device.id,
            temperature=payload.temperature,
            data_source="ESP32" # Assumed real device if hitting this endpoint
        )
        db.add(temp_reading)
        
        # 2. Store Door Event if state changed (For simplicity, we check last state or just save if specified)
        # We will save continuous state for demo or only changes. 
        # For demo, save changes only:
        last_door_event = db.query(models.DoorEvent).filter(
            models.DoorEvent.shipment_id == shipment.id
        ).order_by(models.DoorEvent.timestamp.desc()).first()
        
        current_state = models.DoorStateEnum.OPEN if payload.door_open else models.DoorStateEnum.CLOSED
        
        if not last_door_event or last_door_event.state != current_state:
            new_door_event = models.DoorEvent(
                shipment_id=shipment.id,
                device_id=device.id,
                state=current_state
            )
            db.add(new_door_event)
        
        # 3. Process Alerts
        process_telemetry(db, device, shipment, payload.temperature, payload.door_open)
        
    db.commit()
    return {"status": "success"}

@router.get("/alerts", response_model=list[schemas.AlertResponse])
def get_alerts(db: Session = Depends(database.get_db)):
    # Returns all alerts
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(database.get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = models.AlertStatusEnum.ACKNOWLEDGED
    alert.acknowledged_at = datetime.now(timezone.utc)
    # in real world, set acknowledged_by from current user token
    db.commit()
    return {"status": "Acknowledged"}

@router.get("/shipment/{shipment_id}/telemetry")
def get_shipment_telemetry(shipment_id: int, db: Session = Depends(database.get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Get last 20 temperature readings
    temps = db.query(models.TemperatureReading).filter(
        models.TemperatureReading.shipment_id == shipment_id
    ).order_by(models.TemperatureReading.timestamp.desc()).limit(20).all()
    
    # Get latest door event
    door_event = db.query(models.DoorEvent).filter(
        models.DoorEvent.shipment_id == shipment_id
    ).order_by(models.DoorEvent.timestamp.desc()).first()
    
    # Reverse temperatures to chronological order for graphs
    temps.reverse()
    readings = [{"time": t.timestamp.strftime('%H:%M:%S'), "temp": t.temperature} for t in temps]
    
    current_temp = temps[-1].temperature if temps else None
    door_open = (door_event.state == models.DoorStateEnum.OPEN) if door_event else False
    
    return {
        "current_temp": current_temp,
        "door_open": door_open,
        "readings": readings,
        "device_status": shipment.device.status if shipment.device else None
    }
