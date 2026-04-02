<div align="center">

# 🌦️ ClimateDash

### Real-time Weather Analytics Dashboard for India

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-3b6ef6?style=for-the-badge&logo=vercel&logoColor=white)](https://your-deployed-link-here.vercel.app)
[![WeatherAPI](https://img.shields.io/badge/Powered%20by-WeatherAPI.com-059669?style=for-the-badge)](https://www.weatherapi.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

ClimateDash is a **premium real-time weather analytics dashboard** for major Indian cities with a stunning glassmorphism UI, light/dark mode, interactive charts, and live analytics — all with zero dependencies or build tools.

</div>

---

## 🌐 Live Demo

> **[👉 View ClimateDash Live](https://climate-dash-nine.vercel.app/)**
> *(Replace link once deployed to Vercel / Netlify / GitHub Pages)*

---

## ✨ Features

### 🔴 Live Weather Data
- Real-time temperature, humidity, wind speed & visibility for **8 Indian cities**
- Auto-refreshes every **5 minutes** with a live countdown timer
- Manual refresh with loading animation
- Local time display per city footer

### ☀️ Light & Dark Mode
- **Light mode by default** — clean, soft blue & white aesthetic
- One-click **🌙 Dark / ☀️ Light toggle** in the header
- Theme preference saved to `localStorage` — persists across reloads
- Charts, tooltips, and grid lines all adapt to the active theme

### 🏙️ Dynamic City Management
- 8 cities loaded instantly — all displayed in **one clean row**
- **Add any Indian city** via the header search bar (Enter or click Add)
- **Remove cities** with the ✕ button on any card
- **Sort** all cities by temperature ↑↓, humidity, or wind speed

### 📊 Interactive Analytics
- **4 panels**: Temperature, Wind Speed, Visibility, and Humidity progress bars
- Toggle between **Bar** and **Line** chart views at any time
- Gradient-filled charts with themed tooltips
- Smart insight labels: *"Hottest: Delhi"*, *"Windiest: Kolkata"*, *"Clearest: Bangalore"*

### 🌡️ Smart UI
- **°C / °F toggle** — switches units without re-fetching data
- **Weather-adaptive card theming** (orange → hot, yellow → warm, blue → cool)
- Temperature **color coding** (red ≥ 35°C → blue ≤ 15°C)
- Metric pills per city: Humidity · Wind · Visibility
- **Toast notifications** for all actions (add city, remove, refresh)
- Skeleton loading shimmer while data fetches

### 🎨 Premium Design
- **Light mode**: Soft indigo blue-white palette with glass cards and clean shadows
- **Dark mode**: Deep navy aurora background with glowing glassmorphism cards
- Animated floating aurora orbs in background
- **Space Grotesk + Inter** typography
- Staggered card entrance animations and smooth hover micro-interactions
- Fully **responsive** — desktop → tablet → mobile

---

## 🏙️ Default Cities

| # | City | Region |
|---|------|--------|
| 🌊 | Mumbai | Maharashtra |
| 🏛️ | Delhi | NCT Delhi |
| 🌴 | Chennai | Tamil Nadu |
| 🏙️ | Kolkata | West Bengal |
| 💻 | Bangalore | Karnataka |
| 🍖 | Hyderabad | Telangana |
| 🎓 | Pune | Maharashtra |
| 🏰 | Jaipur | Rajasthan |

> All 8 cities are shown in a single clean row on desktop. Add or remove cities dynamically.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic markup & structure |
| **CSS3** | Light/dark themes via CSS custom properties, glassmorphism, animations |
| **Vanilla JavaScript** | State, DOM rendering, API calls, chart logic |
| **Chart.js 4.4** | Gradient bar & line charts with theme-aware styling |
| **WeatherAPI.com** | Live weather data |
| **Google Fonts** | Inter + Space Grotesk |
| **localStorage** | Theme preference persistence |

No frameworks. No build tools. No npm. Pure HTML/CSS/JS.

---

## 📂 Project Structure

```
ClimateDash/
│
├── index.html         # App shell — layout, header, chart canvases
├── style.css          # Light/dark tokens, glassmorphism, responsive layout
├── weather_stats.js   # API, DOM rendering, charts, state, theme toggle
└── README.md
```

---

## 🔑 Setup & Installation

### Step 1 — Get a Free API Key

1. Go to [weatherapi.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Copy your **API key** from the dashboard

> The free plan allows **1 million calls/month** — more than enough for personal use.

### Step 2 — Add Your API Key

Open `weather_stats.js` and replace:

```js
// Before
var WEATHER_API_KEY = 'YOUR_API_KEY_HERE';

// After
var WEATHER_API_KEY = 'your_actual_api_key';
```

### Step 3 — Open in Browser

```bash
# No server needed — just double-click index.html
open index.html
```

---

## 🧩 Customization

### Change default theme

The app loads in **light mode** by default. To default to dark mode, add this to `weather_stats.js` inside `boot()`:

```js
// Force dark mode on load
document.body.classList.add('dark');
isDark = true;
```

### Add default cities

Edit the `CITIES` array in `weather_stats.js`:

```js
var CITIES = [
  { name: 'Ahmedabad', query: 'Ahmedabad,India', flag: '🏭', region: 'Gujarat' },
  // ...
];
```

### Change auto-refresh interval

```js
var AUTO_REFRESH_SECS = 300; // 5 min — change to 60 for 1 min
```

### Switch chart default type

```js
var chartType = 'line'; // 'bar' or 'line'
```

---

## 🚀 Deploy in One Click

| Platform | Steps |
|----------|-------|
| **Vercel** | Drag & drop folder at [vercel.com](https://vercel.com) |
| **Netlify** | Drop folder at [netlify.com/drop](https://app.netlify.com/drop) |
| **GitHub Pages** | Push to GitHub → Settings → Pages → Deploy from root |

---

## ⚠️ Important Notes

- 🔒 **Never commit your API key** to a public repo — use environment variables for production
- 📶 Internet connection required for live weather data
- 🆓 Free WeatherAPI plan has rate limits — avoid refreshing too aggressively

---

## 📄 License

Open source — free for educational and portfolio use.

---

## 👨‍💻 Author

**Vishwesh Rajopadhye**
Built as a frontend + API integration portfolio project showcasing real-time data visualization, responsive design, and modern CSS theming.

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/vishwesh9835)
