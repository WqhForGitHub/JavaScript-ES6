// 改后：发布-订阅模式 -- 登录模块只广播"登录成功"事件，谁关心谁来订阅
interface UserInfo {
  userId: number;
  name: string;
}

type Handler<T> = (payload: T) => void;

// ========== 事件中心（EventBus）：发布者和订阅者之间唯一的桥梁 ==========
class EventBus {
  private handlers = new Map<string, Array<Handler<unknown>>>();

  // 订阅：把回调登记到指定事件名下
  subscribe<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as Handler<unknown>);
    this.handlers.set(event, list);
  }

  // 发布：依次调用该事件下所有订阅者的回调
  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    list.forEach((handler) => (handler as Handler<T>)(payload));
  }
}

const bus = new EventBus();

// ========== 各模块只订阅自己关心的事件，彼此不知道对方的存在 ==========
bus.subscribe<UserInfo>('login:success', (user) => {
  console.log(`[头部导航] 显示欢迎语：你好，${user.name}`);
});

bus.subscribe<UserInfo>('login:success', (user) => {
  console.log(`[购物车] 加载用户 ${user.userId} 的购物车`);
});

bus.subscribe<UserInfo>('login:success', (user) => {
  console.log(`[消息中心] 拉取 ${user.name} 的未读消息`);
});

// ========== 登录模块只负责发布事件，不再认识任何下游模块 ==========
function login(userId: number, name: string): void {
  console.log(`${name} 登录成功`);
  bus.emit('login:success', { userId, name });
}

login(1001, '张三');

// 新需求"展示会员等级"？新模块自己订阅即可，login 一行都不用改
bus.subscribe<UserInfo>('login:success', (user) => {
  console.log(`[会员中心] 查询 ${user.name} 的会员等级`);
});

login(1002, '李四');

// 优势：
// 1. login 只发布事件，完全不认识下游模块，对象之间彻底解耦
// 2. 新增功能 = 新模块自己订阅事件，login 一行不改（对扩展开放，对修改关闭）
// 3. 发布者和订阅者可以独立开发、独立测试，只靠事件名约定通信

export {};
