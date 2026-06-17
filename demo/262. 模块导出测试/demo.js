// 262. 模块导出测试

const mathModule = (() => {
  function add(a, b) {
    return a + b;
  }
  function multiply(a, b) {
    return a * b;
  }
  return { add, multiply };
})();
console.log(mathModule.add(1, 2), mathModule.multiply(3, 4));
