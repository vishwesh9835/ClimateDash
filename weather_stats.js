// ============================================================
//  weather_stats.js  —  ClimateDash live weather fetcher
//  Powered by WeatherAPI.com (https://www.weatherapi.com/)
//
//  ► Replace the value below with your free API key
// ============================================================

var WEATHER_API_KEY = '80ee9c8f39824ed5af7154630260403';   // <-- paste your key here

// ─────────────────────────────────────────────────────────────
//  Config — add / remove cities as you like
// ─────────────────────────────────────────────────────────────
var BASE_URL = 'https://api.weatherapi.com/v1/current.json';

var CITIES = [
  { name: 'Mumbai',  query: 'Mumbai,India'  },
  { name: 'Delhi',   query: 'Delhi,India'   },
  { name: 'Chennai', query: 'Chennai,India' },
  { name: 'Kolkata', query: 'Kolkata,India' }
];

// ─────────────────────────────────────────────────────────────
//  Condition → emoji map
// ─────────────────────────────────────────────────────────────
var CONDITION_ICONS = {
  'sunny':         '☀️',
  'clear':         '🌙',
  'partly cloudy': '⛅',
  'cloudy':        '☁️',
  'overcast':      '☁️',
  'mist':          '🌫️',
  'fog':           '🌫️',
  'light rain':    '🌦️',
  'moderate rain': '🌧️',
  'heavy rain':    '🌧️',
  'drizzle':       '🌦️',
  'rain':          '🌧️',
  'thunder':       '⛈️',
  'snow':          '❄️',
  'blizzard':      '🌨️',
  'sleet':         '🌨️',
  'hail':          '🌨️',
  'freezing':      '🥶'
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
var charts = {};
var cachedData = {};

function $(id) { return document.getElementById(id); }

function set(id, text) {
  var el = $(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('skeleton');
}

function conditionIcon(text) {
  if (!text) return '🌡️';
  var lower = text.toLowerCase();
  for (var key in CONDITION_ICONS) {
    if (lower.indexOf(key) !== -1) return CONDITION_ICONS[key];
  }
  return '🌤️';
}

function tempColor(c) {
  if (c >= 38) return '#ff5252';
  if (c >= 32) return '#ff7043';
  if (c >= 25) return '#ffca28';
  if (c >= 18) return '#66bb6a';
  if (c >= 10) return '#42a5f5';
  return '#80deea';
}

// ─────────────────────────────────────────────────────────────
//  Fetch one city
// ─────────────────────────────────────────────────────────────
function fetchCity(city) {
  var url = BASE_URL
    + '?key=' + encodeURIComponent(WEATHER_API_KEY)
    + '&q='   + encodeURIComponent(city.query)
    + '&aqi=no';

  return fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
}

// ─────────────────────────────────────────────────────────────
//  Update DOM for one city
// ─────────────────────────────────────────────────────────────
function updateCityUI(name, data) {
  var cur  = data.current;
  var loc  = data.location;
  var temp = cur.temp_c;
  var cond = (cur.condition && cur.condition.text) ? cur.condition.text : 'N/A';
  var icon = conditionIcon(cond);
  var col  = tempColor(temp);

  // — Stat strip —
  var statTempEl = $('stat-' + name + '-temp');
  if (statTempEl) {
    statTempEl.textContent = temp.toFixed(1) + '°C';
    statTempEl.style.color = col;
    statTempEl.classList.remove('skeleton');
  }
  set('stat-' + name + '-desc', cond);

  // — City card —
  var cardTempEl = $('card-' + name + '-temp');
  if (cardTempEl) {
    cardTempEl.textContent = temp.toFixed(1) + '°C';
    cardTempEl.style.color = col;
    cardTempEl.classList.remove('skeleton');
  }
  var iconEl = $('card-' + name + '-icon');
  if (iconEl) iconEl.textContent = icon;

  set('card-' + name + '-cond',   cond + ' · ' + cur.humidity + '% humidity');
  set('card-' + name + '-extra',  'Feels like ' + cur.feelslike_c.toFixed(1) + '°C · Wind '
                                  + cur.wind_kph.toFixed(0) + ' km/h ' + cur.wind_dir);
  set('card-' + name + '-footer', 'Updated ' + loc.localtime);

  var badge = $('badge-' + name);
  if (badge) { badge.textContent = 'LIVE'; badge.className = 'badge badge-live'; }

  // — Humidity bar —
  set('hum-' + name + '-val', cur.humidity + '%');
  var bar = $('hum-' + name + '-bar');
  if (bar) { setTimeout(function () { bar.style.width = cur.humidity + '%'; }, 100); }
}

// ─────────────────────────────────────────────────────────────
//  Show error state for one city
// ─────────────────────────────────────────────────────────────
function showError(name) {
  set('stat-' + name + '-temp', '--');
  set('stat-' + name + '-desc', 'Error');
  set('card-' + name + '-temp', '--');
  set('card-' + name + '-cond', 'Could not load data');
  set('card-' + name + '-extra',  '');
  set('card-' + name + '-footer', '');
  var badge = $('badge-' + name);
  if (badge) { badge.textContent = 'ERR'; badge.className = 'badge badge-err'; }
}

// ─────────────────────────────────────────────────────────────
//  Charts (Chart.js — loaded via CDN in index.html)
// ─────────────────────────────────────────────────────────────
var CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(99,140,255,0.08)' }, ticks: { color: '#6b7a99', font: { size: 11 } } },
    y: { grid: { color: 'rgba(99,140,255,0.08)' }, ticks: { color: '#6b7a99', font: { size: 11 } } }
  }
};

