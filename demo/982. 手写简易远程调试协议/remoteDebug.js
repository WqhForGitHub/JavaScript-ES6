/**
 * 手写简易远程调试协议 (Simple Remote Debug Protocol)
 * ===================================================
 *
 * 概念说明:
 * 远程调试协议 (类似 Chrome DevTools Protocol) 用于让调试客户端 (Client)
 * 控制被调试目标 (Server/Target). 双方通过消息通道交换 JSON 消息.
 *
 * 消息格式:
 * - Request:  { type: 'request',  id, method, params }
 * - Response: { type: 'response', id, result | error }
 * - Event:    { type: 'event',    method, params }
 *
 * 支持的方法 (method):
 * - 'evaluate'        : 在目标上下文中求值表达式, 返回结果
 * - 'getObjectProps'  : 获取某个对象的属性列表
 * - 'setBreakpoint'   : 设置断点 (此处模拟为记录)
 * - 'pause' / 'resume': 暂停 / 恢复执行 (模拟)
 *
 * 通信通道:
 * 使用基于内存事件模拟的 MessageChannel, 双向收发消息.
 * 这与 WebSocket 的接口形态一致, 便于迁移到真实网络环境.
 *
 * 收敛性:
 * 客户端通过 id 关联请求与响应, 使用 Promise 异步等待结果.
 */

"use strict";

const { EventEmitter } = require("events");

/**
 * 模拟双向通信通道
 * 两个端点 (a, b) 互相收发消息, 内部用 EventEmitter 实现.
 * 在真实环境下可替换为 WebSocket / postMessage.
 */
function createChannel() {
  const a = new EventEmitter();
  const b = new EventEmitter();
  // a 发送的消息由 b 接收, 反之亦然
  const endpointA = {
    onMessage(handler) {
      a.on("message", handler);
    },
    send(msg) {
      // 异步投递, 模拟网络延迟
      setImmediate(() => b.emit("message", msg));
    },
  };
  const endpointB = {
    onMessage(handler) {
      b.on("message", handler);
    },
    send(msg) {
      setImmediate(() => a.emit("message", msg));
    },
  };
  return { endpointA, endpointB };
}

/**
 * 调试服务器 (被调试目标)
 * 持有一个上下文对象, 接收命令并返回结果.
 */
class DebugServer {
  /**
   * @param {object} endpoint - 通信端点
   * @param {object} [context] - 被调试的上下文对象
   */
  constructor(endpoint, context = {}) {
    this.endpoint = endpoint;
    this.context = context;
    this.breakpoints = [];
    this.paused = false;
    this._nextBreakpointId = 1;
    this._seq = 0;
    this._bind();
  }

  _bind() {
    this.endpoint.onMessage((msg) => this._handle(msg));
  }

  /**
   * 处理收到的请求
   */
  async _handle(msg) {
    if (msg.type !== "request") return;
    let result;
    let error;
    try {
      result = await this._dispatch(msg.method, msg.params);
    } catch (e) {
      error = { name: e.name, message: e.message, stack: e.stack };
    }
    this.endpoint.send({
      type: "response",
      id: msg.id,
      ...(error ? { error } : { result }),
    });
  }

  /**
   * 方法分发
   */
  _dispatch(method, params) {
    switch (method) {
      case "evaluate":
        return this._evaluate(params.expression);
      case "getObjectProps":
        return this._getObjectProps(params.objectPath);
      case "setBreakpoint":
        return this._setBreakpoint(params);
      case "pause":
        this.paused = true;
        this._emitEvent("paused", { reason: params.reason || "manual" });
        return { paused: true };
      case "resume":
        this.paused = false;
        this._emitEvent("resumed", {});
        return { paused: false };
      case "getState":
        return this.context;
      default:
        throw new Error(`未知方法: ${method}`);
    }
  }

  /**
   * 在上下文中求值表达式
   * 使用 Function 构造器在受控上下文执行 (仅用于演示, 真实场景需沙箱)
   */
  _evaluate(expression) {
    // eslint-disable-next-line no-new-func
    const fn = new Function("ctx", `with(ctx){ return (${expression}); }`);
    const value = fn(this.context);
    return { value, type: typeof value };
  }

  /**
   * 获取指定路径对象的属性
   */
  _getObjectProps(path) {
    let obj = this.context;
    if (path) {
      for (const key of path.split(".")) {
        obj = obj[key];
        if (obj == null) {
          throw new Error(`路径不存在: ${path}`);
        }
      }
    }
    const props = Object.keys(obj).map((name) => ({
      name,
      type: typeof obj[name],
      value: safeSerialize(obj[name]),
    }));
    return { path: path || "root", props };
  }

  /**
   * 设置断点 (模拟)
   */
  _setBreakpoint(params) {
    const id = this._nextBreakpointId++;
    const bp = { id, ...params };
    this.breakpoints.push(bp);
    return { breakpointId: id, ...bp };
  }

