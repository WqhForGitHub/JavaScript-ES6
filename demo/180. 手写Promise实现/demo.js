// 180. 手写Promise实现

class MiniPromise {
  constructor(executor) {
    this.callbacks = [];
    executor(this.resolve.bind(this));
  }
  resolve(value) {
    this.value = value;
    this.callbacks.forEach((fn) => fn(value));
  }
  then(fn) {
    this.value !== undefined ? fn(this.value) : this.callbacks.push(fn);
    return this;
  }
}
new MiniPromise((resolve) => setTimeout(() => resolve(42), 50)).then(
  console.log,
);
