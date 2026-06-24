/**
 * 手写函数异步串行执行器
 *
 * 作用：
 *   - 把一组返回 Promise 的异步任务"按顺序"依次执行
 *   - 前一个完成后才开始下一个
 *   - 典型场景：依赖前置结果的请求链、限流场景、顺序动画
 *
 * 实现思路：
 *   1. 用 for...of + await 依次执行
 *   2. 把上一步结果传给下一步（可选）
 *   3. 任一步失败可选择是否中断
 */

// 基础版：任务数组，依次执行，返回所有结果
async function asyncSerial(tasks) {
  const results = [];
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  return results;
}

// 链式版：上一步结果作为下一步输入（类似 reduce）
async function asyncSerialChain(tasks, initialValue) {
  let acc = initialValue;
  for (const task of tasks) {
    acc = await task(acc);
  }
  return acc;
}

// 带错误处理：某步失败可决定是否继续
async function asyncSerialSafe(tasks) {
  const results = [];
  for (const task of tasks) {
    try {
      const result = await task();
      results.push({ status: "fulfilled", value: result });
    } catch (err) {
      results.push({ status: "rejected", reason: err });
    }
  }
  return results;
}

// ===== 测试 =====

const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

(async () => {
  // 基础串行
  const order = [];
  const tasks = [
    () => delay(100, "a").then(() => order.push(1)),
    () => delay(50, "b").then(() => order.push(2)),
    () => delay(80, "c").then(() => order.push(3)),
  ];
  const start = Date.now();
  const results = await asyncSerial(tasks);
  console.log("串行结果:", results); // ['a','b','c']
  console.log("执行顺序:", order); // [1, 2, 3]（严格顺序）
  console.log("总耗时>=230:", Date.now() - start >= 230); // true（100+50+80）
})();

(async () => {
  // 链式：每步用上步结果
  const tasks = [
    (x) => delay(50, x + 1),
    (x) => delay(50, x * 2),
    (x) => delay(50, x + 10),
  ];
  const final = await asyncSerialChain(tasks, 0);
  console.log("链式结果:", final); // ((0+1)*2)+10 = 12
})();

(async () => {
  // 错误处理版
  const tasks = [
    () => delay(30, "ok1"),
    () => Promise.reject(new Error("fail2")),
    () => delay(30, "ok3"),
  ];
  const results = await asyncSerialSafe(tasks);
  console.log("安全串行:", results);
  // [
  //   { status: 'fulfilled', value: 'ok1' },
  //   { status: 'rejected', reason: Error('fail2') },
  //   { status: 'fulfilled', value: 'ok3' }
  // ]
})();

// 对比并行：串行总耗时是各任务之和，并行是最大值
(async () => {
  const taskA = () => delay(100, "A");
  const taskB = () => delay(100, "B");
  const serialStart = Date.now();
  await asyncSerial([taskA, taskB]);
  const serialTime = Date.now() - serialStart;

  const parallelStart = Date.now();
  await Promise.all([taskA(), taskB()]);
  const parallelTime = Date.now() - parallelStart;

  console.log("串行耗时:", serialTime >= 200); // true
  console.log("并行耗时:", parallelTime < 200); // true
})();

// 应用：依次加载多个资源
(async () => {
  const urls = ["/api/a", "/api/b", "/api/c"];
  const fetch = (url) => delay(20, `data from ${url}`);
  const datas = await asyncSerial(urls.map((url) => () => fetch(url)));
  console.log("依次加载:", datas);
  // ['data from /api/a', 'data from /api/b', 'data from /api/c']
})();
