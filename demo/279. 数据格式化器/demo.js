// 279. 数据格式化器

const formatter = {
  currency: (v) => `¥${Number(v).toFixed(2)}`,
  date: (v) => new Date(v).toISOString().slice(0, 10),
};
console.log(formatter.currency(12.5), formatter.date('2024-01-01'));
