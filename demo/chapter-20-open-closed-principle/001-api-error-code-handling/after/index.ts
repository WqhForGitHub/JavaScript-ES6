// 改后：开放-封闭原则 -- 分发函数对修改关闭，错误码处理像插件一样注册进来，新增错误码只加代码不改代码

// ========== 统一的接口响应结构 ==========
interface ApiResponse {
  status: number;
  message: string;
}

// ========== 错误处理器注册表：错误码 -> 处理动作 ==========
const errorHandlerRegistry = new Map<number, (response: ApiResponse) => void>();

function registerErrorHandler(status: number, handler: (response: ApiResponse) => void): void {
  errorHandlerRegistry.set(status, handler);
}

// ========== 兜底处理器：没注册过的错误码走这里 ==========
function handleUnknown(response: ApiResponse): void {
  console.log(`未知错误（${response.status}）：统一提示"网络开小差了，请稍后重试"`);
}

// ========== 分发函数：核心逻辑从此不再因新错误码而修改 ==========
function handleApiError(response: ApiResponse): void {
  const handler = errorHandlerRegistry.get(response.status) ?? handleUnknown;
  handler(response);
}

// ========== 注册既有错误码：每条处理相互独立 ==========
registerErrorHandler(400, (response) => {
  console.log(`表单提示：${response.message}（请检查填写内容）`);
});

registerErrorHandler(401, () => {
  console.log('登录态失效：清除本地凭证，跳转到登录页');
});

registerErrorHandler(403, () => {
  console.log('权限不足：弹出"联系管理员开通"提示');
});

// ========== 既有错误码照常工作 ==========
handleApiError({ status: 400, message: '手机号格式不正确' });
handleApiError({ status: 401, message: 'token 已过期' });
handleApiError({ status: 403, message: '无权查看该报表' });
handleApiError({ status: 500, message: '服务重启中' }); // 未注册的错误码自动落到兜底

// ========== 扩展：新需求"429 请求太频繁"，只新增一个注册，handleApiError 一行未改 ==========
registerErrorHandler(429, () => {
  console.log('请求太频繁：按钮置灰 30 秒，倒计时结束后再允许提交');
});

handleApiError({ status: 429, message: '触发限流' });

// 优势：
// 1. 新错误码 = 一条新注册，分发函数和既有处理逻辑零修改，回归风险被锁死在新代码里
// 2. 每条处理是独立函数，带状态的复杂处理（如倒计时禁用按钮）也能各写各的互不纠缠
// 3. 处理逻辑可按模块拆分注册：用户模块注册 401、运营模块注册 403，互不冲突互不阻塞
// 4. 想测试 429 直接调用它的处理函数即可，不必再构造响应对象跑遍整个分发函数

export {};
