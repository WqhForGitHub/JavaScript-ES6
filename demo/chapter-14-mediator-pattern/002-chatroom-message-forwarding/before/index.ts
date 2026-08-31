// 改前：每个用户都持有其他所有用户的引用，发消息自己挨个遍历

class User {
  contacts: User[] = []; // 认识的所有群友

  constructor(public name: string) {}

  // 入群：新人和群里每个人都得互相登记一遍
  joinChat(existing: User[]): void {
    this.contacts.push(...existing);
    existing.forEach((other) => other.contacts.push(this));
  }

  // 群发：自己遍历所有联系人
  broadcast(text: string): void {
    this.contacts.forEach((other) => other.receive(this.name, text));
  }

  // 私聊：必须先拿到对方的直接引用
  privateMessage(to: User, text: string): void {
    to.receive(this.name, text);
  }

  receive(from: string, text: string): void {
    console.log(`${this.name} 收到 ${from} 的消息：${text}`);
  }
}

// 建群：第一个人之后，每个新人都和所有老人“握手”
const alice = new User('Alice');
const bob = new User('Bob');
bob.joinChat([alice]);

const carol = new User('Carol');
carol.joinChat([alice, bob]);

const dave = new User('Dave');
dave.joinChat([alice, bob, carol]); // 人越多，入群成本越高

console.log('--- Alice 群发 ---');
alice.broadcast('大家好，今晚 8 点开评审会');
// Alice 必须自己保证 contacts 是最新的：漏登记一个人，就有一个人收不到

console.log('--- Carol 私聊 Bob（需要 Bob 的直接引用）---');
carol.privateMessage(bob, '评审会的材料我发你了');

// 问题：
// 1. 用户之间两两互持引用，群成员越多关系网越乱（n(n-1) 条引用）
// 2. 退群要把自己从所有人的 contacts 里删掉，漏一个人就还会收到消息
// 3. “屏蔽某人”“只给管理员发”这类规则，每个用户都得自己实现一遍
// 4. 消息分发逻辑（遍历谁、过滤谁）散落在用户对象里，无法统一管理

export {};
