// 改前：电费按"是否夏季"分档计价，判断条件是一长串日期比较，费率直接写死成魔法数字，读代码的人既猜不出条件含义也算不明白价格

// ========== 用电记录：一段时间内的用电量和起止日期 ==========
interface Usage {
  quantity: number;
  date: Date;
}

// ========== 计算电费：条件难懂 + 费率成谜 ==========
function calculateElectricityBill(usage: Usage): number {
  // 夏季是 6 月 1 日到 9 月 30 日，但这段比较没人能一眼看懂
  if (
    usage.date >= new Date(usage.date.getFullYear(), 5, 1) &&
    usage.date <= new Date(usage.date.getFullYear(), 8, 30)
  ) {
    // 夏季费率：0.22 元/度 + 夏季服务附加费 20 元
    return usage.quantity * 0.22 + 20;
  } else {
    // 非夏季费率：0.28 元/度（到底哪个数字是费率、哪个是附加费？）
    return usage.quantity * 0.28;
  }
}

// ========== 客服查询账单 ==========
function inquiry(user: string, usage: Usage): void {
  console.log(`${user} 本期电费：${calculateElectricityBill(usage)} 元`);
}

inquiry('张三', { quantity: 300, date: new Date(2026, 6, 15) }); // 张三 本期电费：86 元（夏季）
inquiry('李四', { quantity: 300, date: new Date(2026, 11, 15) }); // 李四 本期电费：84 元（冬季）

// 问题：
// 1. `usage.date >= new Date(..., 5, 1) && ... <= new Date(..., 8, 30)` 是纯粹的"翻译题"：读者要自己在脑子里把月份换算成"6 月 1 日到 9 月 30 日"
// 2. 0.22、0.28、20、5、8、30 全是魔法数字：费率调整时没人敢确定该改哪一处，改错一处电费全错
// 3. "夏季"这个业务概念在代码里不存在，只散落在一串比较运算里，新同事接手要靠猜
// 4. 想加"冬季优惠档"或调整夏季区间，只能往 if 里继续堆比较表达式，越堆越难读

export {};
