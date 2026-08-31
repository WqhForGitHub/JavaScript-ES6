// 改后：迭代器模式 -- 生成器把"翻页"细节封装起来，分页接口在外界眼里就是一个序列

// 模拟分页接口：每页 2 条，共 3 页
const orderDatabase: string[][] = [['订单1', '订单2'], ['订单3', '订单4'], ['订单5']];

function fetchOrders(page: number): string[] {
  console.log(`调用接口拉取第 ${page} 页...`);
  return page <= orderDatabase.length ? orderDatabase[page - 1] : [];
}

// 翻页细节全部关进生成器里，只写一次
function* paginate<T>(fetchPage: (page: number) => T[]): Generator<T> {
  let page = 1;
  while (true) {
    const items = fetchPage(page++);
    if (items.length === 0) return; // 拉到空页 = 遍历结束
    yield* items; // 把这一页逐条吐出去
  }
}

// 用法一：像遍历数组一样遍历所有订单，没有"页"的概念
console.log('--- 遍历全部订单 ---');
for (const order of paginate(fetchOrders)) {
  console.log('处理订单：', order);
}

// 用法二：处理到"订单3"就停，第 3 页根本不会去拉
console.log('--- 处理到订单3就停 ---');
for (const order of paginate(fetchOrders)) {
  console.log('处理订单：', order);
  if (order === '订单3') break; // break 即止损
}

// 优势：
// 1. 翻页逻辑只写一次，所有调用方共享，重复代码清零
// 2. 外界看到的是"一条订单流"，双层循环变成了单层 for...of
// 3. 惰性拉取：要前 3 条就只拉 2 页，不多请求一次
// 4. paginate 是通用的，换成用户列表、日志列表接口直接复用

export {};
