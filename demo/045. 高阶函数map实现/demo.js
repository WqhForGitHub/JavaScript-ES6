// 45. 高阶函数map实现

function myMap(array, mapper) {
  const result = [];
  for (let i = 0; i < array.length; i++) result.push(mapper(array[i], i));
  return result;
}
console.log(myMap([1, 2, 3], (n) => n * 2));
