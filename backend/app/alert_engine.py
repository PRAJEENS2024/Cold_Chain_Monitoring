from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from . import models

def process_telemetry(db: Session, device: models.Device, shipment: models.Shipment, temperature: float, door_open: bool):
    # 1. Temperature Alert Logic
    # Check if there is already an active temperature alert for this shipment
    active_temp_alert = db.query(models.Alert).filter(
        models.Alert.shipment_id == shipment.id,
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.alert_type.in_([models.AlertTypeEnum.HIGH_TEMPERATURE, models.AlertTypeEnum.LOW_TEMPERATURE])
    ).first()

    if temperature > shipment.temp_max:
        if not active_temp_alert:
            new_alert = models.Alert(
                shipment_id=shipment.id,
                device_id=device.id,
                alert_type=models.AlertTypeEnum.HIGH_TEMPERATURE,
                severity=models.AlertSeverityEnum.CRITICAL,
                message=f"Temperature {temperature}°C exceeds safe maximum of {shipment.temp_max}°C"
            )
            db.add(new_alert)
    elif temperature < shipment.temp_min:
        if not active_temp_alert:
            new_alert = models.Alert(
                shipment_id=shipment.id,
                device_id=device.id,
                alert_type=models.AlertTypeEnum.LOW_TEMPERATURE,
                severity=models.AlertSeverityEnum.CRITICAL,
                message=f"Temperature {temperature}°C is below safe minimum of {shipment.temp_min}°C"
            )
            db.add(new_alert)
    else:
        # If temp is back to normal, we could auto-resolve, but for now we leave it for manual resolution/acknowledgment
        pass

    # 2. Door Open Alert Logic
    # For a real system, we'd calculate duration. 
    # Here, if door is open and an active alert doesn't exist, we can create one if it's been open 'too long'.
    # Since we are receiving continuous telemetry, if door is open, we check the last closed event.
    
    active_door_alert = db.query(models.Alert).filter(
        models.Alert.shipment_id == shipment.id,
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.alert_type == models.AlertTypeEnum.DOOR_OPEN_TOO_LONG
    ).first()

    if door_open and not active_door_alert:
        # For prototype, we generate alert immediately on 'open' if none exists.
        # Ideally, we would check if (now - last_door_open_event) > threshold
        new_alert = models.Alert(
            shipment_id=shipment.id,
            device_id=device.id,
            alert_type=models.AlertTypeEnum.DOOR_OPEN_TOO_LONG,
            severity=models.AlertSeverityEnum.WARNING,
            message="Door has been opened during shipment."
        )
        db.add(new_alert)
