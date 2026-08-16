# 046 - 函数柯里化（curry）

> 柯里化：把接收多个参数的函数转换为一系列接收单个（部分）参数的函数。
> `fn(a, b, c)` -> `curriedFn(a)(b)(c)`。

## 通用柯里化函数

```js
function curry(fn) {
  return function curried(...args) {
    // 参数够了：立即执行
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 参数不够：返回新函数继续收集剩余参数
    return function (...rest) {
      return curried.apply(this, args.concat(rest));
    };
  };
}

// 测试
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1, 2, 3)); // 6 一次性传齐
console.log(curriedAdd(1)(2)(3)); // 6 分三次传
console.log(curriedAdd(1, 2)(3)); // 6 分两次传
console.log(curriedAdd(1)(2, 3)); // 6 混合传参
```

## 经典面试题：add(1)(2)(3) 固定调用链

```js
function add(...args) {
  // 汇总所有参数
  const sum = args.reduce((a, b) => a + b, 0);

  // 返回函数，同时重写 valueOf / Symbol.toPrimitive 使其可参与运算或转字符串
  function inner(...rest) {
    const next = add(sum, ...rest);
    return next;
  }

  inner.valueOf = () => sum;
  inner.toString = () => String(sum);
  return inner;
}

console.log(add(1)(2)(3)); // 6（打印时调用 toString）
console.log(add(1)(2)(3) == 6); // true（== 触发 valueOf）
console.log(add(1, 2)(3) + add(1)(2, 3)); // 12
```

## 进阶：不限参数个数的柯里化 sum

```js
// 当没有参数传入时输出结果，否则继续累加
function curryingSum() {
  let total = 0;

  function sum(...args) {
    if (args.length === 0) {
      return total;
    }
    total += args.reduce((a, b) => a + b, 0);
    return sum; // 链式继续收集
  }

  return sum;
}

const sum = curryingSum();
console.log(sum(1)(2)(3)(4)()); // 10 以空参数触发结算
```

## 柯里化的实际应用

```js
// 1. 参数复用：生成日志函数
function log(level, module, message) {
  console.log(`[${level}] [${module}] ${message}`);
}

const curriedLog = curry(log);
const errorLog = curriedLog('ERROR'); // 固定 level
const webError = errorLog('web'); // 再固定 module

webError('接口请求失败'); // [ERROR] [web] 接口请求失败
errorLog('api', '数据库连接超时'); // [ERROR] [api] 数据库连接超时

// 2. 延迟执行：预填参数
const curriedAjax = curry(function (method, url, data) {
  console.log(`${method} ${url}`, data);
});
const get = curriedAjax('GET');
get('/user', { id: 1 }); // GET /user { id: 1 }
```

## 注意：fn.length 的局限

```js
// fn.length 是「第一个默认参数之前」的形参个数
function fn(a, b = 2, c) {} // fn.length === 1
function fn2(...rest) {} // fn2.length === 0

// 对于 rest 参数或默认参数场景，需要显式指定目标参数个数：
function curryN(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) return fn.apply(this, args);
    return (...rest) => curried.apply(this, args.concat(rest));
  };
}
```
