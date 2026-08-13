// 1. JS变量作用域测试

const globalName = 'global';
function testScope() {
  const functionName = 'function';
  if (true) {
    var varName = 'var';
    const letName = 'let';
    const constName = 'const';
    console.log(globalName, functionName, varName, letName, constName);
  }
  console.log(varName);
  console.log(typeof letName);
}
testScope();
