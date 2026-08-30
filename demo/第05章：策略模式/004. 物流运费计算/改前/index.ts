// 改前：运费算法按快递公司写成一串 if-else，各家的计价规则差异全挤在一起

interface Order {
  weight: number; // 公斤
  distance: number; // 公里
  express: 'SF' | 'YTO' | 'EMS'; // 顺丰 / 圆通 / EMS
}

function calcShippingFee(order: Order): number {
  let fee = 0;

  if (order.express === 'SF') {
    // 顺丰：首重 1kg 收 23 元，续重每 kg 加 10 元，距离超过 500km 再加 5 元
    fee = 23 + Math.max(order.weight - 1, 0) * 10;
    if (order.distance > 500) fee += 5;
  } else if (order.express === 'YTO') {
    // 圆通：一口价 8 元，超过 3kg 每公斤加 2 元
    fee = 8 + Math.max(order.weight - 3, 0) * 2;
  } else if (order.express === 'EMS') {
    // EMS：按距离分段，起步 12 元，每 100km 加 1.5 元
    fee = 12 + Math.ceil(order.distance / 100) * 1.5;
  }

  return fee;
}

console.log('顺丰 2kg / 800km：', calcShippingFee({ weight: 2, distance: 800, express: 'SF' })); // 23+10+5=38
console.log('圆通 5kg：', calcShippingFee({ weight: 5, distance: 100, express: 'YTO' })); // 8+4=12
console.log('EMS 300km：', calcShippingFee({ weight: 1, distance: 300, express: 'EMS' })); // 12+4.5=16.5

// 问题：
// 1. 三家快递三种计价逻辑互相纠缠，读代码时要在分支间来回跳跃
// 2. 接入京东物流？再塞一个分支，函数继续膨胀
// 3. 想给顺丰做个"续重单价调价"？改的是这个公共函数，回归测试要覆盖所有分支

export {};
