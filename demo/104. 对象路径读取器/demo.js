// 104. 对象路径读取器

function getByPath(obj, path, defaultValue) {
  const value = path.split(".").reduce((current, key) => current?.[key], obj);
  return value === undefined ? defaultValue : value;
}
const data = { user: { profile: { name: "Alice" } } };
console.log(getByPath(data, "user.profile.name"));
console.log(getByPath(data, "user.age", 0));
