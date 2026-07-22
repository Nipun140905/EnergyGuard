import os

# ── ML Pipeline Constants ──────────────────────────────────────────────────────
CONTAMINATION_RATE = 0.03
ROLLING_WINDOW = 24          # hours
MAJORITY_VOTE_THRESHOLD = 2  # out of 3 models
COST_PER_UNIT = 0.08         # USD per energy unit

FEATURES = [
    "value",
    "rolling_mean",
    "rolling_std",
    "deviation",
    "lag_1",
    "lag_24",
    "hour",
    "day_of_week",
    "is_weekend",
]

# ── Anomaly Explanation Rules (priority order) ─────────────────────────────────
# 1. Spike   → value > rolling_mean + 3 * rolling_std
# 2. Night   → hour in 23–5
# 3. Weekend → is_weekend == 1 AND value > rolling_mean * 1.5
# 4. Deviation (catch-all)

SPIKE_STD_MULTIPLIER = 2
NIGHT_HOURS = list(range(23, 24)) + list(range(0, 6))  # 23,0,1,2,3,4,5
WEEKEND_MULTIPLIER = 1.5

# ── Dataset Files ──────────────────────────────────────────────────────────────
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data", "bdgp2"))

CLEANED_ENERGY_FILES = {
    "electricity":  "electricity_cleaned.csv",
    "water":        "water_cleaned.csv",
    "gas":          "gas_cleaned.csv",
    "steam":        "steam_cleaned.csv",
    "hotwater":     "hotwater_cleaned.csv",
    "chilledwater": "chilledwater_cleaned.csv",
    "irrigation":   "irrigation_cleaned.csv",
    "solar":        "solar_cleaned.csv",
}

METADATA_FILE = "metadata.csv"

# ── Stream UI Colors (mirrors frontend constants) ──────────────────────────────
STREAM_COLORS = {
    "electricity":  "#2563EB",
    "water":        "#0D9488",
    "chilledwater": "#7C3AED",
    "irrigation":   "#D97706",
    "gas":          "#F59E0B",
    "steam":        "#EF4444",
    "hotwater":     "#F97316",
    "solar":        "#EAB308",
}