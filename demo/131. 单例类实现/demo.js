// 131. 单例类实现

class Singleton {
  static instance;
  constructor(name) {
    if (Singleton.instance) return Singleton.instance;
    this.name = name;
    Singleton.instance = this;
  }
}
console.log(new Singleton('first') === new Singleton('second'));
