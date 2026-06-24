/**
 * 手写 Promise.all
 *
 * 行为：
 *   - 接收一个可迭代对象（数组等），返回一个新 Promise
 *   - 所有元素都 fulfilled -> 返回数组按顺序保存每个结果 -> 整体 fulfilled
 *   - 任一元素 rejected -> 整体立即 rejected，原因即该元素的 reason
 *   - 空可迭代对象 -> 立即 fulfilled 为空数组
 *   - 非 Promise 元素会被 Promise.resolve 包装
 *   - 结果数组顺序与输入顺序一致（与完成先后无关）
 */

function myAll(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable); // 支持所有可迭代对象
    const result = new Array(arr.length);
    let remaining = arr.length;

    if (arr.length === 0) {
      return resolve([]);
    }

    arr.forEach((item, index) => {
      // 用 Promise.resolve 兼容非 Promise 与 thenable
      Promise.resolve(item).then(
        (value) => {
          result[index] = value; // 保证顺序
          if (--remaining === 0) resolve(result);
        },
        (reason) => reject(reason) // 一旦失败立即 reject
      );
    });
  });
}

// ===== 测试 =====

// 1. 全部成功，顺序与输入一致
myAll([Promise.resolve(1), 2, Promise.resolve(3)]).then((res) =>
  console.log("all ok:", res)
); // all ok: [ 1, 2, 3 ]

// 2. 异步 + 顺序保证（后写的先完成，但结果顺序不变）
const slow = new Promise((r) => setTimeout(() => r("slow"), 80));
const fast = new Promise((r) => setTimeout(() => r("fast"), 20));
myAll([slow, fast]).then((res) => console.log("order:", res)); // order: [ 'slow', 'fast' ]

// 3. 任一失败
myAll([
  Promise.resolve(1),
  Promise.reject("err"),
  Promise.resolve(3),
]).catch((e) => console.log("rejected:", e)); // rejected: err

// 4. 空数组
myAll([]).then((res) => console.log("empty:", res)); // empty: []

// 5. 支持 Set 等可迭代对象
myAll(new Set([Promise.resolve("a"), Promise.resolve("b")])).then((res) =>
  console.log("set:", res)
); // set: [ 'a', 'b' ]
