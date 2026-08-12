const btn = document.getElementById("btn"), res = document.getElementById("res");
function ok(p) {
  const { latitude, longitude, accuracy } = p.coords;
  res.innerHTML = `纬度：<b>${latitude.toFixed(6)}</b><br>经度：<b>${longitude.toFixed(6)}</b><br>精度：约 ${Math.round(accuracy)} m<br>时间：${new Date(p.timestamp).toLocaleTimeString()}`;
  document.getElementById("map").textContent = "🌍";
  btn.textContent = "刷新位置";
}
function fail(e) { res.innerHTML = "定位失败：" + e.message; }
btn.onclick = () => {
  if (!navigator.geolocation) { res.textContent = "浏览器不支持定位"; return; }
  res.textContent = "定位中...";
  navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy: true, timeout: 10000 });
};
const watch = navigator.geolocation.watchPosition ? null : null;