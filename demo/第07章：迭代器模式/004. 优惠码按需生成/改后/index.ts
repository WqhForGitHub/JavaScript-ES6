// 改后：迭代器模式 -- 生成器惰性求值，要一个才算一个，序列理论上无限长

function* codeGenerator(prefix: string): Generator<string> {
  let i = 0;
  while (true) {
    // 没有 next() 之前，这行代码根本不会执行
    yield `${prefix}-${String(i++).padStart(6, '0')}`;
  }
}

// 此刻内存里一个优惠码都没有
const codes = codeGenerator('SALE');
console.log('生成器已就绪，内存占用为 0');

// 发 3 个才算 3 个
for (let i = 0; i < 3; i++) {
  console.log('发放优惠码：', codes.next().value);
}

// 爆单了？接着 next() 就有，上不封顶
console.log('加发优惠码：', codes.next().value);
console.log('加发优惠码：', codes.next().value);

// 配合工具函数"要多少取多少"，内存占用永远是 O(1)
function take<T>(iterator: Generator<T>, n: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const { value, done } = iterator.next();
    if (done) break;
    result.push(value);
  }
  return result;
}
console.log('批量发放：', take(codes, 2));

// 优势：
// 1. 惰性求值：next() 一次算一个，不取不占内存
// 2. while (true) 表达"无限序列"毫无压力，要多少有多少
// 3. 生成规则集中一处，改前缀、改格式只动一行
// 4. 思路可推广到分页拉取、传感器读数、实时行情等"边产生边消费"的场景

export {};
