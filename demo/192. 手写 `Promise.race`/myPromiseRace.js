/**
 * 手写 Promise.race
 *
 * 行为：
 *   - 接收一个可迭代对象，返回一个新 Promise
 *   - 第一个落定（无论 fulfilled 还是 rejected）的元素决定整体结果
 *   - 其余元素仍会继续执行（无法真正取消），但结果被忽略
 *   - 空可迭代对象 -> 永远 pending（保持挂起）
 *   - 常用于：请求超时控制、多源竞速取最快响应
 */

function myRace(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable);
    // 空数组：不调用 resolve/reject，新 Promise 保持 pending
    arr.forEach((item) => {
      // 包装以兼容非 Promise / thenable
      Promise.resolve(item).then(resolve, reject);
    });
  });
}

// ===== 测试 =====

// 1. 最快的 fulfilled 决定结果
const fast = new Promise((r) => setTimeout(() => r("fast"), 20));
const slow = new Promise((r) => setTimeout(() => r("slow"), 100));
myRace([fast, slow]).then((v) => console.log("fastest:", v)); // fastest: fast

// 2. 最快的是 rejected，整体也 rejected
const failFast = new Promise((_, rej) =>
  setTimeout(() => rej("fail-fast"), 10)
);
const okSlow = new Promise((r) => setTimeout(() => r("ok-slow"), 100));
myRace([failFast, okSlow]).catch((e) =>
  console.log("race rejected:", e)
); // race rejected: fail-fast

// 3. 超时控制：3 秒内拿不到数据就超时
function fetchMock(delay, data) {
  return new Promise((r) => setTimeout(() => r(data), delay));
}
function timeout(ms) {
  return new Promise((_, rej) =>
    setTimeout(() => rej(new Error("timeout " + ms + "ms")), ms)
  );
}
myRace([fetchMock(80, "data"), timeout(50)]).catch((e) =>
  console.log("race timeout:", e.message)
); // race timeout: timeout 50ms

// 4. 含同步 fulfilled 立即决议
myRace([Promise.resolve("sync"), Promise.resolve("later")]).then((v) =>
  console.log("sync wins:", v)
); // sync wins: sync

// 5. 空数组 -> 永远 pending（这里只打印，不会进入 then）
const forever = myRace([]);
forever.then(() => console.log("never")); // 不输出
console.log("empty race is pending:", forever instanceof Promise);
// empty race is pending: true
