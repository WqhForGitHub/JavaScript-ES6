// 78. 工厂模式创建对象

function createUser(name, role) {
  return {
    name,
    role,
    describe() {
      return `${this.name}: ${this.role}`;
    },
  };
}
console.log(createUser("Alice", "admin").describe());
