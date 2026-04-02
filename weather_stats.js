// ============================================================
//  weather_stats.js  —  ClimateDash 2.0
//  Powered by WeatherAPI.com (https://www.weatherapi.com/)
//
//  ► Replace the value below with your free API key
// ============================================================

var WEATHER_API_KEY = '80ee9c8f39824ed5af7154630260403';

// ─────────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────────
var BASE_URL = 'https://api.weatherapi.com/v1/current.json';
var useCelsius = true;
var chartType  = 'bar';
var AUTO_REFRESH_SECS = 300; // 5 minutes
var countdownTimer = null;
var remaining = AUTO_REFRESH_SECS;

var CITIES = [
  { name: 'Mumbai',    query: 'Mumbai,India',    flag: '🌊', region: 'Maharashtra' },
  { name: 'Delhi',     query: 'Delhi,India',     flag: '🏛️', region: 'NCT Delhi'   },
  { name: 'Chennai',   query: 'Chennai,India',   flag: '🌴', region: 'Tamil Nadu'  },
  { name: 'Kolkata',   query: 'Kolkata,India',   flag: '🏙️', region: 'West Bengal' },
  { name: 'Bangalore', query: 'Bangalore,India', flag: '💻', region: 'Karnataka'   },
  { name: 'Hyderabad', query: 'Hyderabad,India', flag: '🍖', region: 'Telangana'   },
  { name: 'Pune',      query: 'Pune,India',      flag: '🎓', region: 'Maharashtra' },
  { name: 'Jaipur',    query: 'Jaipur,India',    flag: '🏰', region: 'Rajasthan'   }
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
//  State
// ─────────────────────────────────────────────────────────────
var charts     = {};
var cachedData = {};
var isDark     = false;

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function conditionIcon(text) {
  if (!text) return '🌡️';
  var lower = text.toLowerCase();
  for (var key in CONDITION_ICONS) {
    if (lower.indexOf(key) !== -1) return CONDITION_ICONS[key];
  }
  return '🌤️';
}

function tempColor(c) {
  if (c >= 40) return '#ef4444';
  if (c >= 35) return '#f97316';
  if (c >= 28) return '#fbbf24';
  if (c >= 20) return '#34d399';
  if (c >= 12) return '#38bdf8';
  return '#818cf8';
}

function weatherClass(c) {
  if (c >= 35) return 'weather-hot';
  if (c >= 25) return 'weather-warm';
  if (c >= 15) return 'weather-cool';
  return 'weather-rain';
}

function displayTemp(celsius) {
  if (useCelsius) return celsius.toFixed(1) + '°C';
  return (celsius * 9 / 5 + 32).toFixed(1) + '°F';
}

function feelsLike(celsius) {
  if (useCelsius) return celsius.toFixed(1) + '°C';
  return (celsius * 9 / 5 + 32).toFixed(1) + '°F';
}

// ─────────────────────────────────────────────────────────────
//  Toast notifications
// ─────────────────────────────────────────────────────────────
function showToast(message, type, icon) {
  type = type || 'info';
  icon = icon || (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️');
  var container = $('toast-container');
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.classList.add('toast-out');
    setTimeout(function () { toast.remove(); }, 300);
  }, 3200);
}

// ─────────────────────────────────────────────────────────────
//  Countdown timer & footer clock
// ─────────────────────────────────────────────────────────────
function formatCountdown(secs) {
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function startCountdown() {
  clearInterval(countdownTimer);
  remaining = AUTO_REFRESH_SECS;
  var el = $('countdown');
  if (el) el.textContent = formatCountdown(remaining);
  countdownTimer = setInterval(function () {
    remaining--;
    if (el) el.textContent = formatCountdown(remaining);
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      loadAllCities();
    }
  }, 1000);
}

function updateFooterClock() {
  var el = $('footer-time');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateFooterClock, 1000);
updateFooterClock();

