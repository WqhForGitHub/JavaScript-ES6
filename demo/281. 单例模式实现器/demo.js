// 281. 单例模式实现器

function createSingleton(ClassName) {
  let instance;
  return (...args) => instance || (instance = new ClassName(...args));
}
class Config {
  constructor(name) {
    this.name = name;
  }
}
const getConfig = createSingleton(Config);
console.log(getConfig('app') === getConfig('other'));
