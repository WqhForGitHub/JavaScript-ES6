/**
 * 手写对象路径赋值 set
 *
 * 作用：
 *   - 按路径（如 'a.b.c' 或 ['a','b','c']）给对象深层赋值
 *   - 路径中间不存在的层级自动创建对象
 *   - 类似 lodash.set
 *
 * 实现思路：
 *   1. 统一路径为数组（复用 get 的 parsePath 思路）
 *   2. 逐层深入：若中间层不存在或不是对象，则创建 {}
 *   3. 到达最后一层赋值
 *   4. 返回原对象
 *
 * 注意：
 *   - 路径段为数字索引时会创建数组（这里简化为统一用对象，可选支持数组）
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

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function setObject(obj, path, value) {
  if (!isObject(obj)) {
    return obj;
  }

  const segments = parsePath(path);
  if (segments.length === 0) return obj;

  let current = obj;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    if (isLast) {
      current[seg] = value;
    } else {
      // 中间层：若不存在或非对象，则创建新对象
      if (!isObject(current[seg]) && !Array.isArray(current[seg])) {
        // 下一层是数字索引 → 创建数组，否则创建对象
        const nextIsIndex = /^\d+$/.test(segments[i + 1]);
        current[seg] = nextIsIndex ? [] : {};
      }
      current = current[seg];
    }
  }

  return obj;
}

// ===== 测试 =====

// 基本深层赋值
const obj1 = {};
setObject(obj1, "a.b.c", 42);
console.log(obj1); // { a: { b: { c: 42 } } }

// 已存在的路径赋值
const obj2 = { a: { b: { c: 1 } } };
setObject(obj2, "a.b.c", 99);
console.log(obj2); // { a: { b: { c: 99 } } }

// 路径中间不存在自动创建
const obj3 = {};
setObject(obj3, "x.y.z.w", "deep");
console.log(obj3); // { x: { y: { z: { w: 'deep' } } } }

// 数组路径（字符串形式）
const obj4 = {};
setObject(obj4, "arr[0]", "first");
setObject(obj4, "arr[1]", "second");
console.log(obj4); // { arr: ['first', 'second'] }

// 数组路径（数组形式）
const obj5 = {};
setObject(obj5, ["user", "name"], "Tom");
console.log(obj5); // { user: { name: 'Tom' } }

// 覆盖非对象中间值
const obj6 = { a: { b: 1 } };
setObject(obj6, "a.b.c", 2);
console.log(obj6); // { a: { b: { c: 2 } } }（b 被替换为对象）

// 返回原对象
const target = {};
const returned = setObject(target, "a", 1);
console.log(returned === target); // true

// 混合数组与对象
const obj7 = {};
setObject(obj7, "list[0].name", "item1");
setObject(obj7, "list[1].name", "item2");
console.log(obj7);
// { list: [ { name: 'item1' }, { name: 'item2' } ] }
