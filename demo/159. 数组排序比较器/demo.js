// 159. 数组排序比较器

const users = [
  { name: "A", age: 30 },
  { name: "B", age: 20 },
];
users.sort((a, b) => a.age - b.age);
console.log(users);
