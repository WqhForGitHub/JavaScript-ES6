// 改后：策略模式 -- 每家快递是一个策略类，实现同一个接口，计价入口只面向接口编程

interface ParcelInfo {
  weight: number; // 公斤
  distance: number; // 公里
}

// ========== 策略接口：所有快递公司都要实现 calcFee ==========
interface ExpressStrategy {
  readonly name: string;
  calcFee(parcel: ParcelInfo): number;
}

// ========== 一组具体策略 ==========
class SfExpress implements ExpressStrategy {
  readonly name = '顺丰';
  calcFee({ weight, distance }: ParcelInfo): number {
    // 首重 1kg 收 23 元，续重每 kg 加 10 元，超过 500km 再加 5 元
    let fee = 23 + Math.max(weight - 1, 0) * 10;
    if (distance > 500) fee += 5;
    return fee;
  }
}

class YtoExpress implements ExpressStrategy {
  readonly name = '圆通';
  calcFee({ weight }: ParcelInfo): number {
    // 一口价 8 元，超过 3kg 每公斤加 2 元
    return 8 + Math.max(weight - 3, 0) * 2;
  }
}

class EmsExpress implements ExpressStrategy {
  readonly name = 'EMS';
  calcFee({ distance }: ParcelInfo): number {
    // 起步 12 元，每 100km 加 1.5 元
    return 12 + Math.ceil(distance / 100) * 1.5;
  }
}

// ========== 策略注册表 + 环境类 ==========
const expressStrategies: Record<string, ExpressStrategy> = {
  SF: new SfExpress(),
  YTO: new YtoExpress(),
  EMS: new EmsExpress(),
};

function calcShippingFee(expressType: string, parcel: ParcelInfo): number {
  const strategy = expressStrategies[expressType];
  if (!strategy) throw new Error(`未接入的快递：${expressType}`);
  return strategy.calcFee(parcel); // 只面向接口，不关心是哪家
}

console.log('顺丰 2kg / 800km：', calcShippingFee('SF', { weight: 2, distance: 800 })); // 38
console.log('圆通 5kg：', calcShippingFee('YTO', { weight: 5, distance: 100 })); // 12
console.log('EMS 300km：', calcShippingFee('EMS', { weight: 1, distance: 300 })); // 16.5

// ========== 新接入京东物流：新增一个类 + 注册一行，计价入口零改动 ==========
class JdExpress implements ExpressStrategy {
  readonly name = '京东';
  calcFee({ weight, distance }: ParcelInfo): number {
    // 起步 15 元，重量和距离都计费
    return 15 + weight * 3 + Math.ceil(distance / 200) * 2;
  }
}
expressStrategies['JD'] = new JdExpress();

console.log('京东 2kg / 400km：', calcShippingFee('JD', { weight: 2, distance: 400 })); // 15+6+4=25

// 顺便演示"比价"：策略可互换，遍历所有策略就能做运费对比
const parcel: ParcelInfo = { weight: 2, distance: 800 };
const quotes = Object.values(expressStrategies).map((s) => `${s.name}：${s.calcFee(parcel)} 元`);
console.log('同一包裹比价：', quotes.join('，'));

// 优势：
// 1. 每家快递一个类，调价只改自己，单元测试粒度到单个策略
// 2. 接口约束：新快递没实现 calcFee，TypeScript 编译期直接报错
// 3. 策略可互换，天然支持"比价"这类横向对比需求

export {};
