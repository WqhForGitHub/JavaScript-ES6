/**
 * 手写 Promise.reject
 *
 * 行为：
 *   - 返回一个新的、状态为 rejected 的 Promise
 *   - 参数会原封不动作为 reason（即使参数是 Promise，也不会等待它）
 *   - 这点与 Promise.resolve 不同：reject 永远立即 reject
 */

function myReject(reason) {
  return new Promise((_, reject) => reject(reason));
}

// ===== 测试 =====

// 1. 字符串原因
myReject("oops").catch((e) => console.log("string:", e)); // string: oops

// 2. Error 对象
myReject(new Error("boom")).catch((e) => console.log("error:", e.message)); // error: boom

// 3. 传入一个 fulfilled Promise，仍应立即 reject（不会等待它）
myReject(Promise.resolve("ignored")).catch((e) =>
  console.log("rejected with promise:", e),
); // rejected with promise: Promise { 'ignored' }（值是那个 Promise 对象本身）

// 4. undefined
myReject(undefined).catch((e) => console.log("undefined reason:", e)); // undefined reason: undefined

// 5. 数字
myReject(404).catch((e) => console.log("code:", e)); // code: 404
