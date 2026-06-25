/**
 * 手写首字母大写转换
 *
 * 定义：将字符串的首字母转为大写，其余字母转为小写
 *   - "hello"      → "Hello"
 *   - "HELLO"      → "Hello"
 *   - "hELLO"      → "Hello"
 *   - ""           → ""
 *   - "a"          → "A"
 *
 * 变体说明：
 *   - 仅首字母大写，其余小写（标准 capitalize）
 *   - 每个单词首字母大写（title case）
 *
 * 以下提供多种方法
 */

// ===== 方法 1：charAt + slice + toUpperCase/toLowerCase =====
// 最直观的方式

function capitalize(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

// 优点：简洁清晰，最常用
// 缺点：无

// ===== 方法 2：charCodeAt 码元计算 =====
// 手动处理大小写转换

function capitalize2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  const firstCode = str.charCodeAt(0);
  // 小写 a-z (97-122) → 大写 A-Z (65-90)
  const first =
    firstCode >= 97 && firstCode <= 122
      ? String.fromCharCode(firstCode - 32)
      : str[0];

  let rest = "";
  for (let i = 1; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // 大写 A-Z (65-90) → 小写 a-z (97-122)
    rest += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : str[i];
  }
  return first + rest;
}

// 优点：手动处理码元，理解底层原理
// 缺点：代码较长，只处理 ASCII

// ===== 方法 3：正则替换 =====

function capitalize3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.replace(/^(\w)(\w*)$/, (_, first, rest) => {
    return first.toUpperCase() + rest.toLowerCase();
  });
}

// 优点：正则一行搞定
// 缺点：正则可读性稍差

// ===== 进阶：每个单词首字母大写（title case）=====

function titleCase(str) {
  if (typeof str !== "string") return "";
  return str.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// 或完整版：每个单词首字母大写，其余小写
function titleCaseFull(str) {
  if (typeof str !== "string") return "";
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

// ===== 测试 =====

console.log("========== 手写首字母大写转换 ==========\n");

const testCases = [
  { value: "hello", expected: "Hello", desc: "hello" },
  { value: "HELLO", expected: "Hello", desc: "HELLO（全大写）" },
  { value: "hELLO", expected: "Hello", desc: "hELLO（混合）" },
  { value: "wORLD", expected: "World", desc: "wORLD" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a", expected: "A", desc: "单字符" },
  { value: "A", expected: "A", desc: "单字符已大写" },
  { value: "javaScript", expected: "Javascript", desc: "javaScript" },
];

const methods = [
  { name: "charAt+slice", fn: capitalize },
  { name: "charCodeAt", fn: capitalize2 },
  { name: "正则替换", fn: capitalize3 },
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

// --- title case 测试 ---
console.log("--- 进阶：每个单词首字母大写 ---");
console.log(titleCase("hello world")); // "Hello World"
console.log(titleCase("the quick brown fox")); // "The Quick Brown Fox"
console.log(titleCaseFull("hELLO wORLD")); // "Hello World"

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：charAt + slice + toUpperCase/toLowerCase，简洁高效");
console.log("titleCase 适用于每个单词首字母大写的场景");
