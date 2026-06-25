/**
 * 手写计数型布隆过滤器
 * 功能：支持删除的布隆过滤器
 * 实现：用计数器数组代替位数组，插入+1，删除-1
 */
class CountingBloomFilter {
  constructor(size = 1024, hashCount = 7) {
    this.size = size;
    this.hashCount = hashCount;
    this.counters = new Array(size).fill(0);
  }
  _hash(key, seed) {
    let h = seed;
    for (let i = 0; i < key.length; i++)
      h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff;
    return h % this.size;
  }
  _getIndices(key) {
    return Array.from({ length: this.hashCount }, (_, i) =>
      this._hash(key, i + 1),
    );
  }
  add(key) {
    for (const idx of this._getIndices(key)) this.counters[idx]++;
  }
  contains(key) {
    return this._getIndices(key).every((idx) => this.counters[idx] > 0);
  }
  remove(key) {
    if (!this.contains(key)) return false;
    for (const idx of this._getIndices(key)) this.counters[idx]--;
    return true;
  }
}
// ===== 测试 =====
const cbf = new CountingBloomFilter(2048, 5);
["hello", "world", "foo", "bar"].forEach((x) => cbf.add(x));
console.log('contains("hello"):', cbf.contains("hello")); // true
console.log('contains("baz"):', cbf.contains("baz")); // false
cbf.remove("hello");
console.log('删除后 contains("hello"):', cbf.contains("hello")); // false
console.log('contains("world"):', cbf.contains("world")); // true
