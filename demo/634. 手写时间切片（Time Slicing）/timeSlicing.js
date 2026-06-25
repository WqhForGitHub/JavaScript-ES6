/**
 * 手写时间切片（Time Slicing）
 *
 * 思想：把一个大任务拆成多个小单元（unit of work），每个时间片只执行到
 *   时间预算耗尽（如 5ms），然后让出主线程给浏览器渲染 / 事件，
 *   剩余任务延后到下一个时间片继续。这样保证主线程不会长时间被占用，
 *   高优先级任务（用户输入）可及时响应。
 *
 * 实现：用 MessageChannel（优先级高于 setTimeout）做宏任务调度，
 *   每次时间片用时间戳计算剩余时间，剩余 < 0 时让出。
 */

// 兼容 Node 环境：浏览器用 MessageChannel（优先级高于 setTimeout），
// Node 用 setTimeout（MessageChannel 的 port 会无限保持事件循环）
let postTask;
function setupChannel() {
  if (typeof window !== "undefined" && typeof MessageChannel !== "undefined") {
    const channel = new MessageChannel();
    channel.port1.onmessage = flushWork;
    postTask = () => channel.port2.postMessage(null);
  } else {
    postTask = () => setTimeout(flushWork, 0);
  }
}
setupChannel();

function now() {
  return typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
}

// ===== 调度入口 =====
const FRAME_INTERVAL = 5; // 每个时间片预算 5ms
let scheduledCallback = null;
let isLoopRunning = false;
let currentSliceStart = 0;

function scheduleCallback(callback) {
  scheduledCallback = callback;
  if (!isLoopRunning) {
    isLoopRunning = true;
    postTask();
  }
}

function flushWork() {
  isLoopRunning = false;
  const cb = scheduledCallback;
  if (!cb) return;
  currentSliceStart = now();
  let hasMoreWork = true;
  do {
    hasMoreWork = cb(() => now() - currentSliceStart < FRAME_INTERVAL);
  } while (hasMoreWork && now() - currentSliceStart < FRAME_INTERVAL);
  if (hasMoreWork) {
    // 还有剩余工作：再排一个时间片
    isLoopRunning = true;
    postTask();
  } else {
    scheduledCallback = null;
  }
}

// ===== 示例任务：累加一个长数组，每项为一个工作单元 =====
function createWork(items, onProgress, onDone) {
  let i = 0;
  let sum = 0;
  return function work(hasTimeRemaining) {
    while (i < items.length) {
      sum += items[i];
      i++;
      if (!hasTimeRemaining()) {
        onProgress(i, items.length, sum);
        return true; // 还有更多工作
      }
    }
    onProgress(i, items.length, sum);
    onDone(sum);
    return false; // 完成
  };
}

// ===== 测试 =====
const items = Array.from({ length: 100000 }, (_, i) => i + 1);
const work = createWork(
  items,
  (done, total, sum) => {
    console.log(`progress: ${done}/${total}, sum=${sum}`);
  },
  (sum) => {
    console.log("done, sum =", sum); // 5000050000
  },
);
scheduleCallback(work);
