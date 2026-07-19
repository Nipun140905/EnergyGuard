from pydantic import BaseModel
from typing import Dict, List, Optional


class AnalyseRequest(BaseModel):
    building_id: str


class AnomalyRecord(BaseModel):
    timestamp: str
    value: float
    rolling_mean: float
    rolling_std: float
    deviation: float
    votes: int
    explanation: str


class StreamKPI(BaseModel):
    total_anomalies: int
    anomaly_rate: float
    estimated_cost_impact: float
    total_records: int
    normal_mean: float
    cost_per_unit: float


class StreamResult(BaseModel):
    anomalies: List[AnomalyRecord]
    kpi: StreamKPI
    all_timestamps: List[str]
    all_values: List[Optional[float]]
    all_rolling_means: List[Optional[float]]
    color: str


class AnalyseResponse(BaseModel):
    building_id: str
    streams: Dict[str, StreamResult]


class BuildingInfo(BaseModel):
    building_id: str
    site_id: Optional[str] = None
    primary_use: Optional[str] = None
    square_feet: Optional[float] = None
    year_built: Optional[int] = None


class BuildingsResponse(BaseModel):
    buildings: List[BuildingInfo]


class HealthResponse(BaseModel):
    status: str
    available_streams: List[str]


class ValidationWarning(BaseModel):
    column: str
    message: str


class RegisterBuildingResponse(BaseModel):
    building_id: str
    streams: Dict[str, StreamResult]
    status: str
    warnings: List[ValidationWarning]