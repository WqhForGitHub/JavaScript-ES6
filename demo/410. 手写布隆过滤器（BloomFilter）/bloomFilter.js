/**
 * 手写布隆过滤器（BloomFilter）
 *
 * 布隆过滤器是一种空间高效的概率型数据结构，用于判断元素"可能存在"或"一定不存在"。
 * 原理：使用 k 个独立哈希函数将元素映射到位数组的 k 个位置，置为 1。
 * 查询时若所有对应位都为 1，则"可能存在"（有假阳性）；若有任一位为 0，则"一定不存在"。
 * 不支持删除。优点：空间和查询时间均为常数级。
 * 本实现使用 k 个哈希函数（基于不同种子），位数组用 Uint8Array。
 */

class BloomFilter {
  constructor(size = 1024, hashCount = 4) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(size); // 每个元素代表 1 位（0/1）
  }

  // 简单哈希函数（基于 FNV-1a 变种 + 种子）
  _hash(value, seed) {
    const str = String(value);
    let hash = 2166136261 ^ seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash) % this.size;
  }

  // 获取 k 个哈希位置
  _getPositions(value) {
    const positions = [];
    for (let i = 0; i < this.hashCount; i++) {
      positions.push(this._hash(value, i * 131 + 7));
    }
    return positions;
  }

  add(value) {
    const positions = this._getPositions(value);
    for (const pos of positions) {
      this.bitArray[pos] = 1;
    }
  }

  // 返回 true 表示"可能存在"，false 表示"一定不存在"
  mightContain(value) {
    const positions = this._getPositions(value);
    for (const pos of positions) {
      if (this.bitArray[pos] === 0) return false;
    }
    return true;
  }
}

// 测试
const bf = new BloomFilter(2048, 5);

// 添加元素
["apple", "banana", "cherry", "date"].forEach((v) => bf.add(v));

// 存在的元素应返回 true
console.log(bf.mightContain("apple")); // true
console.log(bf.mightContain("banana")); // true
console.log(bf.mightContain("cherry")); // true
console.log(bf.mightContain("date")); // true

// 不存在的元素大概率返回 false（极小概率假阳性）
console.log(bf.mightContain("grape")); // false
console.log(bf.mightContain("orange")); // false
console.log(bf.mightContain("kiwi")); // false

// 统计假阳性率（大量随机数据）
const bf2 = new BloomFilter(10000, 5);
const existing = new Set();
for (let i = 0; i < 1000; i++) {
  bf2.add("item_" + i);
  existing.add("item_" + i);
}
let falsePositive = 0;
let total = 0;
for (let i = 1000; i < 11000; i++) {
  total++;
  if (bf2.mightContain("item_" + i)) falsePositive++;
}
console.log("假阳性率: " + ((falsePositive / total) * 100).toFixed(2) + "%"); // 应较低
