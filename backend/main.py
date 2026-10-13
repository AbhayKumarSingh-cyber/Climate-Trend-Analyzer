import os
from analysis import analyze_heatwaves
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import requests

app = FastAPI(title="Climate Hazard Trend Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze")
def analyze_climate_data(
    lat: float = Query(...),
    lon: float = Query(...),
    start_year: int = Query(...),
    end_year: int = Query(...),
):
  url = (
      f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
      f"&start_date={start_year}-01-01&end_date={end_year}-12-31&daily=temperature_2m_max"
  )

  response = requests.get(url)
  if response.status_code != 200:
    raise HTTPException(
        status_code=502, detail="Failed to fetch data from Open-Meteo API"
    )

  data = response.json()
  daily_data = data.get("daily", {})
  times = daily_data.get("time", [])
  tmaxes = daily_data.get("temperature_2m_max", [])

  if not times or not tmaxes:
    raise HTTPException(
        status_code=404, detail="No weather data found for this region/range"
    )

  df = pd.DataFrame({"date": pd.to_datetime(times), "tmax": tmaxes})
  results = analyze_heatwaves(df)

  yearly_trends = results.get("yearly_trends", [])
  if len(yearly_trends) >= 2:
    first_freq = yearly_trends[0]["frequency"]
    last_freq = yearly_trends[-1]["frequency"]
    if first_freq > 0:
      pct_change = round(
          ((last_freq - first_freq) / abs(first_freq)) * 100, 1
      )
      direction = "increased" if pct_change >= 0 else "decreased"
      insight = (
          f"Heatwaves have {direction} by {abs(pct_change)}% in this region"
          f" between {start_year} and {end_year}."
      )
    else:
      insight = (
          f"Analyzed heatwave frequency from {start_year} to {end_year}."
      )
  else:
    insight = "Insufficient yearly data points to compute trend percentage."

  results["summary_insight"] = insight
  return results


@app.get("/api/health")
def health_check():
  return {"status": "healthy"}