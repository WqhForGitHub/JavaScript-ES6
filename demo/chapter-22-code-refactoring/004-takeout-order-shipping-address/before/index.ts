// 改前：创建外卖订单要按顺序传 8 个参数，调用方必须背下每个位置是什么，参数一多就容易传错位，加一个参数全站调用点都要改

// ========== 创建订单：8 个位置参数排成一长队 ==========
function createOrder(
  consumerName: string,
  consumerPhone: string,
  province: string,
  city: string,
  district: string,
  street: string,
  note: string,
  couponId: string | null,
): void {
  console.log('--- 创建订单 ---');
  console.log(`收货人：${consumerName}（${consumerPhone}）`);
  console.log(`收货地址：${province}${city}${district}${street}`);
  console.log(`备注：${note}，优惠券：${couponId === null ? '不使用' : couponId}`);
}

// ========== 调用一：正常下单，数着位置传参 ==========
createOrder(
  '张三',
  '13800138000',
  '广东省',
  '深圳市',
  '南山区',
  '科技园南路 88 号',
  '不要辣',
  'C-100',
);

// ========== 调用二：参数传错位 -- phone 和 province 都是字符串，编译器帮不上忙 ==========
createOrder(
  '李四',
  '广东省',
  '13800138000',
  '深圳市',
  '南山区',
  '科技园南路 88 号',
  '不要辣',
  null,
);
// 收货人：李四（广东省）  <- 电话栏位变成了省份，运行时才暴露

// ========== 调用三：不想写备注和地址详情的调用方，被迫硬塞空串和 null 凑够 8 个 ==========
createOrder('王五', '13900139000', '浙江省', '杭州市', '西湖区', '', '', null);

// 问题：
// 1. 参数越长越容易传错位：consumerPhone 和 province 都是 string，顺序调换编译器也不报错，只有运行时才见鬼
// 2. "不传某个参数"没有正规途径：用不上备注、街道就得硬塞 '' 和 null 凑数，语义全靠猜
// 3. 新需求"加一个门牌号字段"意味着所有调用点都要改：哪怕多数调用方根本用不到这个字段
// 4. 调用点无法自解释：createOrder('张三', '13800138000', '广东省', ...) 里第 6 个参数是什么，只有翻函数签名才知道

export {};
