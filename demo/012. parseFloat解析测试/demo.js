// 12. parseFloat解析测试

['3.14', '3.14px', '.5', '1.2.3', 'Infinity', 'abc'].forEach((value) => {
  console.log(value, parseFloat(value));
});
