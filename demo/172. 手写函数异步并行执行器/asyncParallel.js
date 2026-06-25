/**
 * 手写函数异步并行执行器
 *
 * 作用：
 *   - 同时启动一组异步任务，全部完成后返回结果
 *   - 类似 Promise.all，但接受"任务函数数组"而非 Promise 数组
 *   - 可控制并发数（limit），避免一次性发起过多请求
 *
 * 实现思路：
 *   1. 无并发限制版：直接 Promise.all(tasks.map(t => t()))
 *   2. 有限并发版：维护执行池，空闲槽位才启动新任务
 */

// 无限并发版
async function asyncParallel(tasks) {
  return Promise.all(tasks.map((task) => task()));
}

// 全部完成版（类似 Promise.allSettled，不因一个失败而中断）
async function asyncParallelSettled(tasks) {
  const results = await Promise.allSettled(tasks.map((task) => task()));
  return results;
}

// 有限并发版：最多同时 limit 个任务
async function asyncParallelLimit(tasks, limit = Infinity) {
  const results = new Array(tasks.length);
  let cursor = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    function next() {
      // 全部任务完成
      if (cursor >= tasks.length && active === 0) {
        resolve(results);
        return;
      }
      // 启动新任务直到达到并发上限
      while (active < limit && cursor < tasks.length) {
        const idx = cursor++;
        active++;
        Promise.resolve()
          .then(() => tasks[idx]())
          .then(
            (v) => {
              results[idx] = v;
              active--;
              next();
            },
            (e) => {
              active--;
              reject(e);
            },
          );
      }
    }
    next();
  });
}

// 有限并发 + 容错版
async function asyncParallelLimitSettled(tasks, limit = Infinity) {
  const results = new Array(tasks.length);
  let cursor = 0;
  let active = 0;

  return new Promise((resolve) => {
    function next() {
      if (cursor >= tasks.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < limit && cursor < tasks.length) {
        const idx = cursor++;
        active++;
        Promise.resolve()
          .then(() => tasks[idx]())
          .then(
            (v) => {
              results[idx] = { status: "fulfilled", value: v };
              active--;
              next();
            },
            (e) => {
              results[idx] = { status: "rejected", reason: e };
              active--;
              next();
            },
          );
      }
    }
    next();
  });
}

// ===== 测试 =====

const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

(async () => {
  // 并行：总耗时 ≈ 最大单任务耗时
  const tasks = [
    () => delay(100, "a"),
    () => delay(50, "b"),
    () => delay(80, "c"),
  ];
  const start = Date.now();
  const results = await asyncParallel(tasks);
  console.log("并行结果:", results); // ['a','b','c']
  console.log("并行耗时≈最大值:", Date.now() - start < 150); // true
})();

(async () => {
  // allSettled 版
  const tasks = [
    () => delay(30, "ok1"),
    () => Promise.reject(new Error("fail2")),
    () => delay(30, "ok3"),
  ];
  const results = await asyncParallelSettled(tasks);
  console.log(
    "并行容错:",
    results.map((r) => r.status),
  ); // ['fulfilled','rejected','fulfilled']
})();

(async () => {
  // 有限并发：limit=2
  let running = 0;
  let maxRunning = 0;
  const tasks = Array.from({ length: 6 }, (_, i) => () => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    return delay(50, i).finally(() => running--);
  });
  const start = Date.now();
  const results = await asyncParallelLimit(tasks, 2);
  console.log("有限并发结果:", results); // [0,1,2,3,4,5]
  console.log("最大并发数<=2:", maxRunning <= 2); // true
  console.log("6任务/2并发耗时≈3批:", Date.now() - start >= 140); // true（约 3*50）
})();

(async () => {
  // 有限并发容错
  const tasks = [
    () => delay(20, 1),
    () => Promise.reject(new Error("e")),
    () => delay(20, 3),
    () => delay(20, 4),
  ];
  const results = await asyncParallelLimitSettled(tasks, 2);
  console.log(
    "有限并发容错:",
    results.map((r) => r.status),
  ); // ['fulfilled','rejected','fulfilled','fulfilled']
})();

// 应用：并发请求带限流
(async () => {
  const urls = Array.from({ length: 10 }, (_, i) => `/api/${i}`);
  const fetch = (url) => delay(10, `data:${url}`);
  const datas = await asyncParallelLimit(
    urls.map((u) => () => fetch(u)),
    3,
  );
  console.log("并发请求数量:", datas.length); // 10
  console.log("顺序保持:", datas[0], datas[9]); // 'data:/api/0' 'data:/api/9'
})();
