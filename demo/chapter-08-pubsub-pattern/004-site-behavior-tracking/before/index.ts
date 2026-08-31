// 改前：埋点代码散落在每个业务函数里，业务逻辑和统计逻辑搅在一起
function track(event: string, detail: string): void {
  console.log(`[埋点] ${event}：${detail}`);
}

function login(name: string): void {
  console.log(`[业务] ${name} 登录成功`);
  track('登录', name); // 业务代码里插一句埋点
}

function addToCart(sku: string): void {
  console.log(`[业务] 商品 ${sku} 加入购物车`);
  track('加购', sku); // 又插一句
}

function payOrder(orderNo: string): void {
  console.log(`[业务] 订单 ${orderNo} 支付成功`);
  track('支付', orderNo); // 再插一句
}

login('张三');
addToCart('SKU-1001');
payOrder('SO-2001');

// 问题：
// 1. 埋点侵入每个业务函数，读业务代码时满眼都是统计噪音
// 2. 埋点平台更换（自研换神策），要改遍所有业务函数
// 3. 想再加"异常上报""性能监控"这类横切功能？继续往每个函数里插代码

export {};
