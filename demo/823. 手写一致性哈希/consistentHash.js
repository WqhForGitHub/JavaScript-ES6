/**
 * 手写一致性哈希
 * 功能：分布式缓存节点分配，增删节点时最小化数据迁移
 * 实现：哈希环 + 虚拟节点解决数据倾斜
 */
class ConsistentHash {
  constructor(virtualNodes = 150) {
    this.ring = new Map();
    this.sortedKeys = [];
    this.virtualNodes = virtualNodes;
    this.nodes = new Set();
  }
  hash(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++)
      h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff;
    return h;
  }
  addNode(node) {
    if (this.nodes.has(node)) return;
    this.nodes.add(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const vKey = node + "#" + i;
      const h = this.hash(vKey);
      this.ring.set(h, node);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }
  removeNode(node) {
    if (!this.nodes.has(node)) return;
    this.nodes.delete(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this.hash(node + "#" + i);
      this.ring.delete(h);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }
  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    const h = this.hash(key);
    let lo = 0,
      hi = this.sortedKeys.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sortedKeys[mid] >= h) hi = mid;
      else lo = mid + 1;
    }
    if (this.sortedKeys[lo] < h) lo = 0;
    return this.ring.get(this.sortedKeys[lo]);
  }
  getDistribution(keys) {
    const dist = {};
    for (const k of keys) {
      const n = this.getNode(k);
      dist[n] = (dist[n] || 0) + 1;
    }
    return dist;
  }
}
// ===== 测试 =====
const ch = new ConsistentHash(100);
["node1", "node2", "node3"].forEach((n) => ch.addNode(n));
const keys = Array.from({ length: 10000 }, (_, i) => "key" + i);
let dist = ch.getDistribution(keys);
console.log("3节点分布:", dist);
ch.addNode("node4");
dist = ch.getDistribution(keys);
console.log("加node4后:", dist);
