/**
 * 手写简易协同编辑 - CRDT (Conflict-free Replicated Data Type)
 * ============================================================
 *
 * 概念说明:
 * CRDT 是协同编辑的另一条路线 (区别于 OT). 它通过为每个字符分配全局唯一的
 * "位置标识符 (position identifier)", 使插入 / 删除操作天然满足交换律,
 * 无需对并发操作做 transform. 各副本只要收到相同的操作集合 (不论顺序), 最终都会收敛.
 *
 * 本实现采用类 RGA (Replicated Growable Array) / LSEQ 思路:
 * - 每个字符节点: { id: {site, seq}, char, tombstone }
 * - id 由 (siteId, 递增 seq) 组成, 全局唯一
 * - 字符顺序由 id 之间的 "位置标识符" 决定 (这里用浮点数 fraction 风格, 类似 LSEQ)
 *
 * 位置标识策略 (fractional indexing, 类似 Figma / LSEQ 简化版):
 * - 文档维护一个有序链表, 每个节点带一个 "位置值" pos (大整数或分数)
 * - 头哨兵 pos = 0, 尾哨兵 pos = Number.MAX_SAFE_INTEGER
 * - 在两个节点之间插入时, 取 pos = (leftPos + rightPos) / 2 的整数化表示
 * - 当 leftPos 与 rightPos 过于接近 (无法再分配中间值), 增加深度 (depth),
 *   用数组 [a, b, c...] 表示位置, 类似字典序比较 (LSEQ 核心思想)
 *
 * 为简化但保留核心:
 * 这里用 "大整数风格" 的位置数组实现, 每个位置是数字数组,
 * 比较时按字典序. 在 left 和 right 之间插入时, 在两者数组之间生成一个中间数组.
 *
 * 收敛性保证:
 * - 插入: 操作 (originLeftId, originRightId, newId, char) 在所有副本上执行相同的选择逻辑,
 *   找到 left/right 节点, 在其间插入, 顺序由 id 决定 -> 交换律成立
 * - 删除: 仅标记 tombstone, 不真正移除 (tombstone 保留以保证顺序稳定) -> 幂等
 *
 * 并发同位置插入定序:
 * 用 (pos 数组字典序, siteId) 二级排序, 保证全局一致.
 */

"use strict";

// ------------------------------------------------------------
// 位置标识 (Position Identifier)
// ------------------------------------------------------------

/**
 * 比较两个位置数组 (字典序)
 * @param {number[]} a
 * @param {number[]} b
 * @returns {-1|0|1}
 */
function comparePos(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] !== undefined ? a[i] : 0;
    const bv = b[i] !== undefined ? b[i] : 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

/**
 * 在两个位置之间生成一个新位置
 * 思路: 找到从左到右第一个不同的位, 在中间分配; 若完全相同则扩展一位
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number[]}
 */
function posBetween(left, right) {
  // left < right 必须成立
  const result = [];
  let depth = 0;
  while (depth < 64) {
    const l = left[depth] !== undefined ? left[depth] : 0;
    const r = right[depth] !== undefined ? right[depth] : 0;
    if (r - l > 1) {
      // 中间有空间, 直接取中间
      result.push(...left.slice(0, depth));
      // 为避免与左相等, 取 l + 1 到 r-1 之间
      const mid = l + Math.floor((r - l) / 2);
      result.push(mid);
      return result;
    }
    // l === r 或 r = l + 1, 需要在更深一层分配
    // 把 l 加入结果, 继续深入
    result.push(l);
    // 若 left 在此深度之后没有更多位, 而 right 在此深度是 l+1,
    // 我们可以在 left 之下生成更深的位置 (类似在 l.0 和 l+1 之间插 l.5)
    depth++;
    if (depth >= left.length && depth < right.length) {
      // left 已结束, right 还有更深层: 在 left 尾部追加一个介于 0 和 right[depth] 的值
      const r2 = right[depth];
      if (r2 > 1) {
        result.push(Math.floor(r2 / 2));
        return result;
      } else {
        result.push(0);
        // 继续深入
      }
    }
    if (depth >= right.length) {
      // right 已结束: 在 left 尾部追加一个大值
      result.push(Number.MAX_SAFE_INTEGER);
      return result;
    }
  }
  // 兜底: 追加随机位
  return [...left, Math.floor(Math.random() * 1000) + 1];
}

// ------------------------------------------------------------
// 字符节点
// ------------------------------------------------------------

