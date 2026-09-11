from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, auth
from .routers import auth as auth_router, devices as devices_router, shipments as shipments_router, simulator as simulator_router, telemetry as telemetry_router, analytics as analytics_router
import asyncio
import os
import urllib.request
import json
from datetime import datetime, timezone, timedelta

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed admin user if it doesn't exist
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            hashed_password = auth.get_password_hash("admin")
            new_admin = models.User(
                username="admin",
                email="admin@coldchain.local",
                hashed_password=hashed_password,
                role=models.RoleEnum.ADMIN
            )
            db.add(new_admin)
            db.commit()
            print("Default admin user seeded. Username: admin, Password: admin")
    finally:
        db.close()
        
    # Start background tasks
    task = asyncio.create_task(check_device_offline_loop())
    ts_task = asyncio.create_task(poll_thingspeak_loop())
    yield
    # Shutdown logic
    task.cancel()
    ts_task.cancel()

async def poll_thingspeak_loop():
    while True:
        try:
            await asyncio.sleep(20) # Poll every 20 seconds
            db = SessionLocal()
            try:
                # Find all devices with ThingSpeak config
                all_devices = db.query(models.Device).filter(
                    models.Device.thingspeak_channel_id.isnot(None),
                    models.Device.thingspeak_read_key.isnot(None)
                ).all()
                
                for device in all_devices:
                    url = f"https://api.thingspeak.com/channels/{device.thingspeak_channel_id}/feeds.json?api_key={device.thingspeak_read_key}&results=1"
                    try:
                        req = urllib.request.Request(url)
                        with urllib.request.urlopen(req) as response:
                            data = json.loads(response.read().decode())
                            feeds = data.get('feeds', [])
                            if feeds:
                                latest = feeds[0]
                                temp_str = latest.get('field1')
                                door_str = latest.get('field2')
                                
                                # Update Device Status unconditionally
                                device.status = models.DeviceStatusEnum.ONLINE
                                device.last_seen = datetime.now(timezone.utc)
                                db.commit()
                                
                                if temp_str is not None:
                                    temperature = float(temp_str)
                                    door_open = True if door_str == '1' else False
                                    
                                    # Find active shipment for this device
                                    active_shipment = db.query(models.Shipment).filter(
                                        models.Shipment.device_id == device.id,
                                        models.Shipment.status.in_(["PENDING", "IN_TRANSIT"])
                                    ).first()
                                    
                                    if active_shipment:
                                        # Save Temperature
                                        temp_reading = models.TemperatureReading(
                                            shipment_id=active_shipment.id,
                                            device_id=device.id,
                                            temperature=temperature,
                                            data_source="THINGSPEAK"
                                        )
                                        db.add(temp_reading)
                                        
                                        # Save Door Event if changed
                                        last_door_event = db.query(models.DoorEvent).filter(
                                            models.DoorEvent.shipment_id == active_shipment.id
                                        ).order_by(models.DoorEvent.timestamp.desc()).first()
                                        
                                        current_state = models.DoorStateEnum.OPEN if door_open else models.DoorStateEnum.CLOSED
                                        
                                        if not last_door_event or last_door_event.state != current_state:
                                            new_door_event = models.DoorEvent(
                                                shipment_id=active_shipment.id,
                                                device_id=device.id,
                                                state=current_state
                                            )
                                            db.add(new_door_event)
                                            
                                        # Process Alerts
                                        from .alert_engine import process_telemetry
                                        process_telemetry(db, device, active_shipment, temperature, door_open)
                                        
                                        db.commit()
                        except Exception as e:
                            print(f"Error polling ThingSpeak for device {device.id}: {e}")
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"ThingSpeak polling engine error: {e}")

async def check_device_offline_loop():
    while True:
        try:
            await asyncio.sleep(30) # Run every 30 seconds
            db = SessionLocal()
            try:
                timeout_seconds = int(os.getenv("DEVICE_ONLINE_TIMEOUT_SECONDS", "60"))
                cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=timeout_seconds)
                
                # Find devices that are ONLINE but haven't been seen since cutoff
                stale_devices = db.query(models.Device).filter(
                    models.Device.status == models.DeviceStatusEnum.ONLINE,
                    models.Device.last_seen < cutoff_time
                ).all()
                
                for device in stale_devices:
                    device.status = models.DeviceStatusEnum.OFFLINE
                    
                    # Create an alert if there's an active shipment
                    active_shipment = db.query(models.Shipment).filter(
                        models.Shipment.device_id == device.id,
                        models.Shipment.status.in_(["PENDING", "IN_TRANSIT"])
                    ).first()
                    
                    if active_shipment:
                        # Deduplicate offline alert
                        existing_alert = db.query(models.Alert).filter(
                            models.Alert.shipment_id == active_shipment.id,
                            models.Alert.status == models.AlertStatusEnum.ACTIVE,
                            models.Alert.alert_type == models.AlertTypeEnum.DEVICE_OFFLINE
                        ).first()
                        
                        if not existing_alert:
                            new_alert = models.Alert(
                                shipment_id=active_shipment.id,
                                device_id=device.id,
                                alert_type=models.AlertTypeEnum.DEVICE_OFFLINE,
                                severity=models.AlertSeverityEnum.CRITICAL,
                                message=f"Device {device.device_id} went offline."
                            )
                            db.add(new_alert)
                if stale_devices:
                    db.commit()
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Offline check error: {e}")

app = FastAPI(
    title="IoT Cold Chain API",
    description="API for Intelligent Cold Chain Monitoring and Predictive Analytics System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(auth_router.router)
app.include_router(devices_router.router)
app.include_router(shipments_router.router)
app.include_router(simulator_router.router)
app.include_router(telemetry_router.router)
app.include_router(analytics_router.router)
