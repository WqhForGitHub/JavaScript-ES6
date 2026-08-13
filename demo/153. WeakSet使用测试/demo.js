// 153. WeakSet使用测试

const visited = new WeakSet();
const node = { name: 'root' };
visited.add(node);
console.log(visited.has(node), visited.has({ name: 'root' }));
