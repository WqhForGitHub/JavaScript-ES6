// 13. Boolean转换规则演示

[false, 0, -0, 0n, "", null, undefined, NaN, true, 1, "0", [], {}].forEach(
  (value) => {
    console.log(String(value), Boolean(value));
  },
);
