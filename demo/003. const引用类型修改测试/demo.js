// 3. const引用类型修改测试

const user = { name: 'Alice', age: 20 };
const list = [1, 2, 3];
user.age = 21;
list.push(4);
console.log(user, list);
try {
  user = {};
} catch (error) {
  console.log(error.message);
}