// ─────────────────────────────────────────────────────────────
//  DOM builders
// ─────────────────────────────────────────────────────────────
function buildStatCard(city) {
  var card = document.createElement('div');
  card.className = 'stat-card';
  card.id = 'stat-card-' + city.name;
  card.innerHTML =
    '<div class="stat-top">' +
      '<div class="stat-city">' + city.name + '</div>' +
      '<div class="stat-emoji" id="stat-' + city.name + '-emoji">' + city.flag + '</div>' +
    '</div>' +
    '<div class="stat-temp skeleton" id="stat-' + city.name + '-temp">--</div>' +
    '<div class="stat-desc" id="stat-' + city.name + '-desc">Loading…</div>' +
    '<button class="stat-remove" title="Remove city" onclick="removeCity(\'' + city.name + '\')">✕</button>';
  return card;
}

function buildCityCard(city) {
  var card = document.createElement('div');
  card.className = 'city-card';
  card.id = 'city-card-' + city.name;
  card.innerHTML =
    '<div class="city-card-head">' +
      '<div class="city-card-head-left">' +
        '<span class="city-flag">' + city.flag + '</span>' +
        '<div>' +
          '<div class="city-name">' + city.name + '</div>' +
          '<div class="city-region">' + city.region + '</div>' +
        '</div>' +
      '</div>' +
      '<span class="badge badge-live" id="badge-' + city.name + '">LIVE</span>' +
    '</div>' +
    '<div class="city-main-row">' +
      '<div class="city-big-temp skeleton" id="card-' + city.name + '-temp">--</div>' +
      '<div class="city-weather-icon" id="card-' + city.name + '-icon">🌡️</div>' +
    '</div>' +
    '<div class="city-cond" id="card-' + city.name + '-cond">Fetching conditions…</div>' +
    '<div class="city-extra" id="card-' + city.name + '-extra"></div>' +
    '<div class="city-metrics">' +
      '<div class="metric-pill">' +
        '<div class="metric-pill-val" id="met-' + city.name + '-hum">--%</div>' +
        '<div class="metric-pill-label">Humidity</div>' +
      '</div>' +
      '<div class="metric-pill">' +
        '<div class="metric-pill-val" id="met-' + city.name + '-wind">-- km/h</div>' +
        '<div class="metric-pill-label">Wind</div>' +
      '</div>' +
      '<div class="metric-pill">' +
        '<div class="metric-pill-val" id="met-' + city.name + '-vis">-- km</div>' +
        '<div class="metric-pill-label">Visibility</div>' +
      '</div>' +
    '</div>' +
    '<div class="city-footer">' +
      '<span id="card-' + city.name + '-footer">—</span>' +
      '<button class="city-remove-btn" onclick="removeCity(\'' + city.name + '\')">✕ Remove</button>' +
    '</div>';
  return card;
}

function buildHumidityRow(city) {
  var div = document.createElement('div');
  div.className = 'hum-row';
  div.id = 'hum-row-' + city.name;
  div.innerHTML =
    '<div class="hum-label-row">' +
      '<span>' + city.name + '</span>' +
      '<span id="hum-' + city.name + '-val">--%</span>' +
    '</div>' +
    '<div class="hum-bar-bg"><div class="hum-bar-fill" id="hum-' + city.name + '-bar"></div></div>';
  return div;
}

// ─────────────────────────────────────────────────────────────
//  Render all city UI elements
// ─────────────────────────────────────────────────────────────
function renderCityElements() {
  var statsRow    = $('stats-row');
  var cityGrid    = $('city-grid');
  var humList     = $('humidity-list');

  statsRow.innerHTML = '';
  cityGrid.innerHTML = '';
  humList.innerHTML  = '';

  CITIES.forEach(function (city) {
    statsRow.appendChild(buildStatCard(city));
    cityGrid.appendChild(buildCityCard(city));
    humList.appendChild(buildHumidityRow(city));
  });
}

