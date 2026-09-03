import asyncio
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal

class SimulatorState:
    def __init__(self):
        self.is_running = False
        self.scenario = "NORMAL" # NORMAL, HIGH_TEMP, LOW_TEMP, DOOR_OPEN, OFFLINE, RAPID_RISE
        self.current_temp = 4.0
        self.door_open = False
        self.task = None
        self.active_shipment_id = None
        self.active_device_id = None

simulator_state = SimulatorState()

async def simulator_loop():
    while True:
        if simulator_state.is_running and simulator_state.active_shipment_id and simulator_state.active_device_id:
            db = SessionLocal()
            try:
                # 1. Update State based on scenario
                if simulator_state.scenario == "NORMAL":
                    # Fluctuate normally around 4.2
                    simulator_state.current_temp += random.uniform(-0.2, 0.2)
                    simulator_state.door_open = False
                elif simulator_state.scenario == "HIGH_TEMP":
                    # Steadily rise above 8C
                    simulator_state.current_temp += random.uniform(0.5, 1.5)
                    simulator_state.door_open = False
                elif simulator_state.scenario == "LOW_TEMP":
                    # Steadily drop below 2C
                    simulator_state.current_temp -= random.uniform(0.5, 1.5)
                    simulator_state.door_open = False
                elif simulator_state.scenario == "RAPID_RISE":
                    simulator_state.current_temp += random.uniform(2.0, 3.5)
                    simulator_state.door_open = False
                elif simulator_state.scenario == "DOOR_OPEN":
                    # Normal temp, door is open
                    simulator_state.current_temp += random.uniform(-0.1, 0.3)
                    simulator_state.door_open = True
                
                # If OFFLINE, skip sending data
                if simulator_state.scenario != "OFFLINE":
                    # Save Temperature
                    temp_reading = models.TemperatureReading(
                        shipment_id=simulator_state.active_shipment_id,
                        device_id=simulator_state.active_device_id,
                        temperature=round(simulator_state.current_temp, 2),
                        data_source="SIMULATOR"
                    )
                    db.add(temp_reading)
                    
                    # Update Device Last Seen
                    device = db.query(models.Device).filter(models.Device.id == simulator_state.active_device_id).first()
                    if device:
                        device.status = models.DeviceStatusEnum.ONLINE
                        device.last_seen = datetime.now(timezone.utc)
                    
                    db.commit()

            except Exception as e:
                print(f"Simulator error: {e}")
            finally:
                db.close()
                
        # Send data every 5 seconds for prototype demonstration
        await asyncio.sleep(5)

def start_simulator():
    if not simulator_state.is_running:
        simulator_state.is_running = True
        if simulator_state.task is None:
            simulator_state.task = asyncio.create_task(simulator_loop())
    return {"status": "Simulator started"}

def stop_simulator():
    simulator_state.is_running = False
    return {"status": "Simulator stopped"}

def set_scenario(scenario: str):
    valid_scenarios = ["NORMAL", "HIGH_TEMP", "LOW_TEMP", "DOOR_OPEN", "OFFLINE", "RAPID_RISE"]
    if scenario in valid_scenarios:
        simulator_state.scenario = scenario
        # Generate door event immediately if door state changes
        db = SessionLocal()
        try:
            if scenario == "DOOR_OPEN":
                simulator_state.door_open = True
                door_event = models.DoorEvent(
                    shipment_id=simulator_state.active_shipment_id,
                    device_id=simulator_state.active_device_id,
                    state=models.DoorStateEnum.OPEN
                )
                db.add(door_event)
                db.commit()
            elif simulator_state.door_open:
                # Was open, now changing scenario, so close it
                simulator_state.door_open = False
                door_event = models.DoorEvent(
                    shipment_id=simulator_state.active_shipment_id,
                    device_id=simulator_state.active_device_id,
                    state=models.DoorStateEnum.CLOSED
                )
                db.add(door_event)
                db.commit()
        finally:
            db.close()
            
        return {"status": f"Scenario set to {scenario}"}
    return {"status": "Invalid scenario"}

def set_active_shipment(shipment_id: int, device_id: int):
    simulator_state.active_shipment_id = shipment_id
    simulator_state.active_device_id = device_id
    # Reset temp based on product defaults later, for now reset to 4.0
    simulator_state.current_temp = 4.0
    return {"status": f"Active shipment set to {shipment_id}"}
