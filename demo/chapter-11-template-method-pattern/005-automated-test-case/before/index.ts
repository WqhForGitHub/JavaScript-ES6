// 改前：每写一个测试用例，都要手抄一遍 try/finally 执行样板，抄漏就污染环境

// ========== 测试 1：下单成功场景 ==========
function testCreateOrder(): void {
  console.log('准备：清空购物车');
  try {
    console.log('执行：创建订单 O-1，断言金额 = 99 元');
  } finally {
    console.log('清理：回滚数据库');
  }
}

// ========== 测试 2：取消订单场景（样板又抄一遍） ==========
function testCancelOrder(): void {
  console.log('准备：清空购物车'); // 又抄一遍
  try {
    console.log('执行：取消订单 O-2，断言状态 = 已取消');
  } finally {
    console.log('清理：回滚数据库'); // 又抄一遍
  }
}

// ========== 测试 3：库存不足场景（忘了 try/finally，用例一抛异常清理就被跳过） ==========
function testOutOfStock(): void {
  console.log('准备：清空购物车');
  console.log('执行：库存不足下单，断言抛出 OUT_OF_STOCK');
  throw new Error('OUT_OF_STOCK');
  // 清理代码被遗忘，异常直接冲垮整个测试进程，还污染下一个用例
}

console.log('--- 测试 1 ---');
testCreateOrder();

console.log('--- 测试 2 ---');
testCancelOrder();

console.log('--- 测试 3（异常冲破清理）---');
try {
  testOutOfStock();
} catch (e) {
  console.log(`测试进程兜底捕获：${(e as Error).message}`);
}

// 问题：
// 1. 「准备 -> 执行 -> 清理」的样板每个用例都要抄一遍，写测试比写业务还累
// 2. 忘写 try/finally 的用例，断言一抛异常清理就被跳过，脏数据留给后面的用例
// 3. 框架想统一加「用例耗时统计」，只能改遍所有测试函数

export {};
