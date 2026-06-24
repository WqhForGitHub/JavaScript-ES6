/**
 * 手写对象路径删除 unset
 *
 * 作用：
 *   - 按路径删除对象的深层属性
 *   - 路径不存在不报错，返回 true
 *   - 类似 lodash.unset
 *
 * 实现思路：
 *   1. 统一路径为数组
 *   2. 逐层深入到倒数第二层
 *   3. 在最后一层 delete 该属性
 *   4. 若中间路径不存在，直接返回（无可删属性）
 *
 * 返回值：始终返回 true（与 lodash.unset 行为一致）
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

function unsetObject(obj, path) {
  if (obj === null || typeof obj !== "object") {
    return true;
  }

  const segments = parsePath(path);
  if (segments.length === 0) return true;

  let current = obj;

  // 走到倒数第二层
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (current[seg] === null || current[seg] === undefined) {
      return true; // 路径中断，无属性可删
    }
    current = current[seg];
    if (current === null || typeof current !== "object") {
      return true; // 中间不是对象，无法继续
    }
  }

  // 删除最后一层属性
  const lastSeg = segments[segments.length - 1];
  if (current !== null && typeof current === "object") {
    delete current[lastSeg];
  }

  return true;
}

// ===== 测试 =====

const obj = {
  a: {
    b: {
      c: 1,
      d: 2,
    },
    arr: [10, 20, 30],
  },
  top: "keep",
};

// 删除深层属性
unsetObject(obj, "a.b.c");
console.log(obj.a.b); // { d: 2 }（c 已删除）

// 删除路径不存在（不报错）
unsetObject(obj, "a.b.x.y.z");
console.log(obj.a.b); // { d: 2 }

// 删除数组元素（用 delete 留下空位）
unsetObject(obj, "a.arr[1]");
console.log(obj.a.arr); // [10, <1 empty item>, 30]
console.log(1 in obj.a.arr); // false（索引 1 已删除）

// 删除顶层属性
unsetObject(obj, "top");
console.log(obj.top); // undefined
console.log("top" in obj); // false

// 数组路径形式
const obj2 = { x: { y: { z: 99 } } };
unsetObject(obj2, ["x", "y", "z"]);
console.log(obj2); // { x: { y: {} } }

// 中间为 null
const obj3 = { a: null };
unsetObject(obj3, "a.b.c");
console.log(obj3); // { a: null }（无变化）

// 始终返回 true
console.log(unsetObject({}, "nope.nada")); // true
