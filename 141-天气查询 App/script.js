const codes = { clear: "晴", "partly cloudy": "多云", "cloudy": "阴", "overcast": "阴", fog: "雾", "light rain": "小雨", rain: "雨", "heavy rain": "大雨", "light snow": "小雪", snow: "雪", thunderstorm: "雷雨", "drizzle": "毛毛雨", "light shower": "小雨", "shower": "阵雨", "light drizzle": "毛毛雨", "moderate rain": "中雨", mist: "薄雾" };
async function search() {
  const city = document.getElementById("city").value.trim();
  if (!city) return alert("请输入城市名");
  document.getElementById("res").textContent = "查询中...";
  try {
    const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`).then(r => r.json());
    if (!g.results?.length) { document.getElementById("res").textContent = "未找到该城市"; return; }
    const { latitude, longitude, name, country } = g.results[0];
    const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`).then(r => r.json());
    const c = w.current;
    const tcodes = { 0: "晴", 1: "多云", 2: "多云", 3: "阴", 45: "雾", 48: "雾", 51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 71: "小雪", 73: "雪", 75: "大雪", 80: "阵雨", 81: "阵雨", 82: "阵雨", 95: "雷雨", 96: "雷雨", 99: "雷雨" };
    const desc = tcodes[c.weather_code] || "未知";
    document.getElementById("res").innerHTML = `<div class="city">${name}, ${country}</div><div class="temp">${Math.round(c.temperature_2m)}°C</div><div class="desc">${desc} · 风速 ${c.wind_speed_10m} km/h</div>`;
  } catch (e) { document.getElementById("res").textContent = "查询失败：" + e.message; }
}
document.getElementById("search").onclick = search;
document.getElementById("city").addEventListener("keydown", e => { if (e.key === "Enter") search(); });