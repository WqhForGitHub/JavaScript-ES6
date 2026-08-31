// 改后：最少知识原则 -- 页头对外只承诺"我会显示未读数"，消息中心只跟页头这个直接朋友说话，页头内部随便改版

// ========== 角标：页头最深处的展示件，只有页头内部认识它 ==========
class Badge {
  private text = '';

  setText(text: string): void {
    this.text = text;
    console.log(`角标更新为：${text}`);
  }
}

// ========== 用户菜单：页头内部的子组件，只有页头认识它 ==========
class UserMenu {
  private badge = new Badge();

  showUnreadCount(count: number): void {
    this.badge.setText(count > 99 ? '99+' : String(count)); // 截断规则是菜单自己的家务事
  }
}

// ========== 页头：对外只暴露一个语义化方法 ==========
class Header {
  private userMenu = new UserMenu();

  showUnreadCount(count: number): void {
    this.userMenu.showUnreadCount(count); // 页头只认识自己的直接子组件
  }
}

// ========== 消息中心：只报个数，页头爱怎么显示怎么显示 ==========
class MessageCenter {
  private unreadCount = 0;

  constructor(private header: Header) {}

  receiveMessage(): void {
    this.unreadCount++;
    console.log('收到一条新消息');
    this.header.showUnreadCount(this.unreadCount); // 一句话说完
  }
}

const messageCenter = new MessageCenter(new Header());
messageCenter.receiveMessage(); // 角标更新为：1
messageCenter.receiveMessage(); // 角标更新为：2
messageCenter.receiveMessage(); // 角标更新为：3

// ========== 扩展一：未读堆积到三位数，"99+ 截断"由页头内部消化，外部只管报数 ==========
const busyHeader = new Header();
busyHeader.showUnreadCount(120); // 角标更新为：99+

// ========== 扩展二：页头大改版（角标挪到铃铛图标、换成红点），只改 Header 内部 ==========
// class Header {
//   private bellIcon: BellIcon; // Badge、UserMenu 整个被替换
//
//   showUnreadCount(count: number): void {
//     this.bellIcon.showRedDot(count); // 方法签名不变，消息中心零修改
//   }
// }

// 优势：
// 1. 消息中心只认识页头的一个方法，UserMenu、Badge、setText 从它的世界里彻底消失
// 2. 页头改版换 UI 库、调内部结构，只要 showUnreadCount 签名不变，消息中心一行不改
// 3. "超过 99 显示 99+"这类展示规则有了唯一归宿，不会再出现各页面截断口径不一
// 4. 消息中心与页头彻底解耦：任何会 showUnreadCount 的新组件，消息中心都能直接驱动

export {};
