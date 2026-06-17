// 134. 类方法链式调用

class Calculator {
  constructor(v = 0) {
    this.value = v;
  }
  add(n) {
    this.value += n;
    return this;
  }
  multiply(n) {
    this.value *= n;
    return this;
  }
}
console.log(new Calculator(2).add(3).multiply(4).value);
