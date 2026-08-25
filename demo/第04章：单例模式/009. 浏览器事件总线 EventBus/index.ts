// 第04章：单例模式 - 009：浏览器事件总线 EventBus
//
// 场景：页面上的各个组件（弹窗、表格、导航栏……）互相不认识，
// 又需要通信（例如：登录成功后，导航栏要刷新、购物车要拉数据、欢迎弹窗要弹出）。
// 事件总线是典型的单例：所有组件往同一条「总线」上收发事件。
// Mitt、tiny-emitter 等库的默认导出都是全局单例。

type Handler = (payload?: any) => void;

class EventBus {
  private static instance: EventBus | null = null;

  private events = new Map<string, Set<Handler>>();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /** 订阅事件，返回解绑函数（组件销毁时记得调用，防止内存泄漏） */
  on(event: string, handler: Handler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  /** 只监听一次，触发后自动解绑 */
  once(event: string, handler: Handler): void {
    const wrapped = (payload?: any) => {
      this.off(event, wrapped);
      handler(payload);
    };
    this.on(event, wrapped);
  }

  off(event: string, handler: Handler): void {
    this.events.get(event)?.delete(handler);
  }

  /** 发布事件，通知所有订阅者 */
  emit(event: string, payload?: any): void {
    this.handlersOf(event).forEach((fn) => fn(payload));
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }

  private handlersOf(event: string): Set<Handler> {
    return this.events.get(event) ?? new Set();
  }
}

// ============================================================
// 使用演示：模拟「登录成功」后各组件响应
// ============================================================

// 组件 A、B 都从同一条总线上收发事件
const busA = EventBus.getInstance();
const busB = EventBus.getInstance();

console.log('两个组件拿到的是同一条事件总线：', busA === busB); // true

// 导航栏组件：显示用户名
busA.on('login:success', (payload) => {
  console.log(`[导航栏] 欢迎你，${payload.username}`);
});

// 购物车组件：拉取购物车数据
busA.on('login:success', () => {
  console.log('[购物车] 开始拉取用户的购物车...');
});

// 欢迎弹窗：只弹一次（once）
busB.once('login:success', () => {
  console.log('[欢迎弹窗] 欢迎回来！（只会弹出一次）');
});

console.log("事件 'login:success' 的监听数：", busB.listenerCount('login:success')); // 3

console.log('\n--- 用户第一次登录 ---');
busB.emit('login:success', { username: '张三' });

console.log('\n--- token 过期后重新登录（弹窗不再出现）---');
busA.emit('login:success', { username: '张三' });

console.log('\n--- 组件销毁时解绑 ---');
// on() 返回的解绑函数在这里派上用场
const off = busA.on('theme:change', (p) => console.log('[导航栏] 主题切换为', p));
busB.emit('theme:change', 'dark');
off();
console.log('解绑后监听数：', busA.listenerCount('theme:change')); // 0
busB.emit('theme:change', 'light'); // 没有任何输出

export {};
