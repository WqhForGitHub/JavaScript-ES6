// 改后：中介者模式 -- 用户只把消息交给聊天室，成员管理、消息分发全由聊天室负责

// ========== 同事对象：用户只认识聊天室 ==========
class ChatUser {
  blocked = new Set<string>(); // 屏蔽列表（只存名字，不存对方引用）

  constructor(
    public name: string,
    private room: ChatRoom,
  ) {
    room.join(this);
  }

  say(text: string): void {
    // 只管把消息扔给中介者，发给谁、怎么发一概不管
    this.room.broadcast(this, text);
  }

  whisper(toName: string, text: string): void {
    this.room.privateMessage(this, toName, text);
  }

  receive(from: string, text: string): void {
    if (this.blocked.has(from)) return; // 被我屏蔽的人，看都不看
    console.log(`${this.name} 收到 ${from} 的消息：${text}`);
  }
}

// ========== 中介者：聊天室，唯一持有完整成员名单的角色 ==========
class ChatRoom {
  private members: ChatUser[] = [];

  join(user: ChatUser): void {
    this.members.push(user);
    // 系统消息也走统一分发：通知除新人外的所有人
    this.members
      .filter((member) => member !== user)
      .forEach((member) => member.receive('系统', `${user.name} 加入了群聊`));
  }

  broadcast(from: ChatUser, text: string): void {
    this.members
      .filter((member) => member !== from)
      .forEach((member) => member.receive(from.name, text));
  }

  privateMessage(from: ChatUser, toName: string, text: string): void {
    const target = this.members.find((member) => member.name === toName);
    if (!target) {
      console.log(`[系统] ${from.name}：用户「${toName}」不在群内`);
      return;
    }
    target.receive(from.name, text);
  }
}

// ========== 使用：入群一行代码，无需任何“握手” ==========
const room = new ChatRoom();
const alice = new ChatUser('Alice', room);
const bob = new ChatUser('Bob', room);
const carol = new ChatUser('Carol', room);

console.log('--- Alice 群发 ---');
alice.say('大家好，今晚 8 点开评审会');

console.log('--- Carol 私聊 Bob（不需要持有 Bob 的引用）---');
carol.whisper('Bob', '评审会的材料我发你了');

console.log('--- Bob 屏蔽 Dave 后，Dave 入群并发消息 ---');
bob.blocked.add('Dave');
const dave = new ChatUser('Dave', room); // 入群系统通知 Bob 仍能收到
dave.say('今晚聚餐谁来？'); // Alice、Carol 收到，Bob 静默

// 优势：
// 1. 用户只持有聊天室一个引用，星型结构，成员再多也织不成网
// 2. 入群/退群/名单维护集中在中介者，新成员零成本加入
// 3. 私聊、屏蔽、系统通知等规则集中在聊天室一处，统一演进
// 4. 新增“只给管理员发”“消息免打扰”等能力，只改中介者，用户对象不动

export {};
