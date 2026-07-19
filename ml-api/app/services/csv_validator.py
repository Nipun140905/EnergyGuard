import pandas as pd
import io
from typing import Tuple, List
from app.models.schemas import ValidationWarning


REQUIRED_COLUMNS = {"timestamp", "value"}
MIN_NON_NULL_ROWS = 168   # 1 week of hourly data
TIMESTAMP_FORMAT  = "%Y-%m-%d %H:%M:%S"


def validate_energy_csv(
    file_bytes: bytes,
    stream_name: str,
) -> Tuple[pd.DataFrame, List[ValidationWarning]]:
    """
    Validates an uploaded energy CSV from a new building.

    Rules:
    - Required columns: timestamp, value
    - timestamp column must have zero nulls
    - timestamp must parse as YYYY-MM-DD HH:MM:SS
    - value column must be parseable as float64
    - Minimum 168 non-null energy rows
    - Missing energy values are PERMITTED — return warning, not error

    Returns (cleaned_df, warnings).
    Raises ValueError with column-level error message on hard failures.
    """
    warnings: List[ValidationWarning] = []

    try:
        df = pd.read_csv(io.BytesIO(file_bytes), low_memory=False)
    except Exception as e:
        raise ValueError(f"[{stream_name}] Could not parse CSV: {e}")

    # Check required columns
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"[{stream_name}] Missing required columns: {missing}")

    # Timestamp nulls — hard error
    if df["timestamp"].isnull().any():
        raise ValueError(f"[{stream_name}] timestamp column contains null values")

    # Timestamp format
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], format=TIMESTAMP_FORMAT)
    except Exception:
        raise ValueError(
            f"[{stream_name}] timestamp format must be YYYY-MM-DD HH:MM:SS"
        )

    # Value parseable as float
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    # Warn on missing energy values
    null_count = df["value"].isnull().sum()
    if null_count > 0:
        warnings.append(ValidationWarning(
            column="value",
            message=f"{null_count} missing values in '{stream_name}' energy column — rows will be excluded from modeling",
        ))

    # Minimum rows after dropping nulls
    non_null_count = df["value"].notnull().sum()
    if non_null_count < MIN_NON_NULL_ROWS:
        raise ValueError(
            f"[{stream_name}] Only {non_null_count} non-null energy rows found; "
            f"minimum required is {MIN_NON_NULL_ROWS} (1 week of hourly data)"
        )

    df.sort_values("timestamp", inplace=True)
    df.set_index("timestamp", inplace=True)

    return df, warnings