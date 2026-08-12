const routes = [
  { path: "/", fn: () => "<h2>首页</h2><p>Welcome to Mini Router.</p>" },
  { path: "/about", fn: () => "<h2>关于</h2><p>这是一个最小路由实现。</p>" },
  { path: "/user/:id", fn: params => `<h2>用户 ${params.id}</h2><p>从 URL 解析的参数。</p>` }
];
function match(hash) {
  const path = hash.replace(/^#/, "") || "/";
  for (const route of routes) {
    const keys = [];
    const re = new RegExp("^" + route.path.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
    const m = path.match(re);
    if (m) { const params = {}; keys.forEach((k, i) => params[k] = m[i + 1]); return route.fn(params); }
  }
  return "<h2>404</h2><p>未找到路由：" + path + "</p>";
}
function navigate() { document.getElementById("view").innerHTML = match(location.hash); }
addEventListener("hashchange", navigate);
if (!location.hash) location.hash = "#/";
navigate();