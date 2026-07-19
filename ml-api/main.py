from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyse, buildings, health

app = FastAPI(
    title="EnergyGuard ML API",
    description="Smart building energy anomaly detection pipeline",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyse.router, prefix="/api")
app.include_router(buildings.router, prefix="/api")