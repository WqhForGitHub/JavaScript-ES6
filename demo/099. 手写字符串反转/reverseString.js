/**
 * 手写字符串反转
 *
 * 定义：将字符串中的字符顺序反转
 *   - "hello"   → "olleh"
 *   - "world"   → "dlrow"
 *   - "abc123"  → "321cba"
 *   - ""        → ""
 *   - "a"       → "a"
 *
 * 以下提供 4 种方法：
 *   1. split + reverse + join（最简洁）
 *   2. 双指针交换（原地思路）
 *   3. 从后向前遍历拼接
 *   4. 递归法
 *
 * 注意：对于包含代理对（emoji 等）的字符串，简单反转会破坏代理对
 *      需要使用 Array.from() 或展开运算符 [...str] 来正确处理
 */

// ===== 方法 1：split + reverse + join =====
// 最简洁直观的方式

function reverseString1(str) {
  if (typeof str !== "string") return "";
  return str.split("").reverse().join("");
}

// 优点：代码最简洁，一行搞定
// 缺点：需要创建数组和字符串，空间 O(n)

// ===== 方法 2：双指针交换 =====
// 转为数组后用双指针交换

function reverseString2(str) {
  if (typeof str !== "string") return "";
  const arr = str.split("");
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr.join("");
}

// 优点：双指针思路经典，面试常考
// 缺点：需要转为数组，空间 O(n)

// ===== 方法 3：从后向前遍历拼接 =====

function reverseString3(str) {
  if (typeof str !== "string") return "";
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// 优点：不需要转数组，逻辑清晰
// 缺点：字符串拼接在 JS 中性能尚可（引擎优化），但仍 O(n) 空间

// ===== 方法 4：递归法 =====

function reverseString4(str) {
  if (typeof str !== "string") return "";
  if (str.length <= 1) return str;
  // 取最后一个字符 + 反转剩余部分
  return str[str.length - 1] + reverseString4(str.slice(0, -1));
}

// 优点：体现递归思想
// 缺点：递归深度为 n，超长字符串可能栈溢出，性能差

// ===== 进阶：正确处理 Unicode 代理对（emoji）=====
// 使用 Array.from 将字符串按码点分割

function reverseStringUnicode(str) {
  if (typeof str !== "string") return "";
  // Array.from 或 [...str] 按 Unicode 码点分割
  return Array.from(str).reverse().join("");
}

// ===== 测试 =====

console.log("========== 手写字符串反转 ==========\n");

const testCases = [
  { value: "hello", expected: "olleh", desc: "hello" },
  { value: "world", expected: "dlrow", desc: "world" },
  { value: "abc123", expected: "321cba", desc: "abc123" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a", expected: "a", desc: "单字符" },
  { value: "ab", expected: "ba", desc: "两个字符" },
  { value: "racecar", expected: "racecar", desc: "回文（反转不变）" },
  { value: "你好世界", expected: "界世好你", desc: "中文" },
];

const methods = [
  { name: "split+reverse+join", fn: reverseString1 },
  { name: "双指针交换", fn: reverseString2 },
  { name: "从后向前遍历", fn: reverseString3 },
  { name: "递归法", fn: reverseString4 },
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

// --- Unicode 代理对测试 ---
console.log("--- 进阶：Unicode 代理对（emoji）---");
console.log(reverseString1("abc😀ef")); // 普通方法会破坏 emoji
console.log(reverseStringUnicode("abc😀ef")); // "fe😀cba"（正确处理 emoji）
console.log(reverseStringUnicode("你好😀世界")); // "界世😀好你"

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：split+reverse+join > 从后向前遍历 > 双指针 > 递归");
console.log("split+reverse+join : 最简洁，日常首选");
console.log("从后向前遍历      : 不依赖数组，逻辑清晰");
console.log("双指针交换        : 经典算法思路，面试常考");
console.log("递归法            : 思路优雅但可能栈溢出");
console.log("Unicode 进阶版    : 处理 emoji 等代理对字符");
