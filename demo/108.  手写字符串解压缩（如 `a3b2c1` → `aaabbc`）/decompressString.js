/**
 * 手写字符串解压缩（如 a3b2c1 → aaabbc）
 *
 * 定义：将"字符+次数"的压缩格式还原为原始字符串
 *   - "a3b2c1"     → "aaabbc"
 *   - "a1b1c1"     → "abc"
 *   - "a4"         → "aaaa"
 *   - "a2b2a2"     → "aabbaa"
 *   - ""           → ""
 *   - "a1"         → "a"
 *
 * 规则：
 *   - 格式为"字符+数字"交替
 *   - 将每个字符重复对应次数
 *   - 数字可能是多位（如 "a12" → 12 个 a）
 *
 * 以下提供多种方法
 */

// ===== 方法 1：正则匹配 + repeat =====
// 最简洁的方式

function decompressString(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  let result = "";
  // 匹配：字母（或任意非数字字符）后跟数字
  const matches = str.match(/(\D)(\d+)/g);

  if (!matches) return "";

  for (const match of matches) {
    // 每个匹配项：第一个字符是字母，后面是数字
    const ch = match[0];
    const count = parseInt(match.slice(1), 10);
    result += ch.repeat(count);
  }

  return result;
}

// 优点：正则匹配简洁，利用 repeat 高效
// 缺点：正则可读性稍差

// ===== 方法 2：手动遍历 =====
// 逐字符解析，分离字母和数字

function decompressString2(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  let result = "";
  let i = 0;

  while (i < str.length) {
    // 读取字符（非数字）
    const ch = str[i];
    i++;

    // 读取数字（可能多位）
    let numStr = "";
    while (i < str.length && /\d/.test(str[i])) {
      numStr += str[i];
      i++;
    }

    if (numStr === "") {
      // 没有数字，跳过或当作 1
      continue;
    }

    const count = parseInt(numStr, 10);
    result += ch.repeat(count);
  }

  return result;
}

// 优点：手动解析，逻辑清晰，不依赖正则
// 缺点：代码稍长

// ===== 方法 3：正则替换 =====
// 使用 replace 的回调函数

function decompressString3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  // 匹配非数字字符后跟数字，替换为重复的字符
  return str.replace(/(\D)(\d+)/g, (_, ch, num) => ch.repeat(parseInt(num, 10)));
}

// 优点：一行代码，最简洁
// 缺点：正则可读性差

// ===== 测试 =====

console.log("========== 手写字符串解压缩 ==========\n");

const testCases = [
  { value: "a3b2c1", expected: "aaabbc", desc: "a3b2c1" },
  { value: "a1b1c1", expected: "abc", desc: "a1b1c1" },
  { value: "a4", expected: "aaaa", desc: "a4" },
  { value: "a2b2a2", expected: "aabbaa", desc: "a2b2a2" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a1", expected: "a", desc: "a1" },
  { value: "a2b3c4", expected: "aabbbcccc", desc: "a2b3c4" },
  { value: "x10", expected: "xxxxxxxxxx", expected2: 10, desc: "x10（多位数字）" },
];

const methods = [
  { name: "正则匹配+repeat", fn: decompressString },
  { name: "手动遍历", fn: decompressString2 },
  { name: "正则替换", fn: decompressString3 },
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

// --- 与 compressString 互逆验证 ---
console.log("--- 与压缩函数互逆验证 ---");
function compressString(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.replace(/(.)\1*/g, (match, ch) => ch + match.length);
}

const originals = ["aaabbc", "abc", "aaaa", "aabbaa", "aabbbcccc"];
originals.forEach((s) => {
  const compressed = compressString(s);
  const decompressed = decompressString(compressed);
  const status = decompressed === s ? "✓" : "✗";
  console.log(`  ${status} "${s}" → 压缩 "${compressed}" → 解压 "${decompressed}"`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：正则替换法最简洁");
console.log("手动遍历法逻辑清晰，适合面试手写");
console.log("解压缩是压缩的逆操作，两者可互逆验证");
console.log("注意处理多位数字的情况（如 a12 → 12 个 a）");
