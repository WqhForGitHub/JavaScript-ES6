// 46. 高阶函数filter实现

function myFilter(array, predicate) {
  const result = [];
  for (let i = 0; i < array.length; i++)
    if (predicate(array[i], i)) result.push(array[i]);
  return result;
}
console.log(myFilter([1, 2, 3, 4], (n) => n % 2 === 0));
