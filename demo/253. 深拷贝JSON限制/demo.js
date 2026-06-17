// 253. 深拷贝JSON限制

const source = {
  date: new Date("2024-01-01"),
  fn() {},
  undefinedValue: undefined,
  nested: { value: 1 },
};
const copied = JSON.parse(JSON.stringify(source));
console.log(copied);
console.log("函数和 undefined 会丢失，Date 会变成字符串");
