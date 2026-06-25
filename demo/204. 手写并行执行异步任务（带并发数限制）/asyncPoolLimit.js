/**
 * 手写并行执行异步任务（带并发数限制）
 *
 * 需求：给定 N 个任务和并发上限 limit，任意时刻最多 limit 个任务在执行，
 *      全部完成后按输入顺序返回结果。
 *
 * 这里给出两种实现：
 *   1. 递归式 asyncPoolLimit：直观，每完成一个就启动下一个
 *   2. Promise.all + 索引推进版：更紧凑
 *
 * 与 205 的 asyncPool 区别：本文件强调「带并发数限制地并行执行一批任务」，
 * 输入是任务数组；205 的 asyncPool 是「边迭代边入池」的通用并发池模式。
 */

// 实现 1：递归式（推荐，逻辑清晰）
async function asyncPoolLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let executing = 0; // 当前正在执行的任务数
  let nextIndex = 0; // 下一个待启动的任务下标

  return new Promise((resolve, reject) => {
    const run = () => {
      // 全部任务都已启动且无在执行的 -> 完成
      if (nextIndex >= tasks.length && executing === 0) {
        return resolve(results);
      }

      // 只要还有空位且还有任务，就启动
      while (executing < limit && nextIndex < tasks.length) {
        const index = nextIndex++;
        executing++;
        Promise.resolve()
          .then(() => tasks[index]())
          .then(
            (value) => {
              results[index] = value;
            },
            (err) => {
              // 任一失败立即 reject（也可改为收集，见 allSettled 版）
              reject(err);
            },
          )
          .finally(() => {
            executing--;
            run(); // 空出位置，继续调度
          });
      }
    };
    run();
  });
}

// 实现 2：allSettled 风格（失败不中断，收集每个结果）
async function asyncPoolLimitSettled(tasks, limit) {
  const results = new Array(tasks.length);
  let executing = 0;
  let nextIndex = 0;

  await new Promise((resolve) => {
    const run = () => {
      if (nextIndex >= tasks.length && executing === 0) return resolve();
      while (executing < limit && nextIndex < tasks.length) {
        const index = nextIndex++;
        executing++;
        Promise.resolve()
          .then(() => tasks[index]())
          .then(
            (value) => {
              results[index] = { status: "fulfilled", value };
            },
            (reason) => {
              results[index] = { status: "rejected", reason };
            },
          )
          .finally(() => {
            executing--;
            run();
          });
      }
    };
    run();
  });
  return results;
}

// ===== 测试 =====

// 制造任务：i 号任务延迟 (i%3+1)*30 ms，偶数号失败
function makeTask(i) {
  return () =>
    new Promise((resolve, reject) => {
      const delay = ((i % 3) + 1) * 30;
      setTimeout(() => {
        console.log(`  task ${i} done`);
        if (i % 2 === 0 && i > 0) reject(new Error("task " + i + " failed"));
        else resolve("r" + i);
      }, delay);
    });
}

(async () => {
  // 1. 全部成功
  const tasks1 = [0, 1, 2, 3, 4, 5].map((i) => () => Promise.resolve("v" + i));
  const r1 = await asyncPoolLimit(tasks1, 2);
  console.log("all success:", r1); // all success: [ 'v0','v1','v2','v3','v4','v5' ]

  // 2. 并发上限为 2，混合失败 -> 失败即停止
  console.log("\n-- with failures, fail-fast --");
  try {
    await asyncPoolLimit([0, 1, 2, 3, 4, 5].map(makeTask), 2);
  } catch (e) {
    console.log("fail-fast caught:", e.message);
  }

  // 3. settled 风格：失败不中断，收集结果
  console.log("\n-- with failures, allSettled --");
  const r3 = await asyncPoolLimitSettled([1, 2, 3, 4, 5].map(makeTask), 3);
  console.log(
    "settled:",
    r3.map((r) => r.status + ":" + (r.value ?? r.reason.message)),
  );
})();
