document.getElementById("go").onclick = async () => {
  const sym = document.getElementById("sym").value.trim().toLowerCase();
  if (!sym) return;
  const res = document.getElementById("res"); res.textContent = "查询中...";
  try {
    const txt = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(sym)}&f=sd2t2ohlcv&h&e=csv`).then(r => r.text());
    const rows = txt.trim().split("\n");
    if (rows.length < 2) throw new Error("无数据");
    const cols = rows[1].split(",");
    const [, date, time, open, high, low, close, vol] = cols.map(c => c.trim());
    if (!close) throw new Error("该代码暂无数据");
    const up = close >= open;
    res.innerHTML = `<h3><span>${sym.toUpperCase()}</span> <span class="${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(close - open).toFixed(2)}</span></h3><div>更新：${date} ${time}</div><div>开盘：<b>${open}</b></div><div>最高：<b>${high}</b></div><div>最低：<b>${low}</b></div><div>收盘：<b>${close}</b></div><div>成交量：${vol}</div>`;
  } catch (e) { res.innerHTML = "查询失败：" + e.message + "<br><small>Stooq 在线时可用，部分行业代码请加后缀 (.us / .uk)</small>"; }
};