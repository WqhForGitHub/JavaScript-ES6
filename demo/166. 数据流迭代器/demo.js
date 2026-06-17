// 166. 数据流迭代器

function* stream(items) {
  for (const item of items) yield item * 2;
}
for (const value of stream([1, 2, 3])) console.log(value);
