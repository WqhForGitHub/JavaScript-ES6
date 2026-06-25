/**
 * 手写 Virtual DOM 的 Diff 算法（最长递增子序列优化）
 *
 * Vue3 核心 diff 思路：
 *   1) 头头同步：从前向后比较，相同 key 则 patch 并 i++
 *   2) 尾尾同步：从后向前比较，相同 key 则 patch 并 e1--、e2--
 *   3) 若 i > e1（旧节点耗尽）且 i <= e2 —— 新增 [i, e2] 的新节点
 *      若 i > e2（新节点耗尽）且 i <= e1 —— 卸载 [i, e1] 的旧节点
 *   4) 否则进入「未知子序列」处理：
 *      a) 为新节点建立 key -> newIndex 映射
 *      b) 遍历旧节点段：能找到则 patch，找不到则卸载
 *      c) 用 newIndexToOldIndex 数组求最长递增子序列（LIS），
 *         LIS 内的节点相对顺序未变，可跳过 move；其余节点需移动 / 新增
 *
 * LIS 优化把 DOM 移动次数降到最小，是 Vue3 相对 Vue2 双端 diff 的主要改进。
 */

// ===== 极简 mock DOM =====
class MockNode {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.parentNode = null;
    this.textContent = "";
    this._text = tag === "#text";
  }
  appendChild(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
    this.children.push(node);
    node.parentNode = this;
    return node;
  }
  insertBefore(node, ref) {
    if (node.parentNode) node.parentNode.removeChild(node);
    const idx = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(idx, 0, node);
    node.parentNode = this;
    return node;
  }
  removeChild(node) {
    const idx = this.children.indexOf(node);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      node.parentNode = null;
    }
    return node;
  }
}

function h(tag, props, children) {
  props = props || {};
  return { tag, props, children: children || [], key: props.key, elm: null };
}

function sameVnode(a, b) {
  return a.key === b.key && a.tag === b.tag;
}

function createTextElm(text) {
  const n = new MockNode("#text");
  n.textContent = text;
  return n;
}

function createElm(vnode) {
  if (vnode.tag === "#text") {
    vnode.elm = createTextElm(vnode.props.text || "");
  } else {
    const el = new MockNode(vnode.tag);
    if (Array.isArray(vnode.children)) {
      vnode.children.forEach((c) => el.appendChild(createElm(c)));
    }
    vnode.elm = el;
  }
  return vnode.elm;
}

function patchVnode(oldVnode, newVnode) {
  newVnode.elm = oldVnode.elm;
}

// ===== 求最长递增子序列（返回下标数组）=====
// arr[i] === 0 表示对应位置是「新增」节点，不参与 LIS
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI === 0) continue;
    const j = result[result.length - 1];
    if (arr[j] < arrI) {
      p[i] = j;
      result.push(i);
      continue;
    }
    let u = 0;
    let v = result.length - 1;
    while (u < v) {
      const c = (u + v) >> 1;
      if (arr[result[c]] < arrI) u = c + 1;
      else v = c;
    }
    if (arrI < arr[result[u]]) {
      if (u > 0) p[i] = result[u - 1];
      result[u] = i;
    }
  }
  let u = result.length;
  let v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