function buildOrUpdateChart(id, labels, values, bgColors, unit) {
  var ctx = $(id);
  if (!ctx) return;

  if (charts[id]) {
    charts[id].data.datasets[0].data = values;
    charts[id].data.datasets[0].backgroundColor = bgColors;
    charts[id].update();
    return;
  }

  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: Object.assign({}, CHART_OPTIONS, {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.parsed.y.toFixed(1) + ' ' + unit; }
          }
        }
      }
    })
  });
}

function updateCharts() {
  var labels = CITIES.map(function (c) { return c.name; });

  function field(key) {
    return CITIES.map(function (c) {
      var d = cachedData[c.name];
      return (d && d.current && d.current[key]) ? d.current[key] : 0;
    });
  }

  var temps = field('temp_c');
  buildOrUpdateChart('chart-temp', labels, temps, temps.map(tempColor), '°C');

  buildOrUpdateChart('chart-wind', labels, field('wind_kph'),
    labels.map(function () { return 'rgba(99,140,255,0.75)'; }), 'km/h');

  buildOrUpdateChart('chart-vis', labels, field('vis_km'),
    labels.map(function () { return 'rgba(167,139,250,0.75)'; }), 'km');
}

// ─────────────────────────────────────────────────────────────
//  Load all cities
// ─────────────────────────────────────────────────────────────
function loadAllCities() {
  var promises = CITIES.map(function (city) {
    return fetchCity(city)
      .then(function (data) {
        cachedData[city.name] = data;
        updateCityUI(city.name, data);
      })
      .catch(function (err) {
        console.error('[ClimateDash] ' + city.name + ':', err.message);
        showError(city.name);
      });
  });
  return Promise.all(promises).then(updateCharts);
}

// ─────────────────────────────────────────────────────────────
//  Refresh button
// ─────────────────────────────────────────────────────────────
function attachRefreshHandler() {
  var btn = $('refresh-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    btn.classList.add('loading');
    btn.disabled = true;
    loadAllCities().then(function () {
      setTimeout(function () {
        btn.classList.remove('loading');
        btn.disabled = false;
      }, 800);
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────────────────
function boot() {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
    CITIES.forEach(function (city) {
      set('stat-' + city.name + '-desc', '⚠ Set WEATHER_API_KEY in weather_stats.js');
      set('card-' + city.name + '-cond', '⚠ Set WEATHER_API_KEY in weather_stats.js');
    });
    console.warn('[ClimateDash] Please set WEATHER_API_KEY in weather_stats.js');
    return;
  }
  loadAllCities();
  attachRefreshHandler();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