  /**
   * 向客户端推送事件
   */
  _emitEvent(method, params) {
    this.endpoint.send({ type: "event", method, params });
  }
}

/** 简单序列化, 避免循环引用与函数 */
function safeSerialize(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "function") return "[Function]";
    return value;
  }
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((v) => safeSerialize(v, seen));
  }
  const out = {};
  for (const k of Object.keys(value)) {
    out[k] = safeSerialize(value[k], seen);
  }
  return out;
}

/**
 * 调试客户端
 * 发送命令并等待响应, 监听事件.
 */
class DebugClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this._nextId = 1;
    /** @type {Map<number, {resolve, reject}>} */
    this._pending = new Map();
    /** @type {Map<string, Function>} */
    this._eventHandlers = new Map();
    this._bind();
  }

  _bind() {
    this.endpoint.onMessage((msg) => this._onMessage(msg));
  }

  _onMessage(msg) {
    if (msg.type === "response") {
      const handler = this._pending.get(msg.id);
      if (!handler) return;
      this._pending.delete(msg.id);
      if (msg.error) {
        handler.reject(Object.assign(new Error(msg.error.message), msg.error));
      } else {
        handler.resolve(msg.result);
      }
    } else if (msg.type === "event") {
      const handler = this._eventHandlers.get(msg.method);
      if (handler) handler(msg.params);
    }
  }

  /**
   * 发送请求, 返回 Promise
   */
  send(method, params = {}) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      this.endpoint.send({ type: "request", id, method, params });
    });
  }

  /**
   * 注册事件处理器
   */
  on(event, handler) {
    this._eventHandlers.set(event, handler);
  }
}

// ============================================================
// 测试与演示
// ============================================================

(async function main() {
  console.log("========== 远程调试协议演示 ==========\n");

  // 1. 建立通道, 被调试上下文
  const { endpointA: clientEndpoint, endpointB: serverEndpoint } =
    createChannel();
  const targetContext = {
    user: { id: 42, name: "Alice", roles: ["admin", "editor"] },
    count: 0,
    items: ["apple", "banana", "cherry"],
    config: { debug: true, version: "1.2.3" },
    greet(name) {
      return `Hello, ${name}!`;
    },
  };

  const server = new DebugServer(serverEndpoint, targetContext);
  const client = new DebugClient(clientEndpoint);

  // 监听暂停 / 恢复事件
  client.on("paused", (params) => {
    console.log("[事件] 目标已暂停, 原因:", params.reason);
  });
  client.on("resumed", () => {
    console.log("[事件] 目标已恢复");
  });

  console.log("--- 1. 求值表达式 ---");
  let res = await client.send("evaluate", { expression: "user.name" });
  console.log("evaluate 'user.name' =>", res);

  res = await client.send("evaluate", { expression: "user.roles.length" });
  console.log("evaluate 'user.roles.length' =>", res);

  res = await client.send("evaluate", {
    expression: "items.map(x => x.toUpperCase())",
  });
  console.log("evaluate 'items.map(...)' =>", res);

  res = await client.send("evaluate", { expression: "count + 10" });
  console.log("evaluate 'count + 10' =>", res);

  console.log("\n--- 2. 获取对象属性 ---");
  res = await client.send("getObjectProps", { objectPath: "user" });
  console.log("user 对象属性:");
  for (const p of res.props) {
    console.log(`  ${p.name} (${p.type}) =`, p.value);
  }

  res = await client.send("getObjectProps", { objectPath: "config" });
  console.log("config 对象属性:");
  for (const p of res.props) {
    console.log(`  ${p.name} (${p.type}) =`, p.value);
  }

  console.log("\n--- 3. 设置断点 (模拟) ---");
  res = await client.send("setBreakpoint", {
    file: "app.js",
    line: 42,
    condition: "count > 5",
  });
  console.log("断点已设置:", res);

  console.log("\n--- 4. 暂停 / 恢复 ---");
  await client.send("pause", { reason: "debuggerStatement" });
  await client.send("resume", {});

  console.log("\n--- 5. 获取整体状态 ---");
  res = await client.send("getState", {});
  console.log("当前上下文状态:", JSON.stringify(res, null, 2));

  console.log("\n--- 6. 错误处理 (求值非法表达式) ---");
  try {
    await client.send("evaluate", { expression: "nonexistent.deep.path" });
  } catch (err) {
    console.log("捕获到调试错误:", err.name, "-", err.message);
  }

  console.log("\n--- 7. 错误处理 (未知方法) ---");
  try {
    await client.send("unknownMethod", {});
  } catch (err) {
    console.log("捕获到调试错误:", err.message);
  }

  console.log("\n[远程调试协议演示完成]");
})();
