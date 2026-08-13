// 132. 静态工厂类

class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }
  static admin(name) {
    return new User(name, 'admin');
  }
}
console.log(User.admin('Root'));
