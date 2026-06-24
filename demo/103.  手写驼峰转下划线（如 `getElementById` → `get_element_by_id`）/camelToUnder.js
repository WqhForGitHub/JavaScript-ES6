/**
 * 手写驼峰转下划线（如 getElementById → get_element_by_id）
 *
 * 定义：将驼峰命名（camelCase）的字符串转为下划线命名（snake_case）
 *   - "getElementById"     → "get_element_by_id"
 *   - "userName"           → "user_name"
 *   - "firstName"          → "first_name"
 *   - "apiKey"             → "api_key"
 *   - "hello"              → "hello"（无大写不变）
 *   - "HTMLElement"        → "html_element"（连续大写处理）
 *   - ""                   → ""
 *
 * 规则：
 *   - 在每个大写字母前插入下划线
 *   - 将所有字母转为小写
 *   - 去掉开头多余的下划线
 *
 * 以下提供多种方法
 */

// ===== 方法 1：正则替换 =====
// 最简洁的方式

function camelToUnder(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str
    .replace(/([A-Z])/g, "_$1") // 在大写字母前插入下划线
    .replace(/^_/, "") // 去掉开头多余的下划线
    .toLowerCase(); // 全部转小写
}

// 优点：简洁清晰，正则高效
// 缺点：连续大写字母会逐个插入下划线（如 HTMLElement → h_t_m_l_element）

// ===== 方法 2：处理连续大写字母 =====
// 将连续大写字母视为一组（如 HTML → html）

function camelToUnder2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str
    // 大写字母后跟小写字母：在大写前插入下划线（如 GetById → get_by_id）
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    // 小写字母或数字后跟大写字母：插入下划线（如 getElement → get_element）
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/^_/, "") // 去掉开头下划线
    .toLowerCase();
}

// 优点：能正确处理连续大写字母（HTMLElement → html_element）
// 缺点：正则稍复杂

// ===== 方法 3：手动遍历 =====

function camelToUnder3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    // 大写字母前插入下划线（开头除外）
    if (ch >= "A" && ch <= "Z") {
      if (i > 0) result += "_";
      result += ch.toLowerCase();
    } else {
      result += ch;
    }
  }
  return result;
}

// 优点：手动遍历，逻辑清晰，不依赖正则
// 缺点：连续大写字母会逐个插入下划线

// ===== 测试 =====

console.log("========== 手写驼峰转下划线 ==========\n");

const testCases = [
  { value: "getElementById", expected: "get_element_by_id", desc: "getElementById" },
  { value: "userName", expected: "user_name", desc: "userName" },
  { value: "firstName", expected: "first_name", desc: "firstName" },
  { value: "apiKey", expected: "api_key", desc: "apiKey" },
  { value: "hello", expected: "hello", desc: "hello（无大写）" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "aBC", expected: "a_b_c", desc: "aBC" },
  { value: "userId", expected: "user_id", desc: "userId" },
];

const methods = [
  { name: "正则替换（基础）", fn: camelToUnder },
  { name: "正则替换（连续大写）", fn: camelToUnder2 },
  { name: "手动遍历", fn: camelToUnder3 },
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

// --- 连续大写字母测试 ---
console.log("--- 连续大写字母测试 ---");
console.log(camelToUnder2("HTMLElement")); // "html_element"
console.log(camelToUnder2("XMLHttpRequest")); // "xml_http_request"
console.log(camelToUnder2("getURL")); // "get_url"

// --- 实际应用场景 ---
console.log("\n--- 实际应用场景 ---");
const jsVars = ["getElementById", "userName", "createdAt", "isActive"];
console.log("JS 变量名转数据库字段名：");
jsVars.forEach((v) => {
  console.log(`  ${v} → ${camelToUnder(v)}`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：正则替换法");
console.log("基础版 /([A-Z])/g → '_$1' 简洁但连续大写逐个拆分");
console.log("进阶版能正确处理连续大写字母（如 HTMLElement → html_element）");
console.log("常用于 JS 变量名转数据库字段名、配置项名转换");
