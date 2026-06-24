/**
 * 手写深拷贝（处理 RegExp、Date、Map、Set 等）
 *
 * 作用：
 *   - 深拷贝对象，正确处理多种内置类型
 *   - 同时处理循环引用与共享引用
 *
 * 支持的类型：
 *   - 基本类型：number / string / boolean / null / undefined / symbol / bigint
 *   - 引用类型：Object / Array
 *   - 特殊类型：Date / RegExp / Map / Set / Error / Buffer
 *   - 原始值包装：String / Number / Boolean（取 valueOf）
 *   - 函数：直接返回（通常不深拷贝函数）
 *
 * 实现思路：
 *   1. 用缓存 Map 处理循环/共享引用
 *   2. 根据 Object.prototype.toString 判断具体类型
 *   3. 对每种类型用对应构造函数重建
 */

function deepCloneFull(obj, cache = new Map()) {
  // 1. 基本类型与函数直接返回
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 2. 循环引用 / 共享引用
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  // 3. 精确类型判断
  const tag = Object.prototype.toString.call(obj);

  // —— 基础特殊类型：通过构造函数或工厂方法重建 ——
  switch (tag) {
    case "[object Date]": {
      return new Date(obj.getTime());
    }
    case "[object RegExp]": {
      // flags 包含 global/ignoreCase/multiline 等
      return new RegExp(obj.source, obj.flags);
    }
    case "[object Error]": {
      const err = new obj.constructor(obj.message);
      err.stack = obj.stack;
      return err;
    }
    case "[object Boolean]": {
      return new Boolean(obj.valueOf());
    }
    case "[object Number]": {
      return new Number(obj.valueOf());
    }
    case "[object String]": {
      return new String(obj.valueOf());
    }
    case "[object ArrayBuffer]": {
      return obj.slice(0);
    }
    case "[object Int8Array]":
    case "[object Uint8Array]":
    case "[object Uint8ClampedArray]":
    case "[object Int16Array]":
    case "[object Uint16Array]":
    case "[object Int32Array]":
    case "[object Uint32Array]":
    case "[object Float32Array]":
    case "[object Float64Array]": {
      const TypedArray = obj.constructor;
      return new TypedArray(obj);
    }
  }

  // 4. Map：键值都需深拷贝
  if (tag === "[object Map]") {
    const clone = new Map();
    cache.set(obj, clone);
    obj.forEach((value, key) => {
      clone.set(deepCloneFull(key, cache), deepCloneFull(value, cache));
    });
    return clone;
  }

  // 5. Set：元素需深拷贝
  if (tag === "[object Set]") {
    const clone = new Set();
    cache.set(obj, clone);
    obj.forEach((value) => {
      clone.add(deepCloneFull(value, cache));
    });
    return clone;
  }

  // 6. 普通对象 / 数组 / 自定义类实例
  // 保留原型：用 Object.getPrototypeOf 重建
  const proto = Object.getPrototypeOf(obj);
  const clone = Array.isArray(obj) ? [] : Object.create(proto);
  cache.set(obj, clone); // 先存缓存，防循环引用

  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    clone[key] = deepCloneFull(obj[key], cache);
  }

  return clone;
}

// ===== 测试 =====

// 普通对象 + 数组
const data = {
  num: 1,
  str: "hi",
  arr: [1, 2, { x: 3 }],
  nested: { a: { b: 2 } },
};
const dataCopy = deepCloneFull(data);
console.log(dataCopy.nested === data.nested); // false
console.log(dataCopy.arr[2] === data.arr[2]); // false

// Date
const d = new Date("2024-01-01");
const dCopy = deepCloneFull(d);
console.log(dCopy.getTime() === d.getTime()); // true
console.log(dCopy === d); // false

// RegExp
const re = /abc/gi;
const reCopy = deepCloneFull(re);
console.log(reCopy.source); // 'abc'
console.log(reCopy.flags); // 'gi'
console.log(reCopy === re); // false

// Map
const m = new Map([["k1", { v: 1 }], [{ k: "obj" }, "v2"]]);
const mCopy = deepCloneFull(m);
console.log(mCopy.get("k1")); // { v: 1 }
console.log(mCopy.get("k1") === m.get("k1")); // false（值被深拷贝）
console.log(mCopy.size === m.size); // true

// Set
const s = new Set([1, { a: 2 }, [3, 4]]);
const sCopy = deepCloneFull(s);
console.log(sCopy.size); // 3
sCopy.forEach((v) => {
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    console.log(v.a); // 2
    console.log(v === [...s].find((x) => typeof x === "object" && x && x.a === 2)); // false
  }
});

// 循环引用
const cyclic = { name: "c" };
cyclic.self = cyclic;
const cCopy = deepCloneFull(cyclic);
console.log(cCopy.self === cCopy); // true

// 保留原型 / 自定义类
class Point {
  constructor(x, y) { this.x = x; this.y = y; }
  sum() { return this.x + this.y; }
}
const p = new Point(1, 2);
const pCopy = deepCloneFull(p);
console.log(pCopy.sum()); // 3（原型方法可用）
console.log(pCopy instanceof Point); // true

// 原始值包装
const boxedStr = new String("abc");
const boxedCopy = deepCloneFull(boxedStr);
console.log(boxedCopy.valueOf()); // 'abc'
console.log(boxedCopy instanceof String); // true
