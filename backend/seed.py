import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models, auth
from datetime import datetime, timezone

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # 1. Admin user
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        hashed_password = auth.get_password_hash("admin")
        admin_user = models.User(
            username="admin",
            email="admin@coldchain.local",
            hashed_password=hashed_password,
            role=models.RoleEnum.ADMIN
        )
        db.add(admin_user)
        db.commit()
        print("Admin user seeded.")
    else:
        print("Admin user already exists.")

    # 2. Single default device: ESP-001
    esp_device = db.query(models.Device).filter(models.Device.device_id == "ESP-001").first()
    if not esp_device:
        esp_device = models.Device(
            device_id="ESP-001",
            name="Cold Chain ESP32 Sensor",
            esp32_identifier="04:b2:47:54:b1:88",
            firmware_version="1.0.0",
            thingspeak_channel_id=os.getenv("THINGSPEAK_CHANNEL_ID", "3483882"),
            thingspeak_read_key=os.getenv("THINGSPEAK_READ_KEY", None),
            status=models.DeviceStatusEnum.OFFLINE
        )
        db.add(esp_device)
        db.commit()
        print("Default single device ESP-001 seeded.")
    else:
        print("ESP-001 already exists in database.")
finally:
    db.close()
