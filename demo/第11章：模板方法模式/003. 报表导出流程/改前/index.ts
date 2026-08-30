// 改前：导出 Excel 和导出 CSV 各写一套，查数据、发通知原样抄两遍

interface OrderRow {
  orderNo: string;
  amount: number;
}

// 模拟数据库查询：两种导出用的都是这份数据
function queryOrders(): OrderRow[] {
  return [
    { orderNo: 'O-1001', amount: 199 },
    { orderNo: 'O-1002', amount: 59 },
    { orderNo: 'O-1003', amount: 1288 },
  ];
}

// ========== 导出 Excel：完整流程第一遍 ==========
function exportExcel(): void {
  // 1. 查数据
  const rows = queryOrders();
  // 2. 组装内容（差异点）
  const cells = rows.map((r) => `${r.orderNo}|${r.amount}`).join('|');
  // 3. 写文件（差异点）
  console.log(`生成订单报表.xlsx：${cells}`);
  // 4. 发通知（公共）
  console.log('发送企业微信：订单报表已导出');
}

// ========== 导出 CSV：流程又抄一遍 ==========
function exportCsv(): void {
  const rows = queryOrders(); // 一模一样
  const lines = rows.map((r) => `${r.orderNo},${r.amount}`).join(' / '); // 差异点
  console.log(`生成订单报表.csv：${lines}`); // 差异点
  console.log('发送企业微信：订单报表已导出'); // 一模一样
}

console.log('--- 导出 Excel ---');
exportExcel();

console.log('--- 导出 CSV ---');
exportCsv();

// 问题：
// 1. 查数据、发通知这类公共步骤，每种导出格式都要抄一遍
// 2. 导出流程加环节（比如导出前先检查权限），所有格式函数都得挨个改
// 3. 有的格式忘了发通知、有的忘了查最新数据，只能靠 code review 人肉对齐

export {};
