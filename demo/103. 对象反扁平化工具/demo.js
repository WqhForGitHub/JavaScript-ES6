// 103. 对象反扁平化工具

function unflatten(flat) {
  const result = {};
  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.');
    let current = result;
    keys.slice(0, -1).forEach((key) => (current = current[key] ||= {}));
    current[keys.at(-1)] = value;
  }
  return result;
}
console.log(unflatten({ 'user.name': 'Alice', 'user.age': 20 }));
