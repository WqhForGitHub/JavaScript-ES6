// 147. 生成器无限序列

function* natural() {
  let n = 1;
  while (true) yield n++;
}
const gen = natural();
console.log(gen.next().value, gen.next().value, gen.next().value);
