// 改后：职责链模式 -- 每个审批者是链上一个节点，能处理就处理，处理不了传给下一个

// ========== 请求对象 ==========
interface LeaveRequest {
  applicant: string;
  days: number;
}

// ========== 抽象审批者：“处理不了就上交”的传递逻辑只在基类写一遍 ==========
abstract class Approver {
  private next: Approver | null = null;

  constructor(protected title: string) {}

  // 返回下一个节点，支持链式组装：a.setNext(b).setNext(c)
  setNext(next: Approver): Approver {
    this.next = next;
    return next;
  }

  // 模板方法：自己有权批就批，没权就交给下一个节点
  handle(req: LeaveRequest): string {
    if (this.canApprove(req)) {
      return `${this.title}：批准 ${req.applicant} 请假 ${req.days} 天`;
    }
    if (this.next) {
      return this.next.handle(req);
    }
    return `HR：${req.applicant} 的申请被拒绝（无人有权审批）`;
  }

  // 子类只回答一个问题：这个申请你有没有权限批？
  protected abstract canApprove(req: LeaveRequest): boolean;
}

// ========== 具体审批者：每个类只封装自己的权限边界 ==========
class TeamLeader extends Approver {
  protected canApprove(req: LeaveRequest): boolean {
    return req.days <= 1;
  }
}

class Manager extends Approver {
  protected canApprove(req: LeaveRequest): boolean {
    return req.days <= 3;
  }
}

class Director extends Approver {
  protected canApprove(req: LeaveRequest): boolean {
    return req.days <= 7;
  }
}

// ========== 组装职责链：组长 -> 经理 -> 总监 ==========
const teamLeader = new TeamLeader('组长');
const manager = new Manager('经理');
const director = new Director('总监');
teamLeader.setNext(manager).setNext(director);

// ========== 调用方：只认识链头，不关心最终是谁批的 ==========
console.log(teamLeader.handle({ applicant: '张三', days: 1 })); // 组长批准
console.log(teamLeader.handle({ applicant: '李四', days: 2 })); // 经理批准
console.log(teamLeader.handle({ applicant: '王五', days: 5 })); // 总监批准
console.log(teamLeader.handle({ applicant: '赵六', days: 15 })); // 被拒绝

// ========== 扩展：插入“主管”一级，已有审批者零修改 ==========
class Supervisor extends Approver {
  protected canApprove(req: LeaveRequest): boolean {
    return req.days <= 2;
  }
}

const supervisor = new Supervisor('主管');
teamLeader.setNext(supervisor).setNext(manager); // 链变为：组长 -> 主管 -> 经理 -> 总监
console.log(teamLeader.handle({ applicant: '孙七', days: 2 })); // 主管批准

// 优势：
// 1. 每个审批者是独立对象，只关心自己的权限规则（单一职责）
// 2. “传给下一个节点”的逻辑在基类只写一遍，新增层级 = 新增子类 + 重新串链
// 3. 调用方把请求交给链头即可，与具体审批者解耦
// 4. 链的结构可随时重组（插入/删除节点），对已有节点零侵入

export {};
