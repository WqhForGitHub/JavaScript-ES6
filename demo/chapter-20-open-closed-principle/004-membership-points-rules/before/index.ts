// 改前：积分获取规则全部挤在 earn 方法里，新任务类型、新加成规则都要修改这段核心计分代码

// ========== 任务上下文：一次积分任务的原始信息 ==========
interface TaskContext {
  userId: string;
  taskType: string;
  orderAmount?: number; // 下单任务才有
}

// ========== 积分服务：规则、算分、入账挤在一起 ==========
class PointsService {
  private balances = new Map<string, number>();

  earn(context: TaskContext): void {
    let points: number;

    if (context.taskType === 'sign') {
      points = 5; // 每日签到固定 5 分
    } else if (context.taskType === 'order') {
      points = Math.floor((context.orderAmount ?? 0) / 10); // 每消费 10 元得 1 分
    } else if (context.taskType === 'review') {
      points = 10; // 完成商品评价得 10 分
    } else {
      throw new Error(`不支持的任务类型: ${context.taskType}`);
    }
    // 运营要加"每日分享得 3 分""连续签到翻倍"时，只能继续往这里塞分支

    const current = this.balances.get(context.userId) ?? 0;
    this.balances.set(context.userId, current + points);
    console.log(`${context.userId} 完成「${context.taskType}」任务，+${points} 分`);
  }

  getBalance(userId: string): number {
    return this.balances.get(userId) ?? 0;
  }
}

const pointsService = new PointsService();
pointsService.earn({ userId: '张三', taskType: 'sign' });
pointsService.earn({ userId: '张三', taskType: 'order', orderAmount: 258 });
pointsService.earn({ userId: '张三', taskType: 'review' });
console.log(`张三当前积分：${pointsService.getBalance('张三')} 分`);

// 问题：
// 1. 新任务类型、新加成规则都得修改 earn，记账、入账这些稳定逻辑跟着一起承受回归风险
// 2. "连续签到翻倍"需要读取历史签到记录，塞进分支后 earn 被迫依赖越来越多的上下文
// 3. 各任务的计分规则挤在一个方法里，改下单规则时手滑碰坏签到规则毫无防护
// 4. 规则无法复用：营销活动想临时借用"分享得 3 分"，只能把分支代码抄一遍

export {};
