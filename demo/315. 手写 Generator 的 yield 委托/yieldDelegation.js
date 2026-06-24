/**
 * 手写 Generator 的 yield 委托
 *
 * yield* 可以将一个可迭代对象（或另一个 generator）的值逐个 yield 出来，
 * 即委托给内部迭代器。委托完成后，yield* 表达式的值是内部迭代器的返回值。
 * 这里手动模拟 yield* 的委托行为。
 */

// 原生 yield* 示例（用于对比）
function* inner() {
  yield 1;
  yield 2;
  return 'innerResult';
}

function* outer() {
  yield 0;
  var result = yield* inner(); // 委托给 inner
  yield 3;
  return result;
}

// 手写内部 generator
function makeInner() {
  var state = 0;
  return {
    next: function () {
      switch (state) {
        case 0: state = 1; return { value: 1, done: false };
        case 1: state = 2; return { value: 2, done: false };
        case 2: state = 3; return { value: 'innerResult', done: true };
        default: return { value: undefined, done: true };
      }
    }
  };
}

// 手写外部 generator，模拟 yield* 委托
function makeOuterWithDelegation() {
  var state = 0;
  var innerIterator = null;
  var innerReturnValue;

  return {
    next: function (arg) {
      // 使用循环处理委托内部的多次 next 调用
      while (true) {
        if (state === 0) {
          // yield 0
          state = 1;
          return { value: 0, done: false };
        }
        if (state === 1) {
          // 进入 yield* 委托
          if (innerIterator === null) {
            innerIterator = makeInner();
          }
          var r = innerIterator.next(arg);
          if (!r.done) {
            // 内部还没结束，把内部的值 yield 出去
            return { value: r.value, done: false };
          } else {
            // 内部结束，记录返回值，继续外部执行
            innerReturnValue = r.value;
            state = 2;
            arg = undefined; // 重置传入参数
            continue;        // 继续执行外部的下一条语句
          }
        }
        if (state === 2) {
          // yield 3
          state = 3;
          return { value: 3, done: false };
        }
        if (state === 3) {
          // return innerReturnValue
          state = 4;
          return { value: innerReturnValue, done: true };
        }
        return { value: undefined, done: true };
      }
    }
  };
}

// 测试原生 yield*
console.log('--- Native yield* ---');
var o = outer();
console.log(o.next().value); // 0
console.log(o.next().value); // 1
console.log(o.next().value); // 2
console.log(o.next().value); // 3
console.log(o.next());       // { value: 'innerResult', done: true }

// 测试手写委托
console.log('--- Hand-written yield* delegation ---');
var myOuter = makeOuterWithDelegation();
console.log(myOuter.next().value); // 0
console.log(myOuter.next().value); // 1
console.log(myOuter.next().value); // 2
console.log(myOuter.next().value); // 3
console.log(myOuter.next());       // { value: 'innerResult', done: true }

// yield* 委托给数组（原生）
function* delegateToArray() {
  yield* [10, 20, 30];
  yield 'end';
}
console.log('--- Native yield* to array ---');
var a = delegateToArray();
console.log(a.next().value); // 10
console.log(a.next().value); // 20
console.log(a.next().value); // 30
console.log(a.next().value); // end
console.log(a.next().done);  // true
