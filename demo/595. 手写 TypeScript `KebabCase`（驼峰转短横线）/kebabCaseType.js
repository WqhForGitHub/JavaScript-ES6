/**
 * 手写 TypeScript `KebabCase`（驼峰转短横线）
 *
 * 类型作用：
 *   将驼峰命名字符串字面量类型转为短横线命名（kebab-case）。
 *   例如 'fooBarBaz' -> 'foo-bar-baz'。
 *
 * 实现思路：
 *   递归解析首字符并判断是否大写：
 *     type KebabCase<S extends string> =
//        S extends `${infer First}${infer Rest}`
//          ? First extends Uppercase<First>
//            ? First extends Lowercase<First>
//              ? `${First}${KebabCase<Rest>}`   // 非字母（大小写相同）
//              : `-${Lowercase<First>}${KebabCase<Rest>}` // 大写字母
//            : `${First}${KebabCase<Rest>}`     // 小写字母
//          : S;
 *   关键：First extends Uppercase<First> 判断是否大写；
 *   再用 First extends Lowercase<First> 区分"非字母字符"（如数字、符号）。
 *   连续大写时第一个加 '-'，其余转小写（简化版）。
 *
 * 运行时模拟：
 *   JS 用正则或逐字符遍历实现。
 */

// ===== TypeScript 类型实现 =====
// type KebabCase<S extends string> =
//   S extends `${infer First}${infer Rest}`
//     ? First extends Uppercase<First>
//       ? First extends Lowercase<First>
//         ? `${First}${KebabCase<Rest>}`            // 非字母
//         : `-${Lowercase<First>}${KebabCase<Rest>}` // 大写
//       : `${First}${KebabCase<Rest>}`               // 小写
//     : S;
//
// 示例：
//   type R1 = KebabCase<'fooBarBaz'>; // 'foo-bar-baz'
//   type R2 = KebabCase<'FooBar'>;    // '-foo-bar'（开头大写会带前导 -）

// ===== 运行时模拟函数 =====
/**
 * 模拟 KebabCase：驼峰转短横线（对应 TS 类型行为，开头大写会带前导 -）
 * @param {string} s 驼峰字符串
 * @returns {string} 短横线字符串
 */
function kebabCase(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  if (s.length === 0) return s;
  const first = s[0];
  const rest = s.slice(1);
  const isUpper = first === first.toUpperCase();
  const isLower = first === first.toLowerCase();
  if (isUpper && !isLower) {
    // 大写字母
    return "-" + first.toLowerCase() + kebabCase(rest);
  }
  return first + kebabCase(rest);
}

/**
 * 优化版：去除前导短横线（更符合实际使用习惯）
 * @param {string} s
 * @returns {string}
 */
function kebabCaseClean(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  let result = kebabCase(s);
  // 去除前导短横线
  while (result.startsWith("-")) {
    result = result.slice(1);
  }
  return result;
}

/**
 * 正则版本（处理连续大写更友好）
 * @param {string} s
 * @returns {string}
 */
function kebabCaseRegex(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // 小写/数字后跟大写之间插 -
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2") // 连续大写后接小写（如 HTTPServer -> http-server）
    .toLowerCase();
}

// ===== 测试 =====

// 与 TS 类型行为一致的版本
console.log(kebabCase("fooBarBaz")); // 'foo-bar-baz'
console.log(kebabCase("FooBar")); // '-foo-bar'（前导 -）
console.log(kebabCase("abc")); // 'abc'
console.log(kebabCase("")); // ''
console.log(kebabCase("a")); // 'a'
console.log(kebabCase("A")); // '-a'

// 清理前导 - 版本
console.log(kebabCaseClean("FooBar")); // 'foo-bar'
console.log(kebabCaseClean("fooBarBaz")); // 'foo-bar-baz'
console.log(kebabCaseClean("ABCDef")); // '-a-b-c-def' -> 清理后 'a-b-c-def'

// 正则版本（更实用）
console.log(kebabCaseRegex("fooBarBaz")); // 'foo-bar-baz'
console.log(kebabCaseRegex("FooBar")); // 'foo-bar'
console.log(kebabCaseRegex("HTTPServer")); // 'http-server'
console.log(kebabCaseRegex("getHTTPResponse")); // 'get-http-response'
console.log(kebabCaseRegex("already-kebab")); // 'already-kebab'
console.log(kebabCaseRegex("PascalCase")); // 'pascal-case'
console.log(kebabCaseRegex("")); // ''

// 数字处理
console.log(kebabCaseRegex("foo2Bar")); // 'foo2-bar'
console.log(kebabCaseRegex("v2Component")); // 'v2-component'

// 非字符串抛错
try {
  kebabCase(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a string
}
