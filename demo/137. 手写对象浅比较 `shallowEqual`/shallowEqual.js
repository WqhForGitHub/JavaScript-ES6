/**
 * 手写对象浅比较 shallowEqual
 *
 * 作用：
 *   - 比较两个对象/数组的"第一层"是否相等
 *   - 只比较自身可枚举属性的个数与值（引用相等或基本类型 ===）
 *   - 不递归比较嵌套对象
 *
 * 应用场景：
 *   - React 的 shouldComponentUpdate / memo 性能优化
 *   - Redux 的 connect 默认比较
 *
 * 实现思路：
 *   1. Object.is 处理 NaN、+0/-0、同引用等
 *   2. 都不是对象则用 === 比较
 *   3. 键数量不同直接 false
 *   4. 逐个比较 key 的值是否 Object.is 相等
 */

function is(x, y) {
  // Object.is 处理 NaN !== NaN 但 Object.is(NaN, NaN) === true
  // 以及 +0 !== -0 但 Object.is(+0, -0) === false
  if (x === y) {
    // 区分 +0 和 -0
    return x !== 0 || 1 / x === 1 / y;
  }
  // 处理 NaN
  return x !== x && y !== y;
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  // 其中一个不是对象，或为 null，则不相等（已排除全等的情况）
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // 键数量不同
  if (keysA.length !== keysB.length) {
    return false;
  }

  // 逐个比较：B 必须有 A 的每个 key，且值浅相等
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !is(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

// ===== 测试 =====

// 基本相等
console.log(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })); // true
console.log(shallowEqual({ a: 1 }, { a: 1, b: 2 })); // false（键数量不同）

// 同引用
const same = { x: 1 };
console.log(shallowEqual(same, same)); // true

// 嵌套对象：浅比较只比引用，不递归
const nested1 = { a: { x: 1 } };
const nested2 = { a: { x: 1 } };
console.log(shallowEqual(nested1, nested2)); // false（a 引用不同）
console.log(shallowEqual({ a: nested1.a }, { a: nested1.a })); // true（同引用）

// 数组浅比较
console.log(shallowEqual([1, 2, 3], [1, 2, 3])); // true
console.log(shallowEqual([1, 2], [1, 2, 3])); // false

// NaN 处理
console.log(shallowEqual({ a: NaN }, { a: NaN })); // true

// +0 / -0
console.log(shallowEqual({ a: 0 }, { a: -0 })); // false

// 不同类型
console.log(shallowEqual(1, 1)); // true
console.log(shallowEqual(1, "1")); // false
console.log(shallowEqual(null, null)); // true
console.log(shallowEqual({}, null)); // false

// 顺序无关
console.log(shallowEqual({ a: 1, b: 2 }, { b: 2, a: 1 })); // true

// 属性值类型不同
console.log(shallowEqual({ a: 1 }, { a: "1" })); // false
