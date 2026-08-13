// 63. 函数绑定模拟器

function myBind(fn, context, ...boundArgs) {
  return (...args) => fn.apply(context, [...boundArgs, ...args]);
}
function add(a, b) {
  return `${this.prefix}${a + b}`;
}
console.log(myBind(add, { prefix: 'sum=' }, 1)(2));
