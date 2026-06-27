/**
 * 手写矩阵类（乘法、转置、行列式）
 * 说明：实现 Matrix 类，内部用二维数组存储。
 *      支持 multiply（矩阵乘法）、transpose（转置）、determinant（行列式，递归按行展开）、
 *      identity（单位矩阵）、add（加法）、scale（数乘）、toString。
 *      维度不匹配时抛出错误。
 */

class Matrix {
  /**
   * @param {number[][]} data 二维数组
   */
  constructor(data) {
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("矩阵数据必须是二维数组");
    }
    const cols = data[0].length;
    for (const row of data) {
      if (!Array.isArray(row) || row.length !== cols) {
        throw new Error("矩阵每一行长度必须相同");
      }
    }
    this.data = data.map((row) => row.slice());
    this.rows = data.length;
    this.cols = cols;
  }

  /**
   * 从二维数组构造
   * @param {number[][]} data
   * @returns {Matrix}
   */
  static from(data) {
    return new Matrix(data);
  }

  /**
   * 单位矩阵
   * @param {number} n
   * @returns {Matrix}
   */
  static identity(n) {
    const data = [];
    for (let i = 0; i < n; i++) {
      const row = new Array(n).fill(0);
      row[i] = 1;
      data.push(row);
    }
    return new Matrix(data);
  }

  /**
   * 零矩阵
   * @param {number} rows
   * @param {number} cols
   * @returns {Matrix}
   */
  static zeros(rows, cols) {
    return new Matrix(
      Array.from({ length: rows }, () => new Array(cols).fill(0)),
    );
  }

  /**
   * 矩阵乘法 C = A * B（要求 A.cols === B.rows）
   * @param {Matrix} other
   * @returns {Matrix}
   */
  multiply(other) {
    if (!(other instanceof Matrix)) other = new Matrix(other);
    if (this.cols !== other.rows) {
      throw new Error(
        `维度不匹配: ${this.rows}x${this.cols} * ${other.rows}x${other.cols}`,
      );
    }
    const result = [];
    for (let i = 0; i < this.rows; i++) {
      const row = new Array(other.cols).fill(0);
      for (let k = 0; k < this.cols; k++) {
        const a = this.data[i][k];
        if (a === 0) continue;
        for (let j = 0; j < other.cols; j++) {
          row[j] += a * other.data[k][j];
        }
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * 转置
   * @returns {Matrix}
   */
  transpose() {
    const result = [];
    for (let j = 0; j < this.cols; j++) {
      const row = [];
      for (let i = 0; i < this.rows; i++) {
        row.push(this.data[i][j]);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * 删除第 r 行第 c 列得到子矩阵（用于行列式展开）
   * @param {number} r
   * @param {number} c
   * @returns {Matrix}
   */
  _subMatrix(r, c) {
    const result = [];
    for (let i = 0; i < this.rows; i++) {
      if (i === r) continue;
      const row = [];
      for (let j = 0; j < this.cols; j++) {
        if (j === c) continue;
        row.push(this.data[i][j]);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * 行列式（递归按第一行展开，仅方阵）
   * 时间复杂度 O(n!)，适合小矩阵；对整数矩阵结果精确
   * @returns {number}
   */
  determinant() {
    if (this.rows !== this.cols) {
      throw new Error("行列式仅对方阵定义");
    }
    const n = this.rows;
    if (n === 1) return this.data[0][0];
    if (n === 2) {
      return (
        this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0]
      );
    }
    // 按第一行展开
    let det = 0;
    for (let j = 0; j < n; j++) {
      const sub = this._subMatrix(0, j);
      const sign = j % 2 === 0 ? 1 : -1;
      det += sign * this.data[0][j] * sub.determinant();
    }
    return det;
  }

  /**
   * 矩阵加法
   * @param {Matrix} other
   * @returns {Matrix}
   */
  add(other) {
    if (!(other instanceof Matrix)) other = new Matrix(other);
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("矩阵加法要求维度相同");
    }
    return new Matrix(
      this.data.map((row, i) => row.map((v, j) => v + other.data[i][j])),
    );
  }

  /**
   * 标量乘法
   * @param {number} k
   * @returns {Matrix}
   */
  scale(k) {
    return new Matrix(this.data.map((row) => row.map((v) => v * k)));
  }

  /**
   * 判等
   * @param {Matrix} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Matrix)) other = new Matrix(other);
    if (this.rows !== other.rows || this.cols !== other.cols) return false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.data[i][j] !== other.data[i][j]) return false;
      }
    }
    return true;
  }

  /**
   * 转字符串
   * @returns {string}
   */
  toString() {
    return (
      "[\n" +
      this.data.map((row) => "  [" + row.join(", ") + "]").join(",\n") +
      "\n]"
    );
  }
}

// ===== 测试 =====
console.log("===== 矩阵类 测试 =====");

const A = Matrix.from([
  [1, 2, 3],
  [4, 5, 6],
]);
const B = Matrix.from([
  [7, 8],
  [9, 10],
  [11, 12],
]);
console.log("A =");
console.log(A.toString());
console.log("A * B =");
console.log(A.multiply(B).toString());
// 期望: [[58, 64], [139, 154]]

console.log("A 转置 =");
console.log(A.transpose().toString());
// 期望: [[1,4],[2,5],[3,6]]

const I = Matrix.identity(3);
console.log("3x3 单位矩阵 =");
console.log(I.toString());

const C = Matrix.from([
  [1, 2],
  [3, 4],
]);
console.log("det([[1,2],[3,4]]) =", C.determinant(), " (期望 -2)");

const D = Matrix.from([
  [6, 1, 1],
  [4, -2, 5],
  [2, 8, 7],
]);
console.log("det(3x3) =", D.determinant(), " (期望 -306)");
// 验证: 6*((-2)*7 - 5*8) - 1*(4*7 - 5*2) + 1*(4*8 - (-2)*2)
//     = 6*(-54) - 18 + 36 = -306

const E = Matrix.from([
  [3, 0, 0],
  [0, 4, 0],
  [0, 0, 5],
]);
console.log("det(对角阵) =", E.determinant(), " (期望 60)");

// 单位矩阵验证: I * D = D
console.log("I*D == D:", I.multiply(D).equals(D), " (期望 true)");

// 维度错误测试
try {
  A.multiply(C);
} catch (e) {
  console.log("乘法维度错误:", e.message);
}
