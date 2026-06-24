/**
 * 手写 async/await 的 Generator 实现
 *
 * async/await 本质上是 Generator + 自动执行器的语法糖。
 * - async function 对应一个返回 Promise 的函数
 * - await expr 对应 yield expr
 * - 自动执行器负责反复调用 next()，将每个 yield 的 Promise resolve 后
 *   把结果传给下一个 next()，遇到 reject 则 throw 到 generator 中。
 * 这里手写自动执行器来模拟 async/await 的行为。
 */

// 自动执行器：接收 generator 函数和参数，返回 Promise
function asyncToPromise(generatorFn) {
  return function () {
    var args = arguments;
    var self = this;
    return new Promise(function (resolve, reject) {
      var gen = generatorFn.apply(self, args);

      function step(method, arg) {
        var result;
        try {
          result = gen[method](arg);
        } catch (e) {
          return reject(e);
        }
        if (result.done) {
          return resolve(result.value);
        }
        // 将 yield 的值包装为 Promise
        var promise = Promise.resolve(result.value);
        promise.then(
          function (val) { step('next', val); },
          function (err) { step('throw', err); }
        );
      }

      step('next', undefined);
    });
  };
}

// 模拟一个异步操作
function delay(ms, value) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(value); }, ms);
  });
}

function failAfter(ms, error) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () { reject(error); }, ms);
  });
}

// 原生 async/await 写法（用于对比）：
// async function fetchData() {
//   const a = await delay(100, 1);
//   const b = await delay(100, 2);
//   return a + b;
// }

// 使用 Generator + 自动执行器模拟 async/await
function* fetchDataGen() {
  var a = yield delay(100, 1);
  var b = yield delay(100, 2);
  return a + b;
}
var fetchData = asyncToPromise(fetchDataGen);

// 带错误处理的模拟
function* fetchWithErrorGen() {
  try {
    var data = yield failAfter(50, new Error('Network error'));
    return data;
  } catch (e) {
    return 'caught: ' + e.message;
  }
}
var fetchWithError = asyncToPromise(fetchWithErrorGen);

// 顺序请求模拟
function* sequentialFetchGen() {
  var results = [];
  for (var i = 1; i <= 3; i++) {
    var val = yield delay(50, i * 10);
    results.push(val);
  }
  return results;
}
var sequentialFetch = asyncToPromise(sequentialFetchGen);

// 并行请求（await Promise.all）
function* parallelFetchGen() {
  var values = yield Promise.all([
    delay(50, 'a'),
    delay(50, 'b'),
    delay(50, 'c')
  ]);
  return values;
}
var parallelFetch = asyncToPromise(parallelFetchGen);

// 测试
console.log('--- Sequential await ---');
fetchData().then(function (result) {
  console.log('Result:', result); // Result: 3
});

setTimeout(function () {
  console.log('--- Error handling ---');
  fetchWithError().then(function (result) {
    console.log(result); // caught: Network error
  });
}, 300);

setTimeout(function () {
  console.log('--- Loop with await ---');
  sequentialFetch().then(function (result) {
    console.log('Results:', result); // Results: [10, 20, 30]
  });
}, 600);

setTimeout(function () {
  console.log('--- Parallel with Promise.all ---');
  parallelFetch().then(function (result) {
    console.log('Parallel:', result); // Parallel: ['a', 'b', 'c']
  });
}, 1000);

// 对比原生 async/await
setTimeout(function () {
  console.log('--- Compare with native async/await ---');
  async function nativeFetchData() {
    var a = await delay(50, 1);
    var b = await delay(50, 2);
    return a + b;
  }
  nativeFetchData().then(function (r) {
    console.log('Native result:', r); // Native result: 3
    console.log('Done!');
  });
}, 1300);
