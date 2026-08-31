// 改后：职责链模式 -- 每一级客服是链上一个节点，解决不了就“升级”给下一级

interface Ticket {
  id: number;
  content: string;
}

// ========== 抽象处理者：统一“尝试解决 -> 解决不了就升级”的流程 ==========
abstract class SupportHandler {
  private next: SupportHandler | null = null;

  constructor(protected name: string) {}

  setNext(next: SupportHandler): SupportHandler {
    this.next = next;
    return next;
  }

  handle(ticket: Ticket): string {
    const answer = this.trySolve(ticket);
    if (answer !== null) {
      return `[${this.name}] 工单#${ticket.id}：${answer}`;
    }
    if (this.next) {
      console.log(`  >> ${this.name} 处理不了工单#${ticket.id}，升级给「${this.next.name}」`);
      return this.next.handle(ticket);
    }
    return `[${this.name}] 工单#${ticket.id}：进入人工待处理队列`;
  }

  // 子类只回答：这个问题你能不能解决？能就给出答案，不能返回 null
  protected abstract trySolve(ticket: Ticket): string | null;
}

// ========== FAQ 机器人：查自己的知识库 ==========
class FaqBot extends SupportHandler {
  private faq: Record<string, string> = {
    开发票: '开票入口：我的订单 -> 申请开票',
    修改手机号: '入口：设置 -> 账号与安全 -> 更换手机号',
  };

  protected trySolve(ticket: Ticket): string | null {
    for (const keyword of Object.keys(this.faq)) {
      if (ticket.content.includes(keyword)) return this.faq[keyword];
    }
    return null;
  }
}

// ========== 一线客服：账号类问题 ==========
class FrontDesk extends SupportHandler {
  protected trySolve(ticket: Ticket): string | null {
    if (ticket.content.includes('密码') || ticket.content.includes('登录')) {
      return '已为您重置账号，请注意查收短信';
    }
    return null;
  }
}

// ========== 二线工程师：技术故障 ==========
class Engineer extends SupportHandler {
  protected trySolve(ticket: Ticket): string | null {
    if (ticket.content.includes('报错') || ticket.content.includes('白屏')) {
      return '已定位到服务故障，预计 2 小时恢复';
    }
    return null;
  }
}

// ========== 专家坐席：永远兜底 ==========
class Expert extends SupportHandler {
  protected trySolve(ticket: Ticket): string | null {
    return `已转接人工专家处理工单#${ticket.id}，请保持电话畅通`;
  }
}

// ========== 组装升级链：机器人 -> 一线 -> 二线 -> 专家 ==========
const bot = new FaqBot('FAQ机器人');
const frontDesk = new FrontDesk('一线客服');
const engineer = new Engineer('二线工程师');
const expert = new Expert('专家坐席');
bot.setNext(frontDesk).setNext(engineer).setNext(expert);

// ========== 调用方：工单从链头进入，自动逐级流转 ==========
console.log(bot.handle({ id: 1, content: '请问怎么开发票？' }));
console.log(bot.handle({ id: 2, content: '登录不上，密码忘了' }));
console.log(bot.handle({ id: 3, content: '下单页面一直报错 500' }));
console.log(bot.handle({ id: 4, content: '我要投诉快递员的态度' }));

// 优势：
// 1. 每一级客服是独立对象，FAQ 知识库只属于机器人，互不干扰
// 2. 升级流程在基类只写一遍，“谁解决不了、转给谁”一目了然
// 3. 新增一级（如 VIP 专属客服）只需新增子类并重新串链，已有代码零修改
// 4. 链头可随时替换：工作时间直接从一线开始（跳过机器人），非工作时间再挂回来

export {};
