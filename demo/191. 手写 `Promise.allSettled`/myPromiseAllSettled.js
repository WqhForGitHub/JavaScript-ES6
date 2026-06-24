/**
 * 手写 Promise.allSettled
 *
 * 行为：
 *   - 接收一个可迭代对象，返回一个新 Promise
 *   - 等所有元素都「落定」（fulfilled 或 rejected）后才决议
 *   - 结果是数组，每个元素形如：
 *       { status: "fulfilled", value: any }
 *       { status: "rejected",  reason: any }
 *   - 不会因为某个 rejected 而整体 reject
 *   - 空可迭代对象 -> 立即 fulfilled 为 []
 */

function myAllSettled(iterable) {
  return new Promise((resolve) => {
    const arr = Array.from(iterable);
    const result = new Array(arr.length);
    let remaining = arr.length;

    if (arr.length === 0) {
      return resolve([]);
    }

    arr.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          result[index] = { status: "fulfilled", value };
          if (--remaining === 0) resolve(result);
        },
        (reason) => {
          result[index] = { status: "rejected", reason };
          if (--remaining === 0) resolve(result);
        }
      );
    });
  });
}

// ===== 测试 =====

// 1. 混合成功与失败
myAllSettled([
  Promise.resolve(1),
  Promise.reject("err"),
  Promise.resolve(3),
  Promise.reject(new Error("boom")),
]).then((res) => console.log("mixed:", res));
// mixed: [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'err' },
//   { status: 'fulfilled', value: 3 },
//   { status: 'rejected', reason: Error: boom ... }
// ]

// 2. 全部成功
myAllSettled([Promise.resolve("a"), Promise.resolve("b")]).then((res) =>
  console.log("all ok:", res)
);
// all ok: [ { status: 'fulfilled', value: 'a' }, { status: 'fulfilled', value: 'b' } ]

// 3. 全部失败
myAllSettled([Promise.reject(1), Promise.reject(2)]).then((res) =>
  console.log("all fail:", res)
);
// all fail: [ { status: 'rejected', reason: 1 }, { status: 'rejected', reason: 2 } ]

// 4. 空数组
myAllSettled([]).then((res) => console.log("empty:", res)); // empty: []

// 5. 含非 Promise
myAllSettled([1, Promise.resolve(2)]).then((res) =>
  console.log("with value:", res)
);
// with value: [ { status: 'fulfilled', value: 1 }, { status: 'fulfilled', value: 2 } ]