/**
 * 创建字符节点
 * @param {object} id - { site, seq }
 * @param {string} char
 * @param {number[]} pos - 位置标识
 */
function makeChar(id, char, pos) {
  return {
    id, // 全局唯一标识
    char, // 字符内容
    pos, // 位置标识数组
    tombstone: false, // 墓碑标记 (删除后为 true, 保留以维持顺序)
  };
}

// 哨兵节点 id
const HEAD_ID = { site: -1, seq: 0 };
const TAIL_ID = { site: -1, seq: 1 };

// ------------------------------------------------------------
// CRDT 文档 (RGA 风格)
// ------------------------------------------------------------

/**
 * CRDT 文档副本
 * 维护字符链表 (有序), 支持本地插入 / 删除, 以及应用远端操作.
 */
class CRDTDoc {
  /**
   * @param {number} siteId - 站点 ID
   */
  constructor(siteId) {
    this.siteId = siteId;
    this.seq = 0; // 本站点已分配的序号
    /** @type {Map<string, CharNode>} id -> 节点, 便于 O(1) 查找 */
    this.nodes = new Map();
    /** 头尾哨兵 */
    this.head = makeChar(HEAD_ID, "", [0]);
    this.tail = makeChar(TAIL_ID, "", [Number.MAX_SAFE_INTEGER]);
    this.nodes.set(idKey(HEAD_ID), this.head);
    this.nodes.set(idKey(TAIL_ID), this.tail);
    /** @type {CharNode[]} 有序链表 (含哨兵) */
    this.list = [this.head, this.tail];
    /** @type {Set<string>} 已删除但对应 insert 尚未到达的 id (支持乱序应用) */
    this.deletedIds = new Set();
  }

  /**
   * 生成本站点下一个 id
   */
  nextId() {
    return { site: this.siteId, seq: ++this.seq };
  }

  /**
   * 本地插入: 在 index 位置插入字符 char
   * @param {number} index - 逻辑字符索引 (0 表示开头)
   * @param {string} char
   * @returns {object} 操作 (用于广播)
   */
  localInsert(index, char) {
    // 找到插入位置前后的可见节点 (基于可见字符索引)
    const { leftNode, rightNode } = this.findInsertNeighbors(index);
    const newId = this.nextId();
    const newPos = posBetween(leftNode.pos, rightNode.pos);
    const node = makeChar(newId, char, newPos);
    this.insertNode(node, leftNode, rightNode);
    return { type: "insert", id: newId, char, pos: newPos };
  }

  /**
   * 本地删除: 删除 index 位置的字符 (标记墓碑)
   * @param {number} index
   * @returns {object} 操作 (用于广播)
   */
  localDelete(index) {
    const node = this.getVisibleNodeAt(index);
    if (!node) throw new Error("删除位置无效");
    node.tombstone = true;
    return { type: "delete", id: node.id };
  }

  /**
   * 应用远端操作 (插入 / 删除均幂等, 多次应用安全)
   * @param {object} op
   */
  applyRemote(op) {
    const key = idKey(op.id);
    if (op.type === "insert") {
      if (this.nodes.has(key)) return; // 已存在, 幂等
      const node = makeChar(op.id, op.char, op.pos);
      // 乱序场景: delete 可能先于 insert 到达, 此时该字符应直接标记为墓碑
      if (this.deletedIds.has(key)) {
        node.tombstone = true;
        this.deletedIds.delete(key);
      }
      // 找到该 pos 在链表中的位置并插入 (按 pos 字典序)
      this.insertNodeByPos(node);
    } else if (op.type === "delete") {
      const node = this.nodes.get(key);
      if (node) {
        node.tombstone = true; // 幂等
      } else {
        // insert 尚未到达, 先记录待删除, 等 insert 到达时再标记
        this.deletedIds.add(key);
      }
    }
  }

  /**
   * 按可见索引找到插入的左右邻居
   */
  findInsertNeighbors(index) {
    // index 表示在第几个可见字符前插入
    let visibleCount = 0;
    let leftNode = this.head;
    for (let i = 1; i < this.list.length - 1; i++) {
      const node = this.list[i];
      if (node.tombstone) continue;
      if (visibleCount === index) {
        // 在该节点前插入: left = 前一个可见节点, right = 该节点
        return { leftNode, rightNode: node };
      }
      leftNode = node;
      visibleCount++;
    }
    // 插入末尾
    return { leftNode, rightNode: this.tail };
  }

