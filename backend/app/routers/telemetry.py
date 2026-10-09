import os
from fastapi import APIRouter, Depends, HTTPException, status, Response
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

    # 1. Store Temperature
    temp_reading = models.TemperatureReading(
        shipment_id=shipment.id if shipment else None,
        device_id=device.id,
        temperature=payload.temperature,
        data_source="ESP32"
    )
    db.add(temp_reading)
    
    # 2. Store Door Event if state changed
    door_query = db.query(models.DoorEvent).filter(
        models.DoorEvent.device_id == device.id
    )
    if shipment:
        door_query = door_query.filter(models.DoorEvent.shipment_id == shipment.id)
    last_door_event = door_query.order_by(models.DoorEvent.timestamp.desc()).first()
    
    current_state = models.DoorStateEnum.OPEN if payload.door_open else models.DoorStateEnum.CLOSED
    
    if not last_door_event or last_door_event.state != current_state:
        new_door_event = models.DoorEvent(
            shipment_id=shipment.id if shipment else None,
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
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(database.get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = models.AlertStatusEnum.ACKNOWLEDGED
    alert.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "Acknowledged"}

@router.get("/device/{device_id}/telemetry", response_model=schemas.DeviceTelemetryResponse)
def get_device_telemetry(device_id: str, response: Response, db: Session = Depends(database.get_db)):
    # Step 11: Anti-caching HTTP headers
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    # Get last 20 temperature readings for this device
    temps = db.query(models.TemperatureReading).filter(
        models.TemperatureReading.device_id == device.id
    ).order_by(models.TemperatureReading.timestamp.desc()).limit(20).all()
    
    # Get latest door event for this device
    door_event = db.query(models.DoorEvent).filter(
        models.DoorEvent.device_id == device.id
    ).order_by(models.DoorEvent.timestamp.desc()).first()

    temps.reverse()
    readings = [
        {
            "time": t.timestamp.strftime('%H:%M:%S') if t.timestamp else '--',
            "temp": round(t.temperature, 2)
        } for t in temps
    ]

    current_temp = round(temps[-1].temperature, 2) if temps else None
    door_open = (door_event.state == models.DoorStateEnum.OPEN) if door_event else False

    timeout_seconds = int(os.getenv("DEVICE_ONLINE_TIMEOUT_SECONDS", "90"))
    seconds_ago = None
    status_str = "OFFLINE"

    if device.last_seen:
        now_utc = datetime.now(timezone.utc)
        ls = device.last_seen if device.last_seen.tzinfo else device.last_seen.replace(tzinfo=timezone.utc)
        seconds_ago = max(0, int((now_utc - ls).total_seconds()))
        
        # Step 6: Telemetry Freshness logic
        if seconds_ago <= timeout_seconds:
            status_str = "ONLINE"
            if device.status != models.DeviceStatusEnum.ONLINE:
                device.status = models.DeviceStatusEnum.ONLINE
                db.commit()
        else:
            status_str = "OFFLINE"
            if device.status != models.DeviceStatusEnum.OFFLINE:
                device.status = models.DeviceStatusEnum.OFFLINE
                db.commit()
    else:
        status_str = "OFFLINE"

    return {
        "device_id": device.device_id,
        "status": status_str,
        "last_seen": device.last_seen,
        "last_updated_seconds_ago": seconds_ago,
        "current_temp": current_temp,
        "door_open": door_open,
        "door_status": "OPEN" if door_open else "CLOSED",
        "readings": readings,
        "message": None
    }

@router.get("/shipment/{shipment_id}/telemetry")
def get_shipment_telemetry(shipment_id: int, db: Session = Depends(database.get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    temps = db.query(models.TemperatureReading).filter(
        models.TemperatureReading.shipment_id == shipment_id
    ).order_by(models.TemperatureReading.timestamp.desc()).limit(20).all()
    
    door_event = db.query(models.DoorEvent).filter(
        models.DoorEvent.shipment_id == shipment_id
    ).order_by(models.DoorEvent.timestamp.desc()).first()
    
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
