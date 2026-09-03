from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from .. import database, models, schemas

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics & Prediction"]
)

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    active_shipments = db.query(models.Shipment).filter(models.Shipment.status == "IN_TRANSIT").count()
    
    # Shipments with active critical alerts
    critical_shipments = db.query(models.Shipment).join(models.Alert).filter(
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.severity == models.AlertSeverityEnum.CRITICAL
    ).distinct().count()
    
    warning_shipments = db.query(models.Shipment).join(models.Alert).filter(
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.severity == models.AlertSeverityEnum.WARNING
    ).distinct().count()
    
    safe_shipments = active_shipments - critical_shipments - warning_shipments
    if safe_shipments < 0:
        safe_shipments = 0
        
    offline_devices = db.query(models.Device).filter(models.Device.status == models.DeviceStatusEnum.OFFLINE).count()
    active_alerts = db.query(models.Alert).filter(models.Alert.status == models.AlertStatusEnum.ACTIVE).count()
    
    avg_temp_record = db.query(func.avg(models.TemperatureReading.temperature)).scalar()
    avg_temp = round(avg_temp_record, 2) if avg_temp_record else 0.0

    return {
        "active_shipments": active_shipments,
        "safe_shipments": safe_shipments,
        "warning_shipments": warning_shipments,
        "critical_shipments": critical_shipments,
        "offline_devices": offline_devices,
        "active_alerts": active_alerts,
        "average_temperature": avg_temp
    }

@router.get("/shipment/{shipment_id}/prediction")
def get_temperature_prediction(shipment_id: int, db: Session = Depends(database.get_db)):
    # Very basic linear regression or trend analysis for prototype
    readings = db.query(models.TemperatureReading).filter(
        models.TemperatureReading.shipment_id == shipment_id
    ).order_by(models.TemperatureReading.timestamp.desc()).limit(10).all()
    
    if len(readings) < 5:
        return {"status": "insufficient_data", "message": "Insufficient data for prediction."}
        
    # Reverse to chronological
    readings.reverse()
    
    # Calculate rate of change per reading (assuming roughly equidistant for prototype)
    temp_changes = []
    for i in range(1, len(readings)):
        delta = readings[i].temperature - readings[i-1].temperature
        temp_changes.append(delta)
        
    avg_change = sum(temp_changes) / len(temp_changes)
    
    current_temp = readings[-1].temperature
    predicted_temp = current_temp + (avg_change * 5) # Predict 5 steps ahead (approx 25 seconds in simulator)
    
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    
    risk = "LOW"
    if predicted_temp > shipment.temp_max or predicted_temp < shipment.temp_min:
        risk = "HIGH"
    elif predicted_temp > shipment.temp_max - 1.0 or predicted_temp < shipment.temp_min + 1.0:
        risk = "MEDIUM"

    trend = "Stable"
    if avg_change > 0.1:
        trend = "Increasing"
    elif avg_change < -0.1:
        trend = "Decreasing"

    return {
        "status": "success",
        "current_temp": round(current_temp, 2),
        "predicted_temp": round(predicted_temp, 2),
        "rate_of_change": round(avg_change, 2),
        "trend": trend,
        "prediction_horizon": "25 seconds (simulated)",
        "risk": risk
    }

@router.get("/shipment/{shipment_id}/report")
def get_shipment_report(shipment_id: int, db: Session = Depends(database.get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        return {"error": "Shipment not found"}

    readings = db.query(models.TemperatureReading).filter(
        models.TemperatureReading.shipment_id == shipment_id
    ).all()
    
    door_events = db.query(models.DoorEvent).filter(
        models.DoorEvent.shipment_id == shipment_id
    ).count()

    alerts = db.query(models.Alert).filter(
        models.Alert.shipment_id == shipment_id
    ).count()

    if not readings:
        return {"status": "no_data"}
        
    temps = [r.temperature for r in readings]
    min_temp = min(temps)
    max_temp = max(temps)
    avg_temp = sum(temps) / len(temps)
    
    excursions = db.query(models.Alert).filter(
        models.Alert.shipment_id == shipment_id,
        models.Alert.alert_type.in_([models.AlertTypeEnum.HIGH_TEMPERATURE, models.AlertTypeEnum.LOW_TEMPERATURE])
    ).count()

    # Simple health score logic
    score = 100
    score -= (excursions * 10)
    score -= (alerts * 5)
    score -= (door_events * 2)
    score = max(0, min(100, score))

    return {
        "shipment_id": shipment.shipment_id,
        "product": shipment.product_name,
        "source": shipment.source,
        "destination": shipment.destination,
        "monitoring_period_start": readings[0].timestamp,
        "monitoring_period_end": readings[-1].timestamp,
        "min_temperature": round(min_temp, 2),
        "max_temperature": round(max_temp, 2),
        "avg_temperature": round(avg_temp, 2),
        "total_excursions": excursions,
        "door_events": door_events,
        "total_alerts": alerts,
        "shipment_condition_score": score
    }
