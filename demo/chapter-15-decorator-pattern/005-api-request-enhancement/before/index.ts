// 改前：Token 注入、参数日志、耗时统计、埋点上报全部写死在请求函数里，核心的"发请求"只剩几行

interface RequestParams {
  [key: string]: string;
}

function sendRequest(url: string, params: RequestParams): string {
  // 1. 注入 Token：每个请求都要带上登录态
  params.token = 'token-abc123';

  // 2. 打印参数日志：方便排查问题
  console.log(`[日志] 发起请求 ${url}，参数：${JSON.stringify(params)}`);

  // 3. 统计耗时：慢接口要能被发现
  const start = Date.now();

  // 4. 真正发请求（此处为模拟实现）
  const response = `GET ${url} -> 响应数据`;

  const elapsed = Date.now() - start;
  console.log(`[耗时] ${url} 耗时 ${elapsed}ms`);

  // 5. 埋点上报：统计各接口的调用情况
  console.log(`[埋点] api_call: ${url}`);

  // 6. 以后要加"失败重试""防重复提交""灰度分流"……全都得继续往这个函数里塞
  return response;
}

// ========== 各处调用 ==========
sendRequest('/api/user/info', { userId: '10086' });
sendRequest('/api/order/list', { page: '1', size: '10' });

// 问题：
// 1. 一个函数干了 5 件事：注 Token、打日志、算耗时、埋点、发请求，核心逻辑被淹没
// 2. 换埋点方案、调日志格式都要动这个函数，一改全站请求跟着变，回归成本高
// 3. 无法按接口定制：公开接口根本不该注 Token，免登录接口不想埋点--写死后无从选择
// 4. 想给某个单独接口加"响应缓存"，只能复制一份函数再改，逻辑开始分叉

export {};
