// 33. 箭头函数this绑定测试

const obj = {
  value: 1,
  normal() {
    return this.value;
  },
  arrow: () => this && this.value,
};
console.log(obj.normal());
console.log(obj.arrow());
