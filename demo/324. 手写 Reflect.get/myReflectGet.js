/**
 * 手写 Reflect.get
 *
 * Reflect.get(target, propertyKey, receiver)
 * 从对象上获取指定属性的值，等价于 target[propertyKey]，
 * 但 receiver 参数会影响 getter 中 this 的指向。
 * 这里手写一个与原生行为一致的实现。
 */

// 手写 Reflect.get
function myReflectGet(target, propertyKey, receiver) {
  if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    throw new TypeError('Reflect.get called on non-object');
  }
  var key = String(propertyKey);
  receiver = receiver || target;

  var descriptor = Object.getOwnPropertyDescriptor(target, key);
  // 沿原型链查找
  var proto = target;
  while (proto !== null) {
    descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) break;
    proto = Object.getPrototypeOf(proto);
  }

  if (!descriptor) return undefined;

  if ('get' in descriptor) {
    // 如果是访问器属性，使用 receiver 作为 this 调用 getter
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

// 测试 1：获取普通属性
console.log('--- Get data property ---');
var obj = { x: 1, y: 2, name: 'Alice' };
console.log(myReflectGet(obj, 'x'));    // 1
console.log(myReflectGet(obj, 'name')); // Alice
console.log(myReflectGet(obj, 'z'));    // undefined

// 测试 2：获取访问器属性
console.log('--- Get accessor property ---');
var person = {
  _name: 'Bob',
  get name() { return this._name; }
};
console.log(myReflectGet(person, 'name')); // Bob

// 测试 3：receiver 参数影响 getter 中的 this
console.log('--- Get with receiver ---');
var base = {
  _val: 100,
  get val() { return this._val; }
};
console.log(myReflectGet(base, 'val')); // 100
console.log(myReflectGet(base, 'val', { _val: 200 })); // 200（receiver 改变了 this）

// 测试 4：沿原型链获取
console.log('--- Get from prototype chain ---');
var child = Object.create({ inherited: 'from proto' });
child.own = 'own value';
console.log(myReflectGet(child, 'own'));       // own value
console.log(myReflectGet(child, 'inherited')); // from proto

// 测试 5：数组索引
console.log('--- Get array element ---');
var arr = [10, 20, 30];
console.log(myReflectGet(arr, 0)); // 10
console.log(myReflectGet(arr, 1)); // 20
console.log(myReflectGet(arr, 'length')); // 3

// 测试 6：与原生对比
console.log('--- Compare with native ---');
console.log(myReflectGet(obj, 'x'));  // 1
console.log(Reflect.get(obj, 'x'));   // 1
console.log(myReflectGet(base, 'val', { _val: 200 })); // 200
console.log(Reflect.get(base, 'val', { _val: 200 }));  // 200

// 测试 7：非对象目标抛错
console.log('--- Error on non-object ---');
try {
  myReflectGet(42, 'x');
} catch (e) {
  console.log(e.message); // Reflect.get called on non-object
}
