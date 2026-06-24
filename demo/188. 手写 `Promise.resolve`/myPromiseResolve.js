/**
 * 手写 Promise.resolve
 *
 * 行为：
 *   - 参数是 Promise 实例 -> 直接返回该实例（不创建新对象）
 *   - 参数是 thenable 对象 -> 返回一个新 Promise，状态由 thenable 决定
 *   - 参数是其它值（包括 undefined/null）-> 返回一个以该值为决议值的 fulfilled Promise
 *
 * 这里不依赖 187 的完整实现，用原生 Promise 演示逻辑；
 * 同时提供一个不依赖原生 Promise、复用 myPromiseFull 思路的独立版本。
 */

// 依赖原生 Promise 的实现（最贴近规范）
function myResolve(value) {
  // 1. 已是 Promise：直接返回
  if (value && typeof value.then === "function") {
    return value;
  }
  // 2. thenable：用新 Promise 包一层，调用其 then
  if (value && (typeof value === "object" || typeof value === "function")) {
    return new Promise((resolve, reject) => {
      try {
        value.then.call(value, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }
  // 3. 普通值
  return new Promise((resolve) => resolve(value));
}

// 独立版（不使用原生 Promise 的 then，仅用构造器）
function myResolveStandalone(value) {
  if (value && typeof value.then === "function") {
    // thenable / Promise，统一包一层
    return new Promise((resolve, reject) => {
      // 微任务里执行，避免同步 thenable 立即调用
      queueMicrotask(() => {
        try {
          value.then.call(value, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  return new Promise((resolve) => resolve(value));
}

// ===== 测试 =====

(async () => {
  // 1. 普通值
  const r1 = await myResolve(42);
  console.log("value:", r1); // value: 42

  // 2. undefined
  const r2 = await myResolve(undefined);
  console.log("undefined ->", r2); // undefined -> undefined

  // 3. 传入 Promise，应返回同一实例
  const inner = Promise.resolve("inner");
  const r3 = myResolve(inner);
  console.log("same instance:", r3 === inner); // same instance: true

  // 4. 传入 thenable
  const thenable = {
    then(resolve) {
      setTimeout(() => resolve("from thenable"), 30);
    },
  };
  const r4 = await myResolve(thenable);
  console.log("thenable:", r4); // thenable: from thenable

  // 5. 独立版普通值
  const r5 = await myResolveStandalone("standalone");
  console.log("standalone:", r5); // standalone: standalone
})();
