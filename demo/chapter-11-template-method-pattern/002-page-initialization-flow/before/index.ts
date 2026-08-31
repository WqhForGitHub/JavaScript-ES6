// 改前：订单页和商品页各自把「校验登录 -> 拉数据 -> 渲染 -> 埋点」整套流程抄一遍

// 模拟登录态（真实项目里读 cookie / localStorage）
const token: string | null = 'token-abc';

// ========== 订单列表页：完整流程第一遍 ==========
function showOrderPage(): void {
  // 1. 校验登录
  if (!token) {
    console.log('未登录，跳转登录页');
    return;
  }
  // 2. 拉取数据（差异点）
  const orders = ['订单 O-1001（199 元）', '订单 O-1002（59 元）'];
  // 3. 渲染（差异点）
  console.log(`渲染订单列表：${orders.join('；')}`);
  // 4. 埋点上报
  console.log('上报埋点：page_view = order_page');
}

// ========== 商品列表页：流程又抄一遍 ==========
function showProductPage(): void {
  if (!token) {
    // 和订单页一模一样
    console.log('未登录，跳转登录页');
    return;
  }
  const products = ['商品 P-01（29 元）', '商品 P-02（45 元）'];
  console.log(`渲染商品列表：${products.join('；')}`);
  console.log('上报埋点：page_view = product_page');
}

console.log('--- 打开订单页 ---');
showOrderPage();

console.log('--- 打开商品页 ---');
showProductPage();

// 问题：
// 1. 登录校验、埋点上报这些公共步骤，每个页面函数都要复制一遍
// 2. 公共流程升级（比如埋点统一带上用户 id），所有页面函数都得挨个改
// 3. 页面一多，有的页面忘了校验登录、有的忘了埋点，行为悄悄不一致

export {};
