/**
 * 手写简易全栈应用（前端 + 后端 + 数据库）
 * ---------------------------------------------------------------
 * 在一个文件内实现一个全栈 Todo 应用，分三层：
 * 1. 数据库层（Database）：内存数据库，类似 mini IndexedDB / SQLite
 *    - 支持建表、CRUD、查询条件、索引、自增主键、事务
 * 2. 后端 API 层（Backend）：REST 路由处理器
 *    - GET    /todos        列表（支持过滤）
 *    - POST   /todos        创建
 *    - GET    /todos/:id    详情
 *    - PUT    /todos/:id    更新
 *    - DELETE /todos/:id    删除
 * 3. 前端渲染层（Frontend）：把 todo 列表渲染为 ASCII，处理输入
 *
 * 串起来：前端调用 API -> API 调用 DB -> 返回前端渲染
 *
 * 演示：创建 / 列表 / 切换完成 / 删除，全部通过 API 层完成。
 */

"use strict";

// ============================================================================
// 1. 数据库层：Database（内存数据库）
// ============================================================================

/**
 * 一个数据库表
 * 支持自增主键、索引、条件查询、事务（简化）
 */
class Table {
  /**
   * @param {string} name 表名
   * @param {Object} schema 表结构
   *   { primaryKey: 'id', autoIncrement: true, indexes: ['completed'], fields: [...] }
   */
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.records = new Map(); // primaryKey -> record
    this._autoId = 0;
    // 索引：fieldName -> Map<value, Set<primaryKey>>
    this.indexes = new Map();
    for (const field of schema.indexes || []) {
      this.indexes.set(field, new Map());
    }
  }

  /** 生成主键 */
  _nextId() {
    if (this.schema.autoIncrement) return ++this._autoId;
    return null;
  }

  /** 维护索引 */
  _updateIndex(action, record) {
    for (const [field, indexMap] of this.indexes) {
      const value = record[field];
      if (value === undefined) continue;
      if (!indexMap.has(value)) indexMap.set(value, new Set());
      if (action === "add")
        indexMap.get(value).add(record[this.schema.primaryKey]);
      else if (action === "remove")
        indexMap.get(value).delete(record[this.schema.primaryKey]);
    }
  }

  /**
   * 插入一条记录
   */
  insert(record) {
    const pk = this.schema.primaryKey;
    let newRecord = { ...record };
    if (this.schema.autoIncrement && newRecord[pk] === undefined) {
      newRecord[pk] = this._nextId();
    } else if (newRecord[pk] !== undefined) {
      // 若主键已存在则更新自增计数
      if (typeof newRecord[pk] === "number" && newRecord[pk] > this._autoId) {
        this._autoId = newRecord[pk];
      }
    }
    if (this.records.has(newRecord[pk])) {
      throw new Error(`主键 ${newRecord[pk]} 已存在`);
    }
    newRecord._createdAt = Date.now();
    newRecord._updatedAt = Date.now();
    this.records.set(newRecord[pk], newRecord);
    this._updateIndex("add", newRecord);
    return { ...newRecord };
  }

  /**
   * 按主键查找
   */
  findById(id) {
    const r = this.records.get(id);
    return r ? { ...r } : null;
  }

  /**
   * 条件查询
   * @param {Object} where 条件，如 { completed: true }
   *   支持值相等；字段值为 { $gt, $lt, $gte, $lte, $ne, $in } 时做范围查询
   * @returns {Array} 匹配记录（副本）
   */
  find(where = {}) {
    let candidates;
    // 若 where 中含索引字段且为相等条件，则走索引
    const indexField = Object.keys(where).find(
      (f) => this.indexes.has(f) && !(where[f] && typeof where[f] === "object"),
    );
    if (indexField) {
      const indexMap = this.indexes.get(indexField);
      const ids = indexMap.get(where[indexField]) || new Set();
      candidates = [...ids].map((id) => this.records.get(id));
    } else {
      candidates = [...this.records.values()];
    }
    return candidates
      .filter((r) => this._matchWhere(r, where))
      .map((r) => ({ ...r }));
  }

  /** 判断单条记录是否匹配 where */
  _matchWhere(record, where) {
    for (const [field, condition] of Object.entries(where)) {
      const value = record[field];
      if (
        condition &&
        typeof condition === "object" &&
        !Array.isArray(condition)
      ) {
        // 操作符条件
        if (condition.$gt !== undefined && !(value > condition.$gt))
          return false;
        if (condition.$lt !== undefined && !(value < condition.$lt))
          return false;
        if (condition.$gte !== undefined && !(value >= condition.$gte))
          return false;
        if (condition.$lte !== undefined && !(value <= condition.$lte))
          return false;
        if (condition.$ne !== undefined && !(value !== condition.$ne))
          return false;
        if (condition.$in !== undefined && !condition.$in.includes(value))
          return false;
        if (
          condition.$like !== undefined &&
          typeof value === "string" &&
          !value.toLowerCase().includes(String(condition.$like).toLowerCase())
        )
          return false;
      } else {
        if (value !== condition) return false;
      }
    }
    return true;
  }

  /**
   * 按主键更新（部分更新）
   */
  updateById(id, patch) {
    const existing = this.records.get(id);
    if (!existing) return null;
    // 先移除旧索引
    this._updateIndex("remove", existing);
    const updated = { ...existing, ...patch, _updatedAt: Date.now() };
    // 主键不可变
    updated[this.schema.primaryKey] = id;
    this.records.set(id, updated);
    this._updateIndex("add", updated);
    return { ...updated };
  }

  /**
   * 按主键删除
   */
  deleteById(id) {
    const existing = this.records.get(id);
    if (!existing) return false;
    this._updateIndex("remove", existing);
    this.records.delete(id);
    return true;
  }

  /** 记录总数 */
  count() {
    return this.records.size;
  }
}

