class MiniFetch {
  constructor({ baseURL = "", timeout = 10000, headers = {} } = {}) {
    this.baseURL = baseURL; this.timeout = timeout; this.headers = headers; this.interceptors = { req: [], res: [] };
  }
  useReq(fn) { this.interceptors.req.push(fn); }
  useRes(fn) { this.interceptors.res.push(fn); }
  request(method, url, { data, headers, timeout } = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let finalUrl = this.baseURL + url;
      if (method === "GET" && data) finalUrl += "?" + new URLSearchParams(data).toString();
      xhr.open(method, finalUrl);
      Object.entries({ ...this.headers, ...headers }).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      const timer = setTimeout(() => { xhr.abort(); reject(new Error("timeout")); }, timeout || this.timeout);
      let config = { method, url: finalUrl, data, headers };
      this.interceptors.req.forEach(fn => config = fn(config) || config);
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        clearTimeout(timer);
        let res = { status: xhr.status, data: safeJSON(xhr.responseText), headers: parseHeaders(xhr.getAllResponseHeaders()) };
        this.interceptors.res.forEach(fn => res = fn(res) || res);
        if (xhr.status >= 200 && xhr.status < 300) resolve(res); else reject(new Error("HTTP " + xhr.status));
      };
      xhr.send(method === "GET" ? null : JSON.stringify(data));
    });
  }
  get(url, opts) { return this.request("GET", url, opts); }
  post(url, opts) { return this.request("POST", url, opts); }
}
function safeJSON(s) { try { return JSON.parse(s); } catch { return s; } }
function parseHeaders(s) { return s.trim().split("\r\n").reduce((a, l) => { const [k, v] = l.split(": "); a[k] = v; return a; }, {}); }
const api = new MiniFetch({ baseURL: "", timeout: 8000, headers: { Accept: "application/json" } });
api.useReq(c => { console.log("→", c.method, c.url); return c; });
api.useRes(r => { console.log("←", r.status); return r; });
document.getElementById("get").onclick = async () => {
  document.getElementById("out").textContent = "请求中...";
  try { const r = await api.get("https://api.github.com/repos/facebook/react"); document.getElementById("out").textContent = `status: ${r.status}\nname: ${r.data.full_name}\nstars: ${r.data.stargazers_count}`; }
  catch (e) { document.getElementById("out").textContent = "错误：" + e.message + "（注意 CORS）"; }
};
document.getElementById("post").onclick = async () => {
  try { const r = await api.post("https://httpbin.org/post", { data: { hello: "world" }, headers: { "Content-Type": "application/json" } }); document.getElementById("out").textContent = "POST 返回：\n" + JSON.stringify(r.data, null, 2); }
  catch (e) { document.getElementById("out").textContent = "错误：" + e.message; }
};