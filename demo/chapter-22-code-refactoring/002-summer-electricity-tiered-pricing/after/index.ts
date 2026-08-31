// 改后：分解条件表达式 + 用常量取代魔法值 -- "是不是夏季"提炼成命名函数，费率和日期边界各归命名常量，计价逻辑读起来像一句业务描述

// ========== 用电记录：一段时间内的用电量和账单日期 ==========
interface Usage {
  quantity: number;
  date: Date;
}

// ========== 费率常量：数字全部有了业务名字，调价只改这里 ==========
const SUMMER_RATE = 0.22; // 夏季费率（元/度）
const WINTER_RATE = 0.28; // 非夏季费率（元/度）
const SUMMER_SERVICE_FEE = 20; // 夏季制冷服务附加费（元）
const SUMMER_START_MONTH = 5; // 月份从 0 开始数，5 即 6 月
const SUMMER_END_MONTH = 8; // 8 即 9 月

// ========== 条件函数：判断逻辑有了名字，读代码不再做"翻译题" ==========
function isSummer(date: Date): boolean {
  const start = new Date(date.getFullYear(), SUMMER_START_MONTH, 1);
  const end = new Date(date.getFullYear(), SUMMER_END_MONTH, 30);
  return date >= start && date <= end;
}

// ========== 计算电费：读起来就是一句业务规则 ==========
function calculateElectricityBill(usage: Usage): number {
  if (isSummer(usage.date)) {
    return usage.quantity * SUMMER_RATE + SUMMER_SERVICE_FEE;
  }
  return usage.quantity * WINTER_RATE;
}

// ========== 客服查询账单 ==========
function inquiry(user: string, usage: Usage): void {
  console.log(`${user} 本期电费：${calculateElectricityBill(usage)} 元`);
}

inquiry('张三', { quantity: 300, date: new Date(2026, 6, 15) }); // 张三 本期电费：86 元（夏季）
inquiry('李四', { quantity: 300, date: new Date(2026, 11, 15) }); // 李四 本期电费：84 元（冬季）

// ========== 扩展：物价调整，夏季费率 0.22 涨到 0.25，只改一行常量 ==========
// const SUMMER_RATE = 0.25; // 其余代码一行不动，全年账单自动生效

// ========== 扩展：新增"冬季优惠档"，再提炼一个条件函数即可 ==========
// function isWinterPromotion(date: Date): boolean {
//   return date.getMonth() === 11 || date.getMonth() === 0; // 12 月和 1 月
// }
// 计价函数里加一个分支，各自使用命名常量，互不干扰

// 优势：
// 1. if (isSummer(...)) 自解释：条件含义写在函数名上，读者不需要在脑内换算月份
// 2. SUMMER_RATE、WINTER_RATE 等常量把"数字"变成"业务词汇"，费率是什么、附加费是多少一目了然
// 3. 调价只改常量定义一处，杜绝"改了 0.22 漏了另一处 0.22"的事故
// 4. isSummer 可以被电费、水费、燃气费等任何"分季节"的计价逻辑复用

export {};
