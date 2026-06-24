/**
 * 手写对象按路径判断是否存在 has
 *
 * 作用：
 *   - 按路径判断对象上是否存在该属性
 *   - 路径上每一层都存在才算 true
 *   - 类似 lodash.has
 *
 * 与直接用 in 的区别：
 *   - 'a.b.c' in obj 不支持点路径，只能判断单层
 *   - has 支持深层路径
 *
 * 实现思路：
 *   1. 统一路径为数组
 *   2. 逐层用 in / hasOwnProperty 判断
 *   3. 任一层不存在返回 false，全部存在返回 true
 *
 * 注意：本实现判断的是属性是否存在（含值为 undefined 的情况），
 *       用 hasOwnProperty + in 组合保证准确。
 */

function parsePath(path) {
  if (Array.isArray(path)) {
    return path.map(String);
  }
  if (typeof path !== "string") {
    return [];
  }
  const result = [];
  const segments = path.split(".");
  for (const seg of segments) {
    const match = seg.match(/^([^\[]*)((?:\[\d+\])*)$/);
    if (!match) {
      result.push(seg);
      continue;
    }
    if (match[1]) result.push(match[1]);
    if (match[2]) {
      const indices = match[2].match(/\[(\d+)\]/g) || [];
      for (const idx of indices) {
        result.push(idx.slice(1, -1));
      }
    }
  }
  return result;
}

function hasObject(obj, path) {
  if (obj === null || typeof obj !== "object") {
    return false;
  }

  const segments = parsePath(path);
  if (segments.length === 0) return false;

  let current = obj;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // 用 Object.prototype.hasOwnProperty 判断自身属性
    // 这里使用 in 以兼容数组索引及原型链属性判断
    if (current === null || typeof current !== "object") {
      return false;
    }
    if (!(seg in current)) {
      return false;
    }
    current = current[seg];
  }

  return true;
}

// ===== 测试 =====

const obj = {
  a: {
    b: {
      c: 1,
      nil: null,
      undef: undefined,
    },
    arr: [10, 20],
  },
};

// 存在的深层路径
console.log(hasObject(obj, "a.b.c")); // true
console.log(hasObject(obj, "a.b")); // true
console.log(hasObject(obj, "a")); // true

// 不存在的路径
console.log(hasObject(obj, "a.b.z")); // false
console.log(hasObject(obj, "x.y.z")); // false

// 值为 null 但属性存在
console.log(hasObject(obj, "a.b.nil")); // true

// 值为 undefined 但属性存在
console.log(hasObject(obj, "a.b.undef")); // true

// 数组路径
console.log(hasObject(obj, "a.arr[0]")); // true
console.log(hasObject(obj, "a.arr[5]")); // false（越界）

// 数组路径形式
console.log(hasObject(obj, ["a", "arr", 1])); // true
console.log(hasObject(obj, ["a", "arr", 10])); // false

// 中间为 null
const obj2 = { a: null };
console.log(hasObject(obj2, "a.b")); // false（a 是 null，无法继续）

// obj 为 null
console.log(hasObject(null, "a.b")); // false
console.log(hasObject(undefined, "a.b")); // false
