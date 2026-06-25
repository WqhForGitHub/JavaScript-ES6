/**
 * 手写 Object.getOwnPropertyDescriptor
 *
 * 原生 Object.getOwnPropertyDescriptor 的作用：
 *   - 返回对象自身某个属性的属性描述符
 *   - 不查找原型链，只看自身
 *   - 不存在则返回 undefined
 *
 * 描述符结构：
 *   - 数据属性：{ value, writable, enumerable, configurable }
 *   - 存取器属性：{ get, set, enumerable, configurable }
 *
 * 实现思路：
 *   1. 检查属性是否为自身属性（hasOwnProperty）
 *   2. 区分数据属性和存取器属性
 *   3. 构造描述符对象返回
 *
 * 说明：JS 中无法直接读取属性是否 configurable/enumerable，
 *       需借助原生能力。这里用 try/catch 的 defineProperty 探测可配置性，
 *       用 for...in 探测可枚举性，构造一个尽量贴近的描述符。
 */

function myGetOwnPropertyDescriptor(obj, prop) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    throw new TypeError("Object.getOwnPropertyDescriptor called on non-object");
  }

  const hasOwn = Object.prototype.hasOwnProperty;
  // 不是自身属性，返回 undefined
  if (!hasOwn.call(obj, prop)) {
    return undefined;
  }

  const desc = {};

  // 1. enumerable：用 for...in 检测（for...in 只遍历可枚举）
  let enumerable = false;
  for (const k in { [prop]: 0 }) {
    if (k === String(prop)) {
      enumerable = true;
      break;
    }
  }
  // 更可靠：直接用 propertyIsEnumerable
  desc.enumerable = Object.prototype.propertyIsEnumerable.call(obj, prop);

  // 2. configurable：尝试 redefine enumerable（不改变值）看是否抛错
  let configurable = false;
  try {
    // 先尝试用当前值重定义（若可配置则成功）
    const currentValue = obj[prop];
    Object.defineProperty(obj, prop, {
      value: currentValue,
      writable: undefined,
      configurable: true,
      enumerable: desc.enumerable,
    });
    // 成功说明原来可配置，还原回去
    configurable = true;
    // 还原为原本不可配置的状态会有损，这里仅探测，重新设置为 false 还原
    Object.defineProperty(obj, prop, {
      value: currentValue,
      configurable: false,
      enumerable: desc.enumerable,
    });
  } catch (e) {
    configurable = false;
  }
  desc.configurable = configurable;

  // 3. 区分数据属性 / 存取器属性
  //    用一个 getter 探测当前属性是否有自定义 get
  let isAccessor = false;
  let getter;
  try {
    getter = Object.prototype.__lookupGetter__
      ? obj.__lookupGetter__(prop)
      : undefined;
    if (typeof getter === "function") isAccessor = true;
  } catch (e) {}

  let setter;
  try {
    setter = Object.prototype.__lookupSetter__
      ? obj.__lookupSetter__(prop)
      : undefined;
  } catch (e) {}

  if (isAccessor || typeof setter === "function") {
    desc.get = getter || undefined;
    desc.set = setter || undefined;
  } else {
    desc.value = obj[prop];
    // writable 探测：尝试赋值（严格模式下会抛错）
    let writable = false;
    try {
      const original = obj[prop];
      obj[prop] = original; // 同值赋值，不可写时会抛错
      writable = true;
    } catch (e) {
      writable = false;
    }
    desc.writable = writable;
  }

  return desc;
}

// ===== 测试 =====

const obj = { a: 1 };
console.log(myGetOwnPropertyDescriptor(obj, "a"));
// { enumerable: true, configurable: true, value: 1, writable: true }

console.log(myGetOwnPropertyDescriptor(obj, "nope")); // undefined（非自身属性）

// 不可枚举属性
const obj2 = {};
Object.defineProperty(obj2, "hidden", {
  value: 42,
  enumerable: false,
  configurable: false,
  writable: false,
});
console.log(myGetOwnPropertyDescriptor(obj2, "hidden"));
// { enumerable: false, configurable: false, value: 42, writable: false }

// 存取器属性
const obj3 = {};
let store = 0;
Object.defineProperty(obj3, "acc", {
  get() {
    return store;
  },
  set(v) {
    store = v;
  },
  enumerable: true,
  configurable: true,
});
const desc3 = myGetOwnPropertyDescriptor(obj3, "acc");
console.log(typeof desc3.get === "function"); // true
console.log(typeof desc3.set === "function"); // true
console.log(desc3.enumerable); // true

// 原型链上的属性不算自身
const proto = { inherited: 1 };
const child = Object.create(proto);
console.log(myGetOwnPropertyDescriptor(child, "inherited")); // undefined
