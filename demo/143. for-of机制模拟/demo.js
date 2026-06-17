// 143. for-of机制模拟

const iterator = [10, 20][Symbol.iterator]();
let step;
while (!(step = iterator.next()).done) console.log(step.value);
