document.getElementById("go").onclick = async () => {
  const ip = document.getElementById("ip").value.trim();
  const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : "https://ipapi.co/json/";
  const res = document.getElementById("res"); res.textContent = "查询中...";
  try {
    const data = await fetch(url).then(r => r.json());
    if (data.error) throw new Error(data.reason || "查询失败");
    res.innerHTML = `IP：<b>${data.ip}</b><br>城市：<b>${data.city || "—"}</b><br>地区：<b>${data.region || "—"}</b><br>国家：<b>${data.country_name || "—"} ${data.country_code || ""}</b><br>经纬度：<b>${data.latitude || "—"}, ${data.longitude || "—"}</b><br>运营商：<b>${data.org || "—"}</b><br>时区：<b>${data.timezone || "—"}</b>`;
  } catch (e) { res.innerHTML = "查询失败：" + e.message + "<br><small>可尝试 ip-api 类备用接口</small>"; }
};