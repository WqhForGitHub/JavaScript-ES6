/**
 * 手写长轮询请求
 *
 * 长轮询（Long Polling）：客户端发请求，服务器若有数据立即返回，
 * 若无数据则挂起请求直到有新数据或超时；客户端收到响应后立即再发下一次请求。
 * 相比普通轮询，长轮询实时性更好、请求次数更少。
 *
 * 这里实现 startLongPolling，支持：
 *   - 上一次请求返回后才发起下一次
 *   - 请求失败时短暂延迟后重试，避免疯狂重连
 *   - stop() 优雅停止
 *
 * 实现思路：
 *   1. 递归调用 requestFn
 *   2. 成功：回调 onSuccess 后立即 loop
 *   3. 失败：回调 onError 后延时 retryDelay 再 loop
 *   4. running 标志控制退出
 */

function startLongPolling(requestFn, options = {}) {
  const { onSuccess, onError, retryDelay = 1000, immediate = true } = options;

  let running = true;
  let pendingTimer = null;

  async function loop() {
    if (!running) return;
    try {
      const result = await requestFn();
      if (!running) return;
      if (onSuccess) onSuccess(result);
      // 立即发起下一次长轮询
      pendingTimer = setTimeout(loop, 0);
    } catch (err) {
      if (!running) return;
      if (onError) onError(err);
      // 失败后短暂延迟再试
      pendingTimer = setTimeout(loop, retryDelay);
    }
  }

  if (immediate) loop();
  else pendingTimer = setTimeout(loop, retryDelay);

  return {
    stop() {
      running = false;
      if (pendingTimer) clearTimeout(pendingTimer);
    },
    isRunning() {
      return running;
    },
  };
}

// ===== 测试 =====
// 模拟服务端：第 1 次无数据挂起，第 2 次返回数据
let serverData = null;
let reqSeq = 0;
function mockLongRequest() {
  return new Promise((resolve, reject) => {
    reqSeq++;
    const current = reqSeq;
    setTimeout(() => {
      if (current === 2) {
        resolve({ event: "update", payload: "data-v2" });
      } else if (current === 3) {
        resolve({ event: "update", payload: "data-v3" });
      } else if (current === 4) {
        reject(new Error("server timeout"));
      } else {
        resolve({ event: "ping", payload: null });
      }
    }, 5);
  });
}

const events = [];
const errors = [];
const longPoller = startLongPolling(mockLongRequest, {
  retryDelay: 10,
  onSuccess: (res) => {
    events.push(res);
    console.log("收到推送:", JSON.stringify(res));
  },
  onError: (err) => {
    errors.push(err.message);
    console.log("请求异常:", err.message);
  },
});

setTimeout(() => {
  longPoller.stop();
  console.log("收到事件数:", events.length, "异常数:", errors.length);
  console.log("isRunning:", longPoller.isRunning()); // isRunning: false
}, 80);
