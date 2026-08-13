// 72. Object.create继承测试

const animal = {
  speak() {
    return `${this.name} makes noise`;
  },
};
const dog = Object.create(animal);
dog.name = 'Dog';
console.log(dog.speak());
console.log(Object.getPrototypeOf(dog) === animal);
