// 改前：员工提交请假时，自己从部门里把经理"拽"出来指挥审批，部门成了透明的中转站，找谁审批的制度细节全泄漏给员工

// ========== 请假申请 ==========
class LeaveRequest {
  constructor(
    public staffName: string,
    public days: number,
  ) {}
}

// ========== 经理：真正的审批人 ==========
class Manager {
  constructor(public name: string) {}

  approve(request: LeaveRequest): void {
    console.log(`经理 ${this.name} 审批通过：${request.staffName} 请假 ${request.days} 天`);
  }
}

// ========== 部门：内部知道审批人是经理 ==========
class Department {
  constructor(
    public name: string,
    private manager: Manager,
  ) {}

  getManager(): Manager {
    return this.manager; // 内部审批人被直接交了出去
  }
}

// ========== 员工：越过部门，直接指挥部门内部的经理 ==========
class Staff {
  constructor(
    public name: string,
    private department: Department,
  ) {}

  submitLeave(days: number): void {
    const request = new LeaveRequest(this.name, days);
    console.log(`${this.name} 提交请假申请：${days} 天`);

    // 员工必须知道：部门里有 getManager、审批要调 approve -- 两份本不属于他的知识
    this.department.getManager().approve(request);
  }
}

const staff = new Staff('张三', new Department('技术部', new Manager('李经理')));
staff.submitLeave(2);

// 问题：
// 1. 员工认识了部门内部的"陌生人"经理：既要会调 getManager 把人拽出来，还要会调 approve 指挥审批
// 2. 审批制度换成"直属经理 + HR 双签"或线上 OA，全公司每个 Staff 的提交代码都得挨个改
// 3. 部门想做代理审批（经理休假自动转交）、记审批日志，都插不上手：调用方直接绕过了部门
// 4. 员工与经理两个本不相识的类被强行焊死，测试 Staff 还得先造一个真经理

export {};
