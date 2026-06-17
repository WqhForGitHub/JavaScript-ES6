// 5. typeof全类型测试器

[
  undefined,
  null,
  true,
  1,
  "x",
  1n,
  Symbol("s"),
  {},
  [],
  function () {},
].forEach((value) => {
  console.log(value, "=>", typeof value);
});
