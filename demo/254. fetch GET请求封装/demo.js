// 254. fetch GET请求封装

async function getJson(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(query ? `${url}?${query}` : url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
console.log("getJson ready");
