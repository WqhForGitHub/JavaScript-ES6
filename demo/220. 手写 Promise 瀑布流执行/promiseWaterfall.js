/**
 * 手写 Promise 瀑布流执行
 *
 * 需求：把一组「处理函数」串联起来，前一个的输出作为后一个的输入，
 *      像瀑布一样逐级流转数据。任一环节失败则整体失败。
 *
 * 区别于 197 顺序执行器：
 *   - 顺序执行器强调「串行」，每个任务通常独立、不强调数据传递
 *   - 瀑布流强调「数据沿管道逐级传递/加工」，类似同步的链式 map/reduce
 *
 * 经典实现：reduce 把每个 handler 串到 chain 上，handler 形如
 *   (prev) => nextValue | Promise<nextValue>
 * 也可支持「提前终止」：handler 返回一个特殊的 STOP 标记则停止后续并返回当前值。
 *
 * 本文件实现：
 *   1. waterfall(handlers, initialValue)：基础瀑布流
 *   2. waterfallWithStop(handlers, initialValue)：支持中途终止
 */

// 基础瀑布流
function waterfall(handlers, initialValue) {
  return handlers.reduce(
    (chain, handler) => chain.then((prev) => handler(prev)),
    Promise.resolve(initialValue)
  );
}

// 支持中途终止的瀑布流
const STOP = Symbol("waterfall.stop");
function waterfallWithStop(handlers, initialValue) {
  return handlers.reduce((chain, handler) => {
    return chain.then(async (prev) => {
      if (prev === STOP) return STOP; // 已停止，后续全部跳过
      const next = await handler(prev);
      return next;
    });
  }, Promise.resolve(initialValue));
}

// ===== 测试 =====

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. 基础瀑布流：每步加工数据
  const handlers = [
    (x) => x + 1, // 0 -> 1
    async (x) => {
      await sleep(10);
      return x * 2; // 1 -> 2
    },
    (x) => "result=" + x, // 2 -> "result=2"
  ];
  const r1 = await waterfall(handlers, 0);
  console.log("case1:", r1); // case1: result=2

  // 2. 含异步与对象传递
  const r2 = await waterfall(
    [
      (user) => ({ ...user, id: 1 }),
      async (user) => {
        await sleep(10);
        return { ...user, profile: await Promise.resolve("profile-data") };
      },
      (user) => `${user.id}:${user.profile}`,
    ],
    { name: "Tom" }
  );
  console.log("case2:", r2); // case2: 1:profile-data

  // 3. 任一失败则整体失败
  try {
    await waterfall(
      [
        (x) => x + 1,
        (x) => Promise.reject(new Error("step2 broken")),
        (x) => x + 1, // 不会执行
      ],
      0
    );
  } catch (e) {
    console.log("case3 fail:", e.message); // case3 fail: step2 broken
  }

  // 4. 中途终止：某步返回 STOP，后续不再执行
  const r4 = await waterfallWithStop(
    [
      (x) => x + 1, // 0 -> 1
      (x) => {
        if (x > 0) return STOP; // 终止
        return x + 1;
      },
      (x) => x + 100, // 不会执行
    ],
    0
  );
  console.log("case4 (stopped):", r4); // case4 (stopped): Symbol(waterfall.stop)

  // 5. 终止时返回当前值（而非 STOP 标记）：自定义 stop 信号
  const STOP_WITH_VALUE = (value) => ({ __stop: true, value });
  const isStopSignal = (v) => v && v.__stop === true;
  const handlers5 = [
    (x) => x + 10, // 0 -> 10
    (x) => STOP_WITH_VALUE(x * 100), // 返回终止信号，携带值 1000
    (x) => x + 1, // 不会执行
  ];
  const chain5 = handlers5.reduce(
    (c, h) => c.then(async (prev) => (isStopSignal(prev) ? prev : h(prev))),
    Promise.resolve(0)
  );
  const r5 = await chain5;
  console.log("case5 stopped with value:", isStopSignal(r5) ? r5.value : r5);
  // case5 stopped with value: 1000
})();
