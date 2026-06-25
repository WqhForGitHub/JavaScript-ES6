/**
 * 手写 TypeScript `Replace`（字符串类型替换）
 *
 * 类型作用：
 *   在字符串字面量类型 S 中，将首个匹配的 From 替换为 To。
 *   例如 Replace<'hello world', 'world', 'TS'> -> 'hello TS'。
 *
 * 实现思路：
 *   使用模板字面量类型 + infer 推断前缀和后缀：
 *     type Replace<S extends string, From extends string, To extends string> =
//        From extends ''
//          ? S
//          : S extends `${infer Before}${From}${infer After}`
//            ? `${Before}${To}${After}`
//            : S;
 *   当 From 为空串时直接返回 S（避免无限匹配）。
 *   只替换第一个匹配（infer 是贪婪到第一个分隔）。
 *
 * 运行时模拟：
 *   JS 用 String.prototype.replace（首匹配）或正则实现。
 */

// ===== TypeScript 类型实现 =====
// type Replace<S extends string, From extends string, To extends string> =
//   From extends ''
//     ? S
//     : S extends `${infer Before}${From}${infer After}`
//       ? `${Before}${To}${After}`
//       : S;
//
// 示例：
//   type R1 = Replace<'hello world', 'world', 'TS'>; // 'hello TS'
//   type R2 = Replace<'abcabc', 'abc', 'X'>;          // 'Xabc'（仅首个）
//   type R3 = Replace<'abc', '', 'X'>;                // 'abc'（From 为空返回原串）

// ===== 运行时模拟函数 =====
/**
 * 模拟 Replace：替换首个匹配（与 TS 类型行为一致）
 * @param {string} s 原字符串
 * @param {string} from 待替换子串
 * @param {string} to 替换为
 * @returns {string}
 */
function replace(s, from, to) {
  if (
    typeof s !== "string" ||
    typeof from !== "string" ||
    typeof to !== "string"
  ) {
    throw new TypeError("Expected three strings");
  }
  // From 为空直接返回原串
  if (from === "") return s;
  const idx = s.indexOf(from);
  if (idx === -1) return s;
  return s.slice(0, idx) + to + s.slice(idx + from.length);
}

/**
 * 使用正则的版本（需转义特殊字符）
 * @param {string} s
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function replaceRegex(s, from, to) {
  if (
    typeof s !== "string" ||
    typeof from !== "string" ||
    typeof to !== "string"
  ) {
    throw new TypeError("Expected three strings");
  }
  if (from === "") return s;
  // 转义正则元字符
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return s.replace(new RegExp(escaped), to);
}

/**
 * 替换全部匹配（对应 TS 的 ReplaceAll，此处作为对比）
 * @param {string} s
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function replaceAll(s, from, to) {
  if (
    typeof s !== "string" ||
    typeof from !== "string" ||
    typeof to !== "string"
  ) {
    throw new TypeError("Expected three strings");
  }
  if (from === "") return s;
  return s.split(from).join(to);
}

// ===== 测试 =====

console.log(replace("hello world", "world", "TS")); // 'hello TS'
console.log(replace("abcabc", "abc", "X")); // 'Xabc'（仅首个）
console.log(replace("abc", "xyz", "X")); // 'abc'（无匹配返回原串）
console.log(replace("abc", "", "X")); // 'abc'（From 为空返回原串）
console.log(replace("", "x", "y")); // ''（空串）
console.log(replace("aaa", "a", "b")); // 'baa'（仅首个）

// 特殊字符
console.log(replace("a.b.c", ".", "-")); // 'a-b.c'
console.log(replace("a(b)c", "(", "[")); // 'a[b)c'

// 正则版本
console.log(replaceRegex("hello world", "world", "TS")); // 'hello TS'
console.log(replaceRegex("a.b.c", ".", "-")); // 'a-b.c'
console.log(replaceRegex("a+b+c", "+", "-")); // 'a-b+c'

// 替换全部
console.log(replaceAll("abcabc", "abc", "X")); // 'XX'
console.log(replaceAll("aaa", "a", "b")); // 'bbb'
console.log(replaceAll("hello world", "o", "0")); // 'hell0 w0rld'

// 非字符串抛错
try {
  replace(123, "a", "b");
} catch (e) {
  console.log("catch:", e.message); // Expected three strings
}
