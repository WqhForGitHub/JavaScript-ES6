// 83. 深拷贝递归实现

function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  Reflect.ownKeys(value).forEach((key) => (copy[key] = deepClone(value[key], seen)));
  return copy;
}
const obj = { nested: { n: 1 } };
const copy = deepClone(obj);
copy.nested.n = 2;
console.log(obj.nested.n, copy.nested.n);
