/**
 * 手写 Object.assign
 *
 * 原生 Object.assign 的作用：
 *   - 将多个源对象的可枚举自有属性复制到目标对象
 *   - 后面的源会覆盖前面同名的属性（浅拷贝）
 *   - 返回目标对象（已被修改）
 *
 * 实现思路：
 *   1. 将 target 包装为对象（toObject）
 *   2. 遍历每个 source，取其可枚举自有属性
 *   3. 浅拷贝到 target（直接赋值）
 *   4. 返回 target
 *
 * 注意：
 *   - 浅拷贝：属性值是对象时，只复制引用
 *   - Symbol 属性：原生 Object.assign 会复制，这里也支持
 *   - null/undefined 源会被跳过
 */

function myObjectAssign(target, ...sources) {
  if (target === null || target === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  const to = Object(target);

  for (const source of sources) {
    // null / undefined 源直接跳过
    if (source === null || source === undefined) continue;

    const from = Object(source);

    // 使用 Reflect.ownKeys 同时获取字符串 key 和 Symbol key
    // 原生 Object.assign 会拷贝 Symbol 属性
    const keys = Reflect.ownKeys(from);

    for (const key of keys) {
      // 仅复制可枚举的自有属性
      const desc = Object.getOwnPropertyDescriptor(from, key);
      if (desc && desc.enumerable) {
        to[key] = from[key]; // 浅拷贝（赋值）
      }
    }
  }

  return to;
}

// ===== 测试 =====

// 基本合并
console.log(myObjectAssign({ a: 1 }, { b: 2 })); // { a: 1, b: 2 }

// 后者覆盖前者
console.log(myObjectAssign({ a: 1, b: 2 }, { b: 3, c: 4 })); // { a: 1, b: 3, c: 4 }

// 多个源
console.log(myObjectAssign({}, { a: 1 }, { b: 2 }, { c: 3 })); // { a: 1, b: 2, c: 3 }

// 浅拷贝验证
const src = { nested: { x: 1 } };
const dest = myObjectAssign({}, src);
dest.nested.x = 999;
console.log(src.nested.x); // 999（浅拷贝，引用同一对象）

// Symbol 属性也会被复制
const sym = Symbol("s");
const s = { [sym]: "symVal" };
const d = myObjectAssign({}, s);
console.log(d[sym]); // 'symVal'

// 不可枚举属性不复制
const withNonEnum = {};
Object.defineProperty(withNonEnum, "hidden", { value: "x", enumerable: false });
const result = myObjectAssign({}, withNonEnum);
console.log(result.hidden); // undefined

// null / undefined 源被跳过
console.log(myObjectAssign({ a: 1 }, null, undefined, { b: 2 })); // { a: 1, b: 2 }

// 返回的就是 target 本身
const target = {};
const returned = myObjectAssign(target, { a: 1 });
console.log(returned === target); // true

// target 为 null/undefined 抛错
try {
  myObjectAssign(null, { a: 1 });
} catch (e) {
  console.log(e.message); // Cannot convert undefined or null to object
}
