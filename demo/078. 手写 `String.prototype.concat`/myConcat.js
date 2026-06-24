/**
 * 手写 String.prototype.concat
 *
 * 原生 concat 的作用：
 *   - 将一个或多个字符串拼接到原字符串末尾，返回新字符串
 *   - 语法：str.concat(str1, str2, ..., strN)
 *   - 不修改原字符串（字符串不可变）
 *   - 参数会被转换为字符串后拼接
 *
 * 注意：
 *   - 实际开发中更推荐使用 + 或模板字符串，性能更好且更简洁
 *   - concat 极少使用，但作为面试题考察字符串拼接原理
 *
 * 核心原理：
 *   - 将 this 转为字符串
 *   - 将所有参数转为字符串
 *   - 依次拼接并返回
 */

String.prototype.myConcat = function (...args) {
  // 1. this 转为字符串
  let result = String(this);

  // 2. 依次将每个参数转为字符串并拼接到结果末尾
  for (let i = 0; i < args.length; i++) {
    result += String(args[i]);
  }

  // 3. 返回拼接后的新字符串
  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.concat ==========\n");

// --- 基本用法 ---
console.log("hello".myConcat(" ", "world")); // "hello world"
console.log("a".myConcat("b", "c", "d")); // "abcd"
console.log("".myConcat("foo")); // "foo"

// --- 无参数 ---
console.log("hello".myConcat()); // "hello"

// --- 参数会被转为字符串 ---
console.log("num: ".myConcat(123)); // "num: 123"
console.log("bool: ".myConcat(true)); // "bool: true"
console.log("arr: ".myConcat([1, 2, 3])); // "arr: 1,2,3"
console.log("obj: ".myConcat({})); // "obj: [object Object]"
console.log("null: ".myConcat(null)); // "null: null"
console.log("undef: ".myConcat(undefined)); // "undef: undefined"

// --- 原字符串不被修改 ---
const original = "hello";
const combined = original.myConcat("!", "!");
console.log(original); // "hello"（原串不变）
console.log(combined); // "hello!!"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello".concat(" ", "world") === "hello".myConcat(" ", "world")); // true
console.log("a".concat("b", "c") === "a".myConcat("b", "c")); // true
