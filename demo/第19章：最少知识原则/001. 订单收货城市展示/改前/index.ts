// 改前：订单列表页想显示"收货城市"，得从订单一路点穿 客户-地址 两层对象，页面把订单的内部家谱背得滚瓜烂熟

// ========== 地址：内部藏着省份和城市 ==========
class Address {
  constructor(
    public province: string,
    private city: string,
  ) {}

  getCity(): string {
    return this.city;
  }
}

// ========== 客户：内部藏着一个地址对象 ==========
class Customer {
  constructor(
    public name: string,
    private address: Address,
  ) {}

  getAddress(): Address {
    return this.address; // 把内部对象原样交了出去
  }
}

// ========== 订单：内部藏着一个客户对象 ==========
class Order {
  constructor(
    public orderNo: string,
    private customer: Customer,
  ) {}

  getCustomer(): Customer {
    return this.customer; // 又把内部对象交了出去
  }
}

// ========== 订单列表页：层层深入"朋友的朋友的朋友" ==========
function renderOrderList(orders: Order[]): void {
  console.log('--- 订单列表 ---');
  orders.forEach((order) => {
    // 火车链：页面必须知道"订单里有客户、客户里有地址、地址里有城市"这整条家谱
    const city = order.getCustomer().getAddress().getCity();
    console.log(`订单 ${order.orderNo} 的收货城市：${city}`);
  });
}

// ========== 订单详情页：同样的火车链被迫再写一遍 ==========
function renderOrderDetail(order: Order): void {
  const city = order.getCustomer().getAddress().getCity();
  console.log(`订单详情：${order.orderNo} 收货于 ${city}`);
}

const orders: Order[] = [
  new Order('SO-1001', new Customer('张三', new Address('广东省', '深圳'))),
  new Order('SO-1002', new Customer('李四', new Address('浙江省', '杭州'))),
];

renderOrderList(orders);
renderOrderDetail(orders[0]);

// 问题：
// 1. 页面认识了"朋友的朋友的朋友"：客户怎么存地址、地址怎么存城市，全部泄漏给了展示层
// 2. 客户一旦支持多地址（address 变成 addresses 数组），全站写过火车链的页面集体报错
// 3. 想统一给城市名加"市"后缀或做国际化，得在每个点穿的页面里各写一遍，漏一处就不一致
// 4. 单元测试没法只 Mock 订单：还得连带 Mock 客户和地址两个"陌生人"

export {};
