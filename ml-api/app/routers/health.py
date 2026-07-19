import os
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.config import CLEANED_ENERGY_FILES, DATA_DIR

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Returns API status and which stream CSV files are present on disk.
    Used by Render health checks and Node backend connectivity test.
    """
    available = [
        stream
        for stream, filename in CLEANED_ENERGY_FILES.items()
        if os.path.exists(os.path.join(DATA_DIR, filename))
    ]
    return HealthResponse(status="ok", available_streams=available)