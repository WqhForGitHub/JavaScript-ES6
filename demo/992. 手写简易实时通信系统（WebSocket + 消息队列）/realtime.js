/**
 * 手写简易实时通信系统（WebSocket + 消息队列）
 * ---------------------------------------------------------------
 * 使用 EventEmitter 模拟 WebSocket，实现一个实时通信系统：
 * 1. Server：管理已连接的客户端，路由消息，维护房间/频道
 * 2. Client：连接服务器、发送消息、监听消息、断开连接
 * 3. 消息队列：带 ack（确认）与 retry（重试）机制的可靠投递
 * 4. 房间/频道：join / leave / broadcast
 * 5. 服务端在客户端之间路由消息
 *
 * 演示：一个多人聊天室，多个客户端互相收发消息。
 */

"use strict";

// ============================================================================
// 1. 事件发射器：通信系统的基础设施
// ============================================================================

/**
 * 简易 EventEmitter：支持 on / off / once / emit
 */
class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  on(event, listener) {
    if (!this._events.has(event)) this._events.set(event, []);
    this._events.get(event).push(listener);
    return () => this.off(event, listener); // 返回取消订阅函数
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  off(event, listener) {
    const list = this._events.get(event);
    if (!list) return;
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
  }

  emit(event, ...args) {
    const list = this._events.get(event);
    if (!list) return;
    // 复制一份，避免监听器在执行过程中修改列表导致问题
    [...list].forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(
          `[EventEmitter] listener for "${event}" threw:`,
          err.message,
        );
      }
    });
  }

  removeAllListeners(event) {
    if (event) this._events.delete(event);
    else this._events.clear();
  }
}

// ============================================================================
// 2. 消息结构
// ============================================================================

/**
 * 一条消息：包含 id、类型、来源、目标、负载、时间戳
 */
class Message {
  constructor({ type, from, to, room, payload, id } = {}) {
    this.id =
      id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.type = type; // 消息类型，如 'chat' / 'system' / 'ack'
    this.from = from; // 发送者 clientId
    this.to = to; // 接收者 clientId（点对点）
    this.room = room; // 房间名（广播）
    this.payload = payload; // 消息内容
    this.timestamp = Date.now();
    // 投递状态：pending / delivered / failed
    this.status = "pending";
    // 已确认的接收者集合
    this.ackedBy = new Set();
  }
}

// ============================================================================
// 3. 消息队列：带 ack 与 retry 的可靠投递
// ============================================================================

/**
 * MessageQueue：服务端维护的待投递消息队列
 * - 每条消息在投递后等待 ack，超时则重试
 * - 超过最大重试次数则标记失败
 */
class MessageQueue {
  /**
   * @param {Object} options
   * @param {number} options.retryInterval 重试间隔（毫秒）
   * @param {number} options.maxRetries 最大重试次数
   */
  constructor(options = {}) {
    this.retryInterval = options.retryInterval ?? 100;
    this.maxRetries = options.maxRetries ?? 3;
    // 待确认消息：msgId -> { message, recipients, attempts, timer }
    this.pending = new Map();
    this._sendFn = null; // 实际发送函数，由外部注入
  }

  /** 注入发送函数：sendFn(message, recipientId) => boolean */
  setSender(sendFn) {
    this._sendFn = sendFn;
  }

  /**
   * 将一条消息投递给多个接收者
   * @param {Message} message
   * @param {string[]} recipients 接收者 clientId 列表
   */
  enqueue(message, recipients) {
    const entry = {
      message,
      recipients: new Set(recipients),
      attempts: 0,
      timer: null,
    };
    this.pending.set(message.id, entry);
    this._deliver(message.id);
  }

  /** 实际投递一次 */
  _deliver(msgId) {
    const entry = this.pending.get(msgId);
    if (!entry) return;
    entry.attempts++;
    let allAckedOrFailed = true;
    for (const recipient of entry.recipients) {
      if (entry.message.ackedBy.has(recipient)) continue;
      if (!this._sendFn) continue;
      const ok = this._sendFn(entry.message, recipient);
      if (!ok) allAckedOrFailed = false;
    }
    // 设置超时定时器，等待 ack
    if (
      !allAckedOrFailed ||
      entry.recipients.size > entry.message.ackedBy.size
    ) {
      entry.timer = setTimeout(
        () => this._onTimeout(msgId),
        this.retryInterval,
      );
    } else {
      // 所有接收者已 ack，移除
      this.pending.delete(msgId);
    }
  }

