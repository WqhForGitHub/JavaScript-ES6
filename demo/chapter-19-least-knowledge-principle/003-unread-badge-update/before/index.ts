// 改前：消息中心收到新消息后，自己伸手进页头内部，翻出"用户菜单里的角标"来改字，页头内部怎么摆全被消息中心知道了

// ========== 角标：页头最深处的展示件 ==========
class Badge {
  private text = '';

  setText(text: string): void {
    this.text = text;
    console.log(`角标更新为：${text}`);
  }
}

// ========== 用户菜单：页头内部的一个子组件 ==========
class UserMenu {
  private badge = new Badge();

  getBadge(): Badge {
    return this.badge; // 内部子组件被交了出去
  }
}

// ========== 页头 ==========
class Header {
  private userMenu = new UserMenu();

  getUserMenu(): UserMenu {
    return this.userMenu; // 内部子组件又被交了出去
  }
}

// ========== 消息中心：收到消息后层层深入页头改角标 ==========
class MessageCenter {
  private unreadCount = 0;

  constructor(private header: Header) {}

  receiveMessage(): void {
    this.unreadCount++;
    console.log('收到一条新消息');

    // 消息中心被迫认识：页头里有 UserMenu，UserMenu 里有 Badge，Badge 用 setText 渲染
    this.header.getUserMenu().getBadge().setText(String(this.unreadCount));
  }
}

const messageCenter = new MessageCenter(new Header());
messageCenter.receiveMessage(); // 角标更新为：1
messageCenter.receiveMessage(); // 角标更新为：2
messageCenter.receiveMessage(); // 角标更新为：3

// 问题：
// 1. 消息中心认识了页头内部的整条"器官链"：UserMenu、Badge、setText 一个不落
// 2. 页头改版把角标挪到铃铛图标上、或换成红点样式，消息中心的火车链立刻报错
// 3. 角标的渲染细节（setText 收字符串）泄漏出去，想加"超过 99 显示 99+"没有任何插手的地方
// 4. 消息中心与页头深处的小组件强耦合：换组件库，先改的不是页头，而是消息中心

export {};
