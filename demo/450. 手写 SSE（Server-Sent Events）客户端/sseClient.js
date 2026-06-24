/**
 * 手写 SSE（Server-Sent Events）客户端
 *
 * SSE 是服务器单向推送数据的协议，基于 HTTP 长连接，Content-Type: text/event-stream。
 * 浏览器原生 EventSource 只支持 GET，这里基于 fetch 实现一个增强版，支持：
 *   - GET / POST 请求
 *   - 自定义 headers
 *   - 事件分组（event 字段）
 *   - 自动重连 + LastEvent-ID 续传
 *   - 数据按 SSE 规范解析（多行 data 用 \n 连接）
 *
 * SSE 协议要点：
 *   - 以 \n\n 分隔事件块
 *   - 每行格式 field: value，字段有 data / event / id / retry
 *   - 注释行以 : 开头
 *
 * 实现思路：
 *   1. fetch 拿到 ReadableStream，逐块读取并按行缓冲
 *   2. 遇到空行则解析一个完整事件块
 *   3. 通过 emit 分发到对应 event 监听器
 *   4. 记录 lastEventId，重连时带上
 */

class SSEClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = Object.assign(
      {
        method: "GET",
        headers: {},
        body: null,
        withCredentials: false,
        reconnect: true,
        reconnectInterval: 3000,
        maxReconnectAttempts: Infinity,
      },
      options
    );

    this._listeners = new Map(); // event -> [fn]
    this.lastEventId = null;
    this.readyState = 0; // 0 connecting, 1 open, 2 closed
    this.reconnectAttempts = 0;
    this.manualClose = false;
    this._reconnectTimer = null;
    this._abortController = null;
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
    return this;
  }

  off(event, fn) {
    const arr = this._listeners.get(event);
    if (arr) this._listeners.set(event, arr.filter((f) => f !== fn));
    return this;
  }

  _emit(event, data, raw) {
    const listeners = this._listeners.get(event) || [];
    listeners.forEach((fn) => fn(data, raw));
    // 'message' 是默认事件
    if (event !== "message") {
      const msgListeners = this._listeners.get("message") || [];
      msgListeners.forEach((fn) => fn(data, raw));
    }
  }

  connect() {
    this.manualClose = false;
    this.readyState = 0;
    this._abortController = new AbortControllerImpl();

    const headers = { Accept: "text/event-stream", ...this.options.headers };
    if (this.lastEventId) headers["Last-Event-ID"] = this.lastEventId;

    const fetchImpl = this.options.fetchImpl || fetch;
    fetchImpl(this.url, {
      method: this.options.method,
      headers,
      body: this.options.body,
      signal: this._abortController.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.readyState = 1;
        this.reconnectAttempts = 0;
        this._emit("open", null, null);
        return this._readStream(response.body);
      })
      .catch((err) => {
        if (this.manualClose) return;
        this._emit("error", err, null);
        this._tryReconnect();
      });
  }

  async _readStream(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIndex;
      // 按 \n\n 分割事件块
      while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);
        this._parseEvent(chunk);
      }
    }

    if (!this.manualClose) this._tryReconnect();
  }

  _parseEvent(chunk) {
    const lines = chunk.split("\n");
    let dataLines = [];
    let event = "message";
    let id = null;

    for (const line of lines) {
      if (!line || line.startsWith(":")) continue; // 空行或注释
      const colonIdx = line.indexOf(":");
      const field = colonIdx === -1 ? line : line.slice(0, colonIdx);
      let value =
        colonIdx === -1 ? "" : line.slice(colonIdx + 1);
      if (value.startsWith(" ")) value = value.slice(1); // 去掉一个前导空格

      switch (field) {
        case "data":
          dataLines.push(value);
          break;
        case "event":
          event = value;
          break;
        case "id":
          id = value;
          break;
        case "retry":
          // 可选：动态调整重连间隔，此处忽略
          break;
      }
    }

    if (id) this.lastEventId = id;
    if (dataLines.length) {
      const data = dataLines.join("\n");
      this._emit(event, data, chunk);
    }
  }

  _tryReconnect() {
    if (!this.options.reconnect || this.manualClose) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this._emit("error", new Error("Max reconnect attempts"), null);
      return;
    }
    this.readyState = 0;
    this.reconnectAttempts++;
    this._reconnectTimer = setTimeout(
      () => this.connect(),
      this.options.reconnectInterval
    );
  }

  close() {
    this.manualClose = true;
    this.readyState = 2;
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer);
    if (this._abortController) this._abortController.abort();
  }
}

// 简易 AbortController（复用 446 思路，保证 Node 下可用）
class AbortControllerImpl {
  constructor() {
    this.signal = { aborted: false, _listeners: [] };
  }
  abort() {
    this.signal.aborted = true;
    this.signal._listeners.forEach((fn) => fn());
  }
}

// ===== 测试（使用 mock fetch + ReadableStream） =====
function makeMockResponse(chunks) {
  let index = 0;
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        return {
          read() {
            if (index < chunks.length) {
              return Promise.resolve({
                done: false,
                value: chunks[index++],
              });
            }
            return Promise.resolve({ done: true, value: undefined });
          },
        };
      },
    },
  };
}

const mockChunks = [
  // utf-8 字节
  new TextEncoder().encode(
    "event: update\ndata: {\"n\":1}\n\n" +
      "data: hello\ndata: world\n\n" +
      "id: 42\nevent: notice\ndata: notice-msg\n\n"
  ),
];

const sse = new SSEClient("https://example.com/stream", {
  fetchImpl: () => Promise.resolve(makeMockResponse(mockChunks)),
  reconnect: false,
});

sse.on("open", () => console.log("[SSE] 连接已建立"));
sse.on("message", (data) => console.log("[SSE] 默认消息:", data));
sse.on("update", (data) => console.log("[SSE] update 事件:", data));
sse.on("notice", (data) => {
  console.log("[SSE] notice 事件:", data);
  console.log("[SSE] lastEventId:", sse.lastEventId);
});

sse.connect();

// 等待异步读取完成
setTimeout(() => {
  sse.close();
  console.log("[SSE] 已主动关闭");
}, 50);
