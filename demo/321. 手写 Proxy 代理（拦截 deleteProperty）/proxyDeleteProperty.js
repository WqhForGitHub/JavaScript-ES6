/**
 * 手写 Proxy 代理（拦截 deleteProperty）
 *
 * Proxy 的 deleteProperty 拦截器可以拦截 delete 操作符，
 * 控制属性是否可以被删除。常用于保护某些属性不被删除或记录删除日志。
 */

// ========== 原生 Proxy：拦截 deleteProperty ==========

// 拦截 delete，保护指定属性不被删除
function createProtectedProxy(target, protectedProps) {
  return new Proxy(target, {
    deleteProperty: function (target, prop) {
      if (protectedProps.indexOf(prop) !== -1) {
        throw new Error("Cannot delete protected property: " + String(prop));
      }
      delete target[prop];
      return true;
    },
  });
}

// 拦截 delete，记录删除日志
function createDeleteAuditProxy(target) {
  return new Proxy(target, {
    deleteProperty: function (target, prop) {
      var existed = prop in target;
      console.log("  [delete] " + String(prop) + " (existed: " + existed + ")");
      delete target[prop];
      return true;
    },
  });
}

// 拦截 delete，禁止删除任何属性
function createNoDeleteProxy(target) {
  return new Proxy(target, {
    deleteProperty: function (target, prop) {
      return false; // 删除失败
    },
  });
}

// ========== ES5 手写模拟 ==========

// ES5 无法拦截 delete 操作符，但可通过 configurable: false 防止删除
function protectProperties(target, protectedProps) {
  protectedProps.forEach(function (prop) {
    if (prop in target) {
      var descriptor = Object.getOwnPropertyDescriptor(target, prop);
      Object.defineProperty(target, prop, {
        value: descriptor.value,
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: false, // 不可删除
      });
    }
  });
  return target;
}

// 测试 1：保护属性
console.log("--- Protected Proxy ---");
var config = createProtectedProxy(
  { host: "localhost", port: 8080, debug: true },
  ["host", "port"],
);
delete config.debug;
console.log("debug" in config); // false（可删除）
console.log(config.debug); // undefined
try {
  delete config.host; // 抛错
} catch (e) {
  console.log(e.message); // Cannot delete protected property: host
}
console.log(config.host); // localhost（仍存在）

// 测试 2：删除审计
console.log("--- Delete Audit Proxy ---");
var audited = createDeleteAuditProxy({ a: 1, b: 2 });
delete audited.a; // [delete] a (existed: true)
delete audited.c; // [delete] c (existed: false)
console.log("a" in audited); // false

// 测试 3：禁止删除
console.log("--- No Delete Proxy ---");
var locked = createNoDeleteProxy({ x: 1, y: 2 });
try {
  delete locked.x;
} catch (e) {
  console.log("Delete blocked"); // （严格模式下抛错）
}
// 在非严格模式下 delete 返回 false
var result = delete locked.x;
console.log(result); // delete 操作可能返回 true/false 取决于严格模式

// 测试 4：ES5 模拟（configurable: false）
console.log("--- ES5 Protect Properties ---");
var data = { name: "Alice", age: 25, temp: "x" };
protectProperties(data, ["name", "age"]);
delete data.temp;
console.log("temp" in data); // false
delete data.name; // 严格模式下抛错，非严格模式静默失败
console.log(data.name); // Alice（仍存在）
