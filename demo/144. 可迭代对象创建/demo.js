// 144. 可迭代对象创建

function makeIterable(items) {
  return {
    [Symbol.iterator]: function* () {
      for (const item of items) yield item;
    },
  };
}
console.log([...makeIterable(["x", "y"])]);
