// 206. fetch封装工具

async function request(url, options = {}, fetcher = mockFetch) {
  const res = await fetcher(url, options);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
function mockFetch(url) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ url }) });
}
request("/users").then(console.log);
