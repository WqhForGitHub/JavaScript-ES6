/**
 * 手写布谷鸟过滤器
 * 功能：支持动态添加和删除的近似集合查询
 * 实现：每个桶多个槽位，两个哈希函数，踢出机制
 */
class CuckooFilter {
  constructor(size = 1024, bucketSize = 4) {
    this.size = size;
    this.bucketSize = bucketSize;
    this.buckets = Array.from({ length: size }, () => []);
    this.count = 0;
    this.maxKicks = 500;
  }
  hash1(item) {
    let h = 0;
    for (let i = 0; i < item.length; i++)
      h = (h * 31 + item.charCodeAt(i)) & 0x7fffffff;
    return h % this.size;
  }
  fingerprint(item) {
    let f = 0;
    for (let i = 0; i < item.length; i++)
      f = ((f * 17 + item.charCodeAt(i)) & 0xffff) + 1;
    return f;
  }
  altIndex(fp, idx) {
    let h = 0;
    const s = String(fp);
    for (let i = 0; i < s.length; i++)
      h = (h * 37 + s.charCodeAt(i)) & 0x7fffffff;
    return (idx ^ h) % this.size;
  }
  insert(item) {
    const fp = this.fingerprint(item);
    const i1 = this.hash1(item);
    const i2 = this.altIndex(fp, i1);
    if (this.buckets[i1].length < this.bucketSize) {
      this.buckets[i1].push(fp);
      this.count++;
      return true;
    }
    if (this.buckets[i2].length < this.bucketSize) {
      this.buckets[i2].push(fp);
      this.count++;
      return true;
    }
    let idx = Math.random() < 0.5 ? i1 : i2;
    let curFp = fp;
    for (let n = 0; n < this.maxKicks; n++) {
      const r = Math.floor(Math.random() * this.buckets[idx].length);
      [curFp, this.buckets[idx][r]] = [this.buckets[idx][r], curFp];
      idx = this.altIndex(curFp, idx);
      if (this.buckets[idx].length < this.bucketSize) {
        this.buckets[idx].push(curFp);
        this.count++;
        return true;
      }
    }
    return false;
  }
  contains(item) {
    const fp = this.fingerprint(item);
    const i1 = this.hash1(item);
    const i2 = this.altIndex(fp, i1);
    return this.buckets[i1].includes(fp) || this.buckets[i2].includes(fp);
  }
  remove(item) {
    const fp = this.fingerprint(item);
    const i1 = this.hash1(item);
    const i2 = this.altIndex(fp, i1);
    for (const idx of [i1, i2]) {
      const pos = this.buckets[idx].indexOf(fp);
      if (pos !== -1) {
        this.buckets[idx].splice(pos, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }
}
// ===== 测试 =====
const cf = new CuckooFilter();
["apple", "banana", "cherry", "date"].forEach((x) => cf.insert(x));
console.log('contains("apple"):', cf.contains("apple")); // true
console.log('contains("grape"):', cf.contains("grape")); // false
cf.remove("apple");
console.log('删除后 contains("apple"):', cf.contains("apple")); // false
