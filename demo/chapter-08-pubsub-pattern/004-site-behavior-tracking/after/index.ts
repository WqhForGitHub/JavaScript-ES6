// 改后：发布-订阅模式 -- 业务函数只管发事件，埋点等横切功能统一订阅
type Handler<T> = (payload: T) => void;

// ========== 事件中心（EventBus） ==========
class EventBus {
  private handlers = new Map<string, Array<Handler<unknown>>>();

  subscribe<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as Handler<unknown>);
    this.handlers.set(event, list);
  }

  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    list.forEach((handler) => (handler as Handler<T>)(payload));
  }
}

const bus = new EventBus();

// ========== 埋点模块：统一订阅所有关心的业务事件 ==========
bus.subscribe<{ name: string }>('user:login', (user) => {
  console.log(`[埋点] 登录：${user.name}`);
});

bus.subscribe<{ sku: string }>('cart:add', (item) => {
  console.log(`[埋点] 加购：${item.sku}`);
});

bus.subscribe<{ orderNo: string }>('order:paid', (order) => {
  console.log(`[埋点] 支付：${order.orderNo}`);
});

// ========== 业务函数干干净净，只在关键节点广播事件 ==========
function login(name: string): void {
  console.log(`[业务] ${name} 登录成功`);
  bus.emit('user:login', { name });
}

function addToCart(sku: string): void {
  console.log(`[业务] 商品 ${sku} 加入购物车`);
  bus.emit('cart:add', { sku });
}

function payOrder(orderNo: string): void {
  console.log(`[业务] 订单 ${orderNo} 支付成功`);
  bus.emit('order:paid', { orderNo });
}

login('张三');
addToCart('SKU-1001');
payOrder('SO-2001');

// 想再加"数据大屏实时刷新"？新增一个订阅者即可，业务代码零改动
bus.subscribe<{ orderNo: string }>('order:paid', (order) => {
  console.log(`[数据大屏] 实时成交额 +1（${order.orderNo}）`);
});

payOrder('SO-2002');

// 优势：
// 1. 业务函数里没有一行统计代码，只广播事件，职责单一
// 2. 换埋点平台、下线埋点，只动埋点模块一处
// 3. 新的横切需求（大屏、告警）= 新增一个订阅者，业务代码零改动

export {};
