// 改前：操作日志靠手工拼字符串，只能"看"，不能"回放"
interface Product {
  name: string;
  price: number;
  onSale: boolean;
}

const product: Product = { name: '机械键盘', price: 399, onSale: true };
const logs: string[] = [];

function changePrice(newPrice: number): void {
  logs.push(`改价：${product.price} -> ${newPrice}`);
  product.price = newPrice;
}

function takeOffSale(): void {
  logs.push('下架');
  product.onSale = false;
}

function putOnSale(): void {
  logs.push('上架');
  product.onSale = true;
}

changePrice(299);
takeOffSale();
putOnSale();
changePrice(259);

console.log('审计日志：', logs);
console.log('当前状态：', product);

// 问题：
// 1. 每个操作函数都要记得手动写日志，漏写一条审计记录就缺失
// 2. 日志是字符串，只能人眼看，出了纠纷想"回放重演"操作过程做不到
// 3. 日志逻辑和业务逻辑挤在同一个函数里，操作一多函数就臃肿

export {};
