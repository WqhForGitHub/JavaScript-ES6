/**
 * 手写驼峰转换（如 get-element-by-id → getElementById）
 *
 * 定义：将短横线（kebab-case）分隔的字符串转为驼峰命名
 *   - "get-element-by-id"   → "getElementById"
 *   - "background-color"    → "backgroundColor"
 *   - "font-size"           → "fontSize"
 *   - "border-bottom-color" → "borderBottomColor"
 *   - "hello"               → "hello"（无分隔符不变）
 *   - ""                    → ""
 *
 * 规则：
 *   - 以分隔符（- 或 _）为边界
 *   - 分隔符后的第一个字母大写
 *   - 首字母保持原样（或小写）
 *   - 去掉分隔符
 *
 * 以下提供多种方法
 */

// ===== 方法 1：split + map =====
// 最直观的方式

function camelize(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str
    .split("-")
    .map((word, index) => {
      // 第一个单词保持小写，后续单词首字母大写
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

// 优点：清晰直观，易于理解
// 缺点：需要创建数组

// ===== 方法 2：正则替换 =====
// 利用正则匹配分隔符后的字母并大写

function camelize2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.replace(/-([a-zA-Z])/g, (_, ch) => ch.toUpperCase());
}

// 优点：一行代码，正则高效
// 缺点：首字母不会自动小写（如需可额外处理）

// ===== 方法 3：正则替换 + 首字母小写 =====

function camelize3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str
    .replace(/^-/, "") // 去掉开头的分隔符
    .replace(/-([a-zA-Z])/g, (_, ch) => ch.toUpperCase()) // 分隔符后字母大写
    .replace(/^(\w)/, (ch) => ch.toLowerCase()); // 首字母小写
}

// ===== 方法 4：手动遍历 =====

function camelize4(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  let result = "";
  let capitalizeNext = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "-") {
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

// 优点：手动遍历，不依赖 split/正则，性能好
// 缺点：代码稍长

// ===== 测试 =====

console.log("========== 手写驼峰转换 ==========\n");

const testCases = [
  { value: "get-element-by-id", expected: "getElementById", desc: "get-element-by-id" },
  { value: "background-color", expected: "backgroundColor", desc: "background-color" },
  { value: "font-size", expected: "fontSize", desc: "font-size" },
  { value: "border-bottom-color", expected: "borderBottomColor", desc: "border-bottom-color" },
  { value: "hello", expected: "hello", desc: "hello（无分隔符）" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a-b-c", expected: "aBC", desc: "a-b-c" },
  { value: "list", expected: "list", desc: "list" },
];

const methods = [
  { name: "split+map", fn: camelize },
  { name: "正则替换", fn: camelize2 },
  { name: "正则+首字母小写", fn: camelize3 },
  { name: "手动遍历", fn: camelize4 },
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
const cssProperties = ["background-color", "font-size", "margin-top", "border-radius"];
console.log("CSS 属性转 JS 属性名：");
cssProperties.forEach((prop) => {
  console.log(`  ${prop} → ${camelize(prop)}`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：正则替换法最简洁");
console.log("正则 /-([a-zA-Z])/g 匹配分隔符后的字母并转为大写");
console.log("常用于 CSS 属性名转 JS 属性名、路由名转换等场景");