  /** 超时处理：重试或标记失败 */
  _onTimeout(msgId) {
    const entry = this.pending.get(msgId);
    if (!entry) return;
    // 移除已 ack 的接收者
    for (const r of entry.message.ackedBy) entry.recipients.delete(r);
    if (entry.recipients.size === 0) {
      this.pending.delete(msgId);
      return;
    }
    if (entry.attempts >= this.maxRetries) {
      // 超过最大重试次数，标记失败
      entry.message.status = "failed";
      console.log(
        `[Queue] 消息 ${msgId} 投递失败，已重试 ${entry.attempts} 次`,
      );
      this.pending.delete(msgId);
      return;
    }
    console.log(`[Queue] 消息 ${msgId} 第 ${entry.attempts} 次重试...`);
    this._deliver(msgId);
  }

  /** 接收者确认消息 */
  ack(msgId, recipientId) {
    const entry = this.pending.get(msgId);
    if (!entry) return false;
    entry.message.ackedBy.add(recipientId);
    entry.message.status = "delivered";
    // 如果所有接收者都确认了，移除该消息
    let allAcked = true;
    for (const r of entry.recipients) {
      if (!entry.message.ackedBy.has(r)) {
        allAcked = false;
        break;
      }
    }
    if (allAcked) {
      if (entry.timer) clearTimeout(entry.timer);
      this.pending.delete(msgId);
    }
    return true;
  }

  /** 当前待确认消息数量 */
  pendingCount() {
    return this.pending.size;
  }
}

// ============================================================================
// 4. 模拟的 WebSocket 连接：客户端 <-> 服务端的虚拟通道
// ============================================================================

/**
 * VirtualSocket：模拟一条双向通道
 * 客户端 emit 'message' 时，服务端 onMessage 被触发；反之亦然。
 * 通过 EventEmitter 实现。
 */
class VirtualSocket extends EventEmitter {
  constructor() {
    super();
    this._otherEnd = null;
    this.open = false;
  }

  /** 把两个 socket 互相绑定 */
  static pair() {
    const a = new VirtualSocket();
    const b = new VirtualSocket();
    a._otherEnd = b;
    b._otherEnd = a;
    return [a, b];
  }

  open_() {
    this.open = true;
    // 同时打开对端，保证双向通道可用
    if (this._otherEnd) this._otherEnd.open = true;
    this.emit("open");
    if (this._otherEnd) this._otherEnd.emit("open");
  }
  close() {
    this.open = false;
    this.emit("close");
    if (this._otherEnd && this._otherEnd.open) {
      this._otherEnd.open = false;
      this._otherEnd.emit("close");
    }
  }

  /** 发送数据到对端 */
  send(data) {
    if (!this.open) throw new Error("socket closed");
    // 异步触发对端的 'message' 事件
    const other = this._otherEnd;
    setTimeout(() => {
      if (other.open) other.emit("message", data);
    }, 0);
  }
}

// ============================================================================
// 5. 服务端：Server
// ============================================================================

/**
 * RealtimeServer：管理客户端连接、房间、消息路由
 */
class RealtimeServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.clients = new Map(); // clientId -> { client, socket }
    this.rooms = new Map(); // roomName -> Set<clientId>
    this.queue = new MessageQueue(options);
    // 注入发送函数：通过 socket 把消息发给目标客户端
    this.queue.setSender((message, recipientId) => {
      const target = this.clients.get(recipientId);
      if (!target || !target.socket.open) return false;
      target.socket.send({ kind: "message", message });
      return true;
    });
  }

  /**
   * 接受一个新客户端连接（已通过 pair 创建 socket）
   * @param {string} clientId
   * @param {VirtualSocket} serverSideSocket 服务端一侧的 socket
   * @returns {RealtimeClient} 创建的客户端实例
   */
  acceptClient(clientId, serverSideSocket) {
    this.clients.set(clientId, { socket: serverSideSocket, rooms: new Set() });
    serverSideSocket.open_();
    console.log(`[Server] 客户端 ${clientId} 已连接`);

    // 监听该客户端发来的消息
    serverSideSocket.on("message", (data) =>
      this._handleIncoming(clientId, data),
    );
    serverSideSocket.on("close", () => this._handleDisconnect(clientId));

    // 发送欢迎消息
    serverSideSocket.send({
      kind: "message",
      message: new Message({
        type: "system",
        from: "server",
        to: clientId,
        payload: "连接成功",
      }),
    });
    return clientId;
  }

  /** 处理客户端断开 */
  _handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;
    // 从所有房间移除
    for (const room of client.rooms) {
      const members = this.rooms.get(room);
      if (members) {
        members.delete(clientId);
        this._broadcastToRoom(
          room,
          new Message({
            type: "system",
            room,
            from: "server",
            payload: `${clientId} 离开了房间 ${room}`,
          }),
          clientId,
        );
      }
    }
    this.clients.delete(clientId);
    console.log(`[Server] 客户端 ${clientId} 已断开`);
    this.emit("clientDisconnected", clientId);
  }

  /** 处理客户端发来的数据 */
  _handleIncoming(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.kind) {
      case "message": {
        const msg = data.message;
        msg.from = clientId; // 服务端覆盖来源，防止伪造
        this._routeMessage(msg);
        break;
      }
      case "ack": {
        // 客户端确认收到某条消息
        this.queue.ack(data.msgId, clientId);
        break;
      }
      case "join": {
        this._joinRoom(clientId, data.room);
        break;
      }
      case "leave": {
        this._leaveRoom(clientId, data.room);
        break;
      }
    }
  }

  /** 路由消息：点对点 or 房间广播 */
  _routeMessage(message) {
    if (message.room) {
      // 房间广播
      const members = this.rooms.get(message.room);
      if (!members) return;
      const recipients = [...members].filter((id) => id !== message.from);
      if (recipients.length > 0) {
        this.queue.enqueue(message, recipients);
      }
    } else if (message.to) {
      // 点对点
      if (this.clients.has(message.to)) {
        this.queue.enqueue(message, [message.to]);
      }
    } else {
      // 全局广播（除发送者外）
      const recipients = [...this.clients.keys()].filter(
        (id) => id !== message.from,
      );
      if (recipients.length > 0) this.queue.enqueue(message, recipients);
    }
  }

  /** 加入房间 */
  _joinRoom(clientId, room) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room).add(clientId);
    this.clients.get(clientId).rooms.add(room);
    console.log(`[Server] ${clientId} 加入房间 ${room}`);
    this._broadcastToRoom(
      room,
      new Message({
        type: "system",
        room,
        from: "server",
        payload: `${clientId} 加入了房间 ${room}`,
      }),
      clientId,
    );
  }

  /** 离开房间 */
  _leaveRoom(clientId, room) {
    const members = this.rooms.get(room);
    if (members) {
      members.delete(clientId);
      this.clients.get(clientId).rooms.delete(room);
      console.log(`[Server] ${clientId} 离开房间 ${room}`);
    }
  }

  /** 向房间内广播（不经队列，直接发送，用于系统消息） */
  _broadcastToRoom(room, message, exceptId = null) {
    const members = this.rooms.get(room);
    if (!members) return;
    for (const id of members) {
      if (id === exceptId) continue;
      const target = this.clients.get(id);
      if (target && target.socket.open) {
        target.socket.send({ kind: "message", message });
      }
    }
  }

  /** 主动向某客户端推送消息 */
  pushTo(clientId, type, payload) {
    const target = this.clients.get(clientId);
    if (!target) return false;
    const msg = new Message({ type, from: "server", to: clientId, payload });
    target.socket.send({ kind: "message", message: msg });
    return true;
  }
}

// ============================================================================
// 6. 客户端：Client
// ============================================================================

/**
 * RealtimeClient：连接服务端、收发消息
 */
class RealtimeClient extends EventEmitter {
  constructor(clientId) {
    super();
    this.id = clientId;
    this.socket = null;
    this.connected = false;
  }

  /**
   * 连接到服务端：通过 VirtualSocket.pair 创建双向通道
   * @param {RealtimeServer} server
   */
  connect(server) {
    const [clientSocket, serverSocket] = VirtualSocket.pair();
    this.socket = clientSocket;
    this.connected = true;
    server.acceptClient(this.id, serverSocket);

    // 监听服务端发来的消息
    clientSocket.on("message", (data) => {
      if (data.kind === "message") {
        const msg = data.message;
        // 立即回 ack（除系统消息外）
        if (msg.type !== "system") {
          clientSocket.send({ kind: "ack", msgId: msg.id });
        }
        this.emit("message", msg);
        // 同时按类型分发
        this.emit(`message:${msg.type}`, msg);
      }
    });
    clientSocket.on("close", () => {
      this.connected = false;
      this.emit("disconnect");
    });
  }

