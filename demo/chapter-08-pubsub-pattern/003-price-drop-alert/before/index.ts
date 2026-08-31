// 改前：价格系统自己硬编码"关注名单"，降价就无差别群发，用户毫无控制权
interface PriceDrop {
  product: string;
  oldPrice: number;
  newPrice: number;
}

// 关注名单写死在价格系统里
const watchers = ['张三', '李四'];

function changePrice(drop: PriceDrop): void {
  console.log(`[价格系统] ${drop.product} 降价：${drop.oldPrice} -> ${drop.newPrice} 元`);

  // 不管用户想不想要，一律群发短信
  for (const name of watchers) {
    console.log(`[短信] 通知 ${name}：${drop.product} 现价 ${drop.newPrice} 元`);
  }
}

changePrice({ product: 'iPhone', oldPrice: 5999, newPrice: 5499 });
changePrice({ product: 'iPhone', oldPrice: 5499, newPrice: 4999 });

// 问题：
// 1. 张三只接受 5000 以下的价位，却被每一次降价骚扰（无法按需过滤）
// 2. 李四中途已经买好了，依然继续收到短信（无法取消订阅）
// 3. 名单维护逻辑长在价格系统里，加人、退订都得改价格系统的代码

export {};
