// 151. Map键值存储测试

const map = new Map();
const key = { id: 1 };
map.set(key, 'object value');
map.set('name', 'Map');
console.log(map.get(key), map.size);
