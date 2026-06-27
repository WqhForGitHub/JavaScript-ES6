/**
 * 手写分数类（加减乘除）
 * 说明：实现 Fraction 类，内部用分子/分母（整数）表示。
 *      支持 add / sub / mul / div / reduce（约分）/ reciprocal（倒数）/ toString。
 *      使用 GCD（辗转相除）自动约分，符号统一放在分子上（分母保持非负），
 *      分母为零时抛出错误。
 */

/**
 * 求最大公约数（欧几里得算法）
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

class Fraction {
  /**
   * @param {number} numerator 分子
   * @param {number} [denominator=1] 分母
   */
  constructor(numerator, denominator = 1) {
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      throw new Error("分子分母必须为整数");
    }
    if (denominator === 0) {
      throw new Error("分母不能为零");
    }
    // 规范化符号：分母保持为正
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }
    this.numerator = numerator;
    this.denominator = denominator;
    // 构造时自动约分
    this._reduceInPlace();
  }

  /**
   * 求最大公约数（实例方法）
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  static gcd(a, b) {
    return gcd(a, b);
  }

  /**
   * 原地约分
   * @returns {Fraction} this
   */
  _reduceInPlace() {
    const g = gcd(this.numerator, this.denominator);
    this.numerator = this.numerator / g;
    this.denominator = this.denominator / g;
    return this;
  }

  /**
   * 约分（返回新 Fraction）
   * @returns {Fraction}
   */
  reduce() {
    const g = gcd(this.numerator, this.denominator);
    return new Fraction(this.numerator / g, this.denominator / g);
  }

  /**
   * 加法
   * @param {Fraction} other
   * @returns {Fraction}
   */
  add(other) {
    other = Fraction.from(other);
    const num =
      this.numerator * other.denominator + other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  /**
   * 减法
   * @param {Fraction} other
   * @returns {Fraction}
   */
  sub(other) {
    other = Fraction.from(other);
    const num =
      this.numerator * other.denominator - other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  /**
   * 乘法
   * @param {Fraction} other
   * @returns {Fraction}
   */
  mul(other) {
    other = Fraction.from(other);
    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator,
    );
  }

  /**
   * 除法
   * @param {Fraction} other
   * @returns {Fraction}
   */
  div(other) {
    other = Fraction.from(other);
    if (other.numerator === 0) throw new Error("除数不能为零");
    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator,
    );
  }

  /**
   * 取倒数
   * @returns {Fraction}
   */
  reciprocal() {
    if (this.numerator === 0) throw new Error("零没有倒数");
    return new Fraction(this.denominator, this.numerator);
  }

  /**
   * 转为数值
   * @returns {number}
   */
  toNumber() {
    return this.numerator / this.denominator;
  }

  /**
   * 判等（约分后比较）
   * @param {Fraction} other
   * @returns {boolean}
   */
  equals(other) {
    other = Fraction.from(other);
    return (
      this.numerator === other.numerator &&
      this.denominator === other.denominator
    );
  }

  /**
   * 转字符串
   * @returns {string} 形如 "5/6" 或 "3"
   */
  toString() {
    if (this.denominator === 1) return String(this.numerator);
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * 从数值 / 字符串 / Fraction 构造
   * @param {Fraction|number|string} value
   * @returns {Fraction}
   */
  static from(value) {
    if (value instanceof Fraction) return value;
    if (typeof value === "number") {
      if (Number.isInteger(value)) return new Fraction(value, 1);
      // 有限小数转分数
      const str = String(value);
      const neg = str[0] === "-";
      const dotIdx = str.indexOf(".");
      if (dotIdx === -1) return new Fraction(value, 1);
      const intPart = str.slice(neg ? 1 : 0, dotIdx);
      const fracPart = str.slice(dotIdx + 1);
      const den = Math.pow(10, fracPart.length);
      const num = (neg ? -1 : 1) * (Number(intPart + fracPart) || 0);
      return new Fraction(num, den);
    }
    if (typeof value === "string") {
      if (value.includes("/")) {
        const [n, d] = value.split("/").map((s) => Number(s.trim()));
        return new Fraction(n, d);
      }
      return Fraction.from(Number(value));
    }
    throw new Error("无法转换为 Fraction: " + value);
  }
}

// ===== 测试 =====
console.log("===== 分数类 测试 =====");
const a = new Fraction(1, 2);
const b = new Fraction(1, 3);
console.log("1/2 + 1/3 =", a.add(b).toString(), " (期望 5/6)");
console.log("1/2 - 1/3 =", a.sub(b).toString(), " (期望 1/6)");
console.log("1/2 * 1/3 =", a.mul(b).toString(), " (期望 1/6)");
console.log("1/2 / 1/3 =", a.div(b).toString(), " (期望 3/2)");
console.log("1/2 倒数 =", a.reciprocal().toString(), " (期望 2)");

console.log("4/6 构造自动约分 =", new Fraction(4, 6).toString(), " (期望 2/3)");
console.log(
  "4/6 reduce =",
  new Fraction(4, 6).reduce().toString(),
  " (期望 2/3)",
);

// 负数处理
console.log(
  "-3/4 + 1/4 =",
  new Fraction(-3, 4).add(new Fraction(1, 4)).toString(),
  " (期望 -1/2)",
);
console.log(
  "-3/4 * -1/3 =",
  new Fraction(-3, 4).mul(new Fraction(-1, 3)).toString(),
  " (期望 1/4)",
);

// 符号规范化（分母保持正数）
console.log("1/-2 =", new Fraction(1, -2).toString(), " (期望 -1/2)");
console.log("-1/-2 =", new Fraction(-1, -2).toString(), " (期望 1/2)");

console.log("3/4 toNumber =", new Fraction(3, 4).toNumber(), " (期望 0.75)");
console.log("5/1 toString =", new Fraction(5, 1).toString(), " (期望 5)");

// from 转换
console.log("from(0.5) =", Fraction.from(0.5).toString(), " (期望 1/2)");
console.log('from("3/4") =', Fraction.from("3/4").toString(), " (期望 3/4)");
console.log("from(2) =", Fraction.from(2).toString(), " (期望 2)");

// 判等
console.log(
  "1/2 == 2/4 =",
  new Fraction(1, 2).equals(new Fraction(2, 4)),
  " (期望 true)",
);

// 链式：1/2 + 1/3 - 1/6 = 2/3
console.log(
  "1/2 + 1/3 - 1/6 =",
  a.add(b).sub(new Fraction(1, 6)).toString(),
  " (期望 2/3)",
);

// 分母为零测试
try {
  new Fraction(1, 0);
} catch (e) {
  console.log("分母为零错误:", e.message);
}
