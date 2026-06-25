/**
 * 手写判断变量是否为 Promise 对象
 *
 * "Promise 对象"的判定：
 *   - 严格意义：value instanceof Promise（但要求环境存在 Promise 构造函数）
 *   - 鸭子类型：value 是对象/函数，且拥有 then 方法（thenable）
 *
 * 业界常用做法（如 axios、is-promise 等）：
 *   - 判断 value 不为 null 且 typeof value.then === "function"
 *
 * 这里提供两个版本：
 *   1. isPromise：严格判断（instanceof Promise 优先，回退到鸭子类型）
 *   2. isThenable：鸭子类型判断（兼容任意 thenable）
 */

function isPromise(value) {
  // 1. null / undefined / 基本类型不是 Promise
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function")
  ) {
    return false;
  }

  // 2. 优先用 instanceof（原生 Promise 或其子类）
  if (typeof Promise !== "undefined" && value instanceof Promise) {
    return true;
  }

  // 3. 兼容跨 realm（如 iframe 的 Promise）及自定义 thenable：鸭子类型
  //    注意 PromiseLike 规范要求 then 是函数
  return typeof value.then === "function";
}

// 鸭子类型版本：只要是 thenable 就算
function isThenable(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}

// ===== 测试 =====

// --- 原生 Promise ---
console.log(isPromise(Promise.resolve())); // true
console.log(isPromise(new Promise((resolve) => resolve(1)))); // true

// --- rejected Promise 仍是 Promise（注意需 .catch 避免未捕获 rejection）---
const rejected = Promise.reject(new Error("x"));
rejected.catch(() => {}); // 静默处理，避免 Node 触发 unhandledRejection
console.log(isPromise(rejected)); // true

// --- async 函数返回值 ---
async function asyncFunc() {
  return 1;
}
console.log(isPromise(asyncFunc())); // true（async 函数返回 Promise）

// --- 自定义 thenable（鸭子类型）---
const thenable = {
  then(resolve) {
    resolve(42);
  },
};
console.log(isPromise(thenable)); // true（thenable 视为 Promise）
console.log(isThenable(thenable)); // true

// --- 非 Promise ---
console.log(isPromise(null)); // false
console.log(isPromise(undefined)); // false
console.log(isPromise(123)); // false
console.log(isPromise("hello")); // false
console.log(isPromise({})); // false
console.log(isPromise({ then: 123 })); // false（then 不是函数）
console.log(isPromise(() => {})); // false（普通函数无 then 方法）
console.log(isPromise([1, 2, 3])); // false
