/**
 * 手写 Proxy 代理（拦截 set）
 *
 * Proxy 的 set 拦截器可以在设置属性时进行自定义行为（如校验、记录）。
 * 这里通过两种方式演示：
 * 1. 原生 Proxy 拦截 set（展示用法）
 * 2. ES5 手写模拟：通过 Object.defineProperty 为已知属性定义 setter
 */

// ========== 原生 Proxy：拦截 set ==========

// 拦截 set，进行类型校验
function createValidatedProxy(target, schema) {
  return new Proxy(target, {
    set: function (target, prop, value) {
      if (schema[prop] && typeof value !== schema[prop]) {
        throw new TypeError(prop + ' must be ' + schema[prop]);
      }
      target[prop] = value;
      return true;
    }
  });
}

// 拦截 set，记录修改日志
function createAuditProxy(target) {
  return new Proxy(target, {
    set: function (target, prop, value) {
      console.log('  [set] ' + String(prop) + ': ' + target[prop] + ' -> ' + value);
      target[prop] = value;
      return true;
    }
  });
}

// 拦截 set，禁止修改
function createImmutableProxy(target) {
  return new Proxy(target, {
    set: function (target, prop) {
      throw new Error('Cannot set property "' + String(prop) + '" on immutable object');
    }
  });
}

// ========== ES5 手写模拟：通过 setter 拦截 set ==========

function createSetProxyES5(target, setHandler) {
  var proxy = {};
  var keys = Object.keys(target);
  for (var i = 0; i < keys.length; i++) {
    (function (key) {
      var internalValue = target[key];
      Object.defineProperty(proxy, key, {
        get: function () { return internalValue; },
        set: function (newValue) {
          var result = setHandler(target, key, newValue);
          if (result !== false) {
            internalValue = newValue;
          }
        },
        enumerable: true,
        configurable: true
      });
    })(keys[i]);
  }
  return proxy;
}

// 测试 1：类型校验代理
console.log('--- Validated Proxy ---');
var person = createValidatedProxy({}, { name: 'string', age: 'number' });
person.name = 'Alice';
person.age = 25;
console.log(person.name, person.age); // Alice 25
try {
  person.age = 'twenty'; // 抛错
} catch (e) {
  console.log(e.message); // age must be number
}

// 测试 2：审计代理
console.log('--- Audit Proxy ---');
var audited = createAuditProxy({ count: 0 });
audited.count = 5;   // [set] count: 0 -> 5
audited.count = 10;  // [set] count: 5 -> 10
console.log(audited.count); // 10

// 测试 3：不可变代理
console.log('--- Immutable Proxy ---');
var frozen = createImmutableProxy({ x: 1 });
try {
  frozen.x = 2;
} catch (e) {
  console.log(e.message); // Cannot set property "x" on immutable object
}

// 测试 4：ES5 手写 set 拦截（带校验）
console.log('--- ES5 Set Proxy (setter) ---');
var model = createSetProxyES5({ score: 0 }, function (target, key, value) {
  if (key === 'score' && (value < 0 || value > 100)) {
    console.log('  [rejected] score must be 0-100');
    return false;
  }
  console.log('  [accepted] ' + key + ' = ' + value);
});
model.score = 85;  // [accepted] score = 85
console.log(model.score); // 85
model.score = 150; // [rejected] score must be 0-100
console.log(model.score); // 85（未被修改）
