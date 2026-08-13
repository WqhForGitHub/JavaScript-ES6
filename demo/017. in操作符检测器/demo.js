// 17. in操作符检测器

const obj = Object.create({ role: 'admin' });
obj.name = 'Alice';
console.log('name' in obj);
console.log('role' in obj);
console.log(Object.hasOwn(obj, 'role'));
