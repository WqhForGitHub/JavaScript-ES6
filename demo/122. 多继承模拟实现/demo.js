// 122. 多继承模拟实现

const Eat = (Base) =>
  class extends Base {
    eat() {
      return "eat";
    }
  };
const Sleep = (Base) =>
  class extends Base {
    sleep() {
      return "sleep";
    }
  };
class Person {}
class Student extends Eat(Sleep(Person)) {}
const s = new Student();
console.log(s.eat(), s.sleep());
