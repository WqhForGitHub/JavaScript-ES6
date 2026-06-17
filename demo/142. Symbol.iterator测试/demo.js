// 142. Symbol.iterator测试

const list = {
  values: ["a", "b"],
  [Symbol.iterator]: function* () {
    yield* this.values;
  },
};
for (const item of list) console.log(item);
