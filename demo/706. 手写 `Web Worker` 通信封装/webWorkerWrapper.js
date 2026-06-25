/**
 * 手写 Web Worker 通信封装
 *
 * Web Worker 作用：
 *   - 在独立线程执行 JS，避免阻塞主线程 UI
 *   - 主线程与 worker 通过 postMessage / onmessage 通信
 *
 * 封装目标：
 *   1. 支持 Promise 化请求-响应（带消息 id 关联）
 *   2. 支持事件订阅（on/off/emit）
 *   3. 支持错误透传
 *   4. Node 环境：用 worker_threads 模拟，保证可运行
 */

// ---- Worker 端应运行的代码（字符串形式，浏览器可写成 Blob） ----
const workerScript = `
self.onmessage = function (e) {
  const { id, type, payload } = e.data;
  if (type === 'compute') {
    // 模拟耗时计算：斐波那契
    function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }
    const result = fib(payload.n);
    self.postMessage({ id, type: 'compute:done', payload: { result } });
  } else if (type === 'progress') {
    for (let i = 0; i <= 3; i++) {
      self.postMessage({ id, type: 'progress:event', payload: { step: i, total: 3 } });
    }
    self.postMessage({ id, type: 'progress:done', payload: { ok: true } });
  }
};
`;

// ---- 主线程封装 ----
class WorkerWrapper {
  constructor(worker) {
    this.worker = worker;
    this._callbacks = new Map(); // id -> { resolve, reject }
    this._handlers = new Map(); // type -> Set<fn>
    this._nextId = 1;

    this.worker.onmessage = (e) => {
      const { id, type, payload } = e.data;
      // 请求-响应：done 事件匹配 id
      if (type.endsWith(":done") && this._callbacks.has(id)) {
        this._callbacks.get(id).resolve(payload);
        this._callbacks.delete(id);
        return;
      }
      // 事件订阅
      if (this._handlers.has(type)) {
        this._handlers.get(type).forEach((fn) => fn(payload));
      }
    };

    this.worker.onerror = (err) => {
      // 通知所有等待中的回调
      this._callbacks.forEach((cb) => cb.reject(err));
      this._callbacks.clear();
    };
  }

  // 发送请求并等待 done 响应
  request(type, payload) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      this._callbacks.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, payload });
    });
  }

  // 订阅事件
  on(type, fn) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    this._handlers.get(type)?.delete(fn);
  }

  terminate() {
    this.worker.terminate?.();
    this._callbacks.clear();
    this._handlers.clear();
  }
}

// ---- 创建 worker 的工厂（跨环境） ----
function createWorker(script) {
  // 浏览器环境
  if (typeof Worker !== "undefined") {
    const blob = new Blob([script], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }
  // Node 环境：用 worker_threads 模拟
  if (typeof require === "function") {
    const { Worker, workerData } = (() => {
      try {
        return require("worker_threads");
      } catch {
        return {};
      }
    })();
    if (Worker) {
      return new NodeWorkerAdapter(script);
    }
  }
  return null;
}

// Node 环境适配器：把 worker_threads 包装成浏览器 Worker 接口
class NodeWorkerAdapter {
  constructor(script) {
    const { Worker } = require("worker_threads");
    // 把浏览器 worker 脚本（用 self.onmessage / self.postMessage）
    // 包装成 Node worker_threads 可运行形式：注入 self shim 映射到 parentPort
    const wrapped = `
      const { parentPort } = require('worker_threads');
      const self = {
        onmessage: null,
        postMessage(data) { parentPort.postMessage(data); }
      };
      parentPort.on('message', (data) => { if (self.onmessage) self.onmessage({ data }); });
      ${script}
    `;
    this._worker = new Worker(wrapped, { eval: true });
    this.onmessage = null;
    this.onerror = null;
    this._worker.on(
      "message",
      (data) => this.onmessage && this.onmessage({ data }),
    );
    this._worker.on("error", (err) => this.onerror && this.onerror(err));
  }
  postMessage(data) {
    this._worker.postMessage(data);
  }
  terminate() {
    this._worker.terminate();
  }
}

// ===== 测试 =====
(async () => {
  const raw = createWorker(workerScript);
  if (!raw) {
    console.log("当前环境无 Worker，跳过运行测试");
    return;
  }
  const worker = new WorkerWrapper(raw);

  // --- 请求-响应：计算斐波那契 ---
  const res = await worker.request("compute", { n: 20 });
  console.log("fib(20) =", res.result); // fib(20) = 6765

  // --- 事件订阅：进度 ---
  const steps = [];
  const off = worker.on("progress:event", (p) => steps.push(p.step));
  await worker.request("progress", {});
  console.log("进度步骤:", steps); // [ 0, 1, 2, 3 ]
  off();

  worker.terminate();
  console.log("Web Worker 通信演示完成");
})();