// ─────────────────────────────────────────────────────────────
//  Remove / Add city dynamically
// ─────────────────────────────────────────────────────────────
function removeCity(name) {
  CITIES = CITIES.filter(function (c) { return c.name !== name; });
  delete cachedData[name];

  // Remove DOM elements
  var sc = $('stat-card-' + name);  if (sc) sc.remove();
  var cc = $('city-card-' + name);  if (cc) cc.remove();
  var hr = $('hum-row-' + name);    if (hr) hr.remove();

  // Destroy and recreate charts (data set changed)
  ['chart-temp','chart-wind','chart-vis'].forEach(function(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  });
  updateCharts();
  showToast(name + ' removed from dashboard', 'info', '🗑️');
}

function addCity(name) {
  name = name.trim();
  if (!name) return;
  // Check if already exists
  var exists = CITIES.some(function (c) { return c.name.toLowerCase() === name.toLowerCase(); });
  if (exists) { showToast(name + ' is already on the dashboard', 'info', 'ℹ️'); return; }

  var city = { name: name, query: name + ',India', flag: '📍', region: 'India' };
  CITIES.push(city);

  var statsRow = $('stats-row');
  var cityGrid = $('city-grid');
  var humList  = $('humidity-list');

  statsRow.appendChild(buildStatCard(city));
  cityGrid.appendChild(buildCityCard(city));
  humList.appendChild(buildHumidityRow(city));

  fetchCity(city)
    .then(function (data) {
      cachedData[city.name] = data;
      // Use API location name for accuracy
      if (data.location && data.location.name) {
        city.name = data.location.name;
        city.region = data.location.region || 'India';
      }
      updateCityUI(city.name, data);
      // Rebuild charts with new city
      ['chart-temp','chart-wind','chart-vis'].forEach(function(id) {
        if (charts[id]) { charts[id].destroy(); delete charts[id]; }
      });
      updateCharts();
      showToast(city.name + ' added successfully!', 'success', '✅');
    })
    .catch(function () {
      showError(city.name);
      showToast('Could not find "' + name + '". Check the city name.', 'error', '❌');
    });
}

