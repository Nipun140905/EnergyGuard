from fastapi import APIRouter, HTTPException
from app.models.schemas import BuildingsResponse, BuildingInfo
from app.utils.data_loader import get_all_bdgp2_buildings

router = APIRouter()


@router.get("/buildings", response_model=BuildingsResponse)
def list_buildings():
    """
    Returns all BDGP2 building IDs and metadata.
    Used by the Signup page dropdown for existing building selection.
    """
    try:
        raw = get_all_bdgp2_buildings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load building list: {e}")

    buildings = [BuildingInfo(**b) for b in raw if b.get("building_id")]
    return BuildingsResponse(buildings=buildings)