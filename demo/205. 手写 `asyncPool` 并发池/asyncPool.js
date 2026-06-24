/**
 * 手写 asyncPool 并发池
 *
 * 这是经典的「JS 并发池」实现，常见考法：
 *   asyncPool(limit, items, iterFn)
 *   - limit: 最大并发数
 *   - items: 可迭代的输入项
 *   - iterFn(item, index): 对每个 item 执行，返回 Promise
 *   - 返回：所有结果的 Promise，按 items 顺序排列
 *
 * 特点：边遍历 items 边启动任务，达到 limit 后「等最快的一个完成」再继续。
 *      相比「先入队再调度」，写法更紧凑，且能处理 items 是生成器/流式输入。
 *
 * 经典写法（阮一峰版本）：
 *   for (const item of items) {
 *     const p = iterFn(item);
 *     ret.push(p);
 *     if (limit <= items.length) {
 *       p.finally(() => executing.splice(executing.indexOf(p), 1));
 *       executing.push(p);
 *       if (executing.length >= limit) await Promise.race(executing);
 *     }
 *   }
 *   return Promise.all(ret);
 *
 * 本文件实现该经典版本 + 一个失败即停止的健壮版。
 */

// 版本 1：经典 asyncPool（用 Promise.all 汇总，任一失败则整体 reject）
async function asyncPool(limit, items, iterFn) {
  const ret = []; // 所有任务的 Promise（保持顺序）
  const executing = []; // 当前在执行的任务

  for (const item of items) {
    const p = Promise.resolve().then(() => iterFn(item));
    ret.push(p);

    if (limit <= items.length) {
      // 完成后从 executing 中移除
      const e = p.finally(() => {
        const idx = executing.indexOf(e);
        if (idx !== -1) executing.splice(idx, 1);
      });
      executing.push(e);
      // 池满：等最快的一个完成，腾出位置继续下一轮 for
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

// 版本 2：失败即停止（任一失败立即 reject，后续不再启动新任务）
function asyncPoolFailFast(limit, items, iterFn) {
  const arr = Array.from(items);
  const results = new Array(arr.length);
  let nextIndex = 0;
  let running = 0;
  let aborted = false;

  return new Promise((resolve, reject) => {
    if (arr.length === 0) return resolve([]);

    const launch = () => {
      if (aborted) return;
      while (running < limit && nextIndex < arr.length) {
        const i = nextIndex++;
        running++;
        Promise.resolve()
          .then(() => iterFn(arr[i], i))
          .then(
            (v) => {
              results[i] = v;
              running--;
              if (nextIndex >= arr.length && running === 0) resolve(results);
              else launch();
            },
            (e) => {
              aborted = true;
              reject(e);
            }
          );
      }
    };
    launch();
  });
}

// ===== 测试 =====

function delay(value, ms, fail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => (fail ? reject(new Error(value + " fail")) : resolve(value)),
      ms
    )
  );
}

(async () => {
  // 1. 经典版：limit=2，5 个任务
  const items1 = [
    ["A", 40],
    ["B", 20],
    ["C", 30],
    ["D", 10],
    ["E", 25],
  ];
  console.log("-- classic asyncPool --");
  const r1 = await asyncPool(2, items1, ([v, ms]) => delay(v, ms));
  console.log("classic result:", r1); // classic result: [ 'A','B','C','D','E' ]

  // 2. 经典版含失败（Promise.all 失败则整体 reject）
  console.log("\n-- classic with failure --");
  try {
    await asyncPool(
      2,
      [["X", 10, true], ["Y", 20], ["Z", 15]],
      ([v, ms, fail]) => delay(v, ms, fail)
    );
  } catch (e) {
    console.log("classic fail:", e.message); // classic fail: X fail
  }

  // 3. fail-fast 版
  console.log("\n-- fail-fast --");
  const r3 = await asyncPoolFailFast(
    3,
    [1, 2, 3, 4, 5],
    (i) => delay("v" + i, 20)
  );
  console.log("failfast result:", r3); // failfast result: [ 'v1','v2','v3','v4','v5' ]

  // 4. limit 大于任务数
  const r4 = await asyncPool(10, [1, 2, 3], (i) => delay(i, 10));
  console.log("limit>size:", r4); // limit>size: [ 1,2,3 ]

  // 5. 空输入
  const r5 = await asyncPoolFailFast(2, [], () => Promise.resolve());
  console.log("empty:", r5); // empty: []
})();
