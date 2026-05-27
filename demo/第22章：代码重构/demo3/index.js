// ============================================================
// 分解条件表达式 & 用常量取代魔法值
// 1. 将复杂的 if-else 条件逻辑提取到命名良好的函数中
// 2. 将意义不明确的具体数字、字符串用带有描述的常量替换
// ============================================================

// ============================================================
// 一、分解条件表达式
// ============================================================

// ---------- 重构前 ----------
var date = new Date();
var summerStart = new Date(date.getFullYear(), 5, 1);   // 6月1日
var summerEnd = new Date(date.getFullYear(), 8, 30);     // 9月30日
var charge1 = 100;
var quantity1 = 10;

// 条件表达式含义不直观
if (date > summerStart && date < summerEnd) {
  charge1 = quantity1 * 0.8;  // 夏季折扣
} else {
  charge1 = quantity1 * 1.0;
}

console.log("重构前费用: " + charge1);

// ---------- 重构后 ----------
// 将条件判断提取为语义清晰的函数
var isSummer = function (aDate) {
  return aDate > summerStart && aDate < summerEnd;
};

var summerRate = 0.8;
var regularRate = 1.0;

if (isSummer(date)) {
  charge1 = quantity1 * summerRate;
} else {
  charge1 = quantity1 * regularRate;
}

console.log("重构后费用: " + charge1);

// ============================================================
// 二、用常量取代魔法值
// ============================================================

// ---------- 重构前 ----------
var status1 = 2;
if (status1 === 2) {
  console.log("订单已发货");
}

if (status1 === 3) {
  console.log("订单已签收");
}

// 2 和 3 是"魔法值"，不看注释根本不知道含义

// ---------- 重构后 ----------
var ORDER_STATUS_PENDING = 1;
var ORDER_STATUS_SHIPPED = 2;
var ORDER_STATUS_SIGNED = 3;
var ORDER_STATUS_CANCELLED = 4;

var status2 = ORDER_STATUS_SHIPPED;

if (status2 === ORDER_STATUS_SHIPPED) {
  console.log("订单已发货");
}

if (status2 === ORDER_STATUS_SIGNED) {
  console.log("订单已签收");
}

// 也可以用对象来组织相关常量
var ORDER_STATUS = {
  PENDING: 1,
  SHIPPED: 2,
  SIGNED: 3,
  CANCELLED: 4,
};

var status3 = ORDER_STATUS.SHIPPED;
console.log("当前状态: " + status3);  // 2

switch (status3) {
  case ORDER_STATUS.PENDING:
    console.log("待发货");
    break;
  case ORDER_STATUS.SHIPPED:
    console.log("已发货");
    break;
  case ORDER_STATUS.SIGNED:
    console.log("已签收");
    break;
  case ORDER_STATUS.CANCELLED:
    console.log("已取消");
    break;
}
