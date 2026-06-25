/**
 * 手写延迟执行函数 delay
 *
 * 作用：
 *   - 延迟指定毫秒后执行函数，类似 setTimeout 的函数式封装
 *   - 返回 Promise，便于 await 和链式调用
 *   - 支持向被延迟函数传递参数
 *
 * 实现思路：
 *   1. 返回一个 Promise
 *   2. 内部用 setTimeout 延迟执行 fn
 *   3. fn 执行结果决定 Promise 的 resolve / reject
 */

function delay(fn, ms, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = fn.apply(this, args);
        // 支持 fn 返回 Promise
        Promise.resolve(result).then(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }, ms);
  });
}

// 仅延迟不执行函数（sleep）
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== 测试 =====

// 基本延迟
console.log("start:", Date.now());
delay(() => console.log("executed after 200ms:", Date.now()), 200);

// 带参数
delay(
  (a, b) => {
    console.log("带参数执行:", a + b); // 30
  },
  100,
  10,
  20,
);

// await 用法（IIFE）
(async () => {
  console.log("=== await delay ===");
  const start = Date.now();
  const result = await delay(() => {
    console.log("  fn 运行中");
    return "done";
  }, 150);
  console.log("结果:", result); // 'done'
  console.log("耗时:", Date.now() - start >= 150); // true
})();

// 链式调用
delay(() => 1, 100)
  .then((v) => {
    console.log("第一步:", v); // 1
    return delay(() => v + 1, 100);
  })
  .then((v) => {
    console.log("第二步:", v); // 2
    return delay(() => v + 1, 100);
  })
  .then((v) => {
    console.log("第三步:", v); // 3
  });

// 支持 fn 返回 Promise
(async () => {
  const r = await delay(
    () =>
      new Promise((resolve) => setTimeout(() => resolve("async value"), 50)),
    100,
  );
  console.log("fn 返回 Promise:", r); // 'async value'
})();

// sleep 工具
(async () => {
  console.log("=== sleep ===");
  console.log("before:", Date.now());
  await sleep(100);
  console.log("after:", Date.now());
})();

// 错误处理
delay(() => {
  throw new Error("boom");
}, 100).catch((err) => {
  console.log("捕获错误:", err.message); // 'boom'
});

// 应用：延迟显示提示
delay(() => console.log("3 秒后显示的提示"), 0);
