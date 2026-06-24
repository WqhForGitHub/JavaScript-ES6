/**
 * 手写稀疏表（Sparse Table）
 * 功能：O(1) 静态区间最值查询（RMQ），不支持修改
 * 原理：st[i][j] = 区间 [i, i+2^j-1] 的最值
 */
class SparseTable {
  constructor(arr) {
    this.n = arr.length; this.log = new Array(arr.length + 1);
    this.log[1] = 0; for (let i = 2; i <= arr.length; i++) this.log[i] = this.log[i >> 1] + 1;
    const K = this.log[arr.length] + 1;
    this.st = []; for (let i = 0; i < arr.length; i++) { this.st[i] = new Array(K); this.st[i][0] = arr[i]; }
    for (let j = 1; j < K; j++) for (let i = 0; i + (1 << j) <= arr.length; i++) this.st[i][j] = Math.max(this.st[i][j-1], this.st[i + (1 << (j-1))][j-1]);
  }
  query(l, r) {
    const k = this.log[r - l + 1];
    return Math.max(this.st[l][k], this.st[r - (1 << k) + 1][k]);
  }
}
// ===== 测试 =====
const rmq = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]);
console.log('RMQ(0,5):', rmq.query(0, 5)); // 9
console.log('RMQ(2,4):', rmq.query(2, 4)); // 5
console.log('RMQ(0,9):', rmq.query(0, 9)); // 9
