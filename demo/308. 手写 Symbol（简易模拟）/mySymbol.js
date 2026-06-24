/**
 * 手写 Symbol（简易模拟）
 *
 * Symbol 是 ES6 引入的原始类型，每个 Symbol 值都是唯一且不可变的。
 * 这里通过对象引用 + 内部 id + description 来模拟 Symbol 的唯一性。
 * 同时模拟 Symbol.for / Symbol.keyFor 全局注册表。
 * 注意：真正的 Symbol 作为属性键时不会被 for...in/Object.keys 枚举，
 * 这里无法完全模拟该特性。
 */

var MySymbol = (function () {
  var idCounter = 0;

  function Symbol(description) {
    if (this instanceof Symbol) {
      throw new TypeError('Symbol is not a constructor');
    }
    var symbol = Object.create(Symbol.prototype);
    var desc = description === undefined ? '' : String(description);
    Object.defineProperties(symbol, {
      __description__: { value: desc, enumerable: false },
      __id__: { value: ++idCounter, enumerable: false }
    });
    return symbol;
  }

  Symbol.prototype.toString = function () {
    return 'Symbol(' + this.__description__ + ')';
  };

  // 为了在 console 中更友好显示
  if (typeof Symbol.prototype[Symbol.toPrimitive] !== 'undefined') {
    Symbol.prototype[Symbol.toPrimitive] = function () {
      return 'Symbol(' + this.__description__ + ')';
    };
  }

  // 全局注册表
  var globalRegistry = {};

  // 模拟 Symbol.for：相同 key 返回相同 Symbol
  // 注意：这里不能使用 new Symbol(key)，因为 Symbol 不允许被 new
  Symbol.for = function (key) {
    key = String(key);
    if (!Object.prototype.hasOwnProperty.call(globalRegistry, key)) {
      globalRegistry[key] = Symbol(key);
    }
    return globalRegistry[key];
  };

  // 模拟 Symbol.keyFor
  Symbol.keyFor = function (sym) {
    for (var k in globalRegistry) {
      if (globalRegistry[k] === sym) return k;
    }
    return undefined;
  };

  return Symbol;
})();

// 测试
var s1 = MySymbol('foo');
var s2 = MySymbol('foo');
console.log(s1.toString()); // Symbol(foo)
console.log(s2.toString()); // Symbol(foo)
console.log(s1 === s2);     // false（每次创建都是唯一的）

// Symbol.for 返回相同的 Symbol
var s3 = MySymbol.for('bar');
var s4 = MySymbol.for('bar');
console.log(s3 === s4);           // true
console.log(MySymbol.keyFor(s3)); // bar

var s5 = MySymbol('baz');
console.log(MySymbol.keyFor(s5)); // undefined（未注册）

// 作为对象属性键
var obj = {};
obj[s1] = 'value1';
console.log(obj[s1]); // value1

// 不能 new
try {
  new MySymbol('test');
} catch (e) {
  console.log(e.message); // Symbol is not a constructor
}

// 无描述
var s6 = MySymbol();
console.log(s6.toString()); // Symbol()
