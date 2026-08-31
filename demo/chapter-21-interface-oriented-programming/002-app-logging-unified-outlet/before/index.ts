// 改前：各模块把"日志记到哪"直接写死在业务代码里，控制台、文件、弹窗各玩各的，上线想统一收集日志只能满工程搜替换

// ========== 订单模块：直接 console.log ==========
function createOrder(orderNo: string): void {
  console.log(`[订单] 创建订单 ${orderNo}`);
}

// ========== 支付模块：自己拼了一坨"写文件"日志 ==========
function payOrder(orderNo: string, amount: number): void {
  const line = `2026-08-30 [支付] 订单 ${orderNo} 支付 ${amount} 元`;
  console.log(`写入 app.log：${line}`); // 模拟写文件
}

// ========== 风控模块：赶工时期有人直接弹窗报错 ==========
function riskCheck(userId: number): void {
  console.log(`[风控] 弹窗提示：用户 ${userId} 触发风控规则`);
}

createOrder('SO-1001');
payOrder('SO-1001', 99);
riskCheck(1001);

// 问题：
// 1. 每个模块自己决定日志去哪：控制台、文件、弹窗五花八门，出口完全失控
// 2. 上线后要统一接远程日志服务器，得挨个模块改一遍，漏一处日志就丢一处
// 3. 想给所有日志统一加时间戳、级别前缀，只能在每个模块复制粘贴
// 4. 日志格式无法统一治理，排查问题时各模块的日志长相都不一样

export {};
