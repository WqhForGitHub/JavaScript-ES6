// 126. constructor执行顺序

class Parent {
  constructor() {
    console.log('parent');
  }
}
class Child extends Parent {
  constructor() {
    console.log('before super');
    super();
    console.log('child');
  }
}
new Child();
