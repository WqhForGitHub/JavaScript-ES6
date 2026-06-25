/**
 * 手写 Promise.any
 *
 * 行为：
 *   - 接收一个可迭代对象，返回一个新 Promise
 *   - 第一个 fulfilled 的元素决定整体结果（与 race 区别：只关心成功）
 *   - 所有元素都 rejected -> 整体 rejected，原因是聚合的 AggregateError
 *       AggregateError.errors 是所有原因组成的数组
 *   - 空可迭代对象 -> 立即 rejected（AggregateError，无 errors）
 *
 * 典型用途：多源竞速，只要有一个可用结果即可，全部失败才报错。
 */

function myAny(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable);

    if (arr.length === 0) {
      // 空数组：直接 reject 一个 AggregateError
      return reject(new AggregateError([], "All promises were rejected"));
    }

    const errors = new Array(arr.length);
    let rejectedCount = 0;

    arr.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => resolve(value), // 任一成功即整体成功
        (reason) => {
          errors[index] = reason; // 保留顺序
          if (++rejectedCount === arr.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        },
      );
    });
  });
}

// 兼容老环境没有 AggregateError 的情况
if (typeof AggregateError === "undefined") {
  globalThis.AggregateError = class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.name = "AggregateError";
      this.errors = errors;
    }
  };
}

// ===== 测试 =====

// 1. 第一个成功即返回（即使有更快失败）
const failFast = new Promise((_, rej) => setTimeout(() => rej("fail"), 10));
const okSlow = new Promise((r) => setTimeout(() => r("ok"), 50));
myAny([failFast, okSlow]).then((v) => console.log("first ok:", v)); // first ok: ok

// 2. 多个异步，最快成功者胜出
myAny([
  new Promise((r) => setTimeout(() => r("a"), 60)),
  new Promise((r) => setTimeout(() => r("b"), 30)),
  new Promise((r) => setTimeout(() => r("c"), 90)),
]).then((v) => console.log("fastest ok:", v)); // fastest ok: b

// 3. 全部失败 -> AggregateError
myAny([Promise.reject(1), Promise.reject(2), Promise.reject(3)]).catch((e) => {
  console.log("aggregate message:", e.message); // All promises were rejected
  console.log("aggregate errors:", e.errors); // aggregate errors: [ 1, 2, 3 ]
});

// 4. 空数组 -> 立即 rejected
myAny([]).catch((e) => console.log("empty rejected:", e.constructor.name)); // empty rejected: AggregateError

// 5. 含同步成功立即决议
myAny([Promise.reject("x"), Promise.resolve("win")]).then((v) =>
  console.log("sync ok:", v),
); // sync ok: win
