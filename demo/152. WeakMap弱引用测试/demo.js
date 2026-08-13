// 152. WeakMap弱引用测试

const weak = new WeakMap();
let key = { id: 1 };
weak.set(key, 'private');
console.log(weak.get(key));
key = null;
