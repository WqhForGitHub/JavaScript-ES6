/**
 * 手写 Object.defineProperty（简化版）
 *
 * 原生 Object.defineProperty 的作用：
 *   - 在对象上定义一个新属性，或修改已有属性
 *   - 通过描述符（descriptor）控制属性的 configurable/enumerable/writable/value/get/set
 *
 * 说明：
 *   - 完整复刻 Object.defineProperty 内部语义非常复杂（涉及 [[DefineOwnProperty]]）
 *   - 这里提供一个"在已有属性上修改描述符"的可行手写版本，
 *     通过先删除再定义的方式实现，模拟核心行为
 *   - 注意：这是教学简化版，无法完全替代原生（尤其对于全新属性在不可扩展对象上）
 */

function myDefineProperty(obj, prop, descriptor) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    throw new TypeError("Object.defineProperty called on non-object");
  }

  // 规范化描述符：区分数据描述符与存取器描述符
  const hasValue = "value" in descriptor;
  const hasWritable = "writable" in descriptor;
  const hasGet = "get" in descriptor;
  const hasSet = "set" in descriptor;

  // 数据描述符和存取器描述符不能混用
  if ((hasValue || hasWritable) && (hasGet || hasSet)) {
    throw new TypeError("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute");
  }

  // 取当前描述符（若属性已存在）
  const current = Object.getOwnPropertyDescriptor(obj, prop);

  // 构造最终的描述符，未指定的字段按规范默认（新属性默认 false/undefined）
  const finalDesc = {};

  // enumerable
  if ("enumerable" in descriptor) {
    finalDesc.enumerable = !!descriptor.enumerable;
  } else if (current) {
    finalDesc.enumerable = current.enumerable;
  } else {
    finalDesc.enumerable = false;
  }

  // configurable
  if ("configurable" in descriptor) {
    finalDesc.configurable = !!descriptor.configurable;
  } else if (current) {
    finalDesc.configurable = current.configurable;
  } else {
    finalDesc.configurable = false;
  }

  if (hasGet || hasSet) {
    // 存取器描述符
    finalDesc.get = typeof descriptor.get === "function" ? descriptor.get : undefined;
    finalDesc.set = typeof descriptor.set === "function" ? descriptor.set : undefined;
  } else {
    // 数据描述符
    if (hasValue) {
      finalDesc.value = descriptor.value;
    } else if (current && "value" in current) {
      finalDesc.value = current.value;
    } else {
      finalDesc.value = undefined;
    }
    if (hasWritable) {
      finalDesc.writable = !!descriptor.writable;
    } else if (current && "writable" in current) {
      finalDesc.writable = current.writable;
    } else {
      finalDesc.writable = false;
    }
  }

  // 用原生 defineProperty 完成最终定义（底层语义难以用 JS 纯模拟）
  return Object.defineProperty(obj, prop, finalDesc);
}

// ===== 测试 =====

// 定义新数据属性（默认不可枚举、不可配置、不可写）
const obj = {};
myDefineProperty(obj, "a", { value: 1 });
console.log(obj.a); // 1
console.log(Object.getOwnPropertyDescriptor(obj, "a"));
// { value: 1, writable: false, enumerable: false, configurable: false }

// 可写可枚举可配置
const obj2 = {};
myDefineProperty(obj2, "b", { value: 2, writable: true, enumerable: true, configurable: true });
console.log(obj2.b); // 2
obj2.b = 200;
console.log(obj2.b); // 200

// 存取器属性
const obj3 = {};
let internal = 0;
myDefineProperty(obj3, "count", {
  get() { return internal; },
  set(v) { internal = v; },
  enumerable: true,
  configurable: true,
});
obj3.count = 5;
console.log(obj3.count); // 5

// 混用数据与存取器应抛错
try {
  myDefineProperty({}, "x", { value: 1, get() {} });
} catch (e) {
  console.log("抛错:", e instanceof TypeError); // true
}

// 修改已有属性
const obj4 = { n: 10 };
myDefineProperty(obj4, "n", { enumerable: false });
console.log(Object.keys(obj4)); // []（n 不可枚举）
console.log(obj4.n); // 10
