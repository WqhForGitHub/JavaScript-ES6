/**
 * 手写 TypeScript `AppendArgument`（给函数追加参数）
 *
 * 类型作用：
 *   给函数类型 Fn 追加一个参数 A，返回新函数类型，原返回类型不变。
 *   例如 (x: number) => string 追加 boolean 后变为 (x: number, a: boolean) => string。
 *
 * 实现思路：
 *   使用 infer 推断原参数元组 Args 与返回类型 Return，重组函数类型：
 *     type AppendArgument<Fn extends (...args: any[]) => any, A> =
//        Fn extends (...args: infer Args) => infer Return
//          ? (...args: [...Args, A]) => Return
//          : never;
 *
 * 运行时模拟：
 *   JS 通过高阶函数包装：返回一个新函数，调用时把追加参数拼到末尾再调用原函数。
 */

// ===== TypeScript 类型实现 =====
// type AppendArgument<Fn extends (...args: any[]) => any, A> =
//   Fn extends (...args: infer Args) => infer Return
//     ? (...args: [...Args, A]) => Return
//     : never;
//
// 示例：
//   type F = (x: number) => string;
//   type F2 = AppendArgument<F, boolean>; // (x: number, a: boolean) => string

// ===== 运行时模拟函数 =====
/**
 * 模拟 AppendArgument：返回一个包装函数，参数末尾追加 A
 * @param {Function} fn 原函数
 * @returns {Function} 新函数（接收 (...原参数, 追加参数)）
 */
function appendArgument(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  return function appended(...args) {
    // args 末尾即追加的参数 A
    return fn.apply(this, args.slice(0, -1));
  };
}

/**
 * 显式接收追加参数的版本
 * @param {Function} fn
 * @returns {Function}
 */
function appendArgumentExplicit(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  return function appended(originalArgs, appendedArg) {
    return fn.apply(this, [...originalArgs, appendedArg]);
  };
}

/**
 * 通用 curry 化追加参数：返回 (a) => (...rest) => fn(...rest, a)
 * @param {Function} fn
 * @returns {Function}
 */
function appendArgumentCurried(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  return (appendedArg) =>
    (...rest) =>
      fn(...rest, appendedArg);
}

// ===== 测试 =====

const greet = (name) => `Hello, ${name}!`;
const greetWithSuffix = appendArgument(greet);

// 追加的参数会被丢弃（因为原函数不接受它）
console.log(greetWithSuffix("Alice", "!?")); // 'Hello, Alice!'

// 实际追加参数被使用的场景
const add = (a, b) => a + b;
const addWithThird = appendArgument((a, b, c) => a + b + c);
console.log(addWithThird(1, 2, 3)); // 6

// 追加参数不被原函数使用，但仍能传递
const sum = (a, b) => a + b;
const sumWithExtra = appendArgument(sum);
console.log(sumWithExtra(1, 2, 999)); // 3（999 被丢弃，因原函数只用前两个）

// 显式版本
const addThree = (x, y, z) => x + y + z;
const wrapped = appendArgumentExplicit(addThree);
console.log(wrapped([1, 2], 3)); // 6

// curried 版本
const withLog = appendArgumentCurried((a, b, log) => {
  if (log) console.log("computing:", a, b);
  return a + b;
});
const logger = withLog(true);
console.log(logger(1, 2)); // computing: 1 2  -> 3
console.log(logger(3, 4)); // computing: 3 4  -> 5

// 返回类型保持
const getLength = (s) => s.length;
const getLengthWithExtra = appendArgument(getLength);
console.log(typeof getLengthWithExtra("hello", "extra")); // 'number'

// 非函数抛错
try {
  appendArgument(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a function
}
