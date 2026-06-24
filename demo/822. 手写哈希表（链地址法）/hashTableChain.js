/**
 * 手写哈希表（链地址法）
 * 冲突解决：每个桶存链表
 */
class HashNode { constructor(key, val) { this.key = key; this.val = val; this.next = null; } }
class HashTableChain {
  constructor(size = 16) { this.size = size; this.buckets = new Array(size).fill(null); this.count = 0; }
  hash(key) { let h = 0; const s = String(key); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h % this.size; }
  set(key, value) {
    const idx = this.hash(key); let node = this.buckets[idx];
    while (node) { if (node.key === key) { node.val = value; return; } node = node.next; }
    const newNode = new HashNode(key, value); newNode.next = this.buckets[idx]; this.buckets[idx] = newNode; this.count++;
    if (this.count / this.size > 0.75) this.resize(this.size * 2);
  }
  get(key) { let node = this.buckets[this.hash(key)]; while (node) { if (node.key === key) return node.val; node = node.next; } return undefined; }
  delete(key) { const idx = this.hash(key); let node = this.buckets[idx], prev = null; while (node) { if (node.key === key) { if (prev) prev.next = node.next; else this.buckets[idx] = node.next; this.count--; return true; } prev = node; node = node.next; } return false; }
  resize(newSize) { const old = this.buckets; this.size = newSize; this.buckets = new Array(newSize).fill(null); this.count = 0; for (const head of old) { let node = head; while (node) { this.set(node.key, node.val); node = node.next; } } }
}
// ===== 测试 =====
const ht = new HashTableChain();
ht.set('a', 1); ht.set('b', 2); ht.set('c', 3); ht.set('d', 4);
console.log('get("a"):', ht.get('a')); // 1
console.log('get("d"):', ht.get('d')); // 4
ht.delete('b'); console.log('删除b后 get("b"):', ht.get('b')); // undefined
console.log('count:', ht.count); // 3