  /** 发送聊天消息 */
  send(type, payload, to = null, room = null) {
    if (!this.connected) throw new Error("未连接");
    const msg = new Message({ type, from: this.id, to, room, payload });
    this.socket.send({ kind: "message", message: msg });
    return msg;
  }

  /** 加入房间 */
  join(room) {
    this.socket.send({ kind: "join", room });
  }

  /** 离开房间 */
  leave(room) {
    this.socket.send({ kind: "leave", room });
  }

  /** 监听消息（语法糖） */
  onMessage(listener) {
    return this.on("message", listener);
  }

  /** 断开连接 */
  disconnect() {
    if (this.socket) this.socket.close();
  }
}

// ============================================================================
// 7. 测试用例：多人聊天室
// ============================================================================

async function runTests() {
  console.log("================ 1. 建立服务端 + 多个客户端 ================");
  const server = new RealtimeServer({ retryInterval: 50, maxRetries: 3 });

  const alice = new RealtimeClient("alice");
  const bob = new RealtimeClient("bob");
  const carol = new RealtimeClient("carol");

  alice.connect(server);
  bob.connect(server);
  carol.connect(server);

  // 让连接事件处理完毕
  await tick();

  console.log("\n================ 2. 客户端收消息监听 ================");
  const received = { alice: [], bob: [], carol: [] };
  alice.onMessage((m) => received.alice.push(m));
  bob.onMessage((m) => received.bob.push(m));
  carol.onMessage((m) => received.carol.push(m));

  console.log("\n================ 3. 创建聊天房间 ================");
  alice.join("room-1");
  bob.join("room-1");
  await tick();
  // carol 不加入 room-1

  console.log("\n================ 4. 房间广播 ================");
  alice.send("chat", "大家好，我是 Alice！", null, "room-1");
  await tick(30);

  console.log(
    "Bob 收到:",
    received.bob.filter((m) => m.type === "chat").map((m) => m.payload),
  );
  console.log(
    "Carol 收到(应为空，未加入房间):",
    received.carol.filter((m) => m.type === "chat"),
  );

  console.log("\n================ 5. 点对点消息 ================");
  bob.send("chat", "Alice，私信你一下", "alice", null);
  await tick(30);
  console.log(
    "Alice 私信收件箱:",
    received.alice
      .filter((m) => m.type === "chat" && m.to === "alice")
      .map((m) => `${m.from}: ${m.payload}`),
  );

  console.log("\n================ 6. 全局广播 ================");
  carol.send("chat", "一条全局消息", null, null);
  await tick(30);
  console.log(
    "Alice 全局消息:",
    received.alice
      .filter((m) => m.from === "carol" && !m.room)
      .map((m) => m.payload),
  );
  console.log(
    "Bob 全局消息:",
    received.bob
      .filter((m) => m.from === "carol" && !m.room)
      .map((m) => m.payload),
  );

  console.log("\n================ 7. 服务端主动推送 ================");
  server.pushTo("bob", "notification", "你的账户有新动态");
  await tick(30);
  console.log(
    "Bob 通知:",
    received.bob.filter((m) => m.type === "notification").map((m) => m.payload),
  );

  console.log("\n================ 8. 断开连接 & 房间成员变更 ================");
  bob.disconnect();
  await tick(20);
  alice.send("chat", "Bob 走了吗？", null, "room-1");
  await tick(30);
  console.log(
    "Alice 系统消息数:",
    received.alice.filter((m) => m.type === "system").length,
  );
  console.log("当前服务端客户端数:", server.clients.size); // 2

  console.log("\n================ 9. 消息队列统计 ================");
  console.log("当前待确认消息数:", server.queue.pendingCount());

  console.log("\n================ 10. 聊天记录汇总 ================");
  console.log("Alice 全部消息类型分布:", countByType(received.alice));
  console.log("Bob 全部消息类型分布:", countByType(received.bob));
  console.log("Carol 全部消息类型分布:", countByType(received.carol));
}

/** 工具：按 type 统计 */
function countByType(messages) {
  const counts = {};
  for (const m of messages) counts[m.type] = (counts[m.type] || 0) + 1;
  return counts;
}

/** 工具：等待若干 tick，让 setTimeout 回调执行 */
function tick(ms = 10) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runTests();
