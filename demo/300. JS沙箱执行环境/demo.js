// 300. JS沙箱执行环境

function runInSandbox(code, context = {}) {
  const keys = Object.keys(context);
  const values = Object.values(context);
  const fn = new Function(...keys, `"use strict"; ${code}`);
  return fn(...values);
}
console.log(runInSandbox('return a+b', { a: 2, b: 3 }));
