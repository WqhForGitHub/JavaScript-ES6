/**
 * 手写对象反扁平化
 *
 * 作用：
 *   - 将扁平化的对象还原为嵌套对象
 *   - 例如 { 'a.b': 1 } → { a: { b: 1 } }
 *   - 例如 { 'a.b.c': 2, d: 3 } → { a: { b: { c: 2 } }, d: 3 }
 *
 * 规则：
 *   - key 以 '.' 分隔，逐层创建嵌套对象
 *   - 数组索引路径（如 'a.0'）会被还原为数组
 *   - 与 flattenObject 互为逆操作
 *
 * 实现思路：
 *   1. 遍历扁平对象的每个 key
 *   2. 用 '.' split 得到路径段数组
 *   3. 逐层深入：若路径段是数字索引则用数组，否则用对象
 *   4. 到达最后一层时赋值
 */

function isIndexKey(seg) {
  // 纯数字字符串（如 '0', '1', '12'）视为数组索引
  return /^\d+$/.test(seg);
}

function unflattenObject(flat) {
  if (flat === null || typeof flat !== "object" || Array.isArray(flat)) {
    return flat;
  }

  const result = {};

  for (const key of Object.keys(flat)) {
    const value = flat[key];
    const segments = key.split(".");

    let current = result;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLast = i === segments.length - 1;
      const useArray = isIndexKey(seg);

      if (isLast) {
        // 最后一层：赋值
        if (useArray) {
          if (!Array.isArray(current)) {
            // current 此时是对象，转为数组容器（罕见情况，保留为对象赋值）
          }
          current[seg] = value;
        } else {
          current[seg] = value;
        }
      } else {
        // 中间层：创建下一层容器
        const nextSeg = segments[i + 1];
        const nextIsIndex = isIndexKey(nextSeg);
        const nextContainer = nextIsIndex ? [] : {};

        if (current[seg] === undefined || current[seg] === null) {
          current[seg] = nextContainer;
        } else if (nextIsIndex && !Array.isArray(current[seg])) {
          // 已存在对象但下一层需要数组：保留对象（避免破坏已有结构）
        } else if (!nextIsIndex && Array.isArray(current[seg])) {
          // 已存在数组但下一层需要对象：保留数组
        }

        current = current[seg];
      }
    }
  }

  return result;
}

// ===== 测试 =====

console.log(unflattenObject({ "a.b": 1 }));
// { a: { b: 1 } }

console.log(unflattenObject({ "a.b.c": 2, d: 3 }));
// { a: { b: { c: 2 } }, d: 3 }

console.log(unflattenObject({ a: 1, b: 2, c: 3 }));
// { a: 1, b: 2, c: 3 }

// 数组路径还原
console.log(unflattenObject({ "a.0": 1, "a.1": 2, "a.2": 3 }));
// { a: [1, 2, 3] }

// 混合：对象与数组
console.log(unflattenObject({ "user.name": "Tom", "tags.0": "a", "tags.1": "b" }));
// { user: { name: 'Tom' }, tags: ['a', 'b'] }

// 多层混合
console.log(unflattenObject({
  "level1.level2.level3": "deep",
  "level1.level2.num": 42,
  top: true,
}));
// { level1: { level2: { level3: 'deep', num: 42 } }, top: true }

// 与 flatten 互逆验证
const { flattenObject } = (() => {
  // 内联一个简易 flatten 以验证互逆
  function isObject(v) { return v !== null && typeof v === "object"; }
  function flt(obj, prefix = "", res = {}) {
    if (!isObject(obj)) return obj;
    if (Array.isArray(obj)) {
      if (obj.length === 0) { res[prefix] = []; return res; }
      obj.forEach((v, i) => {
        const p = prefix ? `${prefix}.${i}` : String(i);
        if (isObject(v)) flt(v, p, res); else res[p] = v;
      });
      return res;
    }
    if (Object.keys(obj).length === 0) { res[prefix] = {}; return res; }
    for (const k of Object.keys(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (isObject(obj[k])) flt(obj[k], p, res); else res[p] = obj[k];
    }
    return res;
  }
  return { flattenObject: flt };
})();

const original = { a: { b: { c: 1 } }, d: [10, 20] };
const flat = flattenObject(original);
const restored = unflattenObject(flat);
console.log(restored); // { a: { b: { c: 1 } }, d: [10, 20] }
