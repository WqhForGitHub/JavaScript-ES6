# 019 - 实现链式调用

> 链式调用的核心：方法执行完后返回当前对象（`return this`）或返回新的支持继续调用的对象。

## 方式一：同步链式调用（计算器）

```js
class Calculator {
  constructor(value = 0) {
    this.value = value;
  }
  add(n) {
    this.value += n;
    return this; // 关键：返回 this
  }
  subtract(n) {
    this.value -= n;
    return this;
  }
  multiply(n) {
    this.value *= n;
    return this;
  }
  divide(n) {
    if (n === 0) throw new Error('除数不能为 0');
    this.value /= n;
    return this;
  }
  getResult() {
    return this.value;
  }
}

const result = new Calculator(10).add(5).multiply(2).subtract(4).divide(2);
console.log(result.getResult()); // 13
```

## 方式二：链式调用操作数组（返回新对象，不可变风格）

```js
class Chain {
  constructor(arr = []) {
    this.arr = arr;
  }
  // 每一步都返回新的 Chain 实例，不修改原数据
  map(fn) {
    return new Chain(this.arr.map(fn));
  }
  filter(fn) {
    return new Chain(this.arr.filter(fn));
  }
  slice(start, end) {
    return new Chain(this.arr.slice(start, end));
  }
  reverse() {
    return new Chain(this.arr.slice().reverse());
  }
  value() {
    return this.arr;
  }
}

const data = [1, 2, 3, 4, 5, 6];
const output = new Chain(data)
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reverse()
  .value();

console.log(output); // [60, 40, 20]
```

## 方式三：异步链式调用（Promise 风格）

```js
class LazyTask {
  constructor() {
    this.callbacks = [];
    this.finalFn = null;
  }
  eat(food) {
    this.callbacks.push(() => {
      console.log(`吃 ${food}`);
      return this;
    });
    return this; // 返回 this 支持同步链式注册
  }
  sleep(time) {
    this.callbacks.push(
      () =>
        new Promise((resolve) => {
          console.log(`等待 ${time}s`);
          setTimeout(resolve, time);
        })
    );
    return this;
  }
  sleepFirst(time) {
    // 插队到最前面
    const task = () =>
      new Promise((resolve) => {
        console.log(`先等待 ${time}s`);
        setTimeout(resolve, time);
      });
    this.callbacks.unshift(task);
    return this;
  }
  async start() {
    for (const task of this.callbacks) {
      await task();
    }
    return this;
  }
}

// 模拟 LazyMan
const lazyMan = (name) => {
  console.log(`Hi, I am ${name}`);
  return new LazyTask();
};

lazyMan('张三').eat('午饭').sleep(1).eat('晚饭').sleepFirst(2).start();
// Hi, I am 张三
// 先等待 2s
// （2 秒后）吃 午饭
// 等待 1s
// （1 秒后）吃 晚饭
```
