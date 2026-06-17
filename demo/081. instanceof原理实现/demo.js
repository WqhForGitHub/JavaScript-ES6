// 81. instanceof原理实现

function myInstanceOf(value, Constructor) {
  let proto = Object.getPrototypeOf(value);
  while (proto) {
    if (proto === Constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
console.log(myInstanceOf([], Array));
console.log(myInstanceOf({}, Array));
