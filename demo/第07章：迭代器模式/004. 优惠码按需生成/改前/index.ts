// 改前：活动前一次性生成 10 万个优惠码塞进数组，用几个白占几万个的内存

function generateCodes(prefix: string, count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(`${prefix}-${String(i).padStart(6, '0')}`);
  }
  console.log(`一次性生成 ${codes.length} 个优惠码，全部驻留内存`);
  return codes;
}

// 大促前拍脑袋按最大量预留 10 万个
const codes = generateCodes('SALE', 100000);

// 结果活动只发出去 3 个，其余 99997 个纯占内存
for (let i = 0; i < 3; i++) {
  console.log('发放优惠码：', codes[i]);
}

// 问题：
// 1. 按最大量预估生成，用不完就是白白浪费内存
// 2. 数组一旦创建，所有元素立刻求值，没有"以后再算"的余地
// 3. 需求变成"上不封顶，发完为止"，count 给多少都心虚，改造成本大

export {};
