const coins = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL", binancecoin: "BNB", ripple: "XRP", cardano: "ADA", dogecoin: "DOGE", polkadot: "DOT" };
document.getElementById("load").onclick = async () => {
  const body = document.getElementById("body"); body.innerHTML = "<tr><td colspan='3'>加载中...</td></tr>";
  try {
    const ids = Object.keys(coins).join(",");
    const data = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`).then(r => r.json());
    body.innerHTML = Object.entries(coins).map(([id, sym]) => {
      const p = data[id]; if (!p) return `<tr><td>${sym}</td><td colspan="2">无数据</td></tr>`;
      const ch = p.usd_24h_change; const cls = ch >= 0 ? "up" : "down";
      return `<tr><td><b>${sym}</b></td><td>$${p.usd.toLocaleString()}</td><td class="${cls}">${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%</td></tr>`;
    }).join("");
  } catch (e) { body.innerHTML = `<tr><td colspan="3">加载失败：${e.message}</td></tr>`; }
};
document.getElementById("load").click();