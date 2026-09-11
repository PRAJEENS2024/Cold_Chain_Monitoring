from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    OPERATOR = "OPERATOR"

class AlertSeverityEnum(str, enum.Enum):
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class AlertStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class DeviceStatusEnum(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"

class DoorStateEnum(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class AlertTypeEnum(str, enum.Enum):
    HIGH_TEMPERATURE = "HIGH_TEMPERATURE"
    LOW_TEMPERATURE = "LOW_TEMPERATURE"
    DOOR_OPEN_TOO_LONG = "DOOR_OPEN_TOO_LONG"
    DEVICE_OFFLINE = "DEVICE_OFFLINE"
    CRITICAL_TEMPERATURE = "CRITICAL_TEMPERATURE"
    PREDICTED_TEMPERATURE_EXCURSION = "PREDICTED_TEMPERATURE_EXCURSION"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.OPERATOR)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    product_category = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=True)
    expected_delivery = Column(DateTime(timezone=True), nullable=True)
    temp_min = Column(Float, nullable=False)
    temp_max = Column(Float, nullable=False)
    status = Column(String, default="PENDING")
    
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    assigned_operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    device = relationship("Device", back_populates="shipments")
    assigned_operator = relationship("User")
    temperature_readings = relationship("TemperatureReading", back_populates="shipment")
    door_events = relationship("DoorEvent", back_populates="shipment")
    alerts = relationship("Alert", back_populates="shipment")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    esp32_identifier = Column(String, unique=True, nullable=True)
    status = Column(Enum(DeviceStatusEnum), default=DeviceStatusEnum.OFFLINE)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    firmware_version = Column(String, nullable=True)
    thingspeak_channel_id = Column(String, nullable=True)
    thingspeak_read_key = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shipments = relationship("Shipment", back_populates="device")

class TemperatureReading(Base):
    __tablename__ = "temperature_readings"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    temperature = Column(Float, nullable=False)
    data_source = Column(String, default="SIMULATOR")  # SIMULATOR or ESP32
    
    shipment = relationship("Shipment", back_populates="temperature_readings")
    device = relationship("Device")

class DoorEvent(Base):
    __tablename__ = "door_events"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    state = Column(Enum(DoorStateEnum), nullable=False)
    duration = Column(Integer, nullable=True) # Duration in seconds if applicable
    
    shipment = relationship("Shipment", back_populates="door_events")
    device = relationship("Device")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    alert_type = Column(Enum(AlertTypeEnum), nullable=False)
    severity = Column(Enum(AlertSeverityEnum), nullable=False)
    message = Column(String, nullable=False)
    status = Column(Enum(AlertStatusEnum), default=AlertStatusEnum.ACTIVE)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    shipment = relationship("Shipment", back_populates="alerts")
    device = relationship("Device")
    acknowledger = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
