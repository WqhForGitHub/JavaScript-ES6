/**
 * 手写 TypeScript `CamelCase`（短横线转驼峰）
 *
 * 类型作用：
 *   将短横线命名字符串字面量类型转为驼峰命名（camelCase）。
 *   例如 'foo-bar-baz' -> 'fooBarBaz'。
 *
 * 实现思路：
 *   递归解析：遇到 `${First}-${Rest}` 时把 Rest 首字母大写后递归：
 *     type CamelCase<S extends string> =
//        S extends `${infer First}-${infer Rest}`
//          ? `${First}${Capitalize<CamelCase<Rest>>}`
//          : S;
 *   注意：多个连续短横线会保留（如 'a--b' -> 'a-B'）。
 *
 * 运行时模拟：
 *   JS 用正则替换或逐段拼接实现。
 */

// ===== TypeScript 类型实现 =====
// type CamelCase<S extends string> =
//   S extends `${infer First}-${infer Rest}`
//     ? `${First}${Capitalize<CamelCase<Rest>>}`
//     : S;
//
// 示例：
//   type R1 = CamelCase<'foo-bar-baz'>; // 'fooBarBaz'
//   type R2 = CamelCase<'foo'>;         // 'foo'

// ===== 运行时模拟函数 =====
/**
 * 模拟 CamelCase：短横线转驼峰（与 TS 类型行为一致）
 * @param {string} s 短横线字符串
 * @returns {string} 驼峰字符串
 */
function camelCase(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  if (s.length === 0) return s;
  const idx = s.indexOf("-");
  if (idx === -1) return s;
  const first = s.slice(0, idx);
  const rest = s.slice(idx + 1);
  // Rest 首字母大写后递归
  const restCamel = camelCase(rest);
  const capitalized =
    restCamel.length === 0
      ? ""
      : restCamel[0].toUpperCase() + restCamel.slice(1);
  return first + capitalized;
}

/**
 * 正则版本：一次性替换所有 -x 为 X
 * @param {string} s
 * @returns {string}
 */
function camelCaseRegex(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  return s.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
}

/**
 * 转为 PascalCase（首字母也大写）
 * @param {string} s
 * @returns {string}
 */
function pascalCase(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  const camel = camelCaseRegex(s);
  if (camel.length === 0) return camel;
  return camel[0].toUpperCase() + camel.slice(1);
}

// ===== 测试 =====

console.log(camelCase("foo-bar-baz")); // 'fooBarBaz'
console.log(camelCase("foo")); // 'foo'
console.log(camelCase("foo-bar")); // 'fooBar'
console.log(camelCase("a-b-c")); // 'aBC'
console.log(camelCase("")); // ''
console.log(camelCase("foo--bar")); // 'fooBar'（中间空段被吃掉，递归行为）

// 正则版本
console.log(camelCaseRegex("foo-bar-baz")); // 'fooBarBaz'
console.log(camelCaseRegex("foo")); // 'foo'
console.log(camelCaseRegex("foo--bar")); // 'fooBar'（两处 -b 都被处理）
console.log(camelCaseRegex("get-http-response")); // 'getHttpResponse'
console.log(camelCaseRegex("")); // ''
console.log(camelCaseRegex("a")); // 'a'

// PascalCase
console.log(pascalCase("foo-bar-baz")); // 'FooBarBaz'
console.log(pascalCase("foo")); // 'Foo'
console.log(pascalCase("get-http-response")); // 'GetHttpResponse'

// 大写输入
console.log(camelCaseRegex("FOO-BAR")); // 'FOOBAR'（首字母已是小写逻辑只动 - 后的字符）
console.log(camelCase("Foo-Bar")); // 'FooBar'

// 数字
console.log(camelCaseRegex("foo-2-bar")); // 'foo2Bar'（数字非字母，正则不匹配）
console.log(camelCase("foo-2-bar")); // 'foo2Bar'（递归版仍能处理）

// 非字符串抛错
try {
  camelCase(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a string
}
