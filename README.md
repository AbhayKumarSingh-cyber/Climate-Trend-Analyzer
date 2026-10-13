# Climate Hazard Trend Analyzer

A full-stack web application built for the Dygnify Ventures Software Engineer case study to analyze historical weather data and visualize trends in climate hazards (heatwaves) for any selected geographic region over time.

## Live Application Links
* **Deployed App (Frontend):** https://climate-trend-analyzer.vercel.app
* **Backend API (Render):** https://climate-trend-analyzer-ddrg.onrender.com
* **GitHub Repository:** https://github.com/AbhayKumarSingh-cyber/Climate-Trend-Analyzer

## Architecture & Tech Stack
- **Frontend:** React (Vite) + Chart.js + Tailwind CSS / Custom CSS for responsive data visualization and clean UI control panels, hosted on **Vercel**.
- **Backend:** Python FastAPI REST API providing asynchronous data ingestion and robust climate hazard analysis, hosted on **Render**.
- **Data Processing:** Pandas & NumPy for handling time-series weather streams, missing value interpolation, and statistical threshold modeling.
- **Weather Data Source:** Open-Meteo Historical Weather API (Public, reliable daily maximum temperature records).

## Climate Hazard Logic (Heatwaves)
The application defines a Heatwave using rigorous domain-specific meteorological standards:
1. **Baseline Threshold:** Calculates the 95th percentile of maximum daily temperatures (Tmax) across the entire selected historical timeline for the target coordinates.
2. **Consecutive Streak Rule:** Identifies continuous blocks where Tmax exceeds the 95th percentile threshold for 3 or more consecutive days.
3. **Trend Extraction:** Groups valid heatwave streaks by year to calculate yearly event frequency and duration trends.

## Local Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\Activate  # On Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
