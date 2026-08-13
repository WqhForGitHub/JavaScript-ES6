// 71. 对象创建方式对比

const literal = { name: 'literal' };
const constructed = new Object({ name: 'constructed' });
const created = Object.create({ kind: 'prototype' });
created.name = 'created';
console.log(literal, constructed, created.kind, created.name);
