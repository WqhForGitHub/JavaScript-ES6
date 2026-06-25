/**
 * 手写 TypeScript `Trim`（字符串类型去除空白）
 *
 * 类型作用：
 *   去除字符串字面量类型两端的空白字符（空格、\n、\t）。
 *   例如 '  hello  ' -> 'hello'。
 *
 * 实现思路：
 *   分别实现 TrimLeft 与 TrimRight，再组合：
 *     type TrimLeft<S extends string> =
//        S extends ` ${infer Rest}` | `\n${infer Rest}` | `\t${infer Rest}`
//          ? TrimLeft<Rest> : S;
//     type TrimRight<S extends string> =
//        S extends `${infer Rest} ` | `${infer Rest}\n` | `${infer Rest}\t`
//          ? TrimRight<Rest> : S;
//     type Trim<S extends string> = TrimLeft<TrimRight<S>>;
 *   利用模板字面量类型 + infer 推断首尾字符递归剥离。
 *
 * 运行时模拟：
 *   JS 用正则 /^\s+|\s+$/g 或原生 String.prototype.trim()。
 */

// ===== TypeScript 类型实现 =====
// type Space = ' ' | '\n' | '\t';
// type TrimLeft<S extends string> =
//   S extends `${Space}${infer Rest}` ? TrimLeft<Rest> : S;
// type TrimRight<S extends string> =
//   S extends `${infer Rest}${Space}` ? TrimRight<Rest> : S;
// type Trim<S extends string> = TrimLeft<TrimRight<S>>;
//
// 示例：
//   type R = Trim<'  hello  '>; // 'hello'

// ===== 运行时模拟函数 =====
/**
 * 模拟 TrimLeft：去除左侧空白（空格、\n、\t）
 * @param {string} s
 * @returns {string}
 */
function trimLeft(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  // 递归实现，对应 TS 递归类型
  if (s.length === 0) return s;
  const first = s[0];
  if (first === " " || first === "\n" || first === "\t") {
    return trimLeft(s.slice(1));
  }
  return s;
}

/**
 * 模拟 TrimRight：去除右侧空白
 * @param {string} s
 * @returns {string}
 */
function trimRight(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  if (s.length === 0) return s;
  const last = s[s.length - 1];
  if (last === " " || last === "\n" || last === "\t") {
    return trimRight(s.slice(0, -1));
  }
  return s;
}

/**
 * 模拟 Trim：TrimLeft(TrimRight(s))
 * @param {string} s
 * @returns {string}
 */
function trim(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  return trimLeft(trimRight(s));
}

/**
 * 正则版本（性能更优）
 * @param {string} s
 * @returns {string}
 */
function trimRegex(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  return s.replace(/^[\s\n\t]+|[\s\n\t]+$/g, "");
}

/**
 * 仅去除特定空白字符（与 TS 类型实现一致，不含 \r 等）
 * @param {string} s
 * @returns {string}
 */
function trimStrict(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  return s.replace(/^[ \n\t]+|[ \n\t]+$/g, "");
}

// ===== 测试 =====

console.log(JSON.stringify(trim("  hello  "))); // "hello"
console.log(JSON.stringify(trim("\n\thello\t\n"))); // "hello"
console.log(JSON.stringify(trim("hello"))); // "hello"（无空白）
console.log(JSON.stringify(trim("   "))); // ""（全空白）
console.log(JSON.stringify(trim(""))); // ""（空串）
console.log(JSON.stringify(trim(" a b c "))); // "a b c"（中间空白保留）

// 单边
console.log(JSON.stringify(trimLeft("  hello"))); // "hello"
console.log(JSON.stringify(trimRight("hello  "))); // "hello"

// 混合空白
console.log(JSON.stringify(trim("\n \t hello \t \n"))); // "hello"

// 正则版本
console.log(JSON.stringify(trimRegex("  hello  "))); // "hello"
console.log(JSON.stringify(trimRegex("\n\thello\t\n"))); // "hello"

// 严格版本（不处理 \r）
console.log(JSON.stringify(trimStrict("  hello  "))); // "hello"
console.log(JSON.stringify(trimStrict("\rhello\r"))); // "\rhello\r"（\r 不在处理范围）

// 含空白字符的字符串
console.log(JSON.stringify(trim("a b"))); // "a b"
console.log(JSON.stringify(trim("\t\ta\t\t"))); // "a"

// 非字符串抛错
try {
  trim(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a string
}
