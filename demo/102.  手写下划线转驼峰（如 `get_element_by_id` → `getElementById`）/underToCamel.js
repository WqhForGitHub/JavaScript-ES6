/**
 * 手写下划线转驼峰（如 get_element_by_id → getElementById）
 *
 * 定义：将下划线（snake_case）分隔的字符串转为驼峰命名
 *   - "get_element_by_id"   → "getElementById"
 *   - "user_name"           → "userName"
 *   - "first_name"          → "firstName"
 *   - "api_key"             → "apiKey"
 *   - "hello"               → "hello"（无下划线不变）
 *   - ""                    → ""
 *
 * 规则：
 *   - 以下划线 _ 为边界
 *   - 下划线后的第一个字母大写
 *   - 去掉下划线
 *
 * 以下提供多种方法
 */

// ===== 方法 1：split + map =====

function underToCamel(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str
    .split("_")
    .filter((word) => word.length > 0) // 过滤空段（连续下划线）
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

// 优点：清晰直观
// 缺点：需要创建数组

// ===== 方法 2：正则替换 =====

function underToCamel2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.replace(/_([a-zA-Z])/g, (_, ch) => ch.toUpperCase());
}

// 优点：一行代码，简洁高效
// 缺点：不处理首字母大小写和连续下划线

// ===== 方法 3：手动遍历 =====

function underToCamel3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  let result = "";
  let capitalizeNext = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "_") {
      capitalizeNext = true;
    } else {
      if (capitalizeNext) {
        result += ch.toUpperCase();
        capitalizeNext = false;
      } else {
        result += ch;
      }
    }
  }
  return result;
}

// 优点：手动遍历，性能好，不依赖正则
// 缺点：代码稍长

// ===== 测试 =====

console.log("========== 手写下划线转驼峰 ==========\n");

const testCases = [
  {
    value: "get_element_by_id",
    expected: "getElementById",
    desc: "get_element_by_id",
  },
  { value: "user_name", expected: "userName", desc: "user_name" },
  { value: "first_name", expected: "firstName", desc: "first_name" },
  { value: "api_key", expected: "apiKey", desc: "api_key" },
  { value: "hello", expected: "hello", desc: "hello（无下划线）" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a_b_c", expected: "aBC", desc: "a_b_c" },
  { value: "user_id", expected: "userId", desc: "user_id" },
];

const methods = [
  { name: "split+map", fn: underToCamel },
  { name: "正则替换", fn: underToCamel2 },
  { name: "手动遍历", fn: underToCamel3 },
];

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;
  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: "${result}" (期望 "${expected}")`);
  });
  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 实际应用场景 ---
console.log("--- 实际应用场景 ---");
const dbFields = ["user_name", "created_at", "is_active", "email_address"];
console.log("数据库字段名转 JS 变量名：");
dbFields.forEach((field) => {
  console.log(`  ${field} → ${underToCamel(field)}`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：正则替换 /_([a-zA-Z])/g 最简洁");
console.log("常用于数据库字段名、配置项名转换");
console.log("与 kebab-case 转驼峰逻辑类似，只是分隔符从 - 换成 _");
