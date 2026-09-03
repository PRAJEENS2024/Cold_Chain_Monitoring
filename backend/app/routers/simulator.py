from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, auth
from ..simulator_service import start_simulator, stop_simulator, set_scenario, set_active_shipment, simulator_state

router = APIRouter(
    prefix="/simulator",
    tags=["Simulator (Demo)"]
)

@router.post("/start")
def start():
    return start_simulator()

@router.post("/stop")
def stop():
    return stop_simulator()

@router.post("/scenario/{scenario_name}")
def update_scenario(scenario_name: str):
    return set_scenario(scenario_name)

@router.post("/set-shipment/{shipment_id}")
def setup_simulation_shipment(shipment_id: int, db: Session = Depends(database.get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment or not shipment.device_id:
        raise HTTPException(status_code=400, detail="Invalid shipment or no device assigned")
    return set_active_shipment(shipment.id, shipment.device_id)

@router.get("/status")
def get_simulator_status():
    return {
        "is_running": simulator_state.is_running,
        "scenario": simulator_state.scenario,
        "current_temp": round(simulator_state.current_temp, 2),
        "door_open": simulator_state.door_open,
        "active_shipment_id": simulator_state.active_shipment_id,
        "active_device_id": simulator_state.active_device_id
    }
