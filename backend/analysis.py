import numpy as np
import pandas as pd


def analyze_heatwaves(df: pd.DataFrame) -> dict:
  df = df.sort_values("date").copy()
  df["tmax"] = df["tmax"].interpolate(method="linear").bfill().ffill()

  threshold_95 = np.percentile(df["tmax"], 95)
  df["is_extreme"] = df["tmax"] > threshold_95
  df["streak_id"] = (df["is_extreme"] != df["is_extreme"].shift()).cumsum()

  streaks = df[df["is_extreme"]].groupby("streak_id").agg(
      start_date=("date", "min"),
      end_date=("date", "max"),
      duration=("date", "count"),
      mean_temp=("tmax", "mean"),
  )

  heatwaves = streaks[streaks["duration"] >= 3].copy()
  heatwaves["year"] = heatwaves["start_date"].dt.year

  yearly_freq = (
      heatwaves.groupby("year")["duration"]
      .count()
      .rename("heatwave_count")
  )
  yearly_avg_duration = (
      heatwaves.groupby("year")["duration"]
      .mean()
      .rename("avg_duration_days")
  )

  trend_summary = pd.DataFrame(
      {"frequency": yearly_freq, "avg_duration": yearly_avg_duration}
  ).fillna(0)

  return {
      "threshold_95th_celsius": round(float(threshold_95), 2),
      "total_heatwave_events": int(len(heatwaves)),
      "total_heatwave_days": int(heatwaves["duration"].sum()),
      "yearly_trends": trend_summary.reset_index().to_dict(orient="records"),
  }
  