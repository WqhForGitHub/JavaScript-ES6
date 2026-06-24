/**
 * 手写 B+ 树
 * 特点：非叶节点只存索引，数据全在叶子节点，叶子节点用链表相连
 */
class BPlusNode { constructor(leaf) { this.keys = []; this.children = []; this.leaf = leaf; this.next = null; } }
class BPlusTree {
  constructor(t) { this.t = t; this.root = new BPlusNode(true); }
  insert(key, val) {
    const leaf = this.findLeaf(this.root, key);
    let pos = leaf.keys.findIndex(k => k > key);
    if (pos === -1) pos = leaf.keys.length;
    leaf.keys.splice(pos, 0, key); leaf.children.splice(pos, 0, val);
    if (leaf.keys.length >= 2 * this.t) this.splitLeaf(leaf);
  }
  findLeaf(node, key) {
    while (!node.leaf) { let i = 0; while (i < node.keys.length && key >= node.keys[i]) i++; node = node.children[i]; }
    return node;
  }
  splitLeaf(leaf) {
    const newLeaf = new BPlusNode(true); const mid = this.t;
    newLeaf.keys = leaf.keys.slice(mid); newLeaf.children = leaf.children.slice(mid);
    leaf.keys = leaf.keys.slice(0, mid); leaf.children = leaf.children.slice(0, mid);
    newLeaf.next = leaf.next; leaf.next = newLeaf;
    const upKey = newLeaf.keys[0];
    if (leaf === this.root) { const newRoot = new BPlusNode(false); newRoot.keys = [upKey]; newRoot.children = [leaf, newLeaf]; this.root = newRoot; }
    else { this.insertIntoParent(leaf, upKey, newLeaf); }
  }
  insertIntoParent(left, key, right) {
    const parent = this.findParent(this.root, left);
    if (!parent) return;
    let pos = parent.keys.findIndex(k => k > key); if (pos === -1) pos = parent.keys.length;
    parent.keys.splice(pos, 0, key); parent.children.splice(pos + 1, 0, right);
    if (parent.keys.length >= 2 * this.t) this.splitInternal(parent);
  }
  splitInternal(node) {
    const newNode = new BPlusNode(false); const mid = this.t;
    const upKey = node.keys[mid];
    newNode.keys = node.keys.slice(mid + 1); newNode.children = node.children.slice(mid + 1);
    node.keys = node.keys.slice(0, mid); node.children = node.children.slice(0, mid + 1);
    if (node === this.root) { const newRoot = new BPlusNode(false); newRoot.keys = [upKey]; newRoot.children = [node, newNode]; this.root = newRoot; }
    else this.insertIntoParent(node, upKey, newNode);
  }
  findParent(node, child) {
    if (node.leaf || node.children.includes(child)) return node.children.includes(child) ? node : null;
    for (const c of node.children) { const r = this.findParent(c, child); if (r) return r; }
    return null;
  }
  rangeQuery(start, end) {
    const leaf = this.findLeaf(this.root, start); const result = [];
    let cur = leaf;
    while (cur) { for (let i = 0; i < cur.keys.length; i++) { if (cur.keys[i] >= start && cur.keys[i] <= end) result.push({ key: cur.keys[i], val: cur.children[i] }); if (cur.keys[i] > end) return result; } cur = cur.next; }
    return result;
  }
}
// ===== 测试 =====
const bpt = new BPlusTree(3);
[[1,'a'],[3,'c'],[5,'e'],[7,'g'],[9,'i'],[2,'b'],[4,'d'],[6,'f'],[8,'h'],[10,'j']].forEach(([k,v]) => bpt.insert(k,v));
console.log('范围查询 3-7:', bpt.rangeQuery(3, 7).map(x => x.key + '=' + x.val).join(', '));
