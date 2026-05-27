// ============================================================
// 合并重复的条件片段 & 参数化函数
// 1. 将多个条件分支里的相同代码移到条件之外
// 2. 将多个相似的函数合并成一个，通过参数区分不同行为
// ============================================================

// ============================================================
// 一、合并重复的条件片段
// ============================================================

// ---------- 重构前 ----------
var sendAlertBefore = function () {
  console.log("发送告警");
};

var isSpecialDealBefore = function () {
  return true;
};

// sendAlert() 在每个分支里都调用了，这是重复代码
var processOrderBefore = function (order) {
  if (isSpecialDealBefore()) {
    var total = order.price * 0.9;
    sendAlertBefore();
  } else {
    var total = order.price * 1.0;
    sendAlertBefore();
  }
  return total;
};

console.log("重构前: " + processOrderBefore({ price: 100 }));

// ---------- 重构后 ----------
// 将重复的代码移到条件之外
var sendAlertAfter = function () {
  console.log("发送告警");
};

var isSpecialDealAfter = function () {
  return true;
};

var processOrderAfter = function (order) {
  var total;
  if (isSpecialDealAfter()) {
    total = order.price * 0.9;
  } else {
    total = order.price * 1.0;
  }
  sendAlertAfter();  // 只需调用一次
  return total;
};

console.log("重构后: " + processOrderAfter({ price: 100 }));

// ============================================================
// 二、参数化函数
// ============================================================

// ---------- 重构前 ----------
// 两个几乎一样的函数，只是倍率不同
var getDoubleValue = function (value) {
  return value * 2;
};

var getTripleValue = function (value) {
  return value * 3;
};

console.log("2 倍: " + getDoubleValue(10));  // 20
console.log("3 倍: " + getTripleValue(10));  // 30

// ---------- 重构后 ----------
// 合并为一个函数，用参数控制倍率
var getScaledValue = function (value, multiplier) {
  return value * multiplier;
};

console.log("2 倍: " + getScaledValue(10, 2));  // 20
console.log("3 倍: " + getScaledValue(10, 3));  // 30

// ---------- 更实际的例子 ----------
// 重构前：多个相似函数处理不同等级的折扣
var calculateVipDiscount = function (price) {
  return price * 0.8;
};

var calculateSvipDiscount = function (price) {
  return price * 0.7;
};

var calculateNormalDiscount = function (price) {
  return price * 0.95;
};

// 重构后：参数化，一个函数搞定
var DISCOUNT_RATES = {
  normal: 0.95,
  vip: 0.8,
  svip: 0.7,
};

var calculateDiscount = function (price, level) {
  return price * (DISCOUNT_RATES[level] || 1);
};

console.log("普通会员折扣: " + calculateDiscount(100, "normal"));  // 95
console.log("VIP 折扣: " + calculateDiscount(100, "vip"));          // 80
console.log("SVIP 折扣: " + calculateDiscount(100, "svip"));        // 70
