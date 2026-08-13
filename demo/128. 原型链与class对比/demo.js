// 128. 原型链与class对比

class ClassUser {
  say() {
    return 'class';
  }
}
function ProtoUser() {}
ProtoUser.prototype.say = function () {
  return 'prototype';
};
console.log(new ClassUser().say(), new ProtoUser().say());
