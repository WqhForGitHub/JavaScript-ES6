/**
 * 手写 hasOwnProperty 实现
 *
 * 原生 hasOwnProperty 的作用：
 *   - 判断某个属性是否是对象自身的属性（而非继承自原型链）
 *   - 不区分可枚举性，只看是否"自有"
 *   - 对 Symbol 属性同样有效
 *
 * 为什么不能直接用 obj.hasOwnProperty？
 *   - 对象可能没有原型（Object.create(null)），访问不到 hasOwnProperty
 *   - 对象可能自己覆盖了 hasOwnProperty 方法
 *   - 推荐：Object.prototype.hasOwnProperty.call(obj, key)
 *
 * 实现思路：
 *   1. 通过 Object.prototype.hasOwnProperty.call 调用，避免被覆盖
 *   2. 也可以借助 Object.getOwnPropertyDescriptor：自有属性才有描述符
 */

function myHasOwnProperty(obj, key) {
  if (obj === null || obj === undefined) {
    return false;
  }

  // 方式1：借助 Object.prototype.hasOwnProperty（最稳妥）
  // return Object.prototype.hasOwnProperty.call(Object(obj), key);

  // 方式2：借助 getOwnPropertyDescriptor，自有属性才有描述符
  const desc = Object.getOwnPropertyDescriptor(Object(obj), key);
  return desc !== undefined;
}

// ===== 测试 =====

const obj = { a: 1, b: 2 };
console.log(myHasOwnProperty(obj, "a")); // true
console.log(myHasOwnProperty(obj, "c")); // false

// 不可枚举的自有属性也算
Object.defineProperty(obj, "hidden", { value: 3, enumerable: false });
console.log(myHasOwnProperty(obj, "hidden")); // true

// 继承属性不算
const proto = { inherited: 1 };
const child = Object.create(proto);
console.log(myHasOwnProperty(child, "inherited")); // false
child.inherited = 2; // 添加自身属性
console.log(myHasOwnProperty(child, "inherited")); // true

// Symbol 属性
const sym = Symbol("s");
obj[sym] = "sym";
console.log(myHasOwnProperty(obj, sym)); // true

// 无原型对象也能用（避免 obj.hasOwnProperty 报错）
const noProto = Object.create(null);
noProto.x = 1;
console.log(myHasOwnProperty(noProto, "x")); // true
console.log(myHasOwnProperty(noProto, "y")); // false

// 对象自己覆盖了 hasOwnProperty 方法时不影响结果
const tricky = { hasOwnProperty: () => "I'm fake" };
tricky.real = 1;
console.log(myHasOwnProperty(tricky, "real")); // true（不受覆盖影响）

// null / undefined 安全
console.log(myHasOwnProperty(null, "a")); // false
console.log(myHasOwnProperty(undefined, "a")); // false
