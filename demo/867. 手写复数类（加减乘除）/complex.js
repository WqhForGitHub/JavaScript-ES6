/**
 * 手写复数类（加减乘除）
 * 说明：实现 Complex 类，内部用实部 real 和虚部 imag 表示复数 a + bi。
 *      支持 add / sub / mul / div / conjugate（共轭）/ abs（模）/ toString。
 *      除法通过乘以共轭复数实现，分母为零时抛出错误。
 */

class Complex {
  /**
   * @param {number} real 实部
   * @param {number} [imag=0] 虚部
   */
  constructor(real, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * 加法 (a+bi) + (c+di) = (a+c) + (b+d)i
   * @param {Complex} other
   * @returns {Complex}
   */
  add(other) {
    other = Complex.from(other);
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  /**
   * 减法 (a+bi) - (c+di) = (a-c) + (b-d)i
   * @param {Complex} other
   * @returns {Complex}
   */
  sub(other) {
    other = Complex.from(other);
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  /**
   * 乘法 (a+bi)(c+di) = (ac - bd) + (ad + bc)i
   * @param {Complex} other
   * @returns {Complex}
   */
  mul(other) {
    other = Complex.from(other);
    const { real: a, imag: b } = this;
    const { real: c, imag: d } = other;
    return new Complex(a * c - b * d, a * d + b * c);
  }

  /**
   * 除法 (a+bi)/(c+di) = [(ac+bd) + (bc-ad)i] / (c^2 + d^2)
   * 即分子分母同乘以分母的共轭 (c-di)
   * @param {Complex} other
   * @returns {Complex}
   */
  div(other) {
    other = Complex.from(other);
    const { real: a, imag: b } = this;
    const { real: c, imag: d } = other;
    const denom = c * c + d * d;
    if (denom === 0) throw new Error("除数不能为零");
    return new Complex((a * c + b * d) / denom, (b * c - a * d) / denom);
  }

  /**
   * 共轭复数 a - bi
   * @returns {Complex}
   */
  conjugate() {
    return new Complex(this.real, -this.imag);
  }

  /**
   * 模（绝对值）|a+bi| = sqrt(a^2 + b^2)
   * @returns {number}
   */
  abs() {
    return Math.hypot(this.real, this.imag);
  }

  /**
   * 辐角 arg(a+bi) = atan2(b, a)
   * @returns {number}
   */
  arg() {
    return Math.atan2(this.imag, this.real);
  }

  /**
   * 判等
   * @param {Complex} other
   * @returns {boolean}
   */
  equals(other) {
    other = Complex.from(other);
    return this.real === other.real && this.imag === other.imag;
  }

  /**
   * 转字符串: a+bi / a-bi / 纯实数 / 纯虚数
   * @returns {string}
   */
  toString() {
    const r = this.real;
    const i = this.imag;
    // 纯实数
    if (i === 0) return String(r);
    // 纯虚数
    if (r === 0) {
      if (i === 1) return "i";
      if (i === -1) return "-i";
      return `${i}i`;
    }
    // 一般情况
    const sign = i >= 0 ? "+" : "-";
    const absI = Math.abs(i);
    const iPart = absI === 1 ? "i" : `${absI}i`;
    return `${r} ${sign} ${iPart}`;
  }

  /**
   * 从数值 / Complex 构造
   * @param {Complex|number} value
   * @returns {Complex}
   */
  static from(value) {
    if (value instanceof Complex) return value;
    if (typeof value === "number") return new Complex(value, 0);
    throw new Error("无法转换为 Complex: " + value);
  }

  /** 常量 */
  static get I() {
    return new Complex(0, 1);
  }
  static get ZERO() {
    return new Complex(0, 0);
  }
  static get ONE() {
    return new Complex(1, 0);
  }
}

// ===== 测试 =====
console.log("===== 复数类 测试 =====");
const z1 = new Complex(3, 4);
const z2 = new Complex(1, -2);
console.log("z1 =", z1.toString(), " (期望 3 + 4i)");
console.log("z2 =", z2.toString(), " (期望 1 - 2i)");
console.log("z1 + z2 =", z1.add(z2).toString(), " (期望 4 + 2i)");
console.log("z1 - z2 =", z1.sub(z2).toString(), " (期望 2 + 6i)");
// (3+4i)(1-2i) = 3 -6i +4i -8i^2 = 3 -2i +8 = 11 - 2i
console.log("z1 * z2 =", z1.mul(z2).toString(), " (期望 11 - 2i)");
// (3+4i)/(1-2i) = (3+4i)(1+2i)/(1+4) = (3+6i+4i+8i^2)/5 = (-5+10i)/5 = -1+2i
console.log("z1 / z2 =", z1.div(z2).toString(), " (期望 -1 + 2i)");
console.log("z1 共轭 =", z1.conjugate().toString(), " (期望 3 - 4i)");
console.log("z1 模 |z1| =", z1.abs(), " (期望 5)");
console.log("z2 模 |z2| =", z2.abs(), " (期望 2.23606797749979)");

console.log("纯实数 toString:", new Complex(5, 0).toString(), " (期望 5)");
console.log("纯虚数 toString:", new Complex(0, 3).toString(), " (期望 3i)");
console.log("纯虚数 1i:", new Complex(0, 1).toString(), " (期望 i)");
console.log("纯虚数 -1i:", new Complex(0, -1).toString(), " (期望 -i)");

// 共轭验证除法：(a+bi) * 共轭(a+bi) = |a+bi|^2
console.log("z1 * z1共轭 =", z1.mul(z1.conjugate()).toString(), " (期望 25)");

console.log("i * i =", Complex.I.mul(Complex.I).toString(), " (期望 -1)");
console.log(
  "(1) + (i) =",
  Complex.ONE.add(Complex.I).toString(),
  " (期望 1 + i)",
);

// 除零测试
try {
  z1.div(Complex.ZERO);
} catch (e) {
  console.log("除以零错误:", e.message);
}
