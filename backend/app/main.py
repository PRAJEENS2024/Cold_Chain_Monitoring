from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, auth
from .routers import auth as auth_router, devices as devices_router, shipments as shipments_router, simulator as simulator_router, telemetry as telemetry_router, analytics as analytics_router

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
    yield
    # Shutdown logic if any

app = FastAPI(
    title="IoT Cold Chain API",
    description="API for Intelligent Cold Chain Monitoring and Predictive Analytics System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Cold Chain API is running"}

app.include_router(auth_router.router)
app.include_router(devices_router.router)
app.include_router(shipments_router.router)
app.include_router(simulator_router.router)
app.include_router(telemetry_router.router)
app.include_router(analytics_router.router)
