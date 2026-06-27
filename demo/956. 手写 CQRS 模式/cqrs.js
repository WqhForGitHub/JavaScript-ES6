/**
 * 手写 CQRS 模式
 * ==============
 * CQRS = Command Query Responsibility Segregation
 * 核心思想：把"写"（Command）和"读"（Query）分离为两条独立链路：
 *   - CommandBus：处理写操作（改变状态），通常返回执行结果/事件，不返回业务数据
 *   - QueryBus：  处理读操作（查询投影），绝不改变状态
 *
 * 优势：
 *   1. 读写模型可独立扩展（写库可强一致，读库可读副本/缓存）
 *   2. 便于与 Event Sourcing、领域事件结合
 *   3. 权限/审计/校验逻辑可分别聚焦
 *
 * 本实现包含：
 *   - CommandBus：register(commandType, handler) + dispatch(command)
 *   - QueryBus：  register(queryType, handler) + ask(query)
 *   - 一个内存"写模型"（UserWriteStore）和多个"读模型投影"（UserListProjection、UserCountProjection）
 *   - 写操作完成后通过 EventBus 通知投影更新（实现读写模型解耦）
 */

// ------------------------------------------------------------
// 1. 简易 EventBus：用于发布领域事件，驱动读模型投影更新
// ------------------------------------------------------------
class EventBus {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this.handlers = new Map();
  }
  /**
   * 订阅事件
   * @param {string} eventType
   * @param {(event: any) => void} handler
   */
  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, []);
    this.handlers.get(eventType).push(handler);
  }
  /** 发布事件 */
  publish(event) {
    const list = this.handlers.get(event.type) || [];
    for (const h of list) h(event);
  }
}

// ------------------------------------------------------------
// 2. CommandBus：处理写命令
// ------------------------------------------------------------
class CommandBus {
  constructor(eventBus) {
    this.eventBus = eventBus;
    /** @type {Map<string, (cmd: any) => any>} */
    this.handlers = new Map();
  }

  /**
   * 注册命令处理器
   * @param {string} commandType - 命令类型
   * @param {(cmd: any, ctx: {eventBus: EventBus}) => any} handler
   */
  register(commandType, handler) {
    this.handlers.set(commandType, handler);
  }

  /**
   * 派发命令
   * @param {{type: string, payload?: any}} command
   * @returns {any} 命令处理结果
   */
  dispatch(command) {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`未注册的命令类型: ${command.type}`);
    }
    // 注入 eventBus 上下文，让 handler 可发布事件
    return handler(command, { eventBus: this.eventBus });
  }
}

// ------------------------------------------------------------
// 3. QueryBus：处理读查询
// ------------------------------------------------------------
class QueryBus {
  constructor() {
    /** @type {Map<string, (query: any) => any>} */
    this.handlers = new Map();
  }

  /**
   * 注册查询处理器
   * @param {string} queryType
   * @param {(query: any) => any} handler
   */
  register(queryType, handler) {
    this.handlers.set(queryType, handler);
  }

  /**
   * 执行查询
   * @param {{type: string, payload?: any}} query
   * @returns {any}
   */
  ask(query) {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`未注册的查询类型: ${query.type}`);
    }
    return handler(query);
  }
}

// ============================================================
// 应用：用户注册系统
// ============================================================
console.log("===== 956. 手写 CQRS 模式 =====");

// 共享基础设施
const eventBus = new EventBus();
const commandBus = new CommandBus(eventBus);
const queryBus = new QueryBus();

// 写模型：单一事实来源（用户的权威数据）
/** @type {Map<string, {id, name, email, createdAt}>} */
const userWriteStore = new Map();

// 读模型 1：用户列表投影（按创建时间排序）
const userListProjection = [];
// 读模型 2：用户计数投影
let userCountProjection = 0;
// 读模型 3：按 email 索引
const userEmailIndex = new Map();

// 订阅领域事件，更新各读模型投影
eventBus.subscribe("UserRegistered", (event) => {
  const { id, name, email, createdAt } = event.payload;
  userListProjection.push({ id, name, email, createdAt });
  userCountProjection += 1;
  userEmailIndex.set(email, id);
  console.log(`  [投影] UserRegistered -> 列表/计数/索引 已同步`);
});

