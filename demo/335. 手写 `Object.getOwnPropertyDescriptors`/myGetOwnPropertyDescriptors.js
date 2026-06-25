/**
 * 手写 Object.getOwnPropertyDescriptors
 *
 * Object.getOwnPropertyDescriptors(obj) 返回一个对象，
 * 包含 obj 所有自有属性的完整属性描述符（value/writable/get/set/enumerable/configurable）。
 * 与 Object.getOwnPropertyDescriptor（单个属性）不同，它返回所有自有属性。
 * 这里手写实现。
 */

// 手写 Object.getOwnPropertyDescriptors
function myGetOwnPropertyDescriptors(obj) {
  if (
    obj == null ||
    (typeof obj !== "object" &&
      typeof obj !== "function" &&
      typeof obj !== "symbol")
  ) {
    throw new TypeError(
      "Object.getOwnPropertyDescriptors called on non-object",
    );
  }
  var result = {};
  var keys = Object.getOwnPropertyNames(obj);
  // 也包含 Symbol 属性
  if (typeof Object.getOwnPropertySymbols === "function") {
    var symbols = Object.getOwnPropertySymbols(obj);
    for (var i = 0; i < symbols.length; i++) {
      keys.push(symbols[i]);
    }
  }
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    var descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor !== undefined) {
      result[key] = descriptor;
    }
  }
  return result;
}

// 测试 1：普通对象的数据属性
console.log("--- Data properties ---");
var obj = { a: 1, b: 2 };
var descriptors = myGetOwnPropertyDescriptors(obj);
console.log(descriptors.a);
// { value: 1, writable: true, enumerable: true, configurable: true }
console.log(descriptors.b);
// { value: 2, writable: true, enumerable: true, configurable: true }

// 测试 2：访问器属性（getter/setter）
console.log("--- Accessor properties ---");
var person = {};
Object.defineProperty(person, "name", {
  get: function () {
    return this._name;
  },
  set: function (v) {
    this._name = v;
  },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(person, "_name", {
  value: "Alice",
  writable: true,
  enumerable: false,
  configurable: true,
});
var personDesc = myGetOwnPropertyDescriptors(person);
console.log(personDesc.name);
// { get: [Function: get], set: [Function: set], enumerable: true, configurable: true }
console.log(personDesc._name.enumerable); // false

// 测试 3：不可枚举属性也被包含
console.log("--- Non-enumerable included ---");
var hidden = {};
Object.defineProperty(hidden, "secret", {
  value: "hidden value",
  enumerable: false,
  configurable: false,
  writable: false,
});
var hiddenDesc = myGetOwnPropertyDescriptors(hidden);
console.log(hiddenDesc.secret.value); // hidden value
console.log(hiddenDesc.secret.enumerable); // false
console.log(hiddenDesc.secret.writable); // false
console.log(hiddenDesc.secret.configurable); // false

// 测试 4：用于完整复制对象（包括 getter/setter）
console.log("--- Clone with descriptors ---");
var source = {};
Object.defineProperty(source, "x", {
  get: function () {
    return 42;
  },
  enumerable: true,
  configurable: true,
});
source.y = 10;

var clone = Object.defineProperties({}, myGetOwnPropertyDescriptors(source));
console.log(clone.x); // 42（getter 被复制）
console.log(clone.y); // 10

// 测试 5：Symbol 属性
console.log("--- Symbol properties ---");
var sym = Symbol("key");
var withSym = {};
withSym[sym] = "symbol value";
var symDesc = myGetOwnPropertyDescriptors(withSym);
console.log(symDesc[sym]);
// { value: 'symbol value', writable: true, enumerable: true, configurable: true }

// 测试 6：数组
console.log("--- Array ---");
var arr = [1, 2, 3];
var arrDesc = myGetOwnPropertyDescriptors(arr);
console.log(arrDesc[0].value); // 1
console.log(arrDesc[1].value); // 2
console.log(arrDesc.length.value); // 3

// 测试 7：与原生对比
console.log("--- Compare with native ---");
var native = Object.getOwnPropertyDescriptors(obj);
var mine = myGetOwnPropertyDescriptors(obj);
console.log(JSON.stringify(native) === JSON.stringify(mine)); // true

// 测试 8：空对象
console.log("--- Empty object ---");
console.log(myGetOwnPropertyDescriptors({})); // {}
