// 69. 函数执行上下文分析

const user = {
  name: 'Alice',
  show(prefix) {
    console.log(prefix, this.name);
  },
};
const detached = user.show;
user.show('method');
detached.call({ name: 'Bob' }, 'call');
