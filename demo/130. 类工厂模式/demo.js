// 130. 类工厂模式

function createModel(type) {
  return class {
    constructor(value) {
      this.type = type;
      this.value = value;
    }
  };
}
const UserModel = createModel('user');
console.log(new UserModel('Tom'));
