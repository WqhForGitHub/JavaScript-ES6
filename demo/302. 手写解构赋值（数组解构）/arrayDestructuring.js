/**
 * 手写解构赋值（数组解构）
 *
 * 数组解构 `const [a, b, ...rest] = arr` 本质上是按索引位置
 * 取出数组元素并赋值给变量。这里通过函数模拟该过程，
 * 支持默认值、剩余参数和跳过元素。
 */

// 基本数组解构：模拟 const [a, b, c] = arr
function destructureArray(arr) {
  return {
    a: arr[0],
    b: arr[1],
    c: arr[2]
  };
}

// 带默认值的数组解构：模拟 const [a = 'A', b = 'B'] = arr
function destructureWithDefault(arr) {
  return {
    a: arr[0] !== undefined ? arr[0] : 'defaultA',
    b: arr[1] !== undefined ? arr[1] : 'defaultB'
  };
}

// 带剩余参数的数组解构：模拟 const [first, ...rest] = arr
function destructureWithRest(arr) {
  return {
    first: arr[0],
    rest: arr.slice(1)
  };
}

// 跳过元素：模拟 const [, second, , fourth] = arr
function destructureWithSkip(arr) {
  return {
    second: arr[1],
    fourth: arr[3]
  };
}

// 嵌套数组解构：模拟 const [[a], [b]] = arr
function destructureNested(arr) {
  return {
    a: arr[0][0],
    b: arr[1][0]
  };
}

// 通用数组解构：传入索引列表
function pickByIndex(arr, indices) {
  var result = {};
  for (var i = 0; i < indices.length; i++) {
    result['v' + i] = arr[indices[i]];
  }
  return result;
}

// 测试
var arr = [1, 2, 3, 4, 5];

var r1 = destructureArray(arr);
console.log(r1.a, r1.b, r1.c); // 1 2 3

var r2 = destructureWithDefault([undefined, 99]);
console.log(r2.a, r2.b); // defaultA 99

var r3 = destructureWithRest(arr);
console.log(r3.first); // 1
console.log(r3.rest);  // [2, 3, 4, 5]

var r4 = destructureWithSkip(arr);
console.log(r4.second, r4.fourth); // 2 4

var r5 = destructureNested([[10], [20]]);
console.log(r5.a, r5.b); // 10 20

var r6 = pickByIndex(arr, [0, 4]);
console.log(r6.v0, r6.v1); // 1 5
