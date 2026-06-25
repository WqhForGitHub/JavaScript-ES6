/**
 * 手写简易 Diff 算法的 key 优化
 *
 * 列表 diff 中是否使用 key，对更新效率影响很大：
 *   - 不用 key（或用 index 作 key）：diff 按「位置」配对，插入/删除会导致
 *     后续所有节点都被「内容更新」（哪怕它们本可复用）。还可能引发状态错乱
 *     （输入框等带内部状态的控件）。
 *   - 用稳定 key：diff 按 key 配对，能精准识别「哪些节点是复用的、哪些是新增/删除/移动」，
 *     只对真正变化的节点操作，DOM 操作次数大幅减少。
 *
 * 本例实现两种 diff 并对比操作次数：
 *   - diffByIndex：按位置配对
 *   - diffByKey：按 key 配对（map + 移动）
 */

// ===== mock DOM + 操作计数 =====
let opCount = { create: 0, patch: 0, move: 0, remove: 0 };
function resetOps() {
  opCount = { create: 0, patch: 0, move: 0, remove: 0 };
}

class DomNode {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.parentNode = null;
    this.textContent = "";
    this._text = tag === "#text";
  }
  appendChild(n) {
    if (n.parentNode) n.parentNode.removeChild(n);
    this.children.push(n);
    n.parentNode = this;
    return n;
  }
  insertBefore(n, ref) {
    if (n.parentNode) n.parentNode.removeChild(n);
    const i = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(i, 0, n);
    n.parentNode = this;
    return n;
  }
  removeChild(n) {
    const i = this.children.indexOf(n);
    if (i >= 0) {
      this.children.splice(i, 1);
      n.parentNode = null;
    }
    return n;
  }
}

function h(key, text) {
  return { tag: "div", key, text, elm: null };
}
function createElm(vnode) {
  const el = new DomNode(vnode.tag);
  const t = new DomNode("#text");
  t.textContent = vnode.text;
  el.appendChild(t);
  vnode.elm = el;
  opCount.create++;
  return el;
}
function patchText(vnode, oldVnode) {
  if (vnode.text !== oldVnode.text) {
    vnode.elm = oldVnode.elm;
    vnode.elm.children[0].textContent = vnode.text;
    opCount.patch++;
  } else {
    vnode.elm = oldVnode.elm;
  }
}

// ===== 方式一：按位置 diff（无 key）=====
function diffByIndex(parent, oldCh, newCh) {
  const len = Math.max(oldCh.length, newCh.length);
  for (let i = 0; i < len; i++) {
    const o = oldCh[i];
    const n = newCh[i];
    if (o && n) {
      // 同位置：复用 DOM，更新内容
      patchText(n, o);
    } else if (n) {
      // 新增
      parent.appendChild(createElm(n));
    } else if (o) {
      // 删除
      parent.removeChild(o.elm);
      opCount.remove++;
    }
  }
}

// ===== 方式二：按 key diff（有 key）=====
function diffByKey(parent, oldCh, newCh) {
  // 1) 旧节点 key -> index 映射
  const oldMap = {};
  oldCh.forEach((c, i) => {
    if (c.key != null) oldMap[c.key] = i;
  });
  const used = new Set();

  // 2) Pass 1：先复用匹配的旧节点（设置 elm），保证后续插入时 ref 已就绪
  newCh.forEach((n) => {
    const oldIdx = oldMap[n.key];
    if (oldIdx != null && !used.has(oldIdx)) {
      used.add(oldIdx);
      patchText(n, oldCh[oldIdx]); // n.elm = old.elm，必要时更新内容
    }
  });

  // 3) Pass 2：按新顺序定位 —— 新增节点创建并插入；复用节点按需移动
  let maxOldIdx = -1;
  newCh.forEach((n, idx) => {
    const oldIdx = oldMap[n.key];
    const matched = oldIdx != null && used.has(oldIdx);
    const ref = idx + 1 < newCh.length ? newCh[idx + 1].elm : null;
    if (!matched) {
      // 新增：插到下一个新节点之前
      parent.insertBefore(createElm(n), ref);
    } else {
      // 复用：判断相对顺序是否变化来决定是否移动
      if (oldIdx < maxOldIdx) {
        parent.insertBefore(n.elm, ref);
        opCount.move++;
      } else {
        maxOldIdx = oldIdx;
      }
    }
  });

  // 4) Pass 3：删除未被复用的旧节点
  oldCh.forEach((o, i) => {
    if (!used.has(i)) {
      parent.removeChild(o.elm);
      opCount.remove++;
    }
  });
}

// ===== 序列化 =====
function serialize(node) {
  return node.children.map((c) => c.children[0].textContent).join(",");
}

// ===== 测试 =====
// 场景：在列表头部插入一个新元素
//   旧：A B C D   新：E A B C D
const oldKeys = ["A", "B", "C", "D"];
const newKeys = ["E", "A", "B", "C", "D"];

// --- 无 key ---
const parent1 = new DomNode("ul");
const oldVnodes1 = oldKeys.map((k) => h(k, k));
oldVnodes1.forEach((v) => parent1.appendChild(createElm(v)));
// 重置 create 计数（初始化不算更新操作）
resetOps();
diffByIndex(
  parent1,
  oldVnodes1,
  newKeys.map((k) => h(k, k)),
);
console.log("=== 无 key（按位置 diff）===");
console.log("结果:", serialize(parent1)); // E,A,B,C,D
console.log("操作:", opCount); // patch:4 (A->E,B->A,C->B,D->C), create:1 (尾部D), 体现「全部更新」

// --- 有 key ---
resetOps();
const parent2 = new DomNode("ul");
const oldVnodes = oldKeys.map((k) => h(k, k));
oldVnodes.forEach((v) => parent2.appendChild(createElm(v)));
resetOps();
diffByKey(
  parent2,
  oldVnodes,
  newKeys.map((k) => h(k, k)),
);
console.log("\n=== 有 key（按 key diff）===");
console.log("结果:", serialize(parent2)); // E,A,B,C,D
console.log("操作:", opCount); // create:1 (E), patch:0, move:0 —— A/B/C/D 原地复用

// 场景2：中间删除
//   旧：A B C D   新：A C D
console.log("\n=== 场景2：删除中间元素 B ===");
resetOps();
const p3 = new DomNode("ul");
const old3 = ["A", "B", "C", "D"].map((k) => h(k, k));
old3.forEach((v) => p3.appendChild(createElm(v)));
resetOps();
diffByKey(
  p3,
  old3,
  ["A", "C", "D"].map((k) => h(k, k)),
);
console.log("有 key 结果:", serialize(p3), "操作:", opCount); // A,C,D ; remove:1

resetOps();
const p4 = new DomNode("ul");
const old4 = ["A", "B", "C", "D"].map((k) => h(k, k));
old4.forEach((v) => p4.appendChild(createElm(v)));
resetOps();
diffByIndex(
  p4,
  old4,
  ["A", "C", "D"].map((k) => h(k, k)),
);
console.log("无 key 结果:", serialize(p4), "操作:", opCount); // patch:3(B->C,C->D), remove:1
