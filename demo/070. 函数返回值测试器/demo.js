// 70. 函数返回值测试器

function returnsValue(flag) {
  if (flag) return 'value';
}
console.log(returnsValue(true));
console.log(returnsValue(false));
console.log(returnsValue(false) === undefined);
