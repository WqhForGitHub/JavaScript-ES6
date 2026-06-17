// 84. JSON深拷贝限制测试

const source = {
  date: new Date(),
  fn() {},
  value: undefined,
  nested: { n: 1 },
};
const copy = JSON.parse(JSON.stringify(source));
console.log(copy);
console.log(typeof copy.date);
