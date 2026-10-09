from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from . import models

def process_telemetry(db: Session, device: models.Device, shipment: Optional[models.Shipment] = None, temperature: float = 0.0, door_open: bool = False):
    temp_min = shipment.temp_min if shipment else 2.0
    temp_max = shipment.temp_max if shipment else 8.0
    shipment_id = shipment.id if shipment else None

    # 1. Temperature Alert Logic
    query = db.query(models.Alert).filter(
        models.Alert.device_id == device.id,
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.alert_type.in_([models.AlertTypeEnum.HIGH_TEMPERATURE, models.AlertTypeEnum.LOW_TEMPERATURE])
    )
    if shipment_id:
        query = query.filter(models.Alert.shipment_id == shipment_id)
    active_temp_alert = query.first()

    if temperature > temp_max:
        if not active_temp_alert:
            new_alert = models.Alert(
                shipment_id=shipment_id,
                device_id=device.id,
                alert_type=models.AlertTypeEnum.HIGH_TEMPERATURE,
                severity=models.AlertSeverityEnum.CRITICAL,
                message=f"Temperature {temperature}°C exceeds safe maximum of {temp_max}°C"
            )
            db.add(new_alert)
    elif temperature < temp_min:
        if not active_temp_alert:
            new_alert = models.Alert(
                shipment_id=shipment_id,
                device_id=device.id,
                alert_type=models.AlertTypeEnum.LOW_TEMPERATURE,
                severity=models.AlertSeverityEnum.CRITICAL,
                message=f"Temperature {temperature}°C is below safe minimum of {temp_min}°C"
            )
            db.add(new_alert)

    # 2. Door Open Alert Logic
    door_query = db.query(models.Alert).filter(
        models.Alert.device_id == device.id,
        models.Alert.status == models.AlertStatusEnum.ACTIVE,
        models.Alert.alert_type == models.AlertTypeEnum.DOOR_OPEN_TOO_LONG
    )
    if shipment_id:
        door_query = door_query.filter(models.Alert.shipment_id == shipment_id)
    active_door_alert = door_query.first()

    if door_open and not active_door_alert:
        new_alert = models.Alert(
            shipment_id=shipment_id,
            device_id=device.id,
            alert_type=models.AlertTypeEnum.DOOR_OPEN_TOO_LONG,
            severity=models.AlertSeverityEnum.WARNING,
            message=f"Door is OPEN on device {device.device_id}."
        )
        db.add(new_alert)
