import pandas as pd
from app.config import SPIKE_STD_MULTIPLIER, NIGHT_HOURS, WEEKEND_MULTIPLIER


def explain_anomaly(row: pd.Series) -> str:
    value        = row["value"]
    rolling_mean = row["rolling_mean"]
    rolling_std  = row["rolling_std"]
    hour         = int(row["hour"])
    is_weekend   = int(row["is_weekend"])
    deviation    = row["deviation"]
    lag_1        = row["lag_1"]
    lag_24       = row["lag_24"]

    # Rule 1: Spike above rolling baseline
    spike_threshold = rolling_mean + SPIKE_STD_MULTIPLIER * rolling_std
    if value > spike_threshold:
        return "Sudden spike above 24hr baseline"

    # Rule 2: Night consumption
    if hour in NIGHT_HOURS:
        return "Unusual consumption during night hours (23:00–05:00)"

    # Rule 3: Weekend elevated usage
    if is_weekend == 1 and rolling_mean > 0 and value > rolling_mean * WEEKEND_MULTIPLIER:
        return "Elevated usage on weekend above expected baseline"

    # Rule 4: Sudden change from previous hour
    if rolling_std > 0 and abs(value - lag_1) > SPIKE_STD_MULTIPLIER * rolling_std:
        direction = "increase" if value > lag_1 else "drop"
        return f"Sharp {direction} from previous hour reading"

    # Rule 5: Breaks same-hour pattern from previous day
    if rolling_std > 0 and abs(value - lag_24) > SPIKE_STD_MULTIPLIER * rolling_std:
        direction = "higher" if value > lag_24 else "lower"
        return f"Consumption {direction} than same hour yesterday"

    # Rule 6: Meaningful deviation from baseline
    if abs(deviation) >= 1e-6:
        direction = "above" if deviation > 0 else "below"
        return f"Deviation {direction} building baseline"

    # Rule 7: Zero deviation — flagged by ensemble on temporal features
    return "Flagged by ensemble based on temporal pattern"


def apply_explanations(result_df: pd.DataFrame) -> pd.DataFrame:
    df = result_df.copy()
    df["explanation"] = ""
    anomaly_mask = df["is_anomaly"] == 1
    df.loc[anomaly_mask, "explanation"] = df[anomaly_mask].apply(explain_anomaly, axis=1)
    return df