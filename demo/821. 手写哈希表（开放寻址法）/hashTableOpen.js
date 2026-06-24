/**
 * 手写哈希表（开放寻址法）
 * 冲突解决：线性探测法
 * 扩容：当负载因子 > 0.75 时扩容
 */
class HashTableOpen {
  constructor(size = 16) { this.size = size; this.count = 0; this.keys = new Array(size); this.values = new Array(size); this.deleted = new Array(size).fill(false); }
  hash(key) { let h = 0; const s = String(key); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h % this.size; }
  set(key, value) {
    if (this.count / this.size > 0.75) this.resize(this.size * 2);
    let idx = this.hash(key);
    while (this.keys[idx] !== undefined && !this.deleted[idx] && this.keys[idx] !== key) idx = (idx + 1) % this.size;
    if (this.keys[idx] === undefined || this.deleted[idx]) { this.count++; this.deleted[idx] = false; }
    this.keys[idx] = key; this.values[idx] = value;
  }
  get(key) { let idx = this.hash(key); let probes = 0; while (probes < this.size) { if (this.keys[idx] === undefined) return undefined; if (!this.deleted[idx] && this.keys[idx] === key) return this.values[idx]; idx = (idx + 1) % this.size; probes++; } return undefined; }
  delete(key) { let idx = this.hash(key); let probes = 0; while (probes < this.size) { if (this.keys[idx] === undefined) return false; if (!this.deleted[idx] && this.keys[idx] === key) { this.deleted[idx] = true; this.count--; return true; } idx = (idx + 1) % this.size; probes++; } return false; }
  resize(newSize) { const oldKeys = this.keys, oldValues = this.values, oldDeleted = this.deleted; this.size = newSize; this.count = 0; this.keys = new Array(newSize); this.values = new Array(newSize); this.deleted = new Array(newSize).fill(false); for (let i = 0; i < oldKeys.length; i++) { if (oldKeys[i] !== undefined && !oldDeleted[i]) this.set(oldKeys[i], oldValues[i]); } }
}
// ===== 测试 =====
const ht = new HashTableOpen();
ht.set('name', 'Alice'); ht.set('age', 30); ht.set('city', 'Beijing');
console.log('get("name"):', ht.get('name')); // Alice
console.log('get("age"):', ht.get('age')); // 30
ht.delete('age'); console.log('删除后 get("age"):', ht.get('age')); // undefined
console.log('count:', ht.count); // 2
