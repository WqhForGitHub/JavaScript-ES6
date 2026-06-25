/**
 * 手写 Promise 顺序执行器
 *
 * 需求：给定一组「返回 Promise 的函数」，让它们一个接一个地执行，
 *      前一个完成（fulfilled 或 rejected）后，再开始下一个。
 *
 * 区别于 Promise.all（并行），这里强调串行：
 *   - 任务 A 完成后才启动任务 B
 *   - 可选择「失败即停止」或「失败也继续」两种策略
 *   - 收集每个任务的结果（含成功值或失败原因）
 *
 * 思路：用 reduce 把任务串成一条 then 链，逐个推进。
 */

// 串行执行，失败也继续，返回每步结果（顺序与任务一致）
function promiseSequence(tasks, { continueOnError = false } = {}) {
  const results = new Array(tasks.length);
  let chain = Promise.resolve();

  tasks.forEach((task, index) => {
    chain = chain.then(async () => {
      try {
        const value = await task();
        results[index] = { status: "fulfilled", value };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
        if (!continueOnError) throw reason; // 默认：失败即停止
      }
    });
  });

  // 失败即停止模式：直接返回 chain（reject 会向外冒泡）
  // 失败也继续模式：把 chain 包成 resolved，返回 results 数组
  if (continueOnError) {
    return chain.then(() => results);
  }
  return chain.then(() => results);
}

// 更通用的「reduce 串联」写法（仅成功值传递，失败即终止）
function runSequenceStrict(tasks) {
  return tasks.reduce(
    (chain, task) => chain.then(() => task()),
    Promise.resolve(),
  );
}

// ===== 测试 =====

// 工具：制造一个有延迟、可能失败的任务
function makeTask(name, delay, fail = false) {
  return () =>
    new Promise((resolve, reject) => {
      console.log(`  -> start ${name}`);
      setTimeout(() => {
        console.log(`  <- end   ${name}`);
        fail ? reject(new Error(name + " failed")) : resolve(name);
      }, delay);
    });
}

(async () => {
  console.log("== 串行（失败也继续）==");
  const tasks1 = [
    makeTask("A", 30),
    makeTask("B", 20, true), // 失败
    makeTask("C", 10),
  ];
  const res1 = await promiseSequence(tasks1, { continueOnError: true });
  console.log("res1:", res1);
  // 期望：A->B->C 依次执行，B 标记 rejected，整体仍返回数组

  console.log("\n== 串行（失败即停止，默认）==");
  const tasks2 = [
    makeTask("X", 20),
    makeTask("Y", 10, true), // 失败，后续 Z 不会执行
    makeTask("Z", 10),
  ];
  try {
    await promiseSequence(tasks2); // 默认 continueOnError=false
    console.log("should not reach");
  } catch (e) {
    console.log("stopped at:", e.message); // stopped at: Y failed
  }

  console.log("\n== 严格串联（值传递）==");
  await runSequenceStrict([
    () => Promise.resolve(1),
    (prev) => Promise.resolve(prev + 2), // 注意：这里拿不到 prev，仅演示串联
    () => Promise.resolve("done"),
  ]).then((v) => console.log("strict last value:", v)); // strict last value: done
})();
