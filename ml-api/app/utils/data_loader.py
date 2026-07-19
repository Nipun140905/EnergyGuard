import os
import pandas as pd
from typing import Optional
from app.config import DATA_DIR, CLEANED_ENERGY_FILES, METADATA_FILE


def get_available_streams(building_id: str) -> list[str]:
    available = []
    for stream, filename in CLEANED_ENERGY_FILES.items():
        fpath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(fpath):
            continue
        header = pd.read_csv(fpath, nrows=0)
        if building_id in header.columns:
            available.append(stream)
    return available


def load_energy_series(building_id: str, stream: str) -> pd.DataFrame:
    filename = CLEANED_ENERGY_FILES[stream]
    fpath = os.path.join(DATA_DIR, filename)
    df = pd.read_csv(fpath, usecols=["timestamp", building_id], low_memory=False)
    df.rename(columns={building_id: "value"}, inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.sort_values("timestamp", inplace=True)
    df.set_index("timestamp", inplace=True)
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    return df


def load_metadata() -> pd.DataFrame:
    fpath = os.path.join(DATA_DIR, METADATA_FILE)
    if not os.path.exists(fpath):
        return pd.DataFrame()
    return pd.read_csv(fpath, low_memory=False)


def get_building_metadata(building_id: str) -> Optional[dict]:
    meta = load_metadata()
    if meta.empty or "building_id" not in meta.columns:
        return None
    row = meta[meta["building_id"] == building_id]
    if row.empty:
        return None
    return row.iloc[0].to_dict()


def get_all_bdgp2_buildings() -> list[dict]:
    meta = load_metadata()
    if meta.empty:
        return []

    def clean_str(val):
        try:
            if pd.isna(val):
                return None
            s = str(val).strip()
            return s if s else None
        except:
            return None

    def clean_int(val):
        try:
            v = float(val)
            return int(v) if not pd.isna(v) else None
        except:
            return None

    def clean_float(val):
        try:
            v = float(val)
            return v if not pd.isna(v) else None
        except:
            return None

    def pick(row, *keys):
        for k in keys:
            v = row.get(k)
            if v is not None and not (isinstance(v, float) and pd.isna(v)):
                return v
        return None

    records = []
    for _, row in meta.iterrows():
        records.append({
            "building_id": clean_str(pick(row, "building_id")),
            "site_id":     clean_str(pick(row, "site_id")),
            "primary_use": clean_str(pick(row, "primaryspaceusage", "primary_use")),
            "square_feet": clean_float(pick(row, "sqft", "sqm")),
            "year_built":  clean_int(pick(row, "yearbuilt", "year_built")),
        })
    return [r for r in records if r["building_id"]]