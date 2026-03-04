# 🌦️ ClimateDash — Live Weather Dashboard

ClimateDash is a modern, responsive **real-time weather analytics dashboard** built using **HTML, CSS, JavaScript, and Chart.js**.

It fetches live weather data for major Indian cities using WeatherAPI and displays it in a clean, visually rich UI.

---

## 🚀 Features

- 🌡️ Live temperature display  
- 💧 Humidity tracking with animated bars  
- 🌬️ Wind speed visualization  
- 👁️ Visibility comparison  
- 📊 Interactive charts powered by Chart.js  
- 🔄 One-click refresh system  
- 📱 Fully responsive design  
- ✨ Modern gradient + glass UI  

---

## 🏙️ Cities Included

- Mumbai  
- Delhi  
- Chennai  
- Kolkata  

You can easily add or remove cities in `weather_stats.js`.

---

## 🛠️ Tech Stack

- HTML5  
- CSS3  
- JavaScript (Vanilla JS)  
- Chart.js  
- WeatherAPI  

---

## 📂 Project Structure

```
ClimateDash/
│
├── index.html        # Main UI structure
├── style.css         # Styling and layout
├── weather_stats.js  # API fetching + chart logic
└── README.md
```

---

## 🔑 Setup Instructions

### 1️⃣ Get a Free API Key

1. Go to https://www.weatherapi.com/
2. Sign up for a free account
3. Copy your API key

---

### 2️⃣ Add API Key

Open `weather_stats.js` and replace:

```js
var WEATHER_API_KEY = 'YOUR_API_KEY_HERE';
```

With:

```js
var WEATHER_API_KEY = 'your_actual_api_key';
```

---

### 3️⃣ Run the Project

Simply open:

```
index.html
```

in your browser.

No backend or server required.

---

## 📊 Charts Included

- Temperature Comparison (°C)
- Wind Speed (km/h)
- Visibility (km)
- Humidity Levels

---

## 🎨 UI Highlights

- Skeleton loading animation  
- Dynamic temperature color coding  
- Weather condition emoji mapping  
- Smooth hover animations  
- Fully responsive layout  

---

## 🔄 Adding More Cities

Edit the `CITIES` array in `weather_stats.js`:

```js
var CITIES = [
  { name: 'Pune', query: 'Pune,India' }
];
```

Make sure corresponding HTML IDs exist if you add new cities.

---

## ⚠️ Important Notes

- Do not expose your API key publicly.
- Free WeatherAPI plans have request limits.
- Internet connection is required for live data.

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👨‍💻 Author : Vishwesh Rajopadhye

Built as a frontend + API integration project.
