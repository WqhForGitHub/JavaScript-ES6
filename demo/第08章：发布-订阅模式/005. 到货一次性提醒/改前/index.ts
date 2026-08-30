// 改前：到货提醒发完一次名单还在，下次补货继续群发，用户被反复打扰
interface RestockInfo {
  product: string;
  count: number;
}

const subscribers = ['张三', '李四'];

function restock(info: RestockInfo): void {
  console.log(`[库存系统] ${info.product} 补货 ${info.count} 台`);
  for (const name of subscribers) {
    console.log(`[到货提醒] 通知 ${name}：${info.product} 有货了`);
  }
}

restock({ product: 'iPhone', count: 100 });
restock({ product: 'iPhone', count: 50 }); // 张三早就买完了，还是被通知了一遍

// 问题：
// 1. "到货提醒"本质上是一次性的（提醒一次就该结束），改前却每次补货都群发
// 2. 想实现"只提醒一次"，得在业务代码里手工清空名单，容易忘记也容易清错
// 3. 名单管理（谁提醒过、谁没有）和库存逻辑混在一起，越写越乱

export {};