/**
 * Database：管理多个表
 */
class Database {
  constructor() {
    this.tables = new Map();
  }

  /** 创建表 */
  createTable(name, schema) {
    const table = new Table(name, schema);
    this.tables.set(name, table);
    return table;
  }

  /** 获取表 */
  getTable(name) {
    return this.tables.get(name);
  }

  /**
   * 简易事务：把一组操作打包，全部成功才提交，否则回滚
   * 通过深拷贝快照实现回滚
   */
  transaction(fn) {
    // 快照所有表
    const snapshot = new Map();
    for (const [name, table] of this.tables) {
      snapshot.set(name, {
        records: new Map(table.records),
        autoId: table._autoId,
        indexes: new Map(
          [...table.indexes].map(([k, v]) => [
            k,
            new Map([...v].map(([kk, vv]) => [kk, new Set(vv)])),
          ]),
        ),
      });
    }
    try {
      const result = fn(this);
      return result;
    } catch (err) {
      // 回滚
      for (const [name, snap] of snapshot) {
        const table = this.tables.get(name);
        if (!table) continue;
        table.records = snap.records;
        table._autoId = snap.autoId;
        table.indexes = snap.indexes;
      }
      throw err;
    }
  }
}

// ============================================================================
// 2. 后端 API 层：Backend
// ============================================================================

/**
 * HTTP 请求模拟
 */
class HttpRequest {
  constructor(method, path, body = null, query = {}) {
    this.method = method;
    this.path = path;
    this.body = body;
    this.query = query;
  }
}

/**
 * HTTP 响应模拟
 */
class HttpResponse {
  constructor(status, body) {
    this.status = status;
    this.body = body;
  }
}

/**
 * 路由定义
 */
class Route {
  constructor(method, pattern, handler) {
    this.method = method;
    this.pattern = pattern; // 如 '/todos/:id'
    this.handler = handler;
    // 编译为正则
    this._paramNames = [];
    const regexStr =
      "^" +
      pattern.replace(/:([\w]+)/g, (_, name) => {
        this._paramNames.push(name);
        return "([^/]+)";
      }) +
      "$";
    this._regex = new RegExp(regexStr);
  }

