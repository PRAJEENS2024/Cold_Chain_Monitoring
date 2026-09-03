import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from datetime import datetime, timezone, timedelta

db = SessionLocal()

try:
    # Check if we already have devices
    if db.query(models.Device).count() == 0:
        d1 = models.Device(device_id="ESP32-001", name="Sensor Alpha", esp32_identifier="MAC:A1:B2")
        d2 = models.Device(device_id="ESP32-002", name="Sensor Beta", esp32_identifier="MAC:C3:D4")
        db.add_all([d1, d2])
        db.commit()
        db.refresh(d1)
        db.refresh(d2)
        
        # Add Shipments
        s1 = models.Shipment(
            shipment_id="CC-1020",
            product_name="Pfizer Vaccine",
            product_category="Vaccine",
            quantity=500,
            source="London Hub",
            destination="Manchester Clinic",
            temp_min=2.0,
            temp_max=8.0,
            status="IN_TRANSIT",
            device_id=d1.id,
            start_time=datetime.now(timezone.utc) - timedelta(hours=2)
        )
        s2 = models.Shipment(
            shipment_id="CC-2044",
            product_name="Premium Dairy Milk",
            product_category="Dairy",
            quantity=1000,
            source="Yorkshire Farm",
            destination="Leeds Supermarket",
            temp_min=0.0,
            temp_max=4.0,
            status="IN_TRANSIT",
            device_id=d2.id,
            start_time=datetime.now(timezone.utc) - timedelta(hours=5)
        )
        db.add_all([s1, s2])
        db.commit()
        print("Database seeded with 2 devices and 2 shipments.")
    else:
        print("Database already seeded.")
finally:
    db.close()
