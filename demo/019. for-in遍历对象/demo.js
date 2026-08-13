// 19. for-in遍历对象

const obj = Object.create({ inherited: 'yes' });
obj.own = 'value';
for (const key in obj) console.log(key, obj[key], Object.hasOwn(obj, key));
