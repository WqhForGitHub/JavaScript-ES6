// 第04章：单例模式 - 006：全局状态管理
//
// 场景：多个组件 / 页面需要共享同一份状态（用户信息、购物车、主题……），
// Redux、Vuex、Pinia 本质上都是「全局唯一的 Store 单例」。
// 这里实现一个 mini 版状态管理器：单向数据流 + 订阅通知。

interface AppState {
  user: { name: string; vip: boolean } | null;
  cart: string[];
  theme: 'light' | 'dark';
}

type Listener = (state: Readonly<AppState>) => void;

// 用可辨识联合类型约束所有合法的 action
type Action =
  | { type: 'login'; payload: { name: string; vip: boolean } }
  | { type: 'logout' }
  | { type: 'addToCart'; payload: string }
  | { type: 'clearCart' }
  | { type: 'toggleTheme' };

class Store {
  private static instance: Store | null = null;

  private state: AppState = {
    user: null,
    cart: [],
    theme: 'light',
  };

  private listeners = new Set<Listener>();
  private history: string[] = [];

  private constructor() {}

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  getState(): Readonly<AppState> {
    return this.state;
  }

  /** 订阅状态变化，返回「取消订阅」函数 */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** 修改状态的唯一途径：dispatch 一个 action */
  dispatch(action: Action): void {
    this.history.push(action.type);
    switch (action.type) {
      case 'login':
        this.state = { ...this.state, user: action.payload };
        break;
      case 'logout':
        this.state = { ...this.state, user: null };
        break;
      case 'addToCart':
        this.state = { ...this.state, cart: [...this.state.cart, action.payload] };
        break;
      case 'clearCart':
        this.state = { ...this.state, cart: [] };
        break;
      case 'toggleTheme':
        this.state = {
          ...this.state,
          theme: this.state.theme === 'light' ? 'dark' : 'light',
        };
        break;
    }
    // 通知所有订阅者
    this.listeners.forEach((fn) => fn(this.state));
  }

  /** action 历史，方便调试 */
  getActionHistory(): readonly string[] {
    return this.history;
  }
}

// ============================================================
// 使用演示
// ============================================================

// 「导航栏组件」和「购物车组件」共享同一个 Store
const storeA = Store.getInstance();
const storeB = Store.getInstance();

console.log('两个组件拿到的是同一个 Store：', storeA === storeB); // true

// 导航栏关心用户名和主题
storeA.subscribe((state) => {
  const user = state.user ? state.user.name : '游客';
  console.log(`[导航栏] 用户：${user}，主题：${state.theme}`);
});

// 购物车组件只关心购物车
storeB.subscribe((state) => {
  if (state.cart.length > 0) {
    console.log(`[购物车] 当前商品：${state.cart.join('、')}`);
  }
});

console.log('\n--- 用户登录 ---');
storeA.dispatch({ type: 'login', payload: { name: '张三', vip: true } });

console.log('\n--- 加购 ---');
storeB.dispatch({ type: 'addToCart', payload: '《JavaScript 设计模式与开发实践》' });
storeA.dispatch({ type: 'addToCart', payload: '机械键盘' });

console.log('\n--- 切换夜间模式 ---');
storeB.dispatch({ type: 'toggleTheme' });

console.log('\n--- 退出并清空购物车 ---');
storeA.dispatch({ type: 'logout' });
storeB.dispatch({ type: 'clearCart' });

console.log('\n最终状态：', storeA.getState());
console.log('action 历史：', storeB.getActionHistory());

export {};
