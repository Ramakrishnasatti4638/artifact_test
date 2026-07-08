const express = require('express');
const app = express();
const PORT = 3000;

const weather = {
  city: 'London',
  country: 'GB',
  temperature: 18,
  condition: 'Partly Cloudy',
  humidity: 72,
  wind: 14,
  feelsLike: 16,
  uvIndex: 3,
  time: new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }),
};

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Weather Card – ${weather.city}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .card {
      width: 380px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      padding: 36px 32px 28px;
      color: #fff;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255,255,255,0.1);
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .location h1 {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .location .country-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 10px;
      background: rgba(255,255,255,0.15);
      border-radius: 20px;
      font-size: 0.75rem;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .location .date {
      display: block;
      margin-top: 6px;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.55);
    }
    .header-icon {
      font-size: 2.8rem;
      line-height: 1;
      filter: drop-shadow(0 2px 8px rgba(255,200,50,0.4));
    }

    /* ── Main temp ── */
    .main-temp {
      text-align: center;
      margin: 8px 0 24px;
    }
    .main-temp .temp-value {
      font-size: 5.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -4px;
      background: linear-gradient(180deg, #ffffff 0%, #a8d8ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .main-temp .condition {
      margin-top: 8px;
      font-size: 1.05rem;
      color: rgba(255,255,255,0.75);
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .main-temp .feels-like {
      margin-top: 4px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      margin: 0 -4px 24px;
    }

    /* ── Stats grid ── */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 14px 10px;
      text-align: center;
      transition: background 0.2s;
    }
    .stat-card:hover { background: rgba(255,255,255,0.12); }
    .stat-icon {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 6px;
      line-height: 1;
    }
    .stat-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255,255,255,0.45);
      display: block;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
    }

    /* ── UV bar ── */
    .uv-section {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 14px 16px;
    }
    .uv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .uv-header span:first-child {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255,255,255,0.45);
    }
    .uv-header .uv-val {
      font-size: 0.9rem;
      font-weight: 700;
      color: #ffd166;
    }
    .uv-track {
      height: 6px;
      background: rgba(255,255,255,0.12);
      border-radius: 99px;
      overflow: hidden;
    }
    .uv-fill {
      height: 100%;
      width: ${(weather.uvIndex / 11) * 100}%;
      background: linear-gradient(90deg, #06d6a0, #ffd166, #ef476f);
      border-radius: 99px;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.25);
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="card">

    <div class="header">
      <div class="location">
        <h1>${weather.city}</h1>
        <span class="country-badge">${weather.country}</span>
        <span class="date">${weather.time}</span>
      </div>
      <div class="header-icon">⛅</div>
    </div>

    <div class="main-temp">
      <div class="temp-value">${weather.temperature}°</div>
      <div class="condition">${weather.condition}</div>
      <div class="feels-like">Feels like ${weather.feelsLike}°C</div>
    </div>

    <div class="divider"></div>

    <div class="stats">
      <div class="stat-card">
        <span class="stat-icon">💧</span>
        <span class="stat-label">Humidity</span>
        <span class="stat-value">${weather.humidity}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💨</span>
        <span class="stat-label">Wind</span>
        <span class="stat-value">${weather.wind} km/h</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🌡️</span>
        <span class="stat-label">Feels Like</span>
        <span class="stat-value">${weather.feelsLike}°C</span>
      </div>
    </div>

    <div class="uv-section">
      <div class="uv-header">
        <span>☀️ &nbsp;UV Index</span>
        <span class="uv-val">${weather.uvIndex} · Moderate</span>
      </div>
      <div class="uv-track">
        <div class="uv-fill"></div>
      </div>
    </div>

    <div class="footer">Weather Card · Powered by Express</div>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Weather card running at http://localhost:${PORT}`);
});
