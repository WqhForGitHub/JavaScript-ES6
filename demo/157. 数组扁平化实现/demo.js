// 157. 数组扁平化实现

function flatten(arr) {
  return arr.reduce((res, item) => res.concat(Array.isArray(item) ? flatten(item) : item), []);
}
console.log(flatten([1, [2, [3, 4]]]));