// ─────────────────────────────────────────────────────────────
//  Fetch one city
// ─────────────────────────────────────────────────────────────
function fetchCity(city) {
  var url = BASE_URL
    + '?key='  + encodeURIComponent(WEATHER_API_KEY)
    + '&q='    + encodeURIComponent(city.query)
    + '&aqi=no';
  return fetch(url).then(function (r) {
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
  var tc   = cur.temp_c;
  var fl   = cur.feelslike_c;
  var cond = (cur.condition && cur.condition.text) ? cur.condition.text : 'N/A';
  var icon = conditionIcon(cond);
  var col  = tempColor(tc);
  var wCls = weatherClass(tc);

  // Update city card's weather class
  var card = $('city-card-' + name);
  if (card) {
    card.className = 'city-card ' + wCls;
  }

  // ── Stat strip ──
  var statTempEl = $('stat-' + name + '-temp');
  if (statTempEl) {
    statTempEl.textContent = displayTemp(tc);
    statTempEl.style.color = col;
    statTempEl.classList.remove('skeleton');
  }
  var statDesc = $('stat-' + name + '-desc');
  if (statDesc) {
    statDesc.textContent = cond;
    statDesc.classList.remove('skeleton');
  }
  var statEmoji = $('stat-' + name + '-emoji');
  if (statEmoji) statEmoji.textContent = icon;

  // ── City card ──
  var cardTempEl = $('card-' + name + '-temp');
  if (cardTempEl) {
    cardTempEl.textContent = displayTemp(tc);
    cardTempEl.style.color = col;
    cardTempEl.classList.remove('skeleton');
  }
  var iconEl = $('card-' + name + '-icon');
  if (iconEl) iconEl.textContent = icon;

  setText('card-' + name + '-cond', cond);
  setText('card-' + name + '-extra',
    'Feels like ' + feelsLike(fl) +
    ' · ' + cur.wind_dir + ' ' + cur.wind_kph.toFixed(0) + ' km/h');

  // ── Metric pills ──
  setText('met-' + name + '-hum',  cur.humidity + '%');
  setText('met-' + name + '-wind', cur.wind_kph.toFixed(0) + ' km/h');
  setText('met-' + name + '-vis',  cur.vis_km + ' km');

  // ── Footer ──
  var timeStr = loc.localtime ? loc.localtime.split(' ')[1] : '--:--';
  setText('card-' + name + '-footer', 'Local time: ' + timeStr + ' · ' + (loc.country || 'India'));

  // ── Badge ──
  var badge = $('badge-' + name);
  if (badge) { badge.textContent = 'LIVE'; badge.className = 'badge badge-live'; }

  // ── Humidity bar ──
  setText('hum-' + name + '-val', cur.humidity + '%');
  var bar = $('hum-' + name + '-bar');
  if (bar) { setTimeout(function () { bar.style.width = cur.humidity + '%'; }, 120); }
}

function setText(id, text) {
  var el = $(id); if (!el) return;
  el.textContent = text;
  el.classList.remove('skeleton');
}

// ─────────────────────────────────────────────────────────────
//  Error state
// ─────────────────────────────────────────────────────────────
function showError(name) {
  setText('stat-' + name + '-temp', '--');
  setText('stat-' + name + '-desc', 'Error');
  setText('card-' + name + '-temp', '--');
  setText('card-' + name + '-cond', 'Could not load data');
  setText('card-' + name + '-extra', '');
  setText('card-' + name + '-footer', 'Data unavailable');
  var badge = $('badge-' + name);
  if (badge) { badge.textContent = 'ERR'; badge.className = 'badge badge-err'; }
  var statTempEl = $('stat-' + name + '-temp');
  if (statTempEl) statTempEl.classList.remove('skeleton');
  var cardTempEl = $('card-' + name + '-temp');
  if (cardTempEl) cardTempEl.classList.remove('skeleton');
}

// ─────────────────────────────────────────────────────────────
//  Temp unit toggle — re-render all cached values
// ─────────────────────────────────────────────────────────────
function refreshTemperatureDisplay() {
  CITIES.forEach(function (city) {
    var data = cachedData[city.name];
    if (!data) return;
    var tc = data.current.temp_c;
    var fl = data.current.feelslike_c;
    var col = tempColor(tc);

    var st = $('stat-' + city.name + '-temp');
    if (st) { st.textContent = displayTemp(tc); st.style.color = col; }

    var ct = $('card-' + city.name + '-temp');
    if (ct) { ct.textContent = displayTemp(tc); ct.style.color = col; }

    var ce = $('card-' + city.name + '-extra');
    if (ce) ce.textContent = 'Feels like ' + feelsLike(fl) +
      ' · ' + data.current.wind_dir + ' ' + data.current.wind_kph.toFixed(0) + ' km/h';
  });
  updateCharts();
}

// ─────────────────────────────────────────────────────────────
//  Charts (Chart.js)
// ─────────────────────────────────────────────────────────────
function getChartTheme() {
  var gridColor = isDark ? 'rgba(99,140,255,0.07)' : 'rgba(59,110,246,0.08)';
  var tickColor = isDark ? '#4e6080' : '#8a9abf';
  var tooltipBg = isDark ? 'rgba(14,20,38,0.95)' : 'rgba(248,249,255,0.97)';
  var tooltipBorder = isDark ? 'rgba(91,141,239,0.3)' : 'rgba(59,110,246,0.25)';
  var tooltipText   = isDark ? '#eef2ff' : '#1e2d5a';
  return { gridColor: gridColor, tickColor: tickColor, tooltipBg: tooltipBg, tooltipBorder: tooltipBorder, tooltipText: tooltipText };
}

var BASE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeInOutQuart' },
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: getChartTheme().gridColor, drawBorder: false },
      ticks: { color: getChartTheme().tickColor, font: { size: 11, family: 'Inter' } },
      border: { display: false }
    },
    y: {
      grid: { color: getChartTheme().gridColor, drawBorder: false },
      ticks: { color: getChartTheme().tickColor, font: { size: 11, family: 'Inter' } },
      border: { display: false }
    }
  }
};