eventBus.subscribe("UserDeleted", (event) => {
  const { id } = event.payload;
  const idx = userListProjection.findIndex((u) => u.id === id);
  if (idx >= 0) {
    const removed = userListProjection.splice(idx, 1)[0];
    userEmailIndex.delete(removed.email);
    userCountProjection -= 1;
    console.log(`  [投影] UserDeleted -> 列表/计数/索引 已同步`);
  }
});

// ------------------------------------------------------------
// 注册 Command Handlers（写）
// ------------------------------------------------------------
commandBus.register("RegisterUser", (cmd, ctx) => {
  const { id, name, email } = cmd.payload;

  // 业务校验
  if (userWriteStore.has(id)) {
    throw new Error(`用户 ID 已存在: ${id}`);
  }
  for (const u of userWriteStore.values()) {
    if (u.email === email) throw new Error(`邮箱已被注册: ${email}`);
  }

  // 写入写模型
  const user = { id, name, email, createdAt: Date.now() };
  userWriteStore.set(id, user);

  // 发布事件驱动投影更新
  ctx.eventBus.publish({ type: "UserRegistered", payload: user });

  return { success: true, id };
});

commandBus.register("DeleteUser", (cmd, ctx) => {
  const { id } = cmd.payload;
  if (!userWriteStore.has(id)) {
    throw new Error(`用户不存在: ${id}`);
  }
  userWriteStore.delete(id);
  ctx.eventBus.publish({ type: "UserDeleted", payload: { id } });
  return { success: true, id };
});

// ------------------------------------------------------------
// 注册 Query Handlers（读）
// ------------------------------------------------------------
queryBus.register("GetAllUsers", () => {
  // 直接返回读模型投影（不查写模型）
  return userListProjection.slice();
});

queryBus.register("GetUserCount", () => userCountProjection);

queryBus.register("GetUserByEmail", (query) => {
  const id = userEmailIndex.get(query.payload.email);
  if (!id) return null;
  return userListProjection.find((u) => u.id === id) || null;
});

queryBus.register("GetUserById", (query) => {
  return userListProjection.find((u) => u.id === query.payload.id) || null;
});

// ============================================================
// 测试用例
// ============================================================
console.log("\n--- 注册三个用户 ---");
commandBus.dispatch({
  type: "RegisterUser",
  payload: { id: "u1", name: "Alice", email: "alice@x.com" },
});
commandBus.dispatch({
  type: "RegisterUser",
  payload: { id: "u2", name: "Bob", email: "bob@x.com" },
});
commandBus.dispatch({
  type: "RegisterUser",
  payload: { id: "u3", name: "Carol", email: "carol@x.com" },
});

console.log("\n--- 查询：用户总数 ---");
console.log("count =", queryBus.ask({ type: "GetUserCount" }));

console.log("\n--- 查询：所有用户 ---");
console.log(queryBus.ask({ type: "GetAllUsers" }));

console.log("\n--- 查询：按 email 查 Alice ---");
console.log(
  queryBus.ask({ type: "GetUserByEmail", payload: { email: "alice@x.com" } }),
);

console.log("\n--- 写校验：重复 email 注册应报错 ---");
try {
  commandBus.dispatch({
    type: "RegisterUser",
    payload: { id: "u4", name: "Alice2", email: "alice@x.com" },
  });
} catch (e) {
  console.log("预期错误:", e.message);
}

console.log("\n--- 删除 Bob ---");
commandBus.dispatch({ type: "DeleteUser", payload: { id: "u2" } });

console.log("\n--- 查询：删除后用户列表与计数 ---");
console.log("count =", queryBus.ask({ type: "GetUserCount" }));
console.log(queryBus.ask({ type: "GetAllUsers" }));

console.log("\n--- 验证：读模型与写模型一致性 ---");
console.log(
  "写模型 size:",
  userWriteStore.size,
  ", 读模型 count:",
  userCountProjection,
);
console.log("写模型 ids:", Array.from(userWriteStore.keys()));
console.log(
  "读模型 ids:",
  queryBus.ask({ type: "GetAllUsers" }).map((u) => u.id),
);

console.log("\n--- 验证：Query 不修改状态 ---");
const before = queryBus.ask({ type: "GetUserCount" });
queryBus.ask({ type: "GetAllUsers" });
queryBus.ask({ type: "GetUserById", payload: { id: "u1" } });
const after = queryBus.ask({ type: "GetUserCount" });
console.log(`查询前后 count 不变: ${before === after} (${before} -> ${after})`);
