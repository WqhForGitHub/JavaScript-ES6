// 110. 对象序列化工具

function serialize(obj) {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "function")
        return `[Function ${value.name || "anonymous"}]`;
      if (typeof value === "symbol") return value.toString();
      return value;
    },
    2,
  );
}
console.log(serialize({ name: "Alice", fn() {}, id: Symbol("id") }));
