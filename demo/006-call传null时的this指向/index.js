function test() {
  console.log(this === globalThis); // 非严格模式下 null 被替换为全局对象
  console.log(this);
}
test.call(null);
