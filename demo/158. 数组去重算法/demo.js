// 158. 数组去重算法

function unique(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
console.log(unique(['a', 'b', 'a', 'c']));
