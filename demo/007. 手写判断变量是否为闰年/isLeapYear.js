/**
 * 手写判断变量是否为闰年
 *
 * 闰年规则（格里高利历）：
 *   1. 能被 4 整除但不能被 100 整除 → 闰年   （如 2004, 2020）
 *   2. 能被 400 整除               → 闰年   （如 1600, 2000）
 *   3. 其他情况                    → 平年   （如 1900, 2100）
 *
 * 口诀：四年一闰，百年不闰，四百年再闰
 *
 * 常见误区：
 *   - 1900 年不是闰年（能被 100 整除但不能被 400 整除）
 *   - 2000 年是闰年（能被 400 整除）
 *   - 2100 年不是闰年
 *
 * 以下提供 3 种方法
 */

// ===== 方法 1：标准规则法 =====
// 直接翻译闰年规则，逻辑最清晰

function isLeapYear1(year) {
  if (!Number.isInteger(year)) {
    return false;
  }

  // 规则 2：能被 400 整除 → 闰年
  if (year % 400 === 0) {
    return true;
  }

  // 规则 3（部分）：能被 100 整除但不能被 400 整除 → 平年
  if (year % 100 === 0) {
    return false;
  }

  // 规则 1：能被 4 整除但不能被 100 整除 → 闰年
  if (year % 4 === 0) {
    return true;
  }

  // 其他：平年
  return false;
}

// 优点：逻辑与规则一一对应，最易理解和维护
// 缺点：代码稍长

// ===== 方法 2：单行表达式法 =====
// 将三条规则合并为一个逻辑表达式

function isLeapYear2(year) {
  if (!Number.isInteger(year)) {
    return false;
  }
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 优点：最简洁，面试中最常见的写法
// 缺点：需要理解逻辑运算的短路特性
// 解读：
//   year % 4 === 0 && year % 100 !== 0  → 满足规则 1（能被 4 整除且不被 100 整除）
//   year % 400 === 0                    → 满足规则 2（能被 400 整除）
//   两者满足其一即为闰年

// ===== 方法 3：利用 Date 对象 =====
// 利用 JS 内置 Date 的特性：闰年 2 月有 29 天

function isLeapYear3(year) {
  if (!Number.isInteger(year)) {
    return false;
  }
  // 创建 year 年 3 月 0 日（即 year 年 2 月的最后一天）
  // 闰年 2 月有 29 天，平年 2 月有 28 天
  const lastDayOfFeb = new Date(year, 2, 0).getDate();
  return lastDayOfFeb === 29;
}

// 优点：巧妙利用 Date API，不需要记忆闰年规则
// 缺点：
//   1. 依赖 Date 实现，性能不如纯数学运算
//   2. Date 对年份有范围限制（通常支持 0 ~ 99,999,999）
//   3. 对于公元前的年份处理可能有问题

// ===== 测试 =====

const testCases = [
  // 闰年
  { value: 2000, expected: true, desc: "2000（能被 400 整除）" },
  { value: 1600, expected: true, desc: "1600（能被 400 整除）" },
  { value: 2004, expected: true, desc: "2004（能被 4 整除，不被 100 整除）" },
  { value: 2020, expected: true, desc: "2020（能被 4 整除，不被 100 整除）" },
  { value: 2024, expected: true, desc: "2024（能被 4 整除，不被 100 整除）" },
  { value: 4, expected: true, desc: "4（最小闰年）" },
  // 平年
  {
    value: 1900,
    expected: false,
    desc: "1900（能被 100 整除，不被 400 整除）",
  },
  {
    value: 2100,
    expected: false,
    desc: "2100（能被 100 整除，不被 400 整除）",
  },
  {
    value: 1800,
    expected: false,
    desc: "1800（能被 100 整除，不被 400 整除）",
  },
  { value: 2023, expected: false, desc: "2023（不能被 4 整除）" },
  { value: 2025, expected: false, desc: "2025（不能被 4 整除）" },
  { value: 1, expected: false, desc: "1（不能被 4 整除）" },
  { value: 100, expected: false, desc: "100（能被 100 整除，不被 400 整除）" },
  // 非整数 / 无效值
  { value: 2000.5, expected: false, desc: "2000.5（非整数）" },
  { value: NaN, expected: false, desc: "NaN" },
  { value: Infinity, expected: false, desc: "Infinity" },
  { value: "2024", expected: false, desc: "字符串 '2024'" },
  { value: null, expected: false, desc: "null" },
  { value: undefined, expected: false, desc: "undefined" },
];

const methods = [
  { name: "标准规则法", fn: isLeapYear1 },
  { name: "单行表达式法", fn: isLeapYear2 },
  { name: "Date 对象法", fn: isLeapYear3 },
];

console.log("========== 判断变量是否为闰年 ==========\n");

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 百年闰年专项测试 ---
console.log("--- 百年闰年专项测试（最易出错的部分）---");
const centuryYears = [1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400];
centuryYears.forEach((year) => {
  const result = isLeapYear2(year);
  console.log(`  ${year}: ${result ? "闰年" : "平年"}`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：单行表达式法 > 标准规则法 > Date 对象法");
console.log("标准规则法    : 逻辑最清晰，与规则一一对应，适合教学");
console.log("单行表达式法  : 最简洁，面试首选，需理解逻辑运算");
console.log("Date 对象法   : 巧妙但依赖 API，性能和范围有限制");
console.log("\n闰年口诀：四年一闰，百年不闰，四百年再闰");
console.log("公式：(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0");
