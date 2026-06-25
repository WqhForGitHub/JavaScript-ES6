/**
 * 手写 MessageChannel 双向通信
 *
 * MessageChannel 特点：
 *   - 创建两个相互连接的端口 port1 / port2
 *   - 一端 postMessage，另一端 onmessage 接收
 *   - 常用于：iframe 通信、Worker 通信、宏任务调度
 *
 * 封装目标：
 *   1. Promise 化请求-响应（带 id）
 *   2. 提供双向通信对（两端都能发起请求）
 *   3. Node 环境：内置 MessageChannel 可直接用
 */

// Node 环境直接有 MessageChannel；浏览器也有
const MC =
  typeof MessageChannel !== "undefined"
    ? MessageChannel
    : typeof require === "function" &&
      (() => {
        try {
          return require("worker_threads").MessageChannel;
        } catch {
          return null;
        }
      })();

// 单端口封装：既能发请求等响应，也能被对方请求
class PortEndpoint {
  constructor(port, name = "port") {
    this.port = port;
    this.name = name;
    this._pending = new Map();
    this._nextId = 1;
    this._handlers = new Map(); // 远端调用的方法

    this.port.onmessage = (e) => {
      const { id, method, payload, isResponse } = e.data;
      if (isResponse && this._pending.has(id)) {
        this._pending.get(id).resolve(payload);
        this._pending.delete(id);
        return;
      }
      // 收到远端请求
      const handler = this._handlers.get(method);
      if (handler) {
        Promise.resolve(handler(payload))
          .then((result) => {
            this.port.postMessage({ id, isResponse: true, payload: result });
          })
          .catch((err) => {
            this.port.postMessage({
              id,
              isResponse: true,
              payload: { error: err.message },
            });
          });
      }
    };
  }

  // 注册本地可被远端调用的方法
  handle(method, fn) {
    this._handlers.set(method, fn);
  }

  // 调用远端方法并等待响应
  call(method, payload) {
    const id = this._nextId++;
    return new Promise((resolve) => {
      this._pending.set(id, { resolve });
      this.port.postMessage({ id, method, payload });
    });
  }
}

// 创建一对双向通信端点
function createChannelPair() {
  const { port1, port2 } = new MC();
  return [new PortEndpoint(port1, "A"), new PortEndpoint(port2, "B")];
}

// ===== 测试 =====
(async () => {
  if (!MC) {
    console.log("当前环境无 MessageChannel，跳过");
    return;
  }
  const [endpointA, endpointB] = createChannelPair();

  // --- B 端注册方法，A 端调用 ---
  endpointB.handle("add", ({ a, b }) => a + b);
  endpointB.handle("greet", (name) => `Hello, ${name}!`);

  const sum = await endpointA.call("add", { a: 2, b: 3 });
  console.log("add 结果:", sum); // 5

  const greet = await endpointA.call("greet", "World");
  console.log("greet 结果:", greet); // "Hello, World!"

  // --- 双向：A 端也注册方法，B 端调用 ---
  endpointA.handle("multiply", ({ a, b }) => a * b);
  const product = await endpointB.call("multiply", { a: 4, b: 5 });
  console.log("multiply 结果:", product); // 20

  // --- 并发调用 ---
  const [r1, r2, r3] = await Promise.all([
    endpointA.call("add", { a: 10, b: 20 }),
    endpointA.call("add", { a: 100, b: 200 }),
    endpointA.call("greet", "并发"),
  ]);
  console.log("并发结果:", r1, r2, r3); // 30 300 "Hello, 并发!"

  console.log("MessageChannel 双向通信演示完成");
})();
