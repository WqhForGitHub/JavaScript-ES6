/**
 * 手写简易协同编辑 - OT 算法 (Operational Transformation)
 * ======================================================
 *
 * 概念说明:
 * OT (Operational Transformation) 是协同文本编辑的经典算法.
 * 核心思想: 用户编辑产生操作 (operation), 当多个用户并发编辑时,
 * 通过 transform 函数对并发操作进行变换, 使所有副本最终收敛到相同状态.
 *
 * 操作定义 (针对纯文本字符串):
 * - Insert(pos, char): 在 pos 位置插入字符 char
 * - Delete(pos):       删除 pos 位置的字符
 *
 * 关键问题:
 * 用户 A 和 B 基于同一文档 S 分别产生操作 opA 与 opB (并发).
 * - A 本地已应用 opA, 收到 opB 时, 需要把 opB 相对 opA 变换: opB' = transform(opB, opA)
 * - B 本地已应用 opB, 收到 opA 时, 需要把 opA 相对 opB 变换: opA' = transform(opA, opB)
 * - 收敛性保证: apply(apply(S, opA), opB') === apply(apply(S, opB), opA')
 *
 * transform 规则 (以 Insert/Delete 两两组合):
 * 设两个操作 op1 与 op2, 它们基于同一文档:
 *
 * 1) Insert vs Insert:
 *    - 若 op1.pos < op2.pos: op2' 的位置 +1 (op1 在前面插入了字符)
 *    - 若 op1.pos > op2.pos: op2' 位置不变
 *    - 若 op1.pos === op2.pos: 用站点 ID (siteId) 打破平局, 保证全局顺序一致
 *
 * 2) Insert vs Delete:
 *    - 若 op1(Insert).pos <= op2(Delete).pos: op2' 位置 +1
 *    - 否则 op2' 位置不变
 *
 * 3) Delete vs Insert:
 *    - 若 op1(Delete).pos < op2(Insert).pos: op2' 位置 -1
 *    - 否则不变
 *
 * 4) Delete vs Delete:
 *    - 若 op1.pos < op2.pos: op2' 位置 -1
 *    - 若 op1.pos > op2.pos: 不变
 *    - 若相等: 两个删除指向同一字符, op2' 变为 NoOp (无需再删)
 *
 * 客户端 / 服务器架构:
 * - 客户端: 本地应用 op, 发送给服务器; 收到服务器广播的远端 op 时, 先 transform 再应用
 * - 服务器: 收到 op, 对已应用的并发历史 op 做 transform, 再广播给其他客户端
 *
 * 本实现:
 * - 为简化, 单字符操作; 服务器维护操作历史
 * - 用版本号 (revision) 跟踪, 客户端发送 op 时附带基于的 revision
 */

"use strict";

// ------------------------------------------------------------
// 操作定义
// ------------------------------------------------------------

/**
 * 创建插入操作
 * @param {number} pos
 * @param {string} ch
 * @param {number} siteId - 站点 ID, 用于并发冲突时定序
 */
function opInsert(pos, ch, siteId) {
  return { type: "insert", pos, ch, siteId };
}

/** 创建删除操作 */
function opDelete(pos, siteId) {
  return { type: "delete", pos, siteId };
}

/** NoOp 操作 (transform 后可能产生) */
function opNoop() {
  return { type: "noop" };
}

/**
 * 在文档上应用操作, 返回新文档 (不可变)
 * @param {string} doc
 * @param {object} op
 * @returns {string}
 */
function applyOp(doc, op) {
  switch (op.type) {
    case "insert":
      if (op.pos < 0 || op.pos > doc.length) {
        throw new Error(`插入位置越界: pos=${op.pos}, len=${doc.length}`);
      }
      return doc.slice(0, op.pos) + op.ch + doc.slice(op.pos);
    case "delete":
      if (op.pos < 0 || op.pos >= doc.length) {
        // 删除位置无效 -> 视为 NoOp (健壮处理)
        return doc;
      }
      return doc.slice(0, op.pos) + doc.slice(op.pos + 1);
    case "noop":
      return doc;
    default:
      throw new Error(`未知操作类型: ${op.type}`);
  }
}

