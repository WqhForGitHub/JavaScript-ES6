// 287. 装饰器模式模拟

function withTiming(fn) {
  return (...args) => {
    const start = Date.now();
    const result = fn(...args);
    console.log('cost:', Date.now() - start);
    return result;
  };
}
const add = withTiming((a, b) => a + b);
console.log(add(1, 2));
