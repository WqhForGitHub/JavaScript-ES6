// 109. 对象冻结深度测试

function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach((value) => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) deepFreeze(value);
  });
  return obj;
}
const data = deepFreeze({ user: { name: 'Alice' } });
data.user.name = 'Bob';
console.log(data.user.name, Object.isFrozen(data.user));
