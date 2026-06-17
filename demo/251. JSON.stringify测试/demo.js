// 251. JSON.stringify测试

const user = { name: "Alice", age: 20, password: "secret" };
const json = JSON.stringify(
  user,
  (key, value) => (key === "password" ? undefined : value),
  2,
);
console.log(json);
