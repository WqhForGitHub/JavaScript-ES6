// 改后：最少知识原则 -- 页面只跟"直接朋友"订单说话，收货城市由订单一层层往下问（委托），中途结构怎么变都与页面无关

// ========== 地址、客户：结构原样保留 ==========
class Address {
  constructor(
    public province: string,
    private city: string,
  ) {}

  getCity(): string {
    return this.city;
  }
}

class Customer {
  constructor(
    public name: string,
    private address: Address,
  ) {}

  // 不再把 address 对象交出去，客户自己回答"我在哪个城市"
  getCity(): string {
    return this.address.getCity();
  }
}

// ========== 订单：把"问城市"这件事揽到自己身上 ==========
class Order {
  constructor(
    public orderNo: string,
    private customer: Customer,
  ) {}

  getShippingCity(): string {
    return this.customer.getCity(); // 订单只认识客户这个直接朋友
  }
}

// ========== 订单列表页：只知道订单会报城市，其余一概不知 ==========
function renderOrderList(orders: Order[]): void {
  console.log('--- 订单列表 ---');
  orders.forEach((order) => {
    const city = order.getShippingCity();
    console.log(`订单 ${order.orderNo} 的收货城市：${city}`);
  });
}

// ========== 订单详情页：火车链消失，与列表页共享同一入口 ==========
function renderOrderDetail(order: Order): void {
  const city = order.getShippingCity();
  console.log(`订单详情：${order.orderNo} 收货于 ${city}`);
}

const orders: Order[] = [
  new Order('SO-1001', new Customer('张三', new Address('广东省', '深圳'))),
  new Order('SO-1002', new Customer('李四', new Address('浙江省', '杭州'))),
];

renderOrderList(orders);
renderOrderDetail(orders[0]);

// ========== 扩展：客户支持多地址后，内部取第一个地址，页面和订单一行不改 ==========
// class Customer {
//   private addresses: Address[]; // 单地址悄悄换成地址列表
//
//   getCity(): string {
//     return this.addresses[0].getCity(); // 只改这一个方法，全站页面毫无感知
//   }
// }

// 优势：
// 1. 页面只依赖订单的一个方法，客户、地址从它的世界里彻底消失，依赖链被斩断
// 2. 客户内部怎么存地址（单对象、数组、甚至远程接口）都只影响 Customer 自己
// 3. "城市统一加'市'后缀"这类格式规则有了唯一归宿，改一处全站生效
// 4. 测试只需一个"会报城市的假订单"，不必再 Mock 一长串陌生对象

export {};
