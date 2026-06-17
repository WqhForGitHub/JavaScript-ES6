// 127. 类继承链分析器

class A {}
class B extends A {}
class C extends B {}
let proto = C.prototype;
while (proto) {
  console.log(proto.constructor && proto.constructor.name);
  proto = Object.getPrototypeOf(proto);
}