  /**
   * 在 leftNode 与 rightNode 之间插入 node (二者相邻)
   * 注意: 这里要求 left/right 是相邻的; 但若并发插入, 我们改为按 pos 排序插入
   */
  insertNode(node, leftNode, rightNode) {
    this.nodes.set(idKey(node.id), node);
    // 找到 leftNode 在 list 中的位置, 在其后插入
    const idx = this.list.indexOf(leftNode);
    this.list.splice(idx + 1, 0, node);
  }

  /**
   * 按 pos 字典序把 node 插入链表 (用于远端操作, 可能与本地并发插入交错)
   */
  insertNodeByPos(node) {
    this.nodes.set(idKey(node.id), node);
    // 找到第一个 pos > node.pos 的位置, 插入其前
    let i = 1; // 跳过 head
    while (i < this.list.length - 1) {
      const cmp = comparePos(node.pos, this.list[i].pos);
      if (cmp < 0) break;
      if (cmp === 0) {
        // pos 相同 (理论上不应发生, 除非同 site 同 seq), 用 siteId 二次排序
        if (node.id.site < this.list[i].id.site) break;
      }
      i++;
    }
    this.list.splice(i, 0, node);
  }

  /**
   * 获取第 index 个可见节点
   */
  getVisibleNodeAt(index) {
    let visibleCount = 0;
    for (let i = 1; i < this.list.length - 1; i++) {
      const node = this.list[i];
      if (node.tombstone) continue;
      if (visibleCount === index) return node;
      visibleCount++;
    }
    return null;
  }

  /**
   * 获取可见文本
   */
  getText() {
    let s = "";
    for (let i = 1; i < this.list.length - 1; i++) {
      const node = this.list[i];
      if (!node.tombstone) s += node.char;
    }
    return s;
  }

  /**
   * 导出全部操作 (用于把一个副本的状态同步到另一个新副本)
   */
  exportOps() {
    const ops = [];
    for (let i = 1; i < this.list.length - 1; i++) {
      const node = this.list[i];
      ops.push({ type: "insert", id: node.id, char: node.char, pos: node.pos });
      if (node.tombstone) ops.push({ type: "delete", id: node.id });
    }
    return ops;
  }
}

/** 把 id 转为字符串键 */
function idKey(id) {
  return `${id.site}:${id.seq}`;
}

// ------------------------------------------------------------
// 同步助手
// ------------------------------------------------------------

/**
 * 把 from 副本的所有操作广播给 to 副本 (模拟网络)
 */
function sync(from, to) {
  for (const op of from.exportOps()) {
    to.applyRemote(op);
  }
}

/**
 * 双向同步 (交换操作)
 */
function syncBoth(a, b) {
  sync(a, b);
  sync(b, a);
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== CRDT 协同编辑演示 ==========\n");

// ---- 1. 单副本基本编辑 ----
console.log("--- 1. 单副本基本编辑 ---");
const doc = new CRDTDoc(1);
doc.localInsert(0, "H");
doc.localInsert(1, "i");
doc.localInsert(2, "!");
console.log("文本:", JSON.stringify(doc.getText()));
doc.localDelete(1); // 删除 'i'
console.log('删除 "i" 后:', JSON.stringify(doc.getText()));
doc.localInsert(1, "e"); // 插入 'e' -> "He!"
doc.localInsert(2, "l");
doc.localInsert(3, "l");
doc.localInsert(4, "o");
console.log("最终:", JSON.stringify(doc.getText()));

// ---- 2. 两个副本并发插入, 验证收敛 ----
console.log("\n--- 2. 两副本并发编辑, 验证收敛 ---");
const alice = new CRDTDoc(1);
const bob = new CRDTDoc(2);

// Alice 先建立文档 "Hello", 然后同步给 Bob
alice.localInsert(0, "H");
alice.localInsert(1, "e");
alice.localInsert(2, "l");
alice.localInsert(3, "l");
alice.localInsert(4, "o");
syncBoth(alice, bob);
console.log("Alice 同步后:");
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));

// 并发: Alice 在开头插 'A', Bob 在末尾插 '!'
const op1 = alice.localInsert(0, "A");
const op2 = bob.localInsert(5, "!");
console.log("\n并发操作前:");
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));

// 互相广播并发操作
bob.applyRemote(op1);
alice.applyRemote(op2);
console.log("互相应用并发操作后:");
console.log("  Alice:", JSON.stringify(alice.getText()));
console.log("  Bob:  ", JSON.stringify(bob.getText()));
console.log("  收敛一致:", alice.getText() === bob.getText() ? "YES" : "NO");

