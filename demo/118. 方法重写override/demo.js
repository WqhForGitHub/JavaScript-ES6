// 118. 方法重写override

class Shape {
  area() {
    return 0;
  }
}
class Square extends Shape {
  constructor(size) {
    super();
    this.size = size;
  }
  area() {
    return this.size ** 2;
  }
}
console.log(new Shape().area(), new Square(4).area());
