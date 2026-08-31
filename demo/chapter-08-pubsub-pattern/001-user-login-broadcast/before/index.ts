// 改前：登录成功后，登录函数亲自调用每一个下游模块 -- 模块间强耦合
interface UserInfo {
  userId: number;
  name: string;
}

// 三个彼此无关的模块
const header = {
  showWelcome(user: UserInfo): void {
    console.log(`[头部导航] 显示欢迎语：你好，${user.name}`);
  },
};

const cart = {
  load(user: UserInfo): void {
    console.log(`[购物车] 加载用户 ${user.userId} 的购物车`);
  },
};

const message = {
  fetchUnread(user: UserInfo): void {
    console.log(`[消息中心] 拉取 ${user.name} 的未读消息`);
  },
};

function login(userId: number, name: string): void {
  const user: UserInfo = { userId, name };
  console.log(`${name} 登录成功`);

  // 登录函数被迫认识每一个下游模块，挨个调用
  header.showWelcome(user);
  cart.load(user);
  message.fetchUnread(user);
  // 明天加"会员等级展示"、后天加"最近浏览记录"……只能一直往这里堆代码
}

login(1001, '张三');

// 问题：
// 1. login 必须认识所有下游模块，新增一个模块就要修改一次 login（违反开放-封闭原则）
// 2. 下游模块改名、删除、调整参数，login 都要跟着改，牵一发动全身
// 3. 各模块强耦合，login 没法单独测试，下游模块也没法脱离 login 复用

export {};
