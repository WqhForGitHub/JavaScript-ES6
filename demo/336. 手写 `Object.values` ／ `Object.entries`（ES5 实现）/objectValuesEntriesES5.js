/**
 * 手写 Object.values / Object.entries（ES5 实现）
 *
 * Object.values(obj) 返回对象所有可枚举自有属性的值数组。
 * Object.entries(obj) 返回对象所有可枚举自有属性的 [key, value] 数组。
 * ES5 中通过 Object.keys + 遍历实现。
 * 注意：原生方法还支持 Symbol 属性的枚举（按属性创建顺序），
 * 这里主要处理字符串键。
 */

// 手写 Object.values
// 注意：原生 Object.values 对 null/undefined 抛错，对其他原始类型（如字符串）
// 会进行装箱（boxing），将其当作对象处理。
function myObjectValues(obj) {
  if (obj == null) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  obj = Object(obj); // 装箱原始类型
  var keys = Object.keys(obj);
  var result = [];
  for (var i = 0; i < keys.length; i++) {
    result.push(obj[keys[i]]);
  }
  return result;
}

// 手写 Object.entries
function myObjectEntries(obj) {
  if (obj == null) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  obj = Object(obj); // 装箱原始类型
  var keys = Object.keys(obj);
  var result = [];
  for (var i = 0; i < keys.length; i++) {
    result.push([keys[i], obj[keys[i]]]);
  }
  return result;
}

// 测试 1：普通对象
console.log("--- Basic object ---");
var obj = { a: 1, b: 2, c: 3 };
console.log(myObjectValues(obj)); // [1, 2, 3]
console.log(myObjectEntries(obj)); // [['a', 1], ['b', 2], ['c', 3]]

// 测试 2：不可枚举属性被排除
console.log("--- Non-enumerable excluded ---");
var mixed = { x: 10 };
Object.defineProperty(mixed, "y", {
  value: 20,
  enumerable: false,
});
console.log(myObjectValues(mixed)); // [10]
console.log(myObjectEntries(mixed)); // [['x', 10]]

// 测试 3：继承的属性被排除
console.log("--- Inherited excluded ---");
var proto = { inherited: "from proto" };
var child = Object.create(proto);
child.own = "own value";
console.log(myObjectValues(child)); // ['own value']
console.log(myObjectEntries(child)); // [['own', 'own value']]

// 测试 4：字符串（按字符索引）
console.log("--- String ---");
console.log(myObjectValues("abc")); // ['a', 'b', 'c']
console.log(myObjectEntries("abc")); // [['0', 'a'], ['1', 'b'], ['2', 'c']]

// 测试 5：数组
console.log("--- Array ---");
console.log(myObjectValues([10, 20])); // [10, 20]
console.log(myObjectEntries([10, 20])); // [['0', 10], ['1', 20]]

// 测试 6：空对象
console.log("--- Empty ---");
console.log(myObjectValues({})); // []
console.log(myObjectEntries({})); // []

// 测试 7：用于对象转 Map
console.log("--- Object to Map ---");
var config = { host: "localhost", port: 8080 };
var configMap = new Map(myObjectEntries(config));
console.log(configMap.get("host")); // localhost
console.log(configMap.get("port")); // 8080

// 测试 8：用于 Map 转对象（反向操作）
console.log("--- Map to Object ---");
var fromEntries = function (entries) {
  var result = {};
  for (var i = 0; i < entries.length; i++) {
    result[entries[i][0]] = entries[i][1];
  }
  return result;
};
var roundTrip = fromEntries(myObjectEntries(obj));
console.log(roundTrip); // { a: 1, b: 2, c: 3 }

// 测试 9：与原生对比
console.log("--- Compare with native ---");
console.log(
  JSON.stringify(myObjectValues(obj)) === JSON.stringify(Object.values(obj)),
); // true
console.log(
  JSON.stringify(myObjectEntries(obj)) === JSON.stringify(Object.entries(obj)),
); // true
