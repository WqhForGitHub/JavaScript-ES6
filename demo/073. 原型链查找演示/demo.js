// 73. 原型链查找演示

const grand = { level: 'grand' };
const parent = Object.create(grand);
parent.name = 'parent';
const child = Object.create(parent);
console.log(child.name, child.level, child.missing);