// ===== 核心 diff =====
function diff(parentElm, oldCh, newCh) {
  let i = 0;
  let e1 = oldCh.length - 1;
  let e2 = newCh.length - 1;

  // 1) 头头同步
  while (i <= e1 && i <= e2 && sameVnode(oldCh[i], newCh[i])) {
    patchVnode(oldCh[i], newCh[i]);
    i++;
  }
  // 2) 尾尾同步
  while (i <= e1 && i <= e2 && sameVnode(oldCh[e1], newCh[e2])) {
    patchVnode(oldCh[e1], newCh[e2]);
    e1--;
    e2--;
  }
  // 3) 旧节点耗尽 —— 新增
  if (i > e1) {
    if (i <= e2) {
      const ref = e2 + 1 < newCh.length ? newCh[e2 + 1].elm : null;
      while (i <= e2) {
        parentElm.insertBefore(createElm(newCh[i]), ref);
        i++;
      }
    }
    return;
  }
  // 新节点耗尽 —— 卸载
  if (i > e2) {
    while (i <= e1) {
      parentElm.removeChild(oldCh[i].elm);
      i++;
    }
    return;
  }

  // 4) 未知子序列
  const s1 = i; // 旧节点起点
  const s2 = i; // 新节点起点
  const keyToNewIndex = {};
  for (let j = s2; j <= e2; j++) {
    keyToNewIndex[newCh[j].key] = j;
  }
  const toBePatched = e2 - s2 + 1;
  const newIndexToOldIndex = new Array(toBePatched).fill(0);
  let moved = false;
  let maxNewIndexSoFar = 0;

  for (let j = s1; j <= e1; j++) {
    const oldV = oldCh[j];
    const newIdx = keyToNewIndex[oldV.key];
    if (newIdx == null) {
      parentElm.removeChild(oldV.elm); // 卸载
    } else {
      newIndexToOldIndex[newIdx - s2] = j + 1; // +1 避免与 0（新增）冲突
      if (newIdx < maxNewIndexSoFar) moved = true;
      else maxNewIndexSoFar = newIdx;
      patchVnode(oldV, newCh[newIdx]);
    }
  }

  const increasingNewIndex = getSequence(newIndexToOldIndex);
  let j = increasingNewIndex.length - 1;
  for (let k = toBePatched - 1; k >= 0; k--) {
    const newIdx = s2 + k;
    const newV = newCh[newIdx];
    const ref = newIdx + 1 < newCh.length ? newCh[newIdx + 1].elm : null;
    if (newIndexToOldIndex[k] === 0) {
      // 新增
      parentElm.insertBefore(createElm(newV), ref);
    } else if (moved) {
      if (j < 0 || k !== increasingNewIndex[j]) {
        parentElm.insertBefore(newV.elm, ref); // 移动
      } else {
        j--;
      }
    }
  }
}

// ===== 序列化 =====
function serialize(node) {
  if (node._text) return node.textContent;
  const inner = node.children.map(serialize).join("");
  return `<${node.tagName}>${inner}</${node.tagName}>`;
}

function build(keys) {
  return keys.map((k) => h("div", { key: k }, [h("#text", { text: k })]));
}

// ===== 测试 =====
// 注意：旧子节点数组必须先 createElm 再作为 diff 的 oldCh 传入，
//       否则 vnode.elm 为 null（不能重新 build 一份新数组）。
// 旧：A B C D E  ->  新：D A B F E
const oldCh1 = build(["A", "B", "C", "D", "E"]);
const c1 = new MockNode("div");
oldCh1.forEach((n) => c1.appendChild(createElm(n)));
console.log("before:", serialize(c1));
diff(c1, oldCh1, build(["D", "A", "B", "F", "E"]));
console.log("after: ", serialize(c1));
// after:  <div><div>D</div><div>A</div><div>B</div><div>F</div><div>E</div></div>

// 倒序：A B C D -> D C B A
const oldCh2 = build(["A", "B", "C", "D"]);
const c2 = new MockNode("div");
oldCh2.forEach((n) => c2.appendChild(createElm(n)));
diff(c2, oldCh2, build(["D", "C", "B", "A"]));
console.log("reverse:", serialize(c2));
// reverse: <div><div>D</div><div>C</div><div>B</div><div>A</div></div>

// 中间插入：A B E -> A B C D E
const oldCh3 = build(["A", "B", "E"]);
const c3 = new MockNode("div");
oldCh3.forEach((n) => c3.appendChild(createElm(n)));
diff(c3, oldCh3, build(["A", "B", "C", "D", "E"]));
console.log("insert:", serialize(c3));
// insert: <div><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div></div>

// 验证 LIS：A B C D E -> E D C B A 时，LIS 长度应为 1，仅 1 个节点无需移动
console.log("LIS of [5,4,3,2,1]:", getSequence([5, 4, 3, 2, 1])); // [0]
console.log("LIS of [2,1,5,3,4]:", getSequence([2, 1, 5, 3, 4])); // 长度 3 的某个序列
