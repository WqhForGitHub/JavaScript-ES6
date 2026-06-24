/**
 * 手写斐波那契堆
 * 功能：O(1) 插入/减小键值，O(logN) 提取最小值
 * 结构：一组最小堆有序树组成的森林 + circular doubly linked list
 */
class FibNode { constructor(key) { this.key = key; this.parent = null; this.child = null; this.left = this; this.right = this; this.degree = 0; this.mark = false; } }
class FibonacciHeap {
  constructor() { this.min = null; this.n = 0; }
  insert(key) { const node = new FibNode(key); if (!this.min) this.min = node; else { this._addToRootList(node); if (node.key < this.min.key) this.min = node; } this.n++; return node; }
  _addToRootList(node) { node.left = this.min; node.right = this.min.right; this.min.right.left = node; this.min.right = node; }
  extractMin() { const z = this.min; if (!z) return null; if (z.child) { let c = z.child; do { const next = c.right; c.parent = null; this._addToRootList(c); c = next; } while (c !== z.child); } this._removeFromList(z); if (z === z.right) this.min = null; else { this.min = z.right; this._consolidate(); } this.n--; return z.key; }
  _removeFromList(node) { node.left.right = node.right; node.right.left = node.left; }
  _consolidate() { const A = {}; let nodes = []; let cur = this.min; do { nodes.push(cur); cur = cur.right; } while (cur !== this.min); for (const w of nodes) { let x = w; let d = x.degree; while (A[d] !== undefined) { const y = A[d]; if (x.key > y.key) [x, y] = [y, x]; this._link(y, x); delete A[d]; d++; } A[d] = x; } this.min = null; for (const d in A) { if (!this.min || A[d].key < this.min.key) this.min = A[d]; } }
  _link(y, x) { this._removeFromList(y); y.parent = x; if (!x.child) { x.child = y; y.left = y; y.right = y; } else { y.left = x.child; y.right = x.child.right; x.child.right.left = y; x.child.right = y; } x.degree++; y.mark = false; }
  getMin() { return this.min ? this.min.key : null; }
  size() { return this.n; }
}
// ===== 测试 =====
const fh = new FibonacciHeap();
[3, 7, 1, 9, 5, 2, 8].forEach(v => fh.insert(v));
console.log('min:', fh.getMin()); // 1
console.log('extractMin:', fh.extractMin()); // 1
console.log('extractMin:', fh.extractMin()); // 2
console.log('min after:', fh.getMin()); // 3
