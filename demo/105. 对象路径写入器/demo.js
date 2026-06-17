// 105. 对象路径写入器

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let current = obj;
  keys.slice(0, -1).forEach((key) => (current = current[key] ||= {}));
  current[keys.at(-1)] = value;
  return obj;
}
const data = {};
console.log(setByPath(data, "user.profile.name", "Alice"));
