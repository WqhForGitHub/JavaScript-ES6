/**
 * 手写 B 树
 * 性质：多路搜索树，每个节点最多 m 个子节点，最少 m/2 个
 * 实现思路：插入时节点满了就分裂，中间关键字上移
 */
class BTreeNode { constructor(t, leaf) { this.t = t; this.keys = []; this.children = []; this.leaf = leaf; } }
class BTree {
  constructor(t) { this.t = t; this.root = new BTreeNode(t, true); }
  search(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) return true;
    if (node.leaf) return false;
    return this.search(node.children[i], key);
  }
  insert(key) {
    const r = this.root;
    if (r.keys.length === 2 * this.t - 1) {
      const s = new BTreeNode(this.t, false);
      s.children.push(r); this.splitChild(s, 0); this.root = s; this.insertNonFull(s, key);
    } else this.insertNonFull(r, key);
  }
  splitChild(parent, i) {
    const full = parent.children[i]; const newNode = new BTreeNode(this.t, full.leaf);
    const mid = this.t - 1;
    newNode.keys = full.keys.slice(mid + 1); const midKey = full.keys[mid];
    full.keys = full.keys.slice(0, mid);
    if (!full.leaf) { newNode.children = full.children.slice(mid + 1); full.children = full.children.slice(0, mid + 1); }
    parent.keys.splice(i, 0, midKey); parent.children.splice(i + 1, 0, newNode);
  }
  insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.leaf) { node.keys.push(0); while (i >= 0 && key < node.keys[i]) { node.keys[i+1] = node.keys[i]; i--; } node.keys[i+1] = key; }
    else { while (i >= 0 && key < node.keys[i]) i--; i++; if (node.children[i].keys.length === 2*this.t-1) { this.splitChild(node, i); if (key > node.keys[i]) i++; } this.insertNonFull(node.children[i], key); }
  }
  traverse(node, arr) { if (!node) return; let i; for (i = 0; i < node.keys.length; i++) { if (!node.leaf) this.traverse(node.children[i], arr); arr.push(node.keys[i]); } if (!node.leaf) this.traverse(node.children[i], arr); }
}
// ===== 测试 =====
const bt = new BTree(3);
[10,20,5,6,12,30,7,17,25,35,40,50].forEach(v => bt.insert(v));
const r = []; bt.traverse(bt.root, r);
console.log('B树遍历:', r.join(' '));
console.log('search(17):', bt.search(bt.root, 17)); // true
console.log('search(99):', bt.search(bt.root, 99)); // false
