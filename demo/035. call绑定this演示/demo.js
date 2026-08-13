// 35. call绑定this演示

function intro(prefix, suffix) {
  return `${prefix} ${this.name}${suffix}`;
}
console.log(intro.call({ name: 'Alice' }, 'Hello', '!'));
