/**
 * 手写对象遍历（包括 Symbol 属性）
 *
 * 作用：
 *   - 遍历对象的所有自有属性，包括字符串属性和 Symbol 属性
 *   - 可选是否包含不可枚举属性
 *
 * 各 API 对比：
 *   - Object.keys / for...in        ：只可枚举字符串属性（for...in 含继承）
 *   - Object.getOwnPropertyNames     ：所有字符串属性（含不可枚举）
 *   - Object.getOwnPropertySymbols   ：所有 Symbol 属性（含不可枚举）
 *   - Reflect.ownKeys                ：所有字符串 + Symbol 属性（含不可枚举）
 *
 * 实现思路：
 *   1. 用 Reflect.ownKeys 获取所有自有 key（字符串 + Symbol）
 *   2. 根据参数决定是否过滤不可枚举
 *   3. 对每个 key 执行回调
 */

// 方式1：用 Reflect.ownKeys（最简洁）
function forEachOwnKey(obj, callback, { includeNonEnumerable = false } = {}) {
  if (obj === null || typeof obj !== "object") {
    return;
  }

  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    if (!includeNonEnumerable) {
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc && !desc.enumerable) continue;
    }
    callback(key, obj[key], obj);
  }
}

// 方式2：手动组合 getOwnPropertyNames + getOwnPropertySymbols（体现原理）
function forEachOwnKeyManual(
  obj,
  callback,
  { includeNonEnumerable = false } = {},
) {
  if (obj === null || typeof obj !== "object") {
    return;
  }

  const isEnumerable = Object.prototype.propertyIsEnumerable;

  // 字符串属性
  const stringKeys = Object.getOwnPropertyNames(obj);
  for (const key of stringKeys) {
    if (!includeNonEnumerable && !isEnumerable.call(obj, key)) continue;
    callback(key, obj[key], obj);
  }

  // Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const key of symbolKeys) {
    if (!includeNonEnumerable && !isEnumerable.call(obj, key)) continue;
    callback(key, obj[key], obj);
  }
}

// 转为 entries 数组（含 Symbol）
function toEntriesWithSymbols(obj, { includeNonEnumerable = false } = {}) {
  const entries = [];
  forEachOwnKey(
    obj,
    (key, value) => {
      entries.push([key, value]);
    },
    { includeNonEnumerable },
  );
  return entries;
}

// ===== 测试 =====

const strSym = Symbol("stringSym");
const hiddenSym = Symbol("hiddenSym");

const obj = {
  name: "Tom",
  age: 20,
  [strSym]: "symValue",
};
Object.defineProperty(obj, "hidden", { value: "secret", enumerable: false });
Object.defineProperty(obj, hiddenSym, {
  value: "hiddenSymValue",
  enumerable: false,
});

// 默认只遍历可枚举属性（含 Symbol）
console.log("--- 可枚举属性（含 Symbol）---");
forEachOwnKey(obj, (key, value) => {
  console.log(String(key), "=>", value);
});
// name => Tom
// age => 20
// Symbol(stringSym) => symValue

// 包含不可枚举属性
console.log("--- 含不可枚举属性 ---");
forEachOwnKey(
  obj,
  (key, value) => {
    console.log(String(key), "=>", value);
  },
  { includeNonEnumerable: true },
);
// name, age, Symbol(stringSym), hidden, Symbol(hiddenSym)

// 转为 entries
console.log(toEntriesWithSymbols(obj));
// [['name','Tom'], ['age',20], [Symbol(stringSym),'symValue']]

// 对比原生各 API
console.log("Object.keys:", Object.keys(obj)); // ['name', 'age']（不含 Symbol、不可枚举）
console.log("getOwnPropertyNames:", Object.getOwnPropertyNames(obj)); // ['name','age','hidden']（含不可枚举字符串）
console.log(
  "getOwnPropertySymbols:",
  Object.getOwnPropertySymbols(obj).map(String),
); // 含两个 Symbol
console.log("Reflect.ownKeys:", Reflect.ownKeys(obj).map(String)); // 全部

// 数组也可遍历（含 length 等不可枚举）
console.log("--- 数组遍历 ---");
const arr = ["a", "b"];
const arrSym = Symbol("arrSym");
arr[arrSym] = "sym";
forEachOwnKey(
  arr,
  (key, value) => {
    console.log(String(key), "=>", value);
  },
  { includeNonEnumerable: true },
);
// 0 => a, 1 => b, length => 2, Symbol(arrSym) => sym

// 手动版与 Reflect 版结果一致
const a = [];
const b = [];
forEachOwnKey(obj, (k, v) => a.push([k, v]));
forEachOwnKeyManual(obj, (k, v) => b.push([k, v]));
console.log(a.length === b.length); // true
