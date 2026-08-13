// 92. 计算属性名对象

const field = 'score';
const index = 1;
const obj = { [field]: 100, [`item_${index}`]: 'value' };
console.log(obj);
