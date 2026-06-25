/**
 * 手写 Reflect.set
 *
 * Reflect.set(target, propertyKey, value, receiver)
 * 在对象上设置指定属性的值，等价于 target[propertyKey] = value，
 * 但 receiver 参数会影响 setter 中 this 的指向。
 * 返回布尔值表示是否设置成功。
 * 这里手写一个与原生行为一致的实现。
 */

// 手写 Reflect.set
function myReflectSet(target, propertyKey, value, receiver) {
  if (
    target == null ||
    (typeof target !== "object" && typeof target !== "function")
  ) {
    throw new TypeError("Reflect.set called on non-object");
  }
  var key = String(propertyKey);
  receiver = receiver || target;

  // 沿原型链查找属性描述符
  var descriptor;
  var proto = target;
  while (proto !== null) {
    descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) break;
    proto = Object.getPrototypeOf(proto);
  }

  if (descriptor) {
    // 如果是访问器属性（有 setter）
    if ("set" in descriptor) {
      descriptor.set.call(receiver, value);
      return true;
    }
    // 如果是数据属性但不可写
    if ("writable" in descriptor && !descriptor.writable) {
      return false;
    }
  }

  // 在 receiver 上设置属性
  var existing = Object.getOwnPropertyDescriptor(receiver, key);
  if (existing) {
    if (existing.get || existing.set) {
      if (existing.set) {
        existing.set.call(receiver, value);
        return true;
      }
      return false; // 只有 getter 没有 setter
    }
    if (existing.writable === false) {
      return false;
    }
  }

  Object.defineProperty(receiver, key, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return true;
}

// 测试 1：设置普通属性
console.log("--- Set data property ---");
var obj = {};
console.log(myReflectSet(obj, "x", 10)); // true
console.log(obj.x); // 10
console.log(myReflectSet(obj, "y", 20)); // true
console.log(obj.y); // 20

// 测试 2：设置访问器属性
console.log("--- Set accessor property ---");
var person = {
  _age: 0,
  get age() {
    return this._age;
  },
  set age(v) {
    this._age = v;
  },
};
console.log(myReflectSet(person, "age", 25)); // true
console.log(person.age); // 25
console.log(person._age); // 25

// 测试 3：receiver 参数影响 setter 中的 this
console.log("--- Set with receiver ---");
var base = {
  _val: 0,
  set val(v) {
    this._val = v;
  },
};
console.log(myReflectSet(base, "val", 100)); // true
console.log(base._val); // 100

var receiverObj = { _val: 999 };
console.log(myReflectSet(base, "val", 555, receiverObj)); // true
console.log(receiverObj._val); // 555（setter 在 receiver 上执行）
console.log(base._val); // 100（未被修改）

// 测试 4：不可写属性返回 false
console.log("--- Set non-writable ---");
var frozen = {};
Object.defineProperty(frozen, "x", { value: 1, writable: false });
console.log(myReflectSet(frozen, "x", 2)); // false
console.log(frozen.x); // 1（未改变）

// 测试 5：数组元素
console.log("--- Set array element ---");
var arr = [1, 2, 3];
console.log(myReflectSet(arr, 1, 20)); // true
console.log(arr); // [1, 20, 3]

// 测试 6：与原生对比
console.log("--- Compare with native ---");
var test = {};
console.log(myReflectSet(test, "a", 1)); // true
console.log(Reflect.set(test, "a", 1)); // true
console.log(test.a); // 1

// 测试 7：非对象目标抛错
console.log("--- Error on non-object ---");
try {
  myReflectSet(null, "x", 1);
} catch (e) {
  console.log(e.message); // Reflect.set called on non-object
}
