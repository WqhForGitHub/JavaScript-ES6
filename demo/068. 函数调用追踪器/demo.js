// 68. 函数调用追踪器

function trace(fn, name = fn.name) {
  return (...args) => {
    console.log("call", name, args);
    const result = fn(...args);
    console.log("return", result);
    return result;
  };
}
trace((a, b) => a + b, "add")(2, 3);
