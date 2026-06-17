// 121. mixin混入模式

const Flyable = (Base) =>
  class extends Base {
    fly() {
      return this.name + " flies";
    }
  };
class Bird {
  constructor(name) {
    this.name = name;
  }
}
class Eagle extends Flyable(Bird) {}
console.log(new Eagle("eagle").fly());
