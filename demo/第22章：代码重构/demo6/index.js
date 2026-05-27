// ============================================================
// 替换过时的语言特性 / API
// 用现代 JavaScript 特性替换老旧写法
// ============================================================

// ============================================================
// 1. var → let / const
// ============================================================

// ---------- 重构前 ----------
var name1 = "sven";
var age1 = 30;
if (true) {
  var name1 = "anne";  // 变量提升，覆盖了外层的 name1
}
console.log("var name: " + name1);  // anne（意料之外的覆盖）

// ---------- 重构后 ----------
const name2 = "sven";
let age2 = 30;
if (true) {
  const name2 = "anne";  // 块级作用域，不会影响外层
}
console.log("const name: " + name2);  // sven（符合预期）

// ============================================================
// 2. 字符串拼接 → 模板字符串
// ============================================================

// ---------- 重构前 ----------
var user1 = { name: "sven", age: 30 };
var greeting1 = "你好，我叫" + user1.name + "，今年" + user1.age + "岁。";
console.log(greeting1);

// ---------- 重构后 ----------
const user2 = { name: "sven", age: 30 };
const greeting2 = `你好，我叫${user2.name}，今年${user2.age}岁。`;
console.log(greeting2);

// ============================================================
// 3. 匿名函数 → 箭头函数
// ============================================================

// ---------- 重构前 ----------
var numbers1 = [1, 2, 3, 4, 5];
var doubled1 = numbers1.map(function (n) {
  return n * 2;
});
console.log("匿名函数: " + doubled1);

// ---------- 重构后 ----------
const numbers2 = [1, 2, 3, 4, 5];
const doubled2 = numbers2.map(n => n * 2);
console.log("箭头函数: " + doubled2);

// 箭头函数解决 this 困扰
// ---------- 重构前 ----------
function TimerBefore() {
  this.seconds = 0;
  var self = this;  // 保存 this 引用
  setInterval(function () {
    self.seconds++;
  }, 1000);
}

// ---------- 重构后 ----------
function TimerAfter() {
  this.seconds = 0;
  setInterval(() => {
    this.seconds++;  // 箭头函数自动绑定外层 this
  }, 1000);
}

// ============================================================
// 4. Callback Hell → Promise → async/await
// ============================================================

// ---------- 重构前：回调地狱 ----------
var getUserBefore = function (userId, callback) {
  setTimeout(function () {
    callback({ id: userId, name: "sven" });
  }, 100);
};

var getOrdersBefore = function (userName, callback) {
  setTimeout(function () {
    callback([{ id: 1, item: "书" }, { id: 2, item: "笔" }]);
  }, 100);
};

// 嵌套越来越深
getUserBefore(1, function (user) {
  getOrdersBefore(user.name, function (orders) {
    console.log("回调方式 - 订单: " + JSON.stringify(orders));
  });
});

// ---------- 重构后：Promise ----------
var getUserPromise = function (userId) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({ id: userId, name: "sven" });
    }, 100);
  });
};

var getOrdersPromise = function (userName) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve([{ id: 1, item: "书" }, { id: 2, item: "笔" }]);
    }, 100);
  });
};

// 链式调用，扁平化
getUserPromise(1)
  .then(function (user) {
    return getOrdersPromise(user.name);
  })
  .then(function (orders) {
    console.log("Promise 方式 - 订单: " + JSON.stringify(orders));
  });

// ---------- 重构后：async/await ----------
// 更像同步代码的写法（需要现代浏览器或 Node.js 支持）
// async function printOrders() {
//   const user = await getUserPromise(1);
//   const orders = await getOrdersPromise(user.name);
//   console.log("async/await 方式 - 订单: " + JSON.stringify(orders));
// }
// printOrders();

// ============================================================
// 5. 解构赋值
// ============================================================

// ---------- 重构前 ----------
var person1 = { name: "sven", age: 30, city: "杭州" };
var name3 = person1.name;
var age3 = person1.age;
var city3 = person1.city;
console.log("重构前: " + name3 + ", " + age3 + ", " + city3);

// ---------- 重构后 ----------
const person2 = { name: "anne", age: 25, city: "上海" };
const { name: personName, age: personAge, city: personCity } = person2;
console.log(`重构后: ${personName}, ${personAge}, ${personCity}`);

// 数组解构
const colors = ["red", "green", "blue"];
const [first, second, third] = colors;
console.log(`颜色: ${first}, ${second}, ${third}`);

// 函数参数解构
// ---------- 重构前 ----------
var createUserBefore = function (options) {
  var name = options.name;
  var age = options.age;
  var role = options.role || "user";
  console.log("创建用户: " + name + ", " + age + ", " + role);
};

// ---------- 重构后 ----------
const createUserAfter = function ({ name, age, role = "user" }) {
  console.log(`创建用户: ${name}, ${age}, ${role}`);
};

createUserBefore({ name: "sven", age: 30 });
createUserAfter({ name: "anne", age: 25 });
createUserAfter({ name: "bob", age: 28, role: "admin" });
