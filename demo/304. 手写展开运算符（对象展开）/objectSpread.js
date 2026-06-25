/**
 * 手写展开运算符（对象展开）
 *
 * 对象展开 `{...obj1, ...obj2}` 本质上是将源对象的所有
 * 可枚举自有属性复制到新对象中，后面的属性会覆盖前面的同名属性。
 * 可以通过 for...in 循环或 Object.assign 来模拟。
 */

// 使用 for...in 模拟对象展开
function objectSpread() {
  var result = {};
  for (var i = 0; i < arguments.length; i++) {
    var source = arguments[i];
    if (source != null && typeof source === "object") {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          result[key] = source[key];
        }
      }
    }
  }
  return result;
}

// 使用 Object.keys + 逐个赋值（更严格的 ES5 写法）
function objectSpreadStrict() {
  var result = {};
  for (var i = 0; i < arguments.length; i++) {
    var source = arguments[i];
    if (source != null) {
      var keys = Object.keys(source);
      for (var j = 0; j < keys.length; j++) {
        result[keys[j]] = source[keys[j]];
      }
    }
  }
  return result;
}

// 浅拷贝对象（模拟 const copy = {...obj}）
function shallowCopy(obj) {
  return objectSpread(obj);
}

// 合并对象（后面的覆盖前面的）
function mergeObjects() {
  return objectSpread.apply(null, arguments);
}

// 测试
var obj1 = { a: 1, b: 2 };
var obj2 = { b: 3, c: 4 };
var obj3 = { d: 5 };

var merged1 = objectSpread(obj1, obj2, obj3);
console.log(merged1); // { a: 1, b: 3, c: 4, d: 5 }

var merged2 = mergeObjects(obj1, obj2);
console.log(merged2); // { a: 1, b: 3, c: 4 }

// 浅拷贝
var copy = shallowCopy(obj1);
console.log(copy); // { a: 1, b: 2 }
console.log(copy === obj1); // false

// 展开后添加新属性
var extended = objectSpread(obj1, { e: 6 });
console.log(extended); // { a: 1, b: 2, e: 6 }

// 忽略 null/undefined
var safe = objectSpread(null, undefined, { x: 1 });
console.log(safe); // { x: 1 }
