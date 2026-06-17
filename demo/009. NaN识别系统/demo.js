// 9. NaN识别系统

[NaN, Number("abc"), 0 / 0, "NaN", undefined].forEach((value) => {
  console.log(value, isNaN(value), Number.isNaN(value), value !== value);
});
