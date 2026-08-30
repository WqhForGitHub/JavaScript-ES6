// 改后：传递对象参数 -- 8 个零散参数收拢成一个收货信息对象，参数自解释、可省略、加字段不破坏任何调用点

// ========== 收货信息：字段名就是文档 ==========
interface DeliveryInfo {
  consumerName: string;
  consumerPhone: string;
  province: string;
  city: string;
  district: string;
  street?: string; // 可选：有的订单只送到区
  note?: string; // 可选：默认"无备注"
  couponId?: string; // 可选：默认不使用优惠券
}

// ========== 创建订单：只收一个对象，缺省项给默认值 ==========
function createOrder(delivery: DeliveryInfo): void {
  const street = delivery.street ?? '';
  const note = delivery.note ?? '无备注';
  const couponId = delivery.couponId ?? '不使用';

  console.log('--- 创建订单 ---');
  console.log(`收货人：${delivery.consumerName}（${delivery.consumerPhone}）`);
  console.log(`收货地址：${delivery.province}${delivery.city}${delivery.district}${street}`);
  console.log(`备注：${note}，优惠券：${couponId}`);
}

// ========== 调用一：完整信息，每个值是什么一目了然 ==========
createOrder({
  consumerName: '张三',
  consumerPhone: '13800138000',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  street: '科技园南路 88 号',
  note: '不要辣',
  couponId: 'C-100',
});

// ========== 调用二：想"传错位"都难 -- 值必须挂在字段名下面，"phone: '广东省'" 一眼就是笔误 ==========
// createOrder({ consumerName: '李四', consumerPhone: '广东省', province: '13800138000', ... });
// 报错：漏掉 district 等必填字段直接编译不通过，错位再也无法悄悄溜进运行时

// ========== 调用三：不需要的字段直接不写，不再硬塞空值 ==========
createOrder({
  consumerName: '王五',
  consumerPhone: '13900139000',
  province: '浙江省',
  city: '杭州市',
  district: '西湖区',
});

// ========== 扩展：新增"门牌号"字段，老调用点一行不改 ==========
// interface DeliveryInfo {
//   ...
//   houseNumber?: string; // 可选字段，加在对象上对既有调用完全兼容
// }

// 优势：
// 1. 参数自解释：字段名 consumerPhone 挂在值旁边，调用点读起来就是一份"收货信息表"
// 2. 类型即防线：字段名与值必须配对，"电话栏塞省份"这类错位在编译期就被拦下
// 3. 可选字段（?）让"不传"成为正规操作，不必再用 '' 和 null 凑数
// 4. 新增字段加在对象上即可，所有既有调用点自动兼容，不需要全站排查修改

export {};
