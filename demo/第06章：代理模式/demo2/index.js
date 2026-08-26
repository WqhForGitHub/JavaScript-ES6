// 权限保护代理
class RealAccount {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
}

class ProtectedAccount {
  constructor(real, role) {
    this.real = real;
    this.role = role;
  }

  get name() {
    return this.real.name;
  }

  get salary() {
    if (this.role !== "admin") {
      throw new Error("Access denied: salary is admin-only");
    }
    return this.real.salary;
  }
}

const account = new ProtectedAccount(new RealAccount("Tom", 100000), "guest");

console.log(account.name);    // "Tom"
console.log(account.salary); // ❌ Error