// 85. 属性描述符定义器

const obj = {};
Object.defineProperty(obj, "id", {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: false,
});
obj.id = 2;
console.log(obj.id);
console.log(Object.getOwnPropertyDescriptor(obj, "id"));
