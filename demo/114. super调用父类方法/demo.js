// 114. super调用父类方法

class Base {
  log(msg) {
    return "[base] " + msg;
  }
}
class Child extends Base {
  log(msg) {
    return super.log("child " + msg);
  }
}
console.log(new Child().log("run"));
