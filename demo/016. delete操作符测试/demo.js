// 16. delete操作符测试

const obj = { name: "Alice", age: 20 };
const arr = [1, 2, 3];
console.log(delete obj.age, obj);
console.log(delete arr[1], arr, arr.length);
