import pandas as pd
from app.config import ROLLING_WINDOW


def engineer_features(ts_df: pd.DataFrame) -> pd.DataFrame:
    """
    Input:  DataFrame with column [value] indexed by timestamp.
    Output: DataFrame with all 9 model features + weather cols retained.

    Mirrors notebook cell: FEATURE ENGINEERING
    """
    df = ts_df.copy()

    # Time-based features
    df["hour"]        = df.index.hour
    df["day_of_week"] = df.index.dayofweek
    df["is_weekend"]  = df["day_of_week"].isin([5, 6]).astype(int)

    # Rolling statistics (24-hour context)
    df["rolling_mean"] = df["value"].rolling(window=ROLLING_WINDOW, min_periods=1).mean()
    df["rolling_std"]  = df["value"].rolling(window=ROLLING_WINDOW, min_periods=1).std()
    df["deviation"]    = df["value"] - df["rolling_mean"]

    # Lag features
    df["lag_1"]  = df["value"].shift(1)
    df["lag_24"] = df["value"].shift(24)

    # Fill NaNs produced by rolling/lag
    df = df.ffill().bfill()

    return df