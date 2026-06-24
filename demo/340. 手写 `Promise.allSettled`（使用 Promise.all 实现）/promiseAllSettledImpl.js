/**
 * 手写 Promise.allSettled（使用 Promise.all 实现）
 *
 * Promise.allSettled(promises) 等待所有 Promise 都"落定"（fulfilled 或 rejected），
 * 返回一个 Promise，resolve 值为每个 Promise 的结果对象数组：
 * - fulfilled: { status: 'fulfilled', value: ... }
 * - rejected: { status: 'rejected', reason: ... }
 * 与 Promise.all 的区别：allSettled 不会因为某个 reject 而短路。
 * 这里使用 Promise.all 实现：将每个 Promise 包装为永不 reject 的 Promise。
 */

// 手写 Promise.allSettled（使用 Promise.all）
function promiseAllSettled(promises) {
  // 将每个 Promise 包装为始终 resolve 的 Promise
  var wrapped = promises.map(function (promise) {
    return Promise.resolve(promise).then(
      function (value) {
        return { status: 'fulfilled', value: value };
      },
      function (reason) {
        return { status: 'rejected', reason: reason };
      }
    );
  });
  // 因为每个 wrapped Promise 都不会 reject，所以 Promise.all 一定会 resolve
  return Promise.all(wrapped);
}

// 不依赖 Promise.all 的手写实现（用计数器）
function promiseAllSettledManual(promises) {
  return new Promise(function (resolve) {
    var results = [];
    var count = 0;
    var total = promises.length;

    if (total === 0) {
      resolve([]);
      return;
    }

    promises.forEach(function (promise, index) {
      Promise.resolve(promise).then(
        function (value) {
          results[index] = { status: 'fulfilled', value: value };
          count++;
          if (count === total) resolve(results);
        },
        function (reason) {
          results[index] = { status: 'rejected', reason: reason };
          count++;
          if (count === total) resolve(results);
        }
      );
    });
  });
}

// 测试辅助函数
function resolveLater(value, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(value); }, ms);
  });
}

function rejectLater(reason, ms) {
  return new Promise(function (_, reject) {
    setTimeout(function () { reject(reason); }, ms);
  });
}

// 测试 1：全部 fulfilled
console.log('--- All fulfilled ---');
promiseAllSettled([
  resolveLater(1, 50),
  resolveLater(2, 100),
  resolveLater(3, 30)
]).then(function (results) {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'fulfilled', value: 2 },
  //   { status: 'fulfilled', value: 3 }
  // ]
});

// 测试 2：混合 fulfilled 和 rejected
setTimeout(function () {
  console.log('--- Mixed ---');
  promiseAllSettled([
    resolveLater('ok', 50),
    rejectLater(new Error('fail'), 100),
    resolveLater(42, 30)
  ]).then(function (results) {
    results.forEach(function (r, i) {
      if (r.status === 'fulfilled') {
        console.log('  [' + i + '] fulfilled:', r.value);
      } else {
        console.log('  [' + i + '] rejected:', r.reason.message);
      }
    });
    // [0] fulfilled: ok
    // [1] rejected: fail
    // [2] fulfilled: 42
  });
}, 200);

// 测试 3：全部 rejected
setTimeout(function () {
  console.log('--- All rejected ---');
  promiseAllSettled([
    rejectLater('err1', 50),
    rejectLater('err2', 30)
  ]).then(function (results) {
    console.log(results);
    // [
    //   { status: 'rejected', reason: 'err1' },
    //   { status: 'rejected', reason: 'err2' }
    // ]
  });
}, 400);

// 测试 4：非 Promise 值
setTimeout(function () {
  console.log('--- Non-promise values ---');
  promiseAllSettled([1, 'hello', { x: 1 }]).then(function (results) {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'fulfilled', value: 'hello' },
    //   { status: 'fulfilled', value: { x: 1 } }
    // ]
  });
}, 600);

// 测试 5：空数组
setTimeout(function () {
  console.log('--- Empty array ---');
  promiseAllSettled([]).then(function (results) {
    console.log(results); // []
  });
}, 700);

// 测试 6：手动实现对比
setTimeout(function () {
  console.log('--- Compare manual implementation ---');
  Promise.all([
    promiseAllSettled([resolveLater(1, 50), rejectLater('e', 30)]),
    promiseAllSettledManual([resolveLater(1, 50), rejectLater('e', 30)])
  ]).then(function (results) {
    var r1 = results[0];
    var r2 = results[1];
    console.log(JSON.stringify(r1) === JSON.stringify(r2)); // true
    console.log('Both implementations match!');
  });
}, 800);

// 测试 7：与原生对比
setTimeout(function () {
  console.log('--- Compare with native ---');
  var promises = [resolveLater(1, 50), rejectLater('e', 30), resolveLater(2, 40)];
  Promise.all([
    promiseAllSettled(promises),
    Promise.allSettled(promises)
  ]).then(function (results) {
    console.log(JSON.stringify(results[0]) === JSON.stringify(results[1])); // true
    console.log('Matches native Promise.allSettled!');
  });
}, 1000);
