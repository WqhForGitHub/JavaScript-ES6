// 197. 事件冒泡测试

const parent = { name: "parent", handler: () => console.log("parent") };
const child = { name: "child", parent, handler: () => console.log("child") };
for (let node = child; node; node = node.parent) node.handler();
