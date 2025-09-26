console.log("Ungrouped foo");
console.log("Ungrouped bar");
console.group("My Group");
console.log("Grouped foo");
console.log("Grouped bar");
console.groupEnd();

console.group("My Group"); // 开始一个新分组
console.log("Starting loop."); // 输出一条消息
console.groupCollapsed("Loop"); // 开始一个新折叠的子分组
for (let i = 0; i < 5; i++) {
  console.log("Iteration " + i); // 每次迭代都输出一条消息
}
console.groupEnd(); // 结束 Loop 分组
console.log("Loop complete."); // 输出一条消息
console.groupEnd(); // 结束 MyGroup 分组

console.time("My Timer");
for (let i = 0; i < 1000000; i++) {
  if (i % 100000 === 0) {
    console.timeLog("My Timer", `Finished ${i} items`);
  }
}
console.timeEnd("My Timer");

const myArray = [
  {
    name: "Alice",
    age: 30,
  },
  {
    name: "Bob",
    age: 25,
  },
  {
    name: "Chunk",
    age: 40,
  },
];

console.table(myArray);

function foo() {
  console.trace();
}

function bar() {
  foo();
}

bar();
