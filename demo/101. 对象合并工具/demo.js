// 101. 对象合并工具

function merge(...objects) {
  return Object.assign({}, ...objects);
}
console.log(merge({ a: 1 }, { b: 2 }, { a: 3 }));
