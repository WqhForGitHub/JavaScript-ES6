/**
 * 手写解构赋值（对象解构）
 *
 * 对象解构 `const {a, b: c} = obj` 本质上是按属性名
 * 取出对象属性并赋值给变量。这里通过函数模拟该过程，
 * 支持重命名、默认值和嵌套解构。
 */

// 基本对象解构：模拟 const {name, age} = obj
function destructureObject(obj) {
  return {
    name: obj.name,
    age: obj.age
  };
}

// 重命名解构：模拟 const {name: n, age: a} = obj
function destructureRename(obj) {
  return {
    n: obj.name,
    a: obj.age
  };
}

// 带默认值的对象解构：模拟 const {x = 10, y = 20} = obj
function destructureWithDefault(obj) {
  return {
    x: obj.x !== undefined ? obj.x : 10,
    y: obj.y !== undefined ? obj.y : 20
  };
}

// 嵌套解构：模拟 const {info: {city}} = obj
function destructureNested(obj) {
  return {
    city: obj.info.city
  };
}

// 重命名 + 默认值：模拟 const {name: n = 'default'} = obj
function destructureRenameDefault(obj) {
  return {
    n: obj.name !== undefined ? obj.name : 'default'
  };
}

// 通用对象解构：传入属性名数组（模拟 pick）
function pick(obj, keys) {
  var result = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

// 测试
var person = {
  name: 'Alice',
  age: 25,
  info: { city: 'Beijing' }
};

var r1 = destructureObject(person);
console.log(r1.name, r1.age); // Alice 25

var r2 = destructureRename(person);
console.log(r2.n, r2.a); // Alice 25

var r3 = destructureWithDefault({ x: 5 });
console.log(r3.x, r3.y); // 5 20

var r4 = destructureNested(person);
console.log(r4.city); // Beijing

var r5 = destructureRenameDefault({});
console.log(r5.n); // default

var r6 = pick(person, ['name', 'age']);
console.log(r6); // { name: 'Alice', age: 25 }
