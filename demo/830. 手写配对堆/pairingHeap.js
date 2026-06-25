/**
 * 手写配对堆
 * 特点：实现简单，O(1) 插入/查找最小值，均摊 O(logN) 删除
 * 结构：树形，子节点用链表连接
 */
class PairingNode {
  constructor(val) {
    this.val = val;
    this.child = null;
    this.sibling = null;
    this.prev = null;
  }
}
class PairingHeap {
  constructor(compare = (a, b) => a - b) {
    this.root = null;
    this.compare = compare;
    this.size = 0;
  }
  merge(h1, h2) {
    if (!h1) return h2;
    if (!h2) return h1;
    if (this.compare(h1.val, h2.val) > 0) [h1, h2] = [h2, h1];
    h2.sibling = h1.child;
    h2.prev = h1;
    if (h1.child) h1.child.prev = h2;
    h1.child = h2;
    h1.sibling = null;
    h1.prev = null;
    return h1;
  }
  push(val) {
    this.root = this.merge(this.root, new PairingNode(val));
    this.size++;
  }
  top() {
    return this.root ? this.root.val : null;
  }
  pop() {
    if (!this.root) return undefined;
    const val = this.root.val;
    this.root = this._twoPassMerge(this.root.child);
    this.size--;
    return val;
  }
  _twoPassMerge(node) {
    if (!node) return null;
    const trees = [];
    let cur = node;
    while (cur) {
      const next = cur.sibling;
      cur.sibling = null;
      cur.prev = null;
      trees.push(cur);
      cur = next;
    }
    let i = 0;
    const merged = [];
    while (i + 1 < trees.length) {
      merged.push(this.merge(trees[i], trees[i + 1]));
      i += 2;
    }
    if (i < trees.length) merged.push(trees[i]);
    let result = merged[merged.length - 1];
    for (let j = merged.length - 2; j >= 0; j--)
      result = this.merge(merged[j], result);
    return result;
  }
}
// ===== 测试 =====
const ph = new PairingHeap();
[5, 3, 7, 1, 9, 2, 8].forEach((v) => ph.push(v));
console.log("top:", ph.top()); // 1
const sorted = [];
while (ph.size > 0) sorted.push(ph.pop());
console.log("全部弹出:", sorted); // [1,2,3,5,7,8,9]
