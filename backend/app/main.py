import asyncio
import os
import urllib.request
import json
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Ensure environment variables are loaded immediately
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, auth
from .routers import auth as auth_router, devices as devices_router, shipments as shipments_router, simulator as simulator_router, telemetry as telemetry_router, analytics as analytics_router

last_processed_entry_id = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup 1: Ensure all database tables exist
    Base.metadata.create_all(bind=engine)
    
    # Startup 2: Seed admin user & single default device ESP-001
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
            print("Default admin user seeded. Username: admin, Password: admin", flush=True)
            
        esp_device = db.query(models.Device).filter(models.Device.device_id == "ESP-001").first()
        channel_id_env = os.getenv("THINGSPEAK_CHANNEL_ID", "3483882")
        read_key_env = os.getenv("THINGSPEAK_READ_KEY", "QOJPZL5KTMI8Z8MZ")
        
        if not esp_device:
            esp_device = models.Device(
                device_id="ESP-001",
                name="Cold Chain ESP32 Sensor",
                esp32_identifier="04:b2:47:54:b1:88",
                firmware_version="1.0.0",
                thingspeak_channel_id=channel_id_env,
                thingspeak_read_key=read_key_env,
                status=models.DeviceStatusEnum.OFFLINE
            )
            db.add(esp_device)
            db.commit()
            print("Default single device ESP-001 seeded.", flush=True)
        else:
            # Sync hardware and ThingSpeak configuration
            esp_device.thingspeak_channel_id = channel_id_env
            if read_key_env:
                esp_device.thingspeak_read_key = read_key_env
            esp_device.esp32_identifier = "04:b2:47:54:b1:88"
            esp_device.firmware_version = "1.0.0"
            db.commit()
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
    global last_processed_entry_id
    # Small initial delay to allow FastAPI startup
    await asyncio.sleep(2)
    while True:
        try:
            db = SessionLocal()
            try:
                # Target the single physical ESP-001 device
                device = db.query(models.Device).filter(models.Device.device_id == "ESP-001").first()
                if not device:
                    await asyncio.sleep(15)
                    continue
                
                channel_id = device.thingspeak_channel_id or os.getenv("THINGSPEAK_CHANNEL_ID", "3483882")
                read_key = device.thingspeak_read_key or os.getenv("THINGSPEAK_READ_KEY", "QOJPZL5KTMI8Z8MZ")
                
                url = f"https://api.thingspeak.com/channels/{channel_id}/feeds.json?results=15"
                if read_key:
                    url += f"&api_key={read_key}"
                
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'ColdChain-Backend/1.0'})
                    with urllib.request.urlopen(req, timeout=10) as response:
                        data = json.loads(response.read().decode())
                        feeds = data.get('feeds', [])
                        if feeds:
                            # If first poll cycle, determine starting entry_id from DB
                            if last_processed_entry_id is None:
                                last_reading = db.query(models.TemperatureReading).filter(
                                    models.TemperatureReading.device_id == device.id,
                                    models.TemperatureReading.data_source == "THINGSPEAK"
                                ).order_by(models.TemperatureReading.timestamp.desc()).first()
                                
                                if last_reading and last_reading.timestamp:
                                    last_ts = last_reading.timestamp
                                    if last_ts.tzinfo is None:
                                        last_ts = last_ts.replace(tzinfo=timezone.utc)
                                    
                                    new_feeds = []
                                    for f in feeds:
                                        if f.get('created_at'):
                                            try:
                                                f_time = datetime.fromisoformat(f['created_at'].replace('Z', '+00:00'))
                                                if f_time > last_ts:
                                                    new_feeds.append(f)
                                            except Exception:
                                                pass
                                    if not new_feeds:
                                        last_processed_entry_id = feeds[-1].get('entry_id', 0)
                                else:
                                    # First run with empty DB: process the latest feed immediately
                                    new_feeds = feeds[-1:]
                            else:
                                new_feeds = [f for f in feeds if f.get('entry_id', 0) > last_processed_entry_id]

                            for feed in new_feeds:
                                entry_id = feed.get('entry_id')
                                temp_str = feed.get('field1')
                                door_str = feed.get('field2')

                                if temp_str is not None and str(temp_str).strip() != '':
                                    try:
                                        temperature = float(temp_str)
                                        door_open = (str(door_str).strip() == '1')
                                        door_text = "OPEN" if door_open else "CLOSED"

                                        feed_time = datetime.now(timezone.utc)
                                        if feed.get('created_at'):
                                            try:
                                                feed_time = datetime.fromisoformat(feed['created_at'].replace('Z', '+00:00'))
                                            except Exception:
                                                pass

                                        # Optional active shipment link
                                        active_shipment = db.query(models.Shipment).filter(
                                            models.Shipment.device_id == device.id,
                                            models.Shipment.status.in_(["PENDING", "IN_TRANSIT"])
                                        ).first()

                                        # Store telemetry reading
                                        temp_reading = models.TemperatureReading(
                                            shipment_id=active_shipment.id if active_shipment else None,
                                            device_id=device.id,
                                            temperature=temperature,
                                            timestamp=feed_time,
                                            data_source="THINGSPEAK"
                                        )
                                        db.add(temp_reading)

                                        # Update door event state if changed or none recorded
                                        last_door_event = db.query(models.DoorEvent).filter(
                                            models.DoorEvent.device_id == device.id
                                        ).order_by(models.DoorEvent.timestamp.desc()).first()

                                        current_state = models.DoorStateEnum.OPEN if door_open else models.DoorStateEnum.CLOSED
                                        if not last_door_event or last_door_event.state != current_state:
                                            new_door_event = models.DoorEvent(
                                                shipment_id=active_shipment.id if active_shipment else None,
                                                device_id=device.id,
                                                state=current_state,
                                                timestamp=feed_time
                                            )
                                            db.add(new_door_event)

                                        # Freshness & Status update
                                        device.status = models.DeviceStatusEnum.ONLINE
                                        device.last_seen = feed_time

                                        # Run Alert Engine if active
                                        try:
                                            from .alert_engine import process_telemetry
                                            process_telemetry(db, device, active_shipment, temperature, door_open)
                                        except Exception:
                                            pass

                                        db.commit()
                                        last_processed_entry_id = entry_id

                                        # Debug logging (Step 7) without printing API keys
                                        print(
                                            f"[ThingSpeak] ESP-001\n"
                                            f"Temperature: {temperature:.2f} C\n"
                                            f"Door: {door_text}\n"
                                            f"Entry ID: {entry_id}\n"
                                            f"Timestamp: {feed.get('created_at', str(feed_time))}\n"
                                            f"Saved to database successfully",
                                            flush=True
                                        )
                                    except (ValueError, TypeError) as parse_err:
                                        print(f"Error parsing ThingSpeak values ({temp_str}, {door_str}): {parse_err}", flush=True)

                            if feeds and last_processed_entry_id is None:
                                last_processed_entry_id = feeds[-1].get('entry_id', 0)

                except Exception as e:
                    # Clean error without exposing secret API key
                    print(f"ThingSpeak poll check for channel {channel_id}: {type(e).__name__}", flush=True)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"ThingSpeak polling engine loop error: {e}", flush=True)

        # Respect ThingSpeak rate limits (15-20s interval)
        await asyncio.sleep(15)

async def check_device_offline_loop():
    while True:
        try:
            await asyncio.sleep(15) # Check every 15 seconds
            db = SessionLocal()
            try:
                timeout_seconds = int(os.getenv("DEVICE_ONLINE_TIMEOUT_SECONDS", "90"))
                cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=timeout_seconds)
                
                device = db.query(models.Device).filter(models.Device.device_id == "ESP-001").first()
                if device and device.status == models.DeviceStatusEnum.ONLINE:
                    ls = device.last_seen
                    if ls:
                        if ls.tzinfo is None:
                            ls = ls.replace(tzinfo=timezone.utc)
                        if ls < cutoff_time:
                            device.status = models.DeviceStatusEnum.OFFLINE
                            db.commit()
                            print(f"[Device] ESP-001 marked OFFLINE (no telemetry for > {timeout_seconds}s)", flush=True)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Offline check error: {e}", flush=True)

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
