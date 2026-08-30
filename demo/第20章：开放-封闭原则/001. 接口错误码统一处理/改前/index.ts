// 改前：接口报错的处理函数里堆满了 if/else，每新增一个错误码都要打开这个被全站依赖的核心函数动刀

// ========== 统一的接口响应结构 ==========
interface ApiResponse {
  status: number;
  message: string;
}

// ========== 全站共用的错误处理器：每个错误码占一段 if ==========
function handleApiError(response: ApiResponse): void {
  if (response.status === 400) {
    console.log(`表单提示：${response.message}（请检查填写内容）`);
  } else if (response.status === 401) {
    console.log('登录态失效：清除本地凭证，跳转到登录页');
  } else if (response.status === 403) {
    console.log('权限不足：弹出"联系管理员开通"提示');
  } else {
    console.log('未知错误：统一提示"网络开小差了，请稍后重试"');
  }
  // 新增错误码（如 429 请求太频繁）时，只能回到这里继续插 else if -- 稳定代码被反复修改
}

// 模拟四个接口的报错
handleApiError({ status: 400, message: '手机号格式不正确' });
handleApiError({ status: 401, message: 'token 已过期' });
handleApiError({ status: 403, message: '无权查看该报表' });
handleApiError({ status: 500, message: '服务重启中' });

// 问题：
// 1. 每新增一个错误码都要修改 handleApiError，被全站 30 个页面依赖的稳定函数被迫反复开刀
// 2. if/else 分支越堆越长，改错一处全站的报错处理一起遭殃，没法只回归新增的那一条
// 3. "429 要禁用按钮 30 秒"这类带状态的处理塞进公共函数里，函数慢慢长成大杂烩
// 4. 想单独测试 401 的处理逻辑，必须构造响应对象跑遍整个函数，分支之间互相牵连

export {};