function makeGradient(ctx, color1, color2) {
  var grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  return grad;
}

function buildOrUpdateChart(id, labels, values, gradientTop, gradientBot, borderColor, unit) {
  // canvas may be inside a .canvas-wrap — find it by ID
  var canvasEl = $(id);
  if (!canvasEl) return;
  var ctx = canvasEl.getContext('2d');
  var theme = getChartTheme();

  var gradient = makeGradient(ctx, gradientTop, gradientBot);

  if (charts[id]) {
    if (charts[id].config.type !== chartType) {
      charts[id].destroy();
      delete charts[id];
    } else {
      charts[id].data.labels = labels;
      charts[id].data.datasets[0].data = values;
      charts[id].data.datasets[0].backgroundColor = chartType === 'bar' ? gradient : gradientTop;
      charts[id].update();
      return;
    }
  }

  var isLine = chartType === 'line';
  charts[id] = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: isLine ? gradientBot : gradient,
        borderColor: borderColor,
        borderWidth: isLine ? 2.5 : 0,
        borderRadius: isLine ? 0 : 10,
        borderSkipped: false,
        fill: isLine ? 'origin' : false,
        tension: 0.4,
        pointBackgroundColor: borderColor,
        pointRadius: isLine ? 4 : 0,
        pointHoverRadius: isLine ? 6 : 0
      }]
    },
    options: Object.assign({}, BASE_CHART_OPTIONS, {
      scales: {
        x: {
          grid: { color: theme.gridColor, drawBorder: false },
          ticks: { color: theme.tickColor, font: { size: 11, family: 'Inter' } },
          border: { display: false }
        },
        y: {
          grid: { color: theme.gridColor, drawBorder: false },
          ticks: { color: theme.tickColor, font: { size: 11, family: 'Inter' } },
          border: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ' ' + ctx.parsed.y.toFixed(1) + ' ' + unit; }
          },
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          titleFont: { family: 'Inter', size: 12 },
          bodyFont:  { family: 'Inter', size: 12 }
        }
      }
    })
  });
}

function field(key) {
  return CITIES.map(function (c) {
    var d = cachedData[c.name];
    return (d && d.current) ? (d.current[key] || 0) : 0;
  });
}

function updateCharts() {
  var labels = CITIES.map(function (c) { return c.name; });
  var temps  = field('temp_c');
  var winds  = field('wind_kph');
  var vis    = field('vis_km');

  buildOrUpdateChart(
    'chart-temp', labels, temps,
    'rgba(249,115,22,0.65)', 'rgba(249,115,22,0.05)',
    '#f97316', useCelsius ? '°C' : '°F'
  );
  buildOrUpdateChart(
    'chart-wind', labels, winds,
    'rgba(91,141,239,0.65)', 'rgba(91,141,239,0.05)',
    '#5b8def', 'km/h'
  );
  buildOrUpdateChart(
    'chart-vis', labels, vis,
    'rgba(52,211,153,0.65)', 'rgba(52,211,153,0.05)',
    '#34d399', 'km'
  );

  // Update chart badge labels
  if (temps.length) {
    var maxTemp = Math.max.apply(null, temps);
    var hotIdx  = temps.indexOf(maxTemp);
    var ct = $('chart-temp-max');
    if (ct) ct.textContent = 'Hottest: ' + CITIES[hotIdx].name;
  }
  var maxWind = Math.max.apply(null, winds);
  var wi = winds.indexOf(maxWind);
  var cw = $('chart-wind-max');
  if (cw && CITIES[wi]) cw.textContent = 'Windiest: ' + CITIES[wi].name;
  var maxVis = Math.max.apply(null, vis);
  var vi = vis.indexOf(maxVis);
  var cv = $('chart-vis-max');
  if (cv && CITIES[vi]) cv.textContent = 'Clearest: ' + CITIES[vi].name;
}

