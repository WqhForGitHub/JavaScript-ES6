// 11. parseInt解析测试

['10', '10px', '08', '0x10', '1010', '3.14', 'abc'].forEach((value) => {
  console.log(value, parseInt(value, 10), parseInt(value, 2), parseInt(value));
});