  /** 匹配路径，返回参数对象或 null */
  match(path) {
    const m = this._regex.exec(path);
    if (!m) return null;
    const params = {};
    this._paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(m[i + 1]);
    });
    return params;
  }
}

/**
 * Backend：REST API 后端
 */
class Backend {
  constructor(database) {
    this.db = database;
    this.routes = [];
    this.middlewares = [];
    this._registerDefaults();
  }

  /** 注册路由 */
  addRoute(method, pattern, handler) {
    this.routes.push(new Route(method, pattern, handler));
  }

  /** 使用中间件 */
  use(middleware) {
    this.middlewares.push(middleware);
  }

  /** 注册默认的 /todos REST 路由 */
  _registerDefaults() {
    // GET /todos - 列表（支持 ?completed=true 过滤）
    this.addRoute("GET", "/todos", (req, res) => {
      const table = this.db.getTable("todos");
      const where = {};
      if (req.query.completed !== undefined) {
        where.completed = req.query.completed === "true";
      }
      if (req.query.q) {
        where.title = { $like: req.query.q };
      }
      const todos = table.find(where);
      return new HttpResponse(200, { data: todos, total: todos.length });
    });

    // GET /todos/:id - 详情
    this.addRoute("GET", "/todos/:id", (req, res) => {
      const table = this.db.getTable("todos");
      const todo = table.findById(Number(req.params.id));
      if (!todo) return new HttpResponse(404, { error: "Todo 不存在" });
      return new HttpResponse(200, { data: todo });
    });

    // POST /todos - 创建
    this.addRoute("POST", "/todos", (req, res) => {
      const table = this.db.getTable("todos");
      if (!req.body || !req.body.title) {
        return new HttpResponse(400, { error: "title 为必填项" });
      }
      const created = table.insert({
        title: req.body.title,
        completed: req.body.completed || false,
        priority: req.body.priority || "normal",
      });
      return new HttpResponse(201, { data: created });
    });

    // PUT /todos/:id - 更新
    this.addRoute("PUT", "/todos/:id", (req, res) => {
      const table = this.db.getTable("todos");
      const id = Number(req.params.id);
      if (!table.findById(id)) {
        return new HttpResponse(404, { error: "Todo 不存在" });
      }
      const patch = {};
      if (req.body.title !== undefined) patch.title = req.body.title;
      if (req.body.completed !== undefined)
        patch.completed = req.body.completed;
      if (req.body.priority !== undefined) patch.priority = req.body.priority;
      const updated = table.updateById(id, patch);
      return new HttpResponse(200, { data: updated });
    });

    // DELETE /todos/:id - 删除
    this.addRoute("DELETE", "/todos/:id", (req, res) => {
      const table = this.db.getTable("todos");
      const id = Number(req.params.id);
      const ok = table.deleteById(id);
      if (!ok) return new HttpResponse(404, { error: "Todo 不存在" });
      return new HttpResponse(200, { data: { deleted: true, id } });
    });
  }

  /**
   * 处理一个请求：依次匹配路由，执行 handler
   */
  async handle(req) {
    // 中间件
    for (const mw of this.middlewares) {
      const result = mw(req);
      if (result) return result; // 中间件可短路返回响应
    }
    for (const route of this.routes) {
      if (route.method !== req.method) continue;
      const params = route.match(req.path);
      if (params) {
        req.params = params;
        try {
          return await route.handler(req);
        } catch (err) {
          return new HttpResponse(500, { error: err.message });
        }
      }
    }
    return new HttpResponse(404, {
      error: `路由不存在: ${req.method} ${req.path}`,
    });
  }
}

// ============================================================================
// 3. 前端渲染层：Frontend
// ============================================================================

/**
 * Frontend：前端 UI 层
 * 通过调用 backend.handle 发请求，渲染为 ASCII
 */
class Frontend {
  constructor(backend) {
    this.backend = backend;
  }

