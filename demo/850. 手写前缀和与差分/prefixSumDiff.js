/**
 * 手写前缀和与差分
 * 前缀和：O(1) 区间求和
 * 差分：O(1) 区间加值
 */
class PrefixSum {
  constructor(arr) { this.prefix = [0]; for (const v of arr) this.prefix.push(this.prefix[this.prefix.length - 1] + v); }
  query(l, r) { return this.prefix[r + 1] - this.prefix[l]; }
}
class Difference {
  constructor(n) { this.n = n; this.diff = new Array(n + 1).fill(0); }
  static fromArray(arr) { const d = new Difference(arr.length); d.diff[0] = arr[0]; for (let i = 1; i < arr.length; i++) d.diff[i] = arr[i] - arr[i-1]; return d; }
  add(l, r, val) { this.diff[l] += val; if (r + 1 <= this.n) this.diff[r + 1] -= val; }
  toArray() { const arr = new Array(this.n); arr[0] = this.diff[0]; for (let i = 1; i < this.n; i++) arr[i] = arr[i-1] + this.diff[i]; return arr; }
}
// 二维前缀和
class PrefixSum2D {
  constructor(matrix) {
    this.m = matrix.length; this.n = matrix[0].length;
    this.prefix = Array.from({ length: this.m + 1 }, () => new Array(this.n + 1).fill(0));
    for (let i = 1; i <= this.m; i++) for (let j = 1; j <= this.n; j++)
      this.prefix[i][j] = matrix[i-1][j-1] + this.prefix[i-1][j] + this.prefix[i][j-1] - this.prefix[i-1][j-1];
  }
  query(r1, c1, r2, c2) { return this.prefix[r2+1][c2+1] - this.prefix[r1][c2+1] - this.prefix[r2+1][c1] + this.prefix[r1][c1]; }
}
// ===== 测试 =====
const ps = new PrefixSum([1, 3, 5, 7, 9]);
console.log('区间和 [1,3]:', ps.query(1, 3)); // 15
const diff = Difference.fromArray([1, 2, 3, 4, 5]);
diff.add(1, 3, 10);
console.log('区间加后:', diff.toArray()); // [1, 12, 13, 14, 5]
const ps2d = new PrefixSum2D([[1,2,3],[4,5,6],[7,8,9]]);
console.log('二维区间和 [0,0]-[1,1]:', ps2d.query(0, 0, 1, 1)); // 12
