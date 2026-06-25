/**
 * 手写深拷贝函数（Deep Clone）
 *
 * 深拷贝 vs 浅拷贝：
 *   - 浅拷贝只复制第一层，嵌套的引用类型仍指向同一地址
 *   - 深拷贝递归复制所有层级，新旧对象完全独立
 *
 * 实现思路：
 *   1. 基本类型、null、function 直接返回（function 一般不深拷贝）
 *   2. Date、RegExp、Map、Set 等内置对象使用对应构造函数重建
 *   3. 数组/普通对象递归拷贝
 *   4. 使用 WeakMap 记录已拷贝对象，解决循环引用
 *   5. 使用 Object.getOwnPropertyDescriptors 保留 getter/setter 与不可枚举属性
 */

function deepClone(source, hash = new WeakMap()) {
  // 1. 基本类型、null、undefined 直接返回
  if (source === null || typeof source !== "object") {
    return source;
  }

  // 2. 如果已经拷贝过，直接返回缓存的副本（解决循环引用）
  if (hash.has(source)) {
    return hash.get(source);
  }

  // 3. Date 对象
  if (source instanceof Date) {
    return new Date(source.getTime());
  }

  // 4. RegExp 对象
  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags);
  }

  // 5. Map 对象
  if (source instanceof Map) {
    const cloned = new Map();
    hash.set(source, cloned);
    source.forEach((value, key) => {
      cloned.set(deepClone(key, hash), deepClone(value, hash));
    });
    return cloned;
  }

  // 6. Set 对象
  if (source instanceof Set) {
    const cloned = new Set();
    hash.set(source, cloned);
    source.forEach((value) => {
      cloned.add(deepClone(value, hash));
    });
    return cloned;
  }

  // 7. 数组或普通对象
  //    用构造函数创建，保证保留子类型（如继承自 Array 的类）
  const cloned = new source.constructor();
  hash.set(source, cloned);

  // 8. 使用 getOwnPropertyDescriptors 保留属性描述符
  //    注意：必须用 Object.defineProperty 复制，普通赋值会丢失 writable/enumerable/configurable
  const descriptors = Object.getOwnPropertyDescriptors(source);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = descriptors[key];
    if ("value" in descriptor) {
      // 普通值属性：递归拷贝 value，同时保留原描述符（writable/enumerable/configurable）
      Object.defineProperty(cloned, key, {
        ...descriptor,
        value: deepClone(descriptor.value, hash),
      });
    } else {
      // accessor 属性（getter/setter）：直接复用描述符，不深拷贝函数
      Object.defineProperty(cloned, key, descriptor);
    }
  }

  return cloned;
}

// ===== 测试 =====

// --- 基本类型 ---
console.log(deepClone(42)); // 42
console.log(deepClone("hello")); // "hello"
console.log(deepClone(null)); // null
console.log(deepClone(undefined)); // undefined

// --- 普通对象 ---
const obj = { a: 1, b: { c: 2 } };
const clonedObj = deepClone(obj);
console.log(clonedObj); // { a: 1, b: { c: 2 } }
console.log(clonedObj.b === obj.b); // false（嵌套对象也是新引用）

// --- 数组 ---
const arr = [1, [2, 3], { x: 4 }];
const clonedArr = deepClone(arr);
console.log(clonedArr); // [ 1, [ 2, 3 ], { x: 4 } ]
console.log(clonedArr[1] === arr[1]); // false
console.log(clonedArr instanceof Array); // true

// --- Date ---
const date = new Date("2024-01-01");
const clonedDate = deepClone(date);
console.log(clonedDate); // 2024-01-01T00:00:00.000Z
console.log(clonedDate === date); // false
console.log(clonedDate.getTime() === date.getTime()); // true

// --- RegExp ---
const reg = /abc/gi;
const clonedReg = deepClone(reg);
console.log(clonedReg); // /abc/gi
console.log(clonedReg === reg); // false

// --- Map ---
const map = new Map([
  ["k1", { v: 1 }],
  ["k2", 2],
]);
const clonedMap = deepClone(map);
console.log(clonedMap.get("k1")); // { v: 1 }
console.log(clonedMap.get("k1") === map.get("k1")); // false

// --- Set ---
const set = new Set([1, { a: 2 }]);
const clonedSet = deepClone(set);
console.log(clonedSet.size); // 2
console.log([...clonedSet][1] === [...set][1]); // false

// --- 循环引用 ---
const cyclic = { name: "cyclic" };
cyclic.self = cyclic;
const clonedCyclic = deepClone(cyclic);
console.log(clonedCyclic.name); // "cyclic"
console.log(clonedCyclic.self === clonedCyclic); // true（自引用正确指向副本自身）
console.log(clonedCyclic.self === cyclic); // false（不指向原对象）

// --- 不可枚举属性 / 属性描述符 ---
const withDescriptor = {};
Object.defineProperty(withDescriptor, "hidden", {
  value: 99,
  enumerable: false,
  writable: false,
});
const clonedDescriptor = deepClone(withDescriptor);
console.log(Object.getOwnPropertyDescriptor(clonedDescriptor, "hidden"));
// { value: 99, writable: false, enumerable: false, configurable: false }
