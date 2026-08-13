// 8. 强制类型转换工具

function convert(value) {
  return {
    string: String(value),
    number: Number(value),
    boolean: Boolean(value),
  };
}
['123', '', 'abc', 0, null, undefined, []].forEach((value) => console.log(value, convert(value)));
