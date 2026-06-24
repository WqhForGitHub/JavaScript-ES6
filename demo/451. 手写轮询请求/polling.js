/**
 * 手写轮询请求
 *
 * 轮询（Polling）：客户端每隔固定时间向服务器发一次请求获取最新数据。
 * 适用场景：数据更新不频繁、对实时性要求一般的场景。
 *
 * 这里实现 startPolling 函数，支持：
 *   - 固定间隔轮询
 *   - 单次请求失败不影响后续轮询
 *   - stop() 停止轮询
 *   - 回调接收每次结果与错误
 *
 * 实现思路：
 *   1. 用 setInterval 或递归 setTimeout 触发请求
 *   2. 推荐 setTimeout 递归：可保证上一次请求完成后才计时下一次，
 *      避免请求堆积
 *   3. 维护 running 标志控制启停
 */

function startPolling(requestFn, interval, handlers = {}) {
  const { onSuccess, onError } = handlers;
  let running = true;
  let timer = null;

  async function tick() {
    if (!running) return;
    try {
      const result = await requestFn();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      if (onError) onError(err);
    } finally {
      if (running) {
        timer = setTimeout(tick, interval);
      }
    }
  }

  // 立即触发第一次，之后按间隔
  tick();

  return {
    stop() {
      running = false;
      if (timer) clearTimeout(timer);
    },
    isRunning() {
      return running;
    },
  };
}

// ===== 测试 =====
let callCount = 0;
function mockRequest() {
  callCount++;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (callCount === 3) {
        reject(new Error("第3次模拟失败"));
      } else {
        resolve({ time: Date.now(), n: callCount });
      }
    }, 5);
  });
}

const results = [];
const errors = [];
const poller = startPolling(mockRequest, 20, {
  onSuccess: (res) => {
    results.push(res.n);
    console.log("轮询成功:", res.n);
  },
  onError: (err) => {
    errors.push(err.message);
    console.log("轮询失败:", err.message);
  },
});

// 5 次后停止
setTimeout(() => {
  poller.stop();
  console.log("已停止，成功次数:", results.length, "失败次数:", errors.length);
  console.log("isRunning:", poller.isRunning()); // isRunning: false
  // 输出形如：成功次数: 4 失败次数: 1（5次里有1次失败）
}, 110);
