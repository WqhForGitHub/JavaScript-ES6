// 47. 高阶函数reduce实现

function myReduce(array, reducer, initial) {
  let acc = initial;
  for (let i = 0; i < array.length; i++) acc = reducer(acc, array[i], i);
  return acc;
}
console.log(myReduce([1, 2, 3], (a, b) => a + b, 0));
