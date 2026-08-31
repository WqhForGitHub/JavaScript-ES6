// 改后：装饰者模式（AOP 风格）-- sendRequest 保持纯净，Token 注入、日志、耗时、埋点全部用装饰器按需叠加

interface RequestParams {
  [key: string]: string;
}

type RequestFn = (url: string, params: RequestParams) => string;

// ========== AOP 装饰器：before 可加工参数，after 可拿到返回值 ==========
function before(
  fn: RequestFn,
  beforefn: (url: string, params: RequestParams) => RequestParams | void,
): RequestFn {
  return (url, params) => {
    const newParams = beforefn(url, params); // 装饰逻辑先执行
    return fn(url, newParams ?? params); // 返回新参数则替换，否则原样透传
  };
}

function after(fn: RequestFn, afterfn: (url: string, result: string) => void): RequestFn {
  return (url, params) => {
    const result = fn(url, params);
    afterfn(url, result); // 拿得到返回值，适合统计、上报
    return result;
  };
}

// ========== 核心函数：只做一件事 -- 发请求 ==========
function sendRequest(url: string, params: RequestParams): string {
  // 模拟发请求：把收到的参数拼进响应，方便观察装饰器加工后的参数长什么样
  return `GET ${url}?${new URLSearchParams(params)} -> 响应数据`;
}

// ========== 装饰逻辑：每个都是独立小函数，可任意复用 ==========
const withToken = (url: string, params: RequestParams): RequestParams => {
  return { ...params, token: 'token-abc123' }; // 注入登录态
};

const logRequest = (url: string, params: RequestParams): void => {
  console.log(`[日志] 发起请求 ${url}，参数：${JSON.stringify(params)}`);
};

const reportApiCall = (url: string): void => {
  console.log(`[埋点] api_call: ${url}`);
};

// 包裹型装饰器：前后包住原函数，适合"耗时统计"这类两头都要挂钩的逻辑
function withTimer(fn: RequestFn): RequestFn {
  return (url, params) => {
    const start = Date.now();
    const result = fn(url, params);
    console.log(`[耗时] ${url} 耗时 ${Date.now() - start}ms`);
    return result;
  };
}

// ========== 按需组装：需要什么能力就包什么装饰器 ==========
// 需要登录态的普通接口：Token + 日志 + 埋点 + 耗时
let api: RequestFn = sendRequest;
api = before(api, logRequest); // 内层：执行时 Token 已注入，日志能看到完整参数
api = before(api, withToken); // 外层：最先执行，注入登录态
api = after(api, reportApiCall);
api = withTimer(api); // 最外层：统计整条链路的耗时
// 实际执行顺序：注 Token -> 打日志 -> 发请求 -> 埋点 -> 记耗时

console.log('--- 普通接口 ---');
console.log('返回值：', api('/api/user/info', { userId: '10086' }));
console.log('返回值：', api('/api/order/list', { page: '1', size: '10' }));

// ========== 免登录的公开接口：不包 Token 装饰器，其他能力照常 ==========
let publicApi: RequestFn = sendRequest;
publicApi = before(publicApi, logRequest);
publicApi = after(publicApi, reportApiCall);

console.log('--- 公开接口（无 Token）---');
console.log('返回值：', publicApi('/api/home/banner', { city: '杭州' }));

// ========== 扩展：给接口加"响应缓存"，写一个装饰器包一层，已有代码零修改 ==========
function withCache(fn: RequestFn): RequestFn {
  const cache = new Map<string, string>();
  return (url, params) => {
    const key = `${url}?${JSON.stringify(params)}`;
    const hit = cache.get(key);
    if (hit !== undefined) {
      console.log(`[缓存] ${url} 命中缓存，跳过整条请求链路`);
      return hit;
    }
    const result = fn(url, params);
    cache.set(key, result);
    return result;
  };
}

api = withCache(api); // 缓存作为最外层，命中时连日志、埋点、请求全部跳过

console.log('--- 响应缓存扩展 ---');
console.log('返回值：', api('/api/user/info', { userId: '10086' })); // 第一次：走完整链路并写入缓存
console.log('返回值：', api('/api/user/info', { userId: '10086' })); // 第二次：直接命中缓存

// 优势：
// 1. sendRequest 只剩核心逻辑，Token/日志/埋点/耗时各自独立、一目了然
// 2. 能力按需组装：普通接口包 Token、公开接口不包，策略全在组装那几行
// 3. 新增能力（响应缓存）= 写一个装饰函数 + 包一层，已有代码零修改
// 4. before 能加工参数、after 能拿到返回值，两个原语即可组合出绝大多数横切需求

export {};
