/**
 * 手写 let 和 const 的块级作用域（使用闭包模拟）
 *
 * ES5 中没有块级作用域，可以用立即执行函数 (IIFE) 模拟块级作用域，
 * 使变量仅在块内可见。const 的不可变性可通过 Object.defineProperty
 * 设置 writable: false 来实现。
 */

// 使用 IIFE 模拟块级作用域：变量在块外不可访问
function blockScopeDemo() {
  (function () {
    var letLike = "I am like let";
    var constLike = "I am like const";
    console.log(letLike); // I am like let
    console.log(constLike); // I am like const
  })();

  // 块外无法访问块内变量（模拟块级作用域）
  // console.log(letLike); // ReferenceError: letLike is not defined
}

// 模拟 const：通过 Object.defineProperty 设置不可写
function createConst(target, name, value) {
  Object.defineProperty(target, name, {
    value: value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  return target;
}

// 使用闭包模拟 let/const：变量只能通过暴露的方法访问和修改
function simulateLetAndConst() {
  var scope = {};

  // 模拟 let：块内可变，块外不可直接访问
  (function (s) {
    var count = 0; // 模拟 let count = 0
    s.getCount = function () {
      return count;
    };
    s.setCount = function (v) {
      count = v;
    };
  })(scope);

  console.log(scope.getCount()); // 0
  scope.setCount(10);
  console.log(scope.getCount()); // 10

  // 模拟 const
  var obj = {};
  createConst(obj, "PI", 3.14159);
  console.log(obj.PI); // 3.14159
  obj.PI = 3.14; // 严格模式抛错，非严格模式静默失败
  console.log(obj.PI); // 3.14159（值未被修改）
}

// 模拟 let 的暂时性死区 (TDZ)：在声明前访问会报错
function tdzDemo() {
  var tdz = (function () {
    var initialized = false;
    var value;
    return {
      get: function () {
        if (!initialized)
          throw new ReferenceError("Cannot access before initialization");
        return value;
      },
      init: function (v) {
        value = v;
        initialized = true;
      },
    };
  })();

  try {
    tdz.get(); // 暂时性死区：声明前访问
  } catch (e) {
    console.log(e.message); // Cannot access before initialization
  }

  tdz.init(42);
  console.log(tdz.get()); // 42
}

blockScopeDemo();
simulateLetAndConst();
tdzDemo();
