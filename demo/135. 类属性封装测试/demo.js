// 135. 类属性封装测试

class Account {
  #balance = 0;
  deposit(v) {
    if (v > 0) this.#balance += v;
  }
  getBalance() {
    return this.#balance;
  }
}
const a = new Account();
a.deposit(100);
console.log(a.getBalance());
