/**
 * 手写左偏树（左偏堆）
 * 性质：左偏性质 - 左子节点距离 >= 右子节点距离
 * 功能：可合并的优先队列 O(logN) merge
 */
class LeftistNode { constructor(val) { this.val = val; this.left = null; this.right = null; this.dist = 0; } }
class LeftistTree {
  constructor(compare = (a, b) => a - b) { this.root = null; this.compare = compare; this.size = 0; }
  getDist(node) { return node ? node.dist : -1; }
  merge(h1, h2) {
    if (!h1) return h2; if (!h2) return h1;
    if (this.compare(h1.val, h2.val) > 0) [h1, h2] = [h2, h1];
    h1.right = this.merge(h1.right, h2);
    if (this.getDist(h1.left) < this.getDist(h1.right)) [h1.left, h1.right] = [h1.right, h1.left];
    h1.dist = this.getDist(h1.right) + 1;
    return h1;
  }
  push(val) { this.root = this.merge(this.root, new LeftistNode(val)); this.size++; }
  pop() { if (!this.root) return undefined; const val = this.root.val; this.root = this.merge(this.root.left, this.root.right); this.size--; return val; }
  top() { return this.root ? this.root.val : null; }
  mergeWith(other) { this.root = this.merge(this.root, other.root); this.size += other.size; other.root = null; other.size = 0; }
}
// ===== 测试 =====
const lt = new LeftistTree();
[5, 3, 7, 1, 9, 2, 8].forEach(v => lt.push(v));
console.log('top:', lt.top()); // 1
console.log('pop:', lt.pop()); // 1
console.log('pop:', lt.pop()); // 2
const lt2 = new LeftistTree();
[4, 6, 0].forEach(v => lt2.push(v));
lt.mergeWith(lt2);
console.log('合并后 top:', lt.top()); // 0
