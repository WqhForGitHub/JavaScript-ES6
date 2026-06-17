// 148. 斐波那契生成器

function* fibonacci() {
  let a = 0,
    b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const gen = fibonacci();
console.log(Array.from({ length: 7 }, () => gen.next().value));
