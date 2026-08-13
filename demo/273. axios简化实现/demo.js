// 273. axios简化实现

function axiosLike(config) {
  const { url, method = 'GET', data, headers = {} } = config;
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data ? JSON.stringify(data) : undefined,
  }).then((r) => r.json());
}
axiosLike.get = (url) => axiosLike({ url });
axiosLike.post = (url, data) => axiosLike({ url, method: 'POST', data });
console.log('axiosLike ready');
