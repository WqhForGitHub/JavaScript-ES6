// 102. 对象扁平化工具

function flatten(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, result);
    else result[path] = value;
  }
  return result;
}
console.log(flatten({ user: { name: 'Alice', age: 20 }, active: true }));