  /** 内部：发请求 */
  async _request(method, path, body = null, query = {}) {
    const req = new HttpRequest(method, path, body, query);
    const res = await this.backend.handle(req);
    return res;
  }

  /** 添加 todo */
  async addTodo(title, priority = "normal") {
    const res = await this._request("POST", "/todos", { title, priority });
    if (res.status === 201) {
      console.log(
        `[前端] 创建成功: #${res.body.data.id} ${res.body.data.title}`,
      );
      return res.body.data;
    }
    console.log(`[前端] 创建失败: ${res.body.error}`);
    return null;
  }

  /** 列出全部 todo */
  async listTodos(filter = {}) {
    const res = await this._request("GET", "/todos", null, filter);
    if (res.status === 200) {
      return res.body.data;
    }
    console.log(`[前端] 获取列表失败: ${res.body.error}`);
    return [];
  }

  /** 获取单个 todo */
  async getTodo(id) {
    const res = await this._request("GET", `/todos/${id}`);
    if (res.status === 200) return res.body.data;
    console.log(`[前端] 获取失败: ${res.body.error}`);
    return null;
  }

  /** 切换完成状态 */
  async toggleComplete(id) {
    const todo = await this.getTodo(id);
    if (!todo) return null;
    const res = await this._request("PUT", `/todos/${id}`, {
      completed: !todo.completed,
    });
    if (res.status === 200) {
      console.log(
        `[前端] 切换完成: #${id} -> ${res.body.data.completed ? "已完成" : "未完成"}`,
      );
      return res.body.data;
    }
    console.log(`[前端] 更新失败: ${res.body.error}`);
    return null;
  }

  /** 删除 todo */
  async deleteTodo(id) {
    const res = await this._request("DELETE", `/todos/${id}`);
    if (res.status === 200) {
      console.log(`[前端] 删除成功: #${id}`);
      return true;
    }
    console.log(`[前端] 删除失败: ${res.body.error}`);
    return false;
  }

  /** 渲染为 ASCII 表格 */
  render(todos) {
    if (todos.length === 0) {
      return "(空) 暂无待办事项";
    }
    const lines = [];
    lines.push(
      "┌──────┬──────────────────────────────────────────┬──────────┬──────────┐",
    );
    lines.push(
      "│  ID  │ 标题                                       │  状态    │  优先级  │",
    );
    lines.push(
      "├──────┼──────────────────────────────────────────┼──────────┼──────────┤",
    );
    for (const t of todos) {
      const id = String(t.id).padEnd(4).slice(0, 4);
      const title = (
        t.title.length > 40 ? t.title.slice(0, 37) + "..." : t.title
      ).padEnd(40);
      const status = (t.completed ? "[x] 已完成" : "[ ] 未完成").padEnd(8);
      const priority = (t.priority || "normal").padEnd(8);
      lines.push(`│ ${id} │ ${title} │ ${status} │ ${priority} │`);
    }
    lines.push(
      "└──────┴──────────────────────────────────────────┴──────────┴──────────┘",
    );
    lines.push(
      `共 ${todos.length} 项，已完成 ${todos.filter((t) => t.completed).length} 项`,
    );
    return lines.join("\n");
  }

  /** 显示当前列表 */
  async display(filter = {}) {
    const todos = await this.listTodos(filter);
    console.log("\n" + this.render(todos));
  }
}

// ============================================================================
// 4. 应用初始化与测试
// ============================================================================

