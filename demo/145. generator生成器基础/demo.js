// 145. generator生成器基础

function* numbers() {
  yield 1;
  yield 2;
  return 3;
}
const gen = numbers();
console.log(gen.next(), gen.next(), gen.next());
