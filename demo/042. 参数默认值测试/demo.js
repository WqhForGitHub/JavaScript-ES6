// 42. 参数默认值测试

function createUser(name = "Anonymous", role = "guest") {
  return { name, role };
}
console.log(createUser());
console.log(createUser("Alice"));