// ------------------------------------------------------------
// transform 函数 (核心)
// ------------------------------------------------------------

/**
 * 变换 op2, 使其可以在已应用 op1 的文档上执行
 * 即: op2' = transform(op2, op1)
 * 满足: apply(apply(S, op1), op2') === apply(apply(S, op2), op1')
 *
 * @param {object} op1 - 已应用的并发操作
 * @param {object} op2 - 待变换的并发操作
 * @returns {object} op2' 变换后的操作
 */
function transform(op1, op2) {
  // NoOp 与任意操作: 不影响
  if (op1.type === "noop" || op2.type === "noop") {
    return clone(op2);
  }

  // Insert vs Insert
  if (op1.type === "insert" && op2.type === "insert") {
    if (op1.pos < op2.pos) {
      return opInsert(op2.pos + 1, op2.ch, op2.siteId);
    } else if (op1.pos > op2.pos) {
      return clone(op2);
    } else {
      // 同位置: 用 siteId 决定顺序, siteId 小的 "排前面"
      // 若 op1 排在前面 (op1.siteId < op2.siteId), 则 op2' 位置 +1
      // 否则 op2' 位置不变
      if (op1.siteId < op2.siteId) {
        return opInsert(op2.pos + 1, op2.ch, op2.siteId);
      }
      return clone(op2);
    }
  }

  // Insert(op1) vs Delete(op2): op1 在 op2 之前或同位置插入 -> op2 删除位置后移
  if (op1.type === "insert" && op2.type === "delete") {
    if (op1.pos <= op2.pos) {
      return opDelete(op2.pos + 1, op2.siteId);
    }
    return clone(op2);
  }

  // Delete(op1) vs Insert(op2): op1 删除在 op2 插入之前 -> op2 插入位置前移
  if (op1.type === "delete" && op2.type === "insert") {
    if (op1.pos < op2.pos) {
      return opInsert(op2.pos - 1, op2.ch, op2.siteId);
    }
    return clone(op2);
  }

  // Delete vs Delete
  if (op1.type === "delete" && op2.type === "delete") {
    if (op1.pos < op2.pos) {
      return opDelete(op2.pos - 1, op2.siteId);
    } else if (op1.pos > op2.pos) {
      return clone(op2);
    } else {
      // 删的是同一字符, op2' 无需再删
      return opNoop();
    }
  }

  throw new Error("无法变换的操作组合");
}

function clone(op) {
  return { ...op };
}

// ------------------------------------------------------------
// 协同编辑客户端
// ------------------------------------------------------------

/**
 * 协同编辑客户端
 * 维护本地文档与版本号, 处理本地编辑与远端操作应用
 */
class OTEditor {
  /**
   * @param {number} siteId - 站点 ID
   * @param {string} initialDoc - 初始文档
   * @param {number} initialRevision - 初始版本号
   * @param {object} server - 服务器引用 (用于发送操作)
   */
  constructor(siteId, initialDoc, initialRevision, server) {
    this.siteId = siteId;
    this.doc = initialDoc;
    this.revision = initialRevision; // 本地文档对应的版本号
    this.server = server;
    /** 本地已应用但尚未被服务器确认的操作 (待 transform) */
    this.pending = null;
    /** 本地已应用且已发送, 但服务器尚未确认; 同时保存收到远端 op 期间产生的新本地 op */
  }

  /**
   * 本地插入
   */
  localInsert(pos, ch) {
    const op = opInsert(pos, ch, this.siteId);
    this.doc = applyOp(this.doc, op);
    this.sendToServer(op);
    return op;
  }

  /**
   * 本地删除
   */
  localDelete(pos) {
    const op = opDelete(pos, this.siteId);
    this.doc = applyOp(this.doc, op);
    this.sendToServer(op);
    return op;
  }

  /**
   * 发送操作到服务器
   * 附带客户端当前 revision (基于哪个版本)
   */
  sendToServer(op) {
    this.server.receiveOp(this, op, this.revision);
    // 客户端假定服务器会接受, revision 递增留待服务器确认
    // 简化: 客户端把本地 revision + 1 (代表包含该 op 的新版本)
    this.revision++;
  }

