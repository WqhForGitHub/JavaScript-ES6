/**
 * 手写红绿灯交替切换
 *
 * 需求：模拟红绿灯，按 红 -> 绿 -> 黄 -> 红 ... 循环切换，
 *      每个灯亮指定时长（红 3s / 绿 2s / 黄 1s，这里用更小的值便于测试）。
 *
 * 要求：
 *   - 用 Promise + async/await 实现
 *   - 提供一个能「停下来」的方式（stop 后停止循环）
 *   - 每次切换打印当前灯
 *
 * 思路：
 *   - sleep(ms) 返回延迟 ms 毫秒的 Promise
 *   - light(color, ms) 打印灯并 sleep
 *   - 主循环 await 依次点亮红、绿、黄，循环往复
 *   - 用一个 running 标志控制是否继续；用 timer 让 sleep 可被中断
 */

// 可中断的 sleep
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) return reject(new Error("aborted"));
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(new Error("aborted"));
    };
    const cleanup = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
    };
    if (signal) signal.addEventListener("abort", onAbort);
  });
}

class TrafficLight {
  constructor(config) {
    // config: [{ color, duration }, ...]
    this.config = config;
    this.running = false;
    this._abort = null;
  }

  async start() {
    this.running = true;
    this._abort = new AbortController();

    let cycle = 0;
    while (this.running) {
      cycle++;
      console.log(`-- cycle ${cycle} --`);
      for (const { color, duration } of this.config) {
        if (!this.running) break;
        await this._light(color, duration);
      }
    }
    console.log("traffic light stopped");
  }

  async _light(color, ms) {
    const start = Date.now();
    console.log(`  [${color}] on`);
    try {
      await sleep(ms, this._abort.signal);
      console.log(`  [${color}] off (${Date.now() - start}ms)`);
    } catch (e) {
      // 被中断（stop）
      console.log(`  [${color}] interrupted`);
      throw e;
    }
  }

  stop() {
    this.running = false;
    if (this._abort) this._abort.abort();
  }
}

// ===== 测试 =====

(async () => {
  // 用较小的时间值便于测试：红 300ms / 绿 200ms / 黄 100ms
  const light = new TrafficLight([
    { color: "红", duration: 300 },
    { color: "绿", duration: 200 },
    { color: "黄", duration: 100 },
  ]);

  // 启动循环
  const task = light.start();

  // 1 秒后停下来（约能跑 2 个完整周期）
  setTimeout(() => {
    console.log(">>> 停止红绿灯");
    light.stop();
  }, 1000);

  try {
    await task;
  } catch (e) {
    console.log("main caught:", e.message);
  }

  // 输出大致如下：
  // -- cycle 1 --
  //   [红] on
  //   [红] off (≈300ms)
  //   [绿] on
  //   [绿] off (≈200ms)
  //   [黄] on
  //   [黄] off (≈100ms)
  // -- cycle 2 --
  //   [红] on
  //   ...
  // >>> 停止红绿灯
  //   [红] interrupted
  // traffic light stopped
})();
