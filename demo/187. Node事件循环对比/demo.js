// 187. Node事件循环对比

console.log('start');
if (typeof setImmediate === 'function') setImmediate(() => console.log('setImmediate'));
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('promise microtask'));
if (typeof process !== 'undefined' && process.nextTick)
  process.nextTick(() => console.log('nextTick'));
