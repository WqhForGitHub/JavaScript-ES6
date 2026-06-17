// 107. 对象比较器

function shallowEqual(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return (
    keysA.length === keysB.length &&
    keysA.every((key) => Object.is(a[key], b[key]))
  );
}
console.log(shallowEqual({ a: 1 }, { a: 1 }));
console.log(shallowEqual({ a: 1 }, { a: 2 }));
