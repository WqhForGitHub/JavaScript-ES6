// ============================================================
// 提取变量 & 引入解释性变量
// 将复杂的表达式结果赋值给一个有描述性的临时变量，提高可读性
// ============================================================

// ---------- 重构前 ----------
var platform = "Mac";
var browser = "IE";
var resize = 1;

// 复杂的条件表达式，难以一眼理解其含义
if (platform.toUpperCase().indexOf("MAC") > -1 &&
    browser.toUpperCase().indexOf("IE") > -1 &&
    wasInitialized() && resize > 0) {
  console.log("执行 MAC IE 下的特殊逻辑");
}

function wasInitialized() {
  return true;
}

// ---------- 重构后 ----------
// 引入解释性变量，让条件表达式的意图一目了然
var isMacOS = platform.toUpperCase().indexOf("MAC") > -1;
var isIEBrowser = browser.toUpperCase().indexOf("IE") > -1;
var wasResized = resize > 0;

if (isMacOS && isIEBrowser && wasInitialized() && wasResized) {
  console.log("执行 MAC IE 下的特殊逻辑");
}

// ============================================================
// 提取变量的另一个例子：复杂计算
// ============================================================

// ---------- 重构前 ----------
var price1 = 100;
var quantity1 = 5;
var itemPrice1 = price1 * quantity1;

// 一个包含多个计算的复杂表达式
var orderTotal1 =
  itemPrice1 -
  Math.max(0, itemPrice1 - 500) * 0.05 +
  Math.min(itemPrice1 * 0.1, 100);

console.log("重构前订单总额: " + orderTotal1);

// ---------- 重构后 ----------
var price2 = 100;
var quantity2 = 5;
var itemPrice2 = price2 * quantity2;

// 提取变量来解释每一步的含义
var basePrice = itemPrice2;
var discount = Math.max(0, basePrice - 500) * 0.05;  // 超过 500 的部分打 95 折
var shipping = Math.min(basePrice * 0.1, 100);         // 运费最高 100

var orderTotal2 = basePrice - discount + shipping;

console.log("重构后订单总额: " + orderTotal2);
console.log("  基础价格: " + basePrice);
console.log("  折扣: " + discount);
console.log("  运费: " + shipping);
