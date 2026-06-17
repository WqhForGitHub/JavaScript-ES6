// 119. 多态行为模拟

class Cat {
  speak() {
    return "meow";
  }
}
class Duck {
  speak() {
    return "quack";
  }
}
[new Cat(), new Duck()].forEach((animal) => console.log(animal.speak()));
