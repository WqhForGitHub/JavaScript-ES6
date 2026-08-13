// 113. 类继承extends测试

class Animal {
  speak() {
    return 'sound';
  }
}
class Dog extends Animal {
  bark() {
    return 'woof';
  }
}
const dog = new Dog();
console.log(dog.speak(), dog.bark());
