/**
 * 手写二项堆
 * 结构：二项树森林 B0, B1, B2...
 * B_k 由两个 B_{k-1} 合并而成
 */
class BinomialNode {
  constructor(key) {
    this.key = key;
    this.degree = 0;
    this.parent = null;
    this.child = null;
    this.sibling = null;
  }
}
class BinomialHeap {
  constructor() {
    this.head = null;
    this.n = 0;
  }
  insert(key) {
    const node = new BinomialNode(key);
    this.head = this._mergeHeads(this.head, node);
    this._union();
    this.n++;
  }
  _mergeHeads(h1, h2) {
    if (!h1) return h2;
    if (!h2) return h1;
    let head;
    if (h1.degree <= h2.degree) {
      head = h1;
      h1 = h1.sibling;
    } else {
      head = h2;
      h2 = h2.sibling;
    }
    let tail = head;
    while (h1 && h2) {
      if (h1.degree <= h2.degree) {
        tail.sibling = h1;
        h1 = h1.sibling;
      } else {
        tail.sibling = h2;
        h2 = h2.sibling;
      }
      tail = tail.sibling;
    }
    tail.sibling = h1 || h2;
    return head;
  }
  _linkTree(y, z) {
    y.parent = z;
    y.sibling = z.child;
    z.child = y;
    z.degree++;
  }
  _union() {
    if (!this.head) return;
    let prev = null,
      cur = this.head,
      next = cur.sibling;
    while (next) {
      if (
        cur.degree !== next.degree ||
        (next.sibling && next.sibling.degree === cur.degree)
      ) {
        prev = cur;
        cur = next;
      } else if (cur.key <= next.key) {
        cur.sibling = next.sibling;
        this._linkTree(next, cur);
      } else {
        if (!prev) this.head = next;
        else prev.sibling = next;
        this._linkTree(cur, next);
        cur = next;
      }
      next = cur.sibling;
    }
  }
  findMin() {
    let min = this.head;
    let cur = this.head;
    while (cur) {
      if (cur.key < min.key) min = cur;
      cur = cur.sibling;
    }
    return min ? min.key : null;
  }
  extractMin() {
    if (!this.head) return null;
    let minNode = this.head,
      minPrev = null,
      prev = null,
      cur = this.head;
    while (cur) {
      if (cur.key < minNode.key) {
        minNode = cur;
        minPrev = prev;
      }
      prev = cur;
      cur = cur.sibling;
    }
    if (minPrev) minPrev.sibling = minNode.sibling;
    else this.head = minNode.sibling;
    let child = minNode.child;
    let prevChild = null;
    while (child) {
      const next = child.sibling;
      child.sibling = prevChild;
      child.parent = null;
      prevChild = child;
      child = next;
    }
    this.head = this._mergeHeads(this.head, prevChild);
    this._union();
    this.n--;
    return minNode.key;
  }
}
// ===== 测试 =====
const bh = new BinomialHeap();
[7, 2, 8, 1, 5, 3, 9, 4].forEach((v) => bh.insert(v));
console.log("min:", bh.findMin()); // 1
console.log("extractMin:", bh.extractMin()); // 1
console.log("extractMin:", bh.extractMin()); // 2
console.log("min:", bh.findMin()); // 3
