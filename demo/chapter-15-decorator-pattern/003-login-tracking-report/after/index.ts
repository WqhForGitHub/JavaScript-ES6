// 改后：装饰者模式（AOP 风格）-- 用 after 装饰器把上报逻辑"贴"到业务函数之后，业务函数保持纯净

// ========== AOP 装饰器：返回"先执行原函数、再执行装饰逻辑"的新函数 ==========
function after<A extends unknown[]>(
  fn: (...args: A) => void,
  afterfn: (...args: A) => void,
): (...args: A) => void {
  return (...args: A): void => {
    fn(...args); // 先干正事
    afterfn(...args); // 再干装饰的事
  };
}

// ========== 业务函数：只做一件事 -- 打开登录浮层 ==========
function showLogin(source: string): void {
  console.log(`打开登录浮层（来源：${source}）`);
}

// ========== 埋点上报：独立的装饰逻辑，互不纠缠 ==========
const reportExpose = (): void => {
  console.log('[埋点] login_layer_expose +1');
};

const reportSource = (source: string): void => {
  console.log(`[埋点] login_source = ${source}`);
};

// ========== 装饰：showLogin 一行没改，上报被一层层贴在了后面 ==========
let loginButton = after(showLogin, reportExpose);
loginButton = after(loginButton, reportSource);

// ========== 调用方毫无感知 ==========
loginButton('首页顶栏');
loginButton('商品详情页');

// ========== 扩展 1：新增"上报 A/B 分组"，继续包一层 ==========
const reportAbGroup = (): void => {
  console.log('[埋点] login_ab_group = B');
};

loginButton = after(loginButton, reportAbGroup);
loginButton('设置页');

// ========== 扩展 2：统计 SDK 临时下线？指回原函数即可，随时回滚 ==========
loginButton = showLogin;
loginButton('活动弹窗');

// 优势：
// 1. showLogin 保持纯净，业务与埋点彻底分离，各自可读、可测
// 2. 增删埋点不动业务函数一行代码，只调整装饰链的组装
// 3. after 是通用装饰器，任何函数都能复用（曝光埋点、关闭埋点、支付埋点……）
// 4. 埋点异常可以只在装饰器里兜底，不再连累业务功能

export {};
