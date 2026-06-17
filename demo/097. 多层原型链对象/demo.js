// 97. 多层原型链对象

const base = { base: true };
const middle = Object.create(base);
middle.middle = true;
const leaf = Object.create(middle);
leaf.leaf = true;
console.log(leaf.leaf, leaf.middle, leaf.base);
