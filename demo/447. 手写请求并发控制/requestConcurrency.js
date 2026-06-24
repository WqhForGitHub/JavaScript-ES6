/**
 * 手写请求并发控制
 *
 * 大量请求同时发起会压垮服务器/浏览器，需要限制最大并发数。
 * 这里实现 concurrencyControl 函数：
 *   - 接收任务函数数组和最大并发数 limit
 *   - 同时只允许 limit 个任务执行
 *   - 某个任务完成立即补充下一个任务
 *   - 返回所有结果（按输入顺序）的 Promise
 *
 * 实现思路：
 *   1. 用一个计数器 activeCount 记录当前执行中数量
 *   2. 维护结果数组 results，按索引写入保证顺序
 *   3. 用递归 + Promise 实现"完成后补位"
 *   4. 全部完成后 resolve
 */

function concurrencyControl(tasks, limit) {
  return new Promise((resolve, reject) => {
    const results = new Array(tasks.length);
    let activeCount = 0;
    let nextIndex = 0;
    let finishedCount = 0;
    let rejected = false;

    function runNext() {
      if (rejected) return;
      // 全部任务已派发且全部完成
      if (finishedCount === tasks.length) {
        resolve(results);
        return;
      }
      // 持续填充并发槽位
      while (activeCount < limit && nextIndex < tasks.length) {
        const index = nextIndex++;
        activeCount++;
        Promise.resolve()
          .then(() => tasks[index]())
          .then(
            (value) => {
              results[index] = { status: "fulfilled", value };
            },
            (reason) => {
              results[index] = { status: "rejected", reason };
            }
          )
          .finally(() => {
            activeCount--;
            finishedCount++;
            runNext();
          });
      }
    }

    runNext();
  });
}

// ===== 测试 =====
function makeTask(id, delay) {
  return function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`任务 ${id} 完成`);
        resolve(id);
      }, delay);
    });
  };
}

const tasks = [
  makeTask(1, 300),
  makeTask(2, 200),
  makeTask(3, 100),
  makeTask(4, 250),
  makeTask(5, 150),
];

const start = Date.now();
concurrencyControl(tasks, 2).then((results) => {
  console.log("总耗时(ms):", Date.now() - start); // 约 550ms（受限并发2）
  console.log("结果顺序:", results.map((r) => r.value)); // 结果顺序: [1,2,3,4,5]
});

// 测试含失败任务
concurrencyControl(
  [
    () => Promise.resolve("ok"),
    () => Promise.reject("fail"),
    () => Promise.resolve("ok2"),
  ],
  2
).then((results) => {
  console.log("含失败结果:", results);
  // 含失败结果: [
  //   { status: 'fulfilled', value: 'ok' },
  //   { status: 'rejected', reason: 'fail' },
  //   { status: 'fulfilled', value: 'ok2' }
  // ]
});

// 空数组
concurrencyControl([], 3).then((r) => console.log("空任务结果:", r)); // 空任务结果: []
