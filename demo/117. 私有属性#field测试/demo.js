// 117. 私有属性#field测试

class Wallet {
  #money = 0;
  deposit(n) {
    this.#money += n;
  }
  get balance() {
    return this.#money;
  }
}
const w = new Wallet();
w.deposit(50);
console.log(w.balance);