// ─────────────────────────────────────────────────────────────
//  Sort cities
// ─────────────────────────────────────────────────────────────
function sortCities(mode) {
  if (mode === 'default') return;
  CITIES.sort(function (a, b) {
    var da = cachedData[a.name], db = cachedData[b.name];
    if (!da || !db) return 0;
    if (mode === 'temp-asc')  return da.current.temp_c - db.current.temp_c;
    if (mode === 'temp-desc') return db.current.temp_c - da.current.temp_c;
    if (mode === 'humidity')  return db.current.humidity - da.current.humidity;
    if (mode === 'wind')      return db.current.wind_kph - da.current.wind_kph;
    return 0;
  });
  renderCityElements();
  CITIES.forEach(function (city) {
    var data = cachedData[city.name];
    if (data) updateCityUI(city.name, data);
  });
  ['chart-temp','chart-wind','chart-vis'].forEach(function(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  });
  updateCharts();
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

  return Promise.all(promises).then(function () {
    updateCharts();
    var now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    var lastUpdated = $('last-updated-text');
    if (lastUpdated) lastUpdated.textContent = 'Last updated: ' + now;
    startCountdown();
  });
}

// ─────────────────────────────────────────────────────────────
//  Event Listeners
// ─────────────────────────────────────────────────────────────
function attachListeners() {
  // Refresh button
  var btn = $('refresh-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      btn.classList.add('loading');
      loadAllCities().then(function () {
        setTimeout(function () { btn.classList.remove('loading'); }, 800);
        showToast('Weather data refreshed!', 'success', '🔄');
      });
    });
  }

  // Search / add city
  var searchBtn = $('search-btn');
  var searchInput = $('city-search');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      addCity(searchInput.value);
      searchInput.value = '';
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        addCity(searchInput.value);
        searchInput.value = '';
      }
    });
  }

  // Unit toggle
  var unitToggle = $('unit-toggle');
  if (unitToggle) {
    unitToggle.addEventListener('click', function () {
      useCelsius = !useCelsius;
      $('unit-c').classList.toggle('active', useCelsius);
      $('unit-f').classList.toggle('active', !useCelsius);
      refreshTemperatureDisplay();
    });
  }

  // Sort select
  var sortSel = $('sort-select');
  if (sortSel) {
    sortSel.addEventListener('change', function () {
      sortCities(this.value);
    });
  }

  // Chart type tabs
  var tabs = document.querySelectorAll('.chart-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      chartType = tab.dataset.chart;
      ['chart-temp','chart-wind','chart-vis'].forEach(function(id) {
        if (charts[id]) { charts[id].destroy(); delete charts[id]; }
      });
      updateCharts();
    });
  });

  // Theme toggle
  var themeBtn = $('theme-toggle');
  if (themeBtn) {
    // Restore saved preference
    var savedTheme = localStorage.getItem('climatedash-theme');
    if (savedTheme === 'dark') {
      isDark = true;
      document.body.classList.add('dark');
      $('theme-icon').textContent = '\u2600\uFE0F';
      $('theme-label').textContent = 'Light';
    }

    themeBtn.addEventListener('click', function () {
      isDark = !isDark;
      document.body.classList.toggle('dark', isDark);
      $('theme-icon').textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
      $('theme-label').textContent = isDark ? 'Light' : 'Dark';
      localStorage.setItem('climatedash-theme', isDark ? 'dark' : 'light');
      // Re-render charts with correct theme colors
      ['chart-temp','chart-wind','chart-vis'].forEach(function(id) {
        if (charts[id]) { charts[id].destroy(); delete charts[id]; }
      });
      updateCharts();
    });
  }
}

// ─────────────────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────────────────
function boot() {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
    CITIES.forEach(function (city) {
      setText('stat-' + city.name + '-desc', '⚠ Set WEATHER_API_KEY in weather_stats.js');
      setText('card-' + city.name + '-cond', '⚠ Set WEATHER_API_KEY in weather_stats.js');
    });
    console.warn('[ClimateDash] Please set WEATHER_API_KEY in weather_stats.js');
    return;
  }
  renderCityElements();
  attachListeners();
  loadAllCities();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
