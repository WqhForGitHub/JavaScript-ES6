// 改前：调用方自己管理页码、缓存、结束标志，双层循环嵌套，翻页样板代码满天飞

// 模拟分页接口：每页 2 条，共 3 页
const orderDatabase: string[][] = [['订单1', '订单2'], ['订单3', '订单4'], ['订单5']];

function fetchOrders(page: number): string[] {
  console.log(`调用接口拉取第 ${page} 页...`);
  return page <= orderDatabase.length ? orderDatabase[page - 1] : [];
}

// 每个消费方都得自己写一遍这套"翻页样板代码"
let page = 1;
let finished = false;
const allOrders: string[] = [];

while (!finished) {
  const orders = fetchOrders(page++);
  if (orders.length === 0) {
    finished = true; // 靠空页判断结束
  } else {
    for (const order of orders) {
      allOrders.push(order); // 只能先全部攒进数组
    }
  }
}

console.log('全部订单：', allOrders);

// 就算只想处理前 3 条，也必须把 3 页全部拉完才能动手

// 问题：
// 1. 页码、buffer、结束标志散落在每个调用方，重复代码遍地
// 2. 双层循环嵌套，可读性差
// 3. 无法把"分页数据"当成一个整体序列来用
// 4. 想"处理到某条就停止"？做不到，永远先拉完全部页

export {};