  /**
   * 接收并应用远端操作 (已由服务器 transform 过, 可直接应用)
   * @param {object} remoteOp - 服务器广播的 (相对客户端当前状态已变换的) 操作
   */
  applyRemote(remoteOp) {
    this.doc = applyOp(this.doc, remoteOp);
    this.revision++;
  }

  getText() {
    return this.doc;
  }
}

// ------------------------------------------------------------
// 协同编辑服务器
// ------------------------------------------------------------

/**
 * 协同编辑服务器
 * 维护主文档与操作历史, 对收到的 op 相对历史做 transform, 广播给其他客户端
 */
class OTServer {
  constructor(initialDoc = "") {
    this.doc = initialDoc;
    /** @type {object[]} 操作历史 (按应用顺序), 每条对应一个版本 */
    this.history = [];
    /** @type {OTEditor[]} 已连接客户端 */
    this.clients = [];
    /** @type {Array<{client: OTEditor, op: object}>} 待投递的广播队列 (模拟异步网络) */
    this.outbox = [];
  }

  /**
   * 连接客户端
   */
  connect(client) {
    this.clients.push(client);
  }

  /**
   * 接收客户端操作
   * @param {OTEditor} client
   * @param {object} op
   * @param {number} clientRevision - 客户端基于的版本号
   */
  receiveOp(client, op, clientRevision) {
    // 把 op 相对 (clientRevision..当前) 之间的并发历史操作进行 transform
    let transformedOp = clone(op);
    for (let i = clientRevision; i < this.history.length; i++) {
      const concurrentOp = this.history[i];
      transformedOp = transform(concurrentOp, transformedOp);
    }
    // 应用到服务器主文档
    this.doc = applyOp(this.doc, transformedOp);
    this.history.push(clone(transformedOp));

    // 入队广播, 不立即投递 (模拟异步网络, 便于产生真正的并发操作)
    for (const other of this.clients) {
      if (other === client) continue;
      this.outbox.push({ client: other, op: clone(transformedOp) });
    }
  }

  /**
   * 投递所有待发广播给对应客户端
   * 在测试中, 先产生并发操作再 flush, 模拟真实的网络延迟与并发
   */
  flush() {
    while (this.outbox.length) {
      const { client, op } = this.outbox.shift();
      client.applyRemote(op);
    }
  }

  getDoc() {
    return this.doc;
  }
}

// ------------------------------------------------------------
// 辅助: 验证收敛性
// ------------------------------------------------------------

/**
 * 验证 transform 满足 TP1 性质 (收敛性):
 * apply(apply(S, op1), transform(op1, op2)) === apply(apply(S, op2), transform(op2, op1))
 */
function verifyTP1(S, op1, op2) {
  const left = applyOp(applyOp(S, op1), transform(op1, op2));
  const right = applyOp(applyOp(S, op2), transform(op2, op1));
  return left === right;
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== OT 协同编辑演示 ==========\n");

// ---- 1. 验证 TP1 收敛性 (各种操作组合) ----
console.log("--- 1. 验证 TP1 收敛性 ---");
const S = "abc";
const cases = [
  ["Insert vs Insert (前)", opInsert(0, "X", 1), opInsert(2, "Y", 2)],
  ["Insert vs Insert (同位)", opInsert(1, "X", 1), opInsert(1, "Y", 2)],
  ["Insert vs Delete", opInsert(1, "X", 1), opDelete(2, 2)],
  ["Delete vs Insert", opDelete(1, 1), opInsert(2, "Y", 2)],
  ["Delete vs Delete (不同)", opDelete(0, 1), opDelete(2, 2)],
  ["Delete vs Delete (同位)", opDelete(1, 1), opDelete(1, 2)],
];
for (const [name, op1, op2] of cases) {
  const ok = verifyTP1(S, op1, op2);
  const left = applyOp(applyOp(S, op1), transform(op1, op2));
  console.log(`  ${name}: ${ok ? "PASS" : "FAIL"}  =>  "${left}"`);
}

// ---- 2. 两个客户端并发编辑 ----
console.log("\n--- 2. 两用户并发编辑演示 ---");
const server = new OTServer("");
const alice = new OTEditor(1, "", 0, server);
const bob = new OTEditor(2, "", 0, server);
server.connect(alice);
server.connect(bob);

console.log("初始: 所有人文档为空");

// Alice 输入 "Hello" (操作入队, 暂不投递)
alice.localInsert(0, "H");
alice.localInsert(1, "e");
alice.localInsert(2, "l");
alice.localInsert(3, "l");
alice.localInsert(4, "o");
server.flush(); // 投递给 Bob
console.log('Alice 输入 "Hello" 后:');
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));
console.log("  服务器:", JSON.stringify(server.getDoc()));

