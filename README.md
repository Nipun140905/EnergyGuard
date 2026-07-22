# EnergyGuard

Smart building energy anomaly detection dashboard built on the Building Data Genome Project 2 (BDGP2) dataset.

## Overview

EnergyGuard detects operational and behavioral anomalies in building energy consumption across eight energy streams: electricity, water, gas, steam, hot water, chilled water, irrigation, and solar. The detection pipeline uses an ensemble of three unsupervised machine learning models with majority voting. Each flagged anomaly is assigned a human-readable explanation and an estimated cost impact.

## Tech Stack

- ML Pipeline: FastAPI, Python, scikit-learn (Isolation Forest, LOF, Robust Covariance)
- Backend: Node.js, Express, Passport.js (Google OAuth 2.0), JWT, MongoDB
- Frontend: React (Vite), Bootstrap, Chart.js
- Database: MongoDB Atlas (production), MongoDB local (development)
- Deployment: Railway (backend + ML API), Vercel (frontend)

## ML Pipeline

**Models:** Isolation Forest, Local Outlier Factor, Robust Covariance (Elliptic Envelope)

**Majority voting:** A data point is flagged as anomalous only if at least 2 of the 3 models agree.

**Features (9 total):**
- value: raw energy consumption
- rolling_mean: 24-hour rolling average (baseline)
- rolling_std: 24-hour rolling standard deviation
- deviation: difference between value and rolling mean
- lag_1: consumption from 1 hour ago
- lag_24: consumption from the same hour yesterday
- hour: hour of day (0-23)
- day_of_week: day of week (0=Monday, 6=Sunday)
- is_weekend: binary flag (1 if Saturday or Sunday)

**Contamination rate:** 0.03

**Minimum data requirement:** 168 rows (7 days x 24 hours) per stream. This ensures the 24-hour rolling window and lag_24 feature have sufficient history to compute meaningful baselines.

**Zero-deviation guard:** After ffill fills missing values, positions that were originally NaN are excluded from anomaly flagging. A point where value equals rolling_mean carries no real signal — it is a filled value, not a real reading.

**Anomaly explanation rules (priority order):**
1. Sudden spike above 24hr baseline (value > mean + 2 x std)
2. Unusual consumption during night hours (23:00-05:00)
3. Elevated usage on weekend above expected baseline
4. Sharp change from previous hour reading
5. Consumption breaks same-hour pattern from previous day
6. Deviation above or below building baseline
7. Flagged by ensemble based on temporal pattern

**Cost impact formula:**

cost = (anomaly_value - normal_baseline_mean) x $0.08 per unit

Only positive excess counts. $0.08/unit is an assumed US commercial energy rate proxy since BDGP2 does not provide actual utility costs.

## Project Structure

```energyguard/
├── ENERGY_ANOMALY.ipynb
├── .gitignore
├── README.md
├── ml-api/
│ ├── main.py
│ ├── requirements.txt
│ ├── data/
│ │ └── bdgp2/ (see Dataset section — not populated in this repo)
│ └── app/
│ ├── config.py
│ ├── models/
│ │ └── schemas.py
│ ├── routers/
│ │ ├── analyse.py
│ │ ├── buildings.py
│ │ └── health.py
│ ├── services/
│ │ ├── pipeline.py
│ │ └── csv_validator.py
│ └── utils/
│ ├── data_loader.py
│ ├── explainer.py
│ └── feature_engineering.py
├── backend/
│ ├── server.js
│ ├── package.json
│ ├── config/
│ │ ├── db.js
│ │ └── passport.js
│ ├── controllers/
│ │ ├── authController.js
│ │ └── buildingController.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ └── uploadMiddleware.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Building.js
│ │ └── AnalysisCache.js
│ ├── routes/
│ │ ├── auth.js
│ │ └── buildings.js
│ └── services/
│ ├── csvValidator.js
│ ├── emailService.js
│ └── fastApiService.js
└── frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
├── App.jsx
├── main.jsx
├── hooks/
│ └── useAuth.js
├── utils/
│ └── api.js
├── styles/
│ └── global.css
├── pages/
│ ├── Landing.jsx
│ ├── Login.jsx
│ ├── Dashboard.jsx
│ └── SelectBuilding.jsx
└── components/
├── dashboard/
│ ├── DashboardNavbar.jsx
│ ├── StreamTabs.jsx
│ ├── KPICards.jsx
│ ├── EnergyChart.jsx
│ └── AnomalyTable.jsx
└── select-building/
├── ExistingBuilding.jsx
└── NewBuilding.jsx
```
## Dataset

Building Data Genome Project 2 (BDGP2): 1,636 buildings across 19 sites, 2016-2017.

Original source: https://www.kaggle.com/datasets/claytonmiller/buildingdatagenomeproject2

The cleaned dataset files (`metadata.csv` + 8 energy stream CSVs, ~297MB total) are **not stored directly in this repository**. They're distributed as a zipped asset on this repo's [Releases page](https://github.com/Nipun140905/EnergyGuard/releases) instead of via Git LFS, to avoid GitHub's LFS bandwidth/storage quotas and Railway's lack of native Git LFS support during builds.

**For local development:**
1. Download `bdgp2_data.zip` from the Releases page (or the original Kaggle source above)
2. Extract into `ml-api/data/bdgp2/` so the files sit directly under that folder:
   - electricity_cleaned.csv
   - water_cleaned.csv
   - gas_cleaned.csv
   - steam_cleaned.csv
   - hotwater_cleaned.csv
   - chilledwater_cleaned.csv
   - irrigation_cleaned.csv
   - solar_cleaned.csv
   - metadata.csv

**For production (Railway):** the ML API service reads from a persistent Railway volume mounted at `/data`, populated once from the same Release asset, rather than from the repo's `ml-api/data/bdgp2/` folder. This is controlled by the `DATA_DIR` environment variable in `ml-api/app/config.py`, which defaults to the local repo path if `DATA_DIR` isn't set — so local dev and production read from different places without any code branching.

## Local Development

Prerequisites: Python 3.10+, Node.js 18+, MongoDB

**1. ML API (FastAPI)**
```bash
cd ml-api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Backend (Node.js)**
```bash
cd backend
npm install
npm run dev
```

**3. Frontend (React)**
```bash
cd frontend
npm install
npm run dev
```

**Environment variables (create backend/.env):**

```MONGODB_URI
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:5173
FASTAPI_URL=http://localhost:8000
NODE_ENV=development
```
**Environment variables (Railway — ML API service):**
```DATA_DIR=/data/bdgp2
```
## Author

**Nipun Garg**  
B.Tech CSE (AI & ML) · SRM Institute of Science & Technology, Delhi-NCR · Batch 2023–2027

[LinkedIn](https://linkedin.com/in/nipungarg1409)· gargnipun4@gmail.com