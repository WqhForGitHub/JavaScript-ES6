// ============================================================
// 提取变量 & 引入解释性变量
// 将复杂的表达式结果赋值给一个有描述性的临时变量，提高可读性
// ============================================================

// ---------- 重构前 ----------
const platform = 'Mac';
const browser = 'IE';
const resize = 1;

// 复杂的条件表达式，难以一眼理解其含义
if (
  platform.toUpperCase().indexOf('MAC') > -1 &&
  browser.toUpperCase().indexOf('IE') > -1 &&
  wasInitialized() &&
  resize > 0
) {
  console.log('执行 MAC IE 下的特殊逻辑');
}

function wasInitialized() {
  return true;
}

// ---------- 重构后 ----------
// 引入解释性变量，让条件表达式的意图一目了然
const isMacOS = platform.toUpperCase().indexOf('MAC') > -1;
const isIEBrowser = browser.toUpperCase().indexOf('IE') > -1;
const wasResized = resize > 0;

if (isMacOS && isIEBrowser && wasInitialized() && wasResized) {
  console.log('执行 MAC IE 下的特殊逻辑');
}

// ============================================================
// 提取变量的另一个例子：复杂计算
// ============================================================

// ---------- 重构前 ----------
const price1 = 100;
const quantity1 = 5;
const itemPrice1 = price1 * quantity1;

// 一个包含多个计算的复杂表达式
const orderTotal1 =
  itemPrice1 -
  Math.max(0, itemPrice1 - 500) * 0.05 +
  Math.min(itemPrice1 * 0.1, 100);

console.log('重构前订单总额: ' + orderTotal1);

// ---------- 重构后 ----------
const price2 = 100;
const quantity2 = 5;
const itemPrice2 = price2 * quantity2;

// 提取变量来解释每一步的含义
const basePrice = itemPrice2;
const discount = Math.max(0, basePrice - 500) * 0.05; // 超过 500 的部分打 95 折
const shipping = Math.min(basePrice * 0.1, 100); // 运费最高 100

const orderTotal2 = basePrice - discount + shipping;

console.log('重构后订单总额: ' + orderTotal2);
console.log('  基础价格: ' + basePrice);
console.log('  折扣: ' + discount);
console.log('  运费: ' + shipping);
