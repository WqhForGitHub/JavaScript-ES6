/**
 * 手写深合并（deepMerge）
 *
 * 作用：
 *   - 递归合并多个对象
 *   - 当属性值都是普通对象时，递归合并而非覆盖
 *   - 后面对象的属性覆盖前面（基本类型值直接覆盖）
 *   - 数组通常按索引覆盖（这里采用"后者覆盖前者"策略）
 *
 * 应用场景：
 *   - 配置合并（默认配置 + 用户配置）
 *   - 类似 lodash.merge / Object.assign 的深版本
 *
 * 实现思路：
 *   1. 遍历每个 source 的自有可枚举属性
 *   2. 若 target[key] 和 source[key] 都是普通对象 → 递归合并
 *   3. 否则用 source[key] 覆盖 target[key]（深拷贝避免引用污染）
 *   4. 返回 target
 */

function isPlainObject(val) {
  if (val === null || typeof val !== "object") return false;
  const proto = Object.getPrototypeOf(val);
  // 普通对象：原型为 Object.prototype 或 null
  return proto === Object.prototype || proto === null;
}

// 深拷贝一个值（简化版，复用之前的思路）
function cloneValue(val, cache = new Map()) {
  if (val === null || typeof val !== "object") return val;
  if (cache.has(val)) return cache.get(val);

  if (Array.isArray(val)) {
    const arr = [];
    cache.set(val, arr);
    val.forEach((v) => arr.push(cloneValue(v, cache)));
    return arr;
  }

  if (isPlainObject(val)) {
    const obj = {};
    cache.set(val, obj);
    for (const k of Reflect.ownKeys(val)) {
      obj[k] = cloneValue(val[k], cache);
    }
    return obj;
  }

  // Date / RegExp 等
  if (val instanceof Date) return new Date(val.getTime());
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  return val; // 其他直接返回引用
}

function deepMerge(target, ...sources) {
  if (!isPlainObject(target) && !Array.isArray(target)) {
    target = {};
  }

  for (const source of sources) {
    if (source === null || source === undefined) continue;
    if (!isPlainObject(source)) continue;

    for (const key of Reflect.ownKeys(source)) {
      const srcVal = source[key];
      const tgtVal = target[key];

      if (isPlainObject(srcVal)) {
        // 源是普通对象：若目标也是普通对象则递归合并，否则用源深拷贝替换
        if (isPlainObject(tgtVal)) {
          target[key] = deepMerge({}, tgtVal, srcVal);
        } else {
          target[key] = cloneValue(srcVal);
        }
      } else if (Array.isArray(srcVal)) {
        // 数组：用源的深拷贝替换（也可改为按索引合并，按需求而定）
        target[key] = cloneValue(srcVal);
      } else {
        // 基本类型 / 其他：直接赋值
        target[key] = srcVal;
      }
    }
  }

  return target;
}

// ===== 测试 =====

// 基本深合并
const r1 = deepMerge({ a: 1, b: { x: 1 } }, { b: { y: 2 }, c: 3 });
console.log(r1); // { a: 1, b: { x: 1, y: 2 }, c: 3 }

// 后者覆盖前者（基本类型）
const r2 = deepMerge({ a: 1, b: 2 }, { b: 99 });
console.log(r2); // { a: 1, b: 99 }

// 多层嵌套递归合并
const r3 = deepMerge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } });
console.log(r3); // { a: { b: { c: 1, d: 2 } } }

// 不修改源对象（深拷贝避免引用污染）
const src = { nested: { x: 1 } };
const r4 = deepMerge({}, src);
r4.nested.x = 999;
console.log(src.nested.x); // 1（源未被修改）

// 数组合并策略：后者替换前者
const r5 = deepMerge({ list: [1, 2, 3] }, { list: [4] });
console.log(r5.list); // [4]

// 多个源
const r6 = deepMerge({ a: 1 }, { b: 2 }, { c: { d: 3 } }, { c: { e: 4 } });
console.log(r6); // { a: 1, b: 2, c: { d: 3, e: 4 } }

// 合并配置的典型场景
const defaultConfig = {
  url: "/api",
  method: "GET",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
};
const userConfig = {
  method: "POST",
  headers: { Authorization: "Bearer token" },
};
const finalConfig = deepMerge({}, defaultConfig, userConfig);
console.log(finalConfig);
// { url: '/api', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' }, timeout: 5000 }