async function runTests() {
  console.log("================ 1. 初始化三层架构 ================");
  // 数据库
  const db = new Database();
  db.createTable("todos", {
    primaryKey: "id",
    autoIncrement: true,
    indexes: ["completed"],
  });
  console.log("数据库已建表: todos");

  // 后端
  const backend = new Backend(db);
  // 加一个日志中间件
  backend.use((req) => {
    console.log(
      `  [API] ${req.method} ${req.path}`,
      req.body ? JSON.stringify(req.body) : "",
    );
    return null; // 不短路
  });
  console.log("后端 API 已注册 /todos 路由");

  // 前端
  const frontend = new Frontend(backend);
  console.log("前端已就绪\n");

  console.log("================ 2. 创建多条 Todo ================");
  await frontend.addTodo("学习 JavaScript 基础", "high");
  await frontend.addTodo("手写 Promise", "high");
  await frontend.addTodo("阅读《你不知道的JS》", "normal");
  await frontend.addTodo("完成全栈项目", "high");
  await frontend.addTodo("锻炼身体", "low");

  console.log("\n================ 3. 列出全部 ================");
  await frontend.display();

  console.log("\n================ 4. 切换完成状态 ================");
  await frontend.toggleComplete(1); // 学习 JS -> 完成
  await frontend.toggleComplete(3); // 阅读书籍 -> 完成
  await frontend.toggleComplete(1); // 再次切换 -> 未完成

  console.log("\n================ 5. 列出已完成 ================");
  await frontend.display({ completed: "true" });

  console.log("\n================ 6. 列出未完成 ================");
  await frontend.display({ completed: "false" });

  console.log("\n================ 7. 模糊搜索 ================");
  console.log('搜索 "JS":');
  const results = await frontend.listTodos({ q: "JS" });
  console.log(frontend.render(results));

  console.log("\n================ 8. 更新标题 ================");
  const updateRes = await backend.handle(
    new HttpRequest("PUT", "/todos/2", {
      title: "手写 Promise（A+ 规范）",
      priority: "high",
    }),
  );
  console.log("更新结果:", updateRes.body.data);

  console.log("\n================ 9. 删除 Todo ================");
  await frontend.deleteTodo(5); // 删除"锻炼身体"

  console.log("\n================ 10. 最终列表 ================");
  await frontend.display();

  console.log(
    "\n================ 11. 直接调用 API（绕过前端） ================",
  );
  // 演示后端可独立使用
  const directRes = await backend.handle(new HttpRequest("GET", "/todos/2"));
  console.log("GET /todos/2 响应:", directRes.status, directRes.body.data);

  console.log("\n================ 12. 错误处理 ================");
  // 不存在的 todo
  const notFound = await backend.handle(new HttpRequest("GET", "/todos/999"));
  console.log("GET /todos/999:", notFound.status, notFound.body.error);
  // 缺少 title
  const badCreate = await backend.handle(new HttpRequest("POST", "/todos", {}));
  console.log("POST /todos (无title):", badCreate.status, badCreate.body.error);
  // 不存在的路由
  const noRoute = await backend.handle(new HttpRequest("GET", "/unknown"));
  console.log("GET /unknown:", noRoute.status, noRoute.body.error);

  console.log("\n================ 13. 数据库索引验证 ================");
  const table = db.getTable("todos");
  console.log("todos 表记录数:", table.count());
  console.log("completed 索引大小:", table.indexes.get("completed").size);
  console.log("已完成集合:", [
    ...(table.indexes.get("completed").get(true) || []),
  ]);
  console.log("未完成集合:", [
    ...(table.indexes.get("completed").get(false) || []),
  ]);

  console.log("\n================ 14. 事务测试 ================");
  try {
    db.transaction((tx) => {
      const t = tx.getTable("todos");
      t.insert({ title: "事务内任务 A", completed: false });
      t.insert({ title: "事务内任务 B", completed: false });
      console.log("事务内记录数:", t.count());
      throw new Error("故意失败以触发回滚");
    });
  } catch (e) {
    console.log("事务回滚:", e.message);
  }
  console.log("事务后记录数（应与事务前一致）:", db.getTable("todos").count());

  console.log("\n================ 15. 事务成功提交 ================");
  db.transaction((tx) => {
    const t = tx.getTable("todos");
    t.insert({ title: "事务成功任务", completed: false });
  });
  console.log("成功事务后记录数:", db.getTable("todos").count());

  console.log("\n================ 最终 Todo 列表 ================");
  await frontend.display();
}

runTests();
