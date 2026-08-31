// 改后：开放-封闭原则 -- 每种任务是一条独立的积分规则对象，积分服务只负责查规则、算分、入账，新规则挂上来即可

// ========== 任务上下文：一次积分任务的原始信息 ==========
interface TaskContext {
  userId: string;
  taskType: string;
  orderAmount?: number; // 下单任务才有
}

// ========== 积分规则基类：子类只回答"这次任务该得几分" ==========
abstract class PointsRule {
  abstract calculate(context: TaskContext): number;
}

class SignRule extends PointsRule {
  calculate(): number {
    return 5; // 每日签到固定 5 分
  }
}

class OrderRule extends PointsRule {
  calculate(context: TaskContext): number {
    return Math.floor((context.orderAmount ?? 0) / 10); // 每消费 10 元得 1 分
  }
}

class ReviewRule extends PointsRule {
  calculate(): number {
    return 10; // 完成商品评价得 10 分
  }
}

// ========== 规则注册表：任务类型 -> 规则对象 ==========
const ruleRegistry = new Map<string, PointsRule>();

function registerRule(taskType: string, rule: PointsRule): void {
  ruleRegistry.set(taskType, rule);
}

// ========== 积分服务：查规则、算分、入账，此后不再因新任务而修改 ==========
class PointsService {
  private balances = new Map<string, number>();

  earn(context: TaskContext): void {
    const rule = ruleRegistry.get(context.taskType);
    if (!rule) {
      throw new Error(`不支持的任务类型: ${context.taskType}`);
    }
    const points = rule.calculate(context); // 多态调用：怎么算分是规则自己的事

    const current = this.balances.get(context.userId) ?? 0;
    this.balances.set(context.userId, current + points);
    console.log(`${context.userId} 完成「${context.taskType}」任务，+${points} 分`);
  }

  getBalance(userId: string): number {
    return this.balances.get(userId) ?? 0;
  }
}

registerRule('sign', new SignRule());
registerRule('order', new OrderRule());
registerRule('review', new ReviewRule());

const pointsService = new PointsService();
pointsService.earn({ userId: '张三', taskType: 'sign' });
pointsService.earn({ userId: '张三', taskType: 'order', orderAmount: 258 });
pointsService.earn({ userId: '张三', taskType: 'review' });

// ========== 扩展：新需求"每日分享得 3 分"，只新增一个规则类加一行注册，PointsService 一行未改 ==========
class ShareRule extends PointsRule {
  calculate(): number {
    return 3; // 每日分享固定 3 分
  }
}

registerRule('share', new ShareRule());
pointsService.earn({ userId: '张三', taskType: 'share' });

console.log(`张三当前积分：${pointsService.getBalance('张三')} 分`);

// 优势：
// 1. 新任务 = 新规则类 + 一行注册，查表、入账这些稳定逻辑零修改
// 2. "连续签到翻倍"这类需要历史记录的规则，只在自己类里扩展状态，不拖累别的规则
// 3. 规则对象可实例化、可复用：营销活动直接借用 ShareRule，不必抄分支代码
// 4. 各规则天然隔离，调整 OrderRule 的计分分母只影响下单任务，回归范围一目了然

export {};
