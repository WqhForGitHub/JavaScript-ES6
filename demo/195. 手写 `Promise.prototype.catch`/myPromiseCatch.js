/**
 * 手写 Promise.prototype.catch
 *
 * 行为：
 *   - 只处理 rejected 状态（相当于 then(null, onRejected) 的语法糖）
 *   - 返回一个新 Promise，支持后续链式调用
 *   - 如果当前 Promise 是 fulfilled，catch 的回调不会执行，
 *     值会透传给后续 then
 *   - catch 自身也可能抛错，可被后面的 catch 再捕获
 *   - catch 之后仍可继续 then / catch
 *
 * 实现要点：catch 本质就是 then 的「只给 rejected 回调」版本，
 * 内部直接调用 this.then(undefined, onRejected)。
 */

function myCatch(onRejected) {
  // 注意：这里直接复用 then，第二个参数即 rejected 回调
  // 第一个参数传 undefined 实现值穿透
  return this.then(undefined, onRejected);
}

// 给一个构造函数挂上 myCatch（不污染全局 Promise，仅演示）
function attachCatch(P) {
  P.prototype.myCatch = myCatch;
}

// ===== 测试 =====

// 1. 基本捕获
myCatch.call(Promise.reject("err"), (e) =>
  console.log("caught:", e)
); // caught: err

// 2. 成功时不执行 catch，但可继续 then
myCatch
  .call(Promise.resolve("ok"), () => "should skip")
  .then((v) => console.log("value passed:", v)); // value passed: ok

// 3. catch 后继续链式
myCatch
  .call(Promise.reject("err"), (e) => {
    console.log("caught then recover:", e);
    return "recovered";
  })
  .then((v) => console.log("after recover:", v));
// caught then recover: err
// after recover: recovered

// 4. catch 中再次抛错，可被后续 catch 捕获
myCatch
  .call(Promise.reject("first"), () => {
    throw new Error("second");
  })
  .catch((e) => console.log("second caught:", e.message)); // second caught: second

// 5. 异步 reject 也能捕获
const asyncP = new Promise((_, rej) =>
  setTimeout(() => rej("async err"), 30)
);
myCatch.call(asyncP, (e) => console.log("async caught:", e));
// async caught: async err
