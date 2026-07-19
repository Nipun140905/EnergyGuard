import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional

from app.models.schemas import (
    AnalyseRequest,
    AnalyseResponse,
    RegisterBuildingResponse,
    ValidationWarning,
)
from app.services.pipeline import (
    run_pipeline_for_building,
    _run_ensemble,
    _build_stream_result,
)
from app.services.csv_validator import validate_energy_csv
from app.utils.feature_engineering import engineer_features
from app.utils.explainer import apply_explanations

router = APIRouter()


@router.post("/analyse", response_model=AnalyseResponse)
def analyse_building(request: AnalyseRequest):
    try:
        result = run_pipeline_for_building(request.building_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {e}")
    return result


@router.post("/register-building", response_model=RegisterBuildingResponse)
async def register_building(
    building_name: str = Form(...),
    location: str = Form(...),
    primary_use: str = Form(...),
    size_sqft: float = Form(...),
    electricity_csv: Optional[UploadFile] = File(None),
    water_csv: Optional[UploadFile] = File(None),
    gas_csv: Optional[UploadFile] = File(None),
    steam_csv: Optional[UploadFile] = File(None),
    hotwater_csv: Optional[UploadFile] = File(None),
    chilledwater_csv: Optional[UploadFile] = File(None),
    irrigation_csv: Optional[UploadFile] = File(None),
    solar_csv: Optional[UploadFile] = File(None),
):
    uploads = {
        "electricity":  electricity_csv,
        "water":        water_csv,
        "gas":          gas_csv,
        "steam":        steam_csv,
        "hotwater":     hotwater_csv,
        "chilledwater": chilledwater_csv,
        "irrigation":   irrigation_csv,
        "solar":        solar_csv,
    }

    uploads = {k: v for k, v in uploads.items() if v is not None}

    if not uploads:
        raise HTTPException(
            status_code=400,
            detail="At least one energy CSV must be uploaded"
        )

    all_warnings: List[ValidationWarning] = []
    stream_dataframes = {}

    for stream, upload_file in uploads.items():
        raw = await upload_file.read()
        try:
            df, warnings = validate_energy_csv(raw, stream)
            stream_dataframes[stream] = df
            all_warnings.extend(warnings)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))

    building_id = f"new_{building_name.lower().replace(' ', '_')}_{uuid.uuid4().hex[:6]}"

    stream_results = {}
    for stream, df in stream_dataframes.items():
        df_features = engineer_features(df)
        df_result = _run_ensemble(df_features)
        df_result = apply_explanations(df_result)
        stream_results[stream] = _build_stream_result(df_result, stream)

    return RegisterBuildingResponse(
        building_id=building_id,
        streams=stream_results,
        status="registered",
        warnings=all_warnings,
    )