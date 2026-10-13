import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2020);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`https://climate-trend-analyzer-ddrg.onrender.com/api/analyze`, null, {
        params: { lat, lon, start_year: startYear, end_year: endYear }
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch climate analysis data.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = data ? {
    labels: data.yearly_trends.map(item => item.year),
    datasets: [
      {
        label: 'Heatwave Frequency (Count)',
        data: data.yearly_trends.map(item => item.frequency),
        borderColor: '#c084fc',
        backgroundColor: 'rgba(192, 132, 252, 0.2)',
        tension: 0.2,
      }
    ]
  } : null;

  return (
    <div className="p-8 text-left">
      <header className="mb-10 text-center">
        <h1>Climate Hazard Trend Analyzer</h1>
        <p>Analyze historical weather patterns and heatwave frequency trends over time.</p>
      </header>

      {/* Control Form */}
      <form onSubmit={handleAnalyze} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)' }} className="p-6 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end shadow-md">
        <div>
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-full border rounded p-2 text-sm bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input type="number" step="any" value={lon} onChange={(e) => setLon(parseFloat(e.target.value))} className="w-full border rounded p-2 text-sm bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Year</label>
          <input type="number" value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))} className="w-full border rounded p-2 text-sm bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Year</label>
          <input type="number" value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value))} className="w-full border rounded p-2 text-sm bg-transparent" required />
        </div>
        <div>
          <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#fff' }} className="w-full font-medium py-2 px-4 rounded transition disabled:opacity-50 cursor-pointer">
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </form>

      {error && <div className="p-4 rounded mb-6 border border-red-400 text-red-500">{error}</div>}

      {/* Results Section */}
      {data && (
        <div className="space-y-6">
          {/* Summary Insight Card */}
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)' }} className="p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <h2>Key Insight</h2>
            <p className="text-xl font-medium" style={{ color: 'var(--text-h)' }}>{data.summary_insight}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div>95th Percentile Threshold: <span className="font-bold" style={{ color: 'var(--text-h)' }}>{data.threshold_95th_celsius}°C</span></div>
              <div>Total Events: <span className="font-bold" style={{ color: 'var(--text-h)' }}>{data.total_heatwave_events}</span></div>
              <div>Total Heatwave Days: <span className="font-bold" style={{ color: 'var(--text-h)' }}>{data.total_heatwave_days}</span></div>
            </div>
          </div>

          {/* Time-Series Chart */}
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)' }} className="p-6 rounded-xl shadow-md">
            <h2>Heatwave Frequency Over Time</h2>
            <div className="h-80 mt-4">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