// Bob 在末尾插入 "!"
bob.localInsert(5, "!");
server.flush();
console.log('\nBob 在末尾插入 "!":');
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));
console.log("  服务器:", JSON.stringify(server.getDoc()));

// 并发场景: Alice 在开头插入 "A", Bob 在末尾插入 "Z" (两者基于同一文档 "Hello!")
console.log('\n并发: Alice 在开头插 "A", Bob 在末尾插 "Z":');
console.log(
  `  (Alice revision=${alice.revision}, Bob revision=${bob.revision})`,
);

// 两端各自本地应用, 暂不 flush, 形成真正的并发
alice.localInsert(0, "A");
bob.localInsert(6, "Z"); // Bob 文档仍为 "Hello!" (未收到 Alice 的 A), 末尾插入
console.log("应用后 (未收对方操作前):");
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));

// flush 后服务器把并发 op 互相 transform 并投递, 客户端收敛
server.flush();
console.log("flush 收敛后:");
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));
console.log("  服务器:", JSON.stringify(server.getDoc()));
console.log(
  "  收敛一致:",
  alice.getText() === bob.getText() && bob.getText() === server.getDoc()
    ? "YES"
    : "NO",
);

// ---- 3. 并发删除 + 插入 ----
console.log("\n--- 3. 并发删除与插入 ---");
const server2 = new OTServer("");
const u1 = new OTEditor(1, "", 0, server2);
const u2 = new OTEditor(2, "", 0, server2);
server2.connect(u1);
server2.connect(u2);

// 共同建立文档 "WORLD"
for (const ch of "WORLD") u1.localInsert(u1.doc.length, ch);
server2.flush(); // 同步给 u2
console.log(
  "初始文档:",
  JSON.stringify(u1.getText()),
  "/ u2:",
  JSON.stringify(u2.getText()),
);

// 并发: u1 删除 'W' (pos=0), u2 在末尾插入 '!' (u2 文档仍为 "WORLD")
u1.localDelete(0);
u2.localInsert(5, "!");
server2.flush();

console.log("最终:");
console.log("  u1:", JSON.stringify(u1.getText()));
console.log("  u2:", JSON.stringify(u2.getText()));
console.log("  服务器:", JSON.stringify(server2.getDoc()));
console.log(
  "  收敛一致:",
  u1.getText() === u2.getText() && u2.getText() === server2.getDoc()
    ? "YES"
    : "NO",
);

// ---- 4. 同位置并发插入 (用 siteId 定序) ----
console.log("\n--- 4. 同位置并发插入 (siteId 定序) ---");
const server3 = new OTServer("");
const a = new OTEditor(1, "", 0, server3);
const b = new OTEditor(2, "", 0, server3);
server3.connect(a);
server3.connect(b);

a.localInsert(0, "A"); // 建立共同文档
server3.flush(); // 此时双方文档都是 "A"
// 并发: 两端都在末尾 (pos=1) 插入, siteId 决定顺序
a.localInsert(1, "1"); // siteId=1
b.localInsert(1, "2"); // siteId=2 (并发, 同位置)
server3.flush();

console.log('  a (siteId=1) 插 "1", b (siteId=2) 插 "2", 同位置:');
console.log("  a:", JSON.stringify(a.getText()));
console.log("  b:", JSON.stringify(b.getText()));
console.log("  服务器:", JSON.stringify(server3.getDoc()));
console.log("  收敛一致:", a.getText() === b.getText() ? "YES" : "NO");
console.log("  说明: siteId 小的字符排在前面 (A12), 保证全局一致顺序");

console.log("\n[OT 协同编辑演示完成]");
