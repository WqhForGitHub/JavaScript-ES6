// 改后：发布-订阅模式 -- 用户自己订阅降价事件、自己决定怎么处理、何时退订
interface PriceDrop {
  product: string;
  oldPrice: number;
  newPrice: number;
}

type Handler<T> = (payload: T) => void;

// ========== 事件中心：带取消订阅（off）能力 ==========
class EventBus {
  private handlers = new Map<string, Array<Handler<unknown>>>();

  subscribe<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as Handler<unknown>);
    this.handlers.set(event, list);
  }

  // 取消订阅：把指定回调从事件名单中移除
  off<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event);
    if (!list) return;
    const index = list.indexOf(handler as Handler<unknown>);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    list.forEach((handler) => (handler as Handler<T>)(payload));
  }
}

const bus = new EventBus();

// ========== 张三：心理价位 5000，没到价位就"收到但不行动" ==========
const zhangsan: Handler<PriceDrop> = (drop) => {
  if (drop.newPrice <= 5000) {
    console.log(`[张三] 降到 ${drop.newPrice} 元了，到心理价位，可以入手！`);
  }
};
bus.subscribe<PriceDrop>('price:drop', zhangsan);

// ========== 李四：心理价位 4500 ==========
bus.subscribe<PriceDrop>('price:drop', (drop) => {
  if (drop.newPrice <= 4500) {
    console.log(`[李四] ${drop.newPrice} 元，正是我等的价格！`);
  }
});

// ========== 价格系统只管发布事件，不认识任何用户 ==========
function changePrice(drop: PriceDrop): void {
  console.log(`[价格系统] ${drop.product} 降价：${drop.oldPrice} -> ${drop.newPrice} 元`);
  bus.emit('price:drop', drop);
}

changePrice({ product: 'iPhone', oldPrice: 5999, newPrice: 5499 }); // 暂无人行动
changePrice({ product: 'iPhone', oldPrice: 5499, newPrice: 4999 }); // 张三出手

// 张三已下单，主动取消订阅，之后降价不再打扰他
bus.off('price:drop', zhangsan);

changePrice({ product: 'iPhone', oldPrice: 4999, newPrice: 4499 }); // 只有李四行动

// 优势：
// 1. 订阅者自己决定"怎么处理"：到不到价位由回调自己判断
// 2. off 让用户随时退订，不再被垃圾短信骚扰
// 3. 价格系统只发布事件，完全不持有用户名单，用户增删零改动

export {};
