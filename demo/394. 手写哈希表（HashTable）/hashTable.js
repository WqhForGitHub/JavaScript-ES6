/**
 * 手写哈希表（HashTable）
 *
 * 哈希表通过哈希函数将 key 映射到数组索引，实现接近 O(1) 的查找/插入/删除。
 * 本实现采用链地址法（拉链法）解决哈希冲突：每个桶存储一个数组（链表）。
 * 哈希函数使用 djb2 算法，对大素数取模以分散分布。
 */

class HashTable {
  constructor(size = 53) {
    this.buckets = new Array(size);
    for (let i = 0; i < size; i++) {
      this.buckets[i] = [];
    }
    this.count = 0;
  }

  // djb2 哈希函数
  _hash(key) {
    const keyStr = String(key);
    let hash = 5381;
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash * 33) ^ keyStr.charCodeAt(i);
    }
    return Math.abs(hash) % this.buckets.length;
  }

  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    // 若 key 已存在则更新
    for (const pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value;
        return this;
      }
    }
    bucket.push([key, value]);
    this.count++;
    return this;
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    for (const pair of bucket) {
      if (pair[0] === key) return pair[1];
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }

  get size() {
    return this.count;
  }

  keys() {
    const result = [];
    for (const bucket of this.buckets) {
      for (const pair of bucket) {
        result.push(pair[0]);
      }
    }
    return result;
  }

  values() {
    const result = [];
    for (const bucket of this.buckets) {
      for (const pair of bucket) {
        result.push(pair[1]);
      }
    }
    return result;
  }
}

// 测试
const ht = new HashTable();
ht.set('apple', 10).set('banana', 20).set('orange', 30);
console.log(ht.get('apple')); // 10
console.log(ht.get('banana')); // 20
console.log(ht.size); // 3
console.log(ht.has('orange')); // true

ht.set('apple', 99); // 更新
console.log(ht.get('apple')); // 99
console.log(ht.size); // 3

console.log(ht.delete('banana')); // true
console.log(ht.has('banana')); // false

console.log(ht.keys());   // ['apple', 'orange']
console.log(ht.values()); // [99, 30]
