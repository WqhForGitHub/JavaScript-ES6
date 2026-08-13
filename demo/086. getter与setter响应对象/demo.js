// 86. getter与setter响应对象

const user = {
  firstName: 'Alice',
  lastName: 'Lee',
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(' ');
  },
};
console.log(user.fullName);
user.fullName = 'Bob Wang';
console.log(user.fullName);
