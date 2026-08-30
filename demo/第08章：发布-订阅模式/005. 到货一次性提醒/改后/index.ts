// 改后：发布-订阅模式 -- once 一次性订阅：触发一次后自动退订
interface RestockInfo {
  product: string;
  count: number;
}

type Handler<T> = (payload: T) => void;

// ========== 事件中心：带一次性订阅（once）能力 ==========
class EventBus {
  private handlers = new Map<string, Array<Handler<unknown>>>();

  subscribe<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as Handler<unknown>);
    this.handlers.set(event, list);
  }

  off<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event);
    if (!list) return;
    const index = list.indexOf(handler as Handler<unknown>);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  // 一次性订阅：触发一次后自动退订
  once<T>(event: string, handler: Handler<T>): void {
    const wrapper: Handler<T> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.subscribe(event, wrapper);
  }

  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    // 复制一份再遍历：once 的自动退订会在遍历过程中修改原数组
    list.slice().forEach((handler) => (handler as Handler<T>)(payload));
  }
}

const bus = new EventBus();

// 到货提醒用 once 订阅：收到一次后自动失效
bus.once<RestockInfo>('stock:restock', (info) => {
  console.log(`[张三] 收到提醒：${info.product} 到货 ${info.count} 台（仅此一次）`);
});

bus.once<RestockInfo>('stock:restock', (info) => {
  console.log(`[李四] 收到提醒：${info.product} 到货 ${info.count} 台（仅此一次）`);
});

// ========== 库存系统只管发布补货事件 ==========
function restock(info: RestockInfo): void {
  console.log(`[库存系统] ${info.product} 补货 ${info.count} 台`);
  bus.emit('stock:restock', info);
}

restock({ product: 'iPhone', count: 100 }); // 两人各收到一次提醒，订阅自动失效
restock({ product: 'iPhone', count: 50 }); // 不再打扰任何人（想再收须重新订阅）

// 优势：
// 1. "一次性"语义被 once 封装好，业务代码不用手工管理名单清理
// 2. 触发即自动退订，绝不会出现"已经买过了还被轰炸"的问题
// 3. 库存系统只发布事件，订阅生命周期完全由订阅方自己掌控

export {};
