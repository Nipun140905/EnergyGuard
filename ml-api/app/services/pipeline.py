import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.covariance import EllipticEnvelope
from sklearn.preprocessing import StandardScaler

from app.config import (
    CONTAMINATION_RATE,
    MAJORITY_VOTE_THRESHOLD,
    FEATURES,
    COST_PER_UNIT,
    STREAM_COLORS,
)
from app.utils.data_loader import (
    load_energy_series,
    get_available_streams,
)
from app.utils.feature_engineering import engineer_features
from app.utils.explainer import apply_explanations
from app.models.schemas import (
    StreamResult,
    AnomalyRecord,
    StreamKPI,
    AnalyseResponse,
)


def _run_ensemble(df: pd.DataFrame) -> pd.DataFrame:
    X = df[FEATURES].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    iso = IsolationForest(contamination=CONTAMINATION_RATE, random_state=42, n_jobs=-1)
    iso_pred = iso.fit_predict(X_scaled)

    lof = LocalOutlierFactor(n_neighbors=20, contamination=CONTAMINATION_RATE)
    lof_pred = lof.fit_predict(X_scaled)

    cov = EllipticEnvelope(contamination=CONTAMINATION_RATE, random_state=42)
    cov_pred = cov.fit_predict(X_scaled)

    df = df.copy()
    df["iso_anomaly"] = (iso_pred == -1).astype(int)
    df["lof_anomaly"] = (lof_pred == -1).astype(int)
    df["cov_anomaly"] = (cov_pred == -1).astype(int)
    df["anomaly_votes"] = df["iso_anomaly"] + df["lof_anomaly"] + df["cov_anomaly"]
    df["is_anomaly"] = (df["anomaly_votes"] >= MAJORITY_VOTE_THRESHOLD).astype(int)

    return df


def _calc_cost_impact(result_df: pd.DataFrame) -> float:
    normal_mean = result_df[result_df["is_anomaly"] == 0]["value"].mean()
    anomalies = result_df[result_df["is_anomaly"] == 1]
    if anomalies.empty:
        return 0.0
    excess = (anomalies["value"] - normal_mean).clip(lower=0)
    return round(float((excess * COST_PER_UNIT).sum()), 2)


def _build_stream_result(result_df: pd.DataFrame, stream: str) -> StreamResult:
    anomaly_rows = result_df[result_df["is_anomaly"] == 1]

    anomalies = []
    for ts, row in anomaly_rows.iterrows():
        anomalies.append(AnomalyRecord(
            timestamp=str(ts),
            value=round(float(row["value"]), 4),
            rolling_mean=round(float(row["rolling_mean"]), 4),
            rolling_std=round(float(row["rolling_std"]), 4),
            deviation=round(float(row["deviation"]), 4),
            votes=int(row["anomaly_votes"]),
            explanation=row.get("explanation", ""),
        ))

    total_records = len(result_df)
    total_anomalies = int(result_df["is_anomaly"].sum())
    anomaly_rate = round(total_anomalies / total_records * 100, 2) if total_records > 0 else 0.0
    cost_impact = _calc_cost_impact(result_df)

    normal_mean = round(float(result_df[result_df["is_anomaly"] == 0]["value"].mean()), 4)

    all_timestamps = [str(ts) for ts in result_df.index]
    all_values = [
        round(float(v), 4) if pd.notna(v) else None
        for v in result_df["value"]
    ]
    all_rolling_means = [
        round(float(v), 4) if pd.notna(v) else None
        for v in result_df["rolling_mean"]
    ]

    return StreamResult(
        anomalies=anomalies,
        kpi=StreamKPI(
            total_anomalies=total_anomalies,
            anomaly_rate=anomaly_rate,
            estimated_cost_impact=cost_impact,
            total_records=total_records,
            normal_mean=normal_mean,
            cost_per_unit=COST_PER_UNIT,
        ),
        all_timestamps=all_timestamps,
        all_values=all_values,
        all_rolling_means=all_rolling_means,
        color=STREAM_COLORS.get(stream, "#888888"),
    )


def run_pipeline_for_building(building_id: str) -> AnalyseResponse:
    streams_available = get_available_streams(building_id)
    if not streams_available:
        raise ValueError(f"No energy data found for building_id: {building_id}")

    stream_results = {}

    for stream in streams_available:
        ts_df = load_energy_series(building_id, stream)

        # Track which positions had real original readings
        original_mask = ts_df["value"].notna()

        ts_model = ts_df.copy()
        ts_model["value"] = ts_model["value"].ffill().bfill()

        if len(ts_model) < 168:
            continue

        zero_ratio = (ts_model["value"] == 0).sum() / len(ts_model)
        if zero_ratio > 0.90:
            stream_results[stream] = StreamResult(
                anomalies=[],
                kpi=StreamKPI(
                    total_anomalies=0,
                    anomaly_rate=0.0,
                    estimated_cost_impact=0.0,
                    total_records=len(ts_model),
                    normal_mean=0.0,
                    cost_per_unit=COST_PER_UNIT,
                    ),
                    all_timestamps=ts_model.index.strftime("%Y-%m-%d %H:%M:%S").tolist(),
                    all_values=ts_model["value"].tolist(),
                    all_rolling_means=[None] * len(ts_model),
                    color=STREAM_COLORS.get(stream, "#888888"),
                      )
            continue

        df_features = engineer_features(ts_model)
        df_result = _run_ensemble(df_features)
        df_result = apply_explanations(df_result)

        # Only flag anomalies at positions that had real original readings
        # Positions filled by ffill are not genuine anomalies
        df_result.loc[~original_mask, "is_anomaly"] = 0
        df_result.loc[~original_mask, "anomaly_votes"] = 0
        df_result.loc[~original_mask, "explanation"] = ""

        stream_results[stream] = _build_stream_result(df_result, stream)

    if not stream_results:
        raise ValueError(f"No streams had sufficient data for building: {building_id}")

    return AnalyseResponse(
        building_id=building_id,
        streams=stream_results,
    )