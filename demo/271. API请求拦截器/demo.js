// 271. API请求拦截器

class ApiClient {
  constructor() {
    this.requestInterceptors = [];
  }
  useRequest(fn) {
    this.requestInterceptors.push(fn);
  }
  request(config) {
    const finalConfig = this.requestInterceptors.reduce((cfg, fn) => fn(cfg), config);
    console.log('request:', finalConfig);
    return Promise.resolve(finalConfig);
  }
}
const client = new ApiClient();
client.useRequest((c) => ({ ...c, headers: { token: 'abc' } }));
client.request({ url: '/api' });
