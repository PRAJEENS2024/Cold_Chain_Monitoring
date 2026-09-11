from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .models import RoleEnum, AlertSeverityEnum, AlertStatusEnum, DeviceStatusEnum, DoorStateEnum, AlertTypeEnum

# Base generic schemas will go here
class UserBase(BaseModel):
    username: str
    email: str
    role: RoleEnum = RoleEnum.OPERATOR

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Devices ---
class DeviceBase(BaseModel):
    device_id: str
    name: Optional[str] = None
    esp32_identifier: Optional[str] = None
    firmware_version: Optional[str] = None
    thingspeak_channel_id: Optional[str] = None
    thingspeak_read_key: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: int
    status: DeviceStatusEnum
    last_seen: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Shipments ---
class ShipmentBase(BaseModel):
    shipment_id: str
    product_name: str
    product_category: str
    quantity: int = 1
    source: str
    destination: str
    expected_delivery: Optional[datetime] = None
    temp_min: float
    temp_max: float
    device_id: Optional[int] = None
    assigned_operator_id: Optional[int] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentResponse(ShipmentBase):
    id: int
    start_time: Optional[datetime] = None
    status: str
    created_at: datetime
    device: Optional[DeviceResponse] = None
    assigned_operator: Optional[UserResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- Telemetry ---
class TelemetryPayload(BaseModel):
    device_id: str
    temperature: float
    door_open: bool
    timestamp: Optional[datetime] = None

class TemperatureReadingResponse(BaseModel):
    id: int
    timestamp: datetime
    temperature: float
    data_source: str
    model_config = ConfigDict(from_attributes=True)

class DoorEventResponse(BaseModel):
    id: int
    timestamp: datetime
    state: DoorStateEnum
    duration: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

# --- Alerts ---
class AlertResponse(BaseModel):
    id: int
    shipment_id: Optional[int]
    device_id: Optional[int]
    alert_type: AlertTypeEnum
    severity: AlertSeverityEnum
    message: str
    status: AlertStatusEnum
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
