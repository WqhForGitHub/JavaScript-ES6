// 137. class装饰器模拟

function freezePrototype(ClassRef) {
  Object.freeze(ClassRef.prototype);
  return ClassRef;
}
class Service {
  run() {
    return 'run';
  }
}
const S = freezePrototype(Service);
console.log(Object.isFrozen(S.prototype));