// ---- 3. 并发同位置插入 (用 siteId 定序) ----
console.log("\n--- 3. 并发同位置插入 (siteId 定序) ---");
const a3 = new CRDTDoc(1);
const b3 = new CRDTDoc(2);
// 共同建立文档 "X"
a3.localInsert(0, "X");
syncBoth(a3, b3);

// 并发: 都在 index=0 插入
const ins1 = a3.localInsert(0, "1"); // site 1
const ins2 = b3.localInsert(0, "2"); // site 2
a3.applyRemote(ins2);
b3.applyRemote(ins1);
console.log("  a3:", JSON.stringify(a3.getText()));
console.log("  b3:", JSON.stringify(b3.getText()));
console.log("  收敛一致:", a3.getText() === b3.getText() ? "YES" : "NO");

// ---- 4. 并发删除同一字符 (幂等) ----
console.log("\n--- 4. 并发删除同一字符 (幂等) ---");
const a4 = new CRDTDoc(1);
const b4 = new CRDTDoc(2);
a4.localInsert(0, "A");
a4.localInsert(1, "B");
a4.localInsert(2, "C");
syncBoth(a4, b4);
console.log("初始:", JSON.stringify(a4.getText()));

// 并发都删除 'B' (index=1)
const del1 = a4.localDelete(1);
const del2 = b4.localDelete(1);
a4.applyRemote(del2);
b4.applyRemote(del1);
console.log('并发删除 "B" 后:');
console.log("  a4:", JSON.stringify(a4.getText()));
console.log("  b4:", JSON.stringify(b4.getText()));
console.log("  收敛一致:", a4.getText() === b4.getText() ? "YES" : "NO");

// ---- 5. 三方并发, 验证最终收敛 ----
console.log("\n--- 5. 三方并发编辑 ---");
const u1 = new CRDTDoc(1);
const u2 = new CRDTDoc(2);
const u3 = new CRDTDoc(3);

// 共同建立 "Hi"
u1.localInsert(0, "H");
u1.localInsert(1, "i");
syncBoth(u1, u2);
syncBoth(u1, u3);
console.log("初始:", JSON.stringify(u1.getText()));

// 并发: u1 在开头插 '1', u2 在中间插 '2', u3 在末尾插 '3'
const o1 = u1.localInsert(0, "1");
const o2 = u2.localInsert(2, "2");
const o3 = u3.localInsert(2, "3");

// 三方互相广播 (任意顺序)
u2.applyRemote(o1);
u3.applyRemote(o1);
u1.applyRemote(o2);
u3.applyRemote(o2);
u1.applyRemote(o3);
u2.applyRemote(o3);

console.log("并发后:");
console.log("  u1:", JSON.stringify(u1.getText()));
console.log("  u2:", JSON.stringify(u2.getText()));
console.log("  u3:", JSON.stringify(u3.getText()));
console.log(
  "  全部收敛:",
  u1.getText() === u2.getText() && u2.getText() === u3.getText() ? "YES" : "NO",
);

// ---- 6. 乱序应用操作, 仍收敛 ----
console.log("\n--- 6. 乱序应用操作仍收敛 ---");
const src = new CRDTDoc(1);
src.localInsert(0, "a");
src.localInsert(1, "b");
src.localInsert(2, "c");
src.localInsert(3, "d");
src.localDelete(1); // 删 b
src.localInsert(1, "B");
const ops = src.exportOps();
console.log("  导出操作数:", ops.length);

// 极端乱序: 先应用所有 delete (对应 insert 尚未到达), 再逆序应用 insert
// 这会触发 deletedIds 机制: delete 先到, insert 后到时直接标记为墓碑
const deletes = ops.filter((o) => o.type === "delete");
const inserts = ops.filter((o) => o.type === "insert").reverse();
const shuffled = [...deletes, ...inserts];

const target = new CRDTDoc(2);
for (const op of shuffled) target.applyRemote(op);
console.log("  源副本:", JSON.stringify(src.getText()));
console.log("  乱序应用副本:", JSON.stringify(target.getText()));
console.log("  收敛一致:", src.getText() === target.getText() ? "YES" : "NO");
console.log("  说明: CRDT 操作满足交换律, 应用顺序不影响最终结果");

console.log("\n[CRDT 协同编辑演示完成]");
