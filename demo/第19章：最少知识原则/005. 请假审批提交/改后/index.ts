// 改后：最少知识原则 -- 员工只跟部门这个直接朋友说"我要请假"，找谁审、怎么审全是部门自己的家务事

// ========== 请假申请 ==========
class LeaveRequest {
  constructor(
    public staffName: string,
    public days: number,
  ) {}
}

// ========== 经理：真正的审批人，只有部门认识他 ==========
class Manager {
  constructor(public name: string) {}

  approve(request: LeaveRequest): void {
    console.log(`经理 ${this.name} 审批通过：${request.staffName} 请假 ${request.days} 天`);
  }
}

// ========== 部门：把"找人审批"揽到自己身上 ==========
class Department {
  constructor(
    public name: string,
    private manager: Manager,
  ) {}

  approveLeave(request: LeaveRequest): void {
    console.log(`${this.name} 受理请假申请`);
    this.manager.approve(request); // 找谁审批是部门的家务事
  }
}

// ========== 员工：只跟部门说话，经理从视野里消失 ==========
class Staff {
  constructor(
    public name: string,
    private department: Department,
  ) {}

  submitLeave(days: number): void {
    const request = new LeaveRequest(this.name, days);
    console.log(`${this.name} 提交请假申请：${days} 天`);
    this.department.approveLeave(request); // 一句话说完
  }
}

const staff = new Staff('张三', new Department('技术部', new Manager('李经理')));
staff.submitLeave(2);

// ========== 扩展：制度升级 -- 请假超过 3 天需总监加签，换个部门实现，员工代码一行不改 ==========
class EscalationDepartment extends Department {
  private director: Manager;

  constructor(name: string, manager: Manager, director: Manager) {
    super(name, manager);
    this.director = director;
  }

  approveLeave(request: LeaveRequest): void {
    if (request.days > 3) {
      console.log(`请假 ${request.days} 天超过 3 天，先请总监 ${this.director.name} 加签`);
      this.director.approve(request);
    }
    super.approveLeave(request); // 直属经理照常审批
  }
}

const staff2 = new Staff(
  '王五',
  new EscalationDepartment('技术部', new Manager('李经理'), new Manager('赵总监')),
);
staff2.submitLeave(5);

// 优势：
// 1. 员工只认识部门的一个方法，经理、审批流程从员工的视野里彻底消失
// 2. 审批制度怎么变（换审批人、加签、接 OA 自动审批），只动部门内部，员工零修改
// 3. 部门在 approveLeave 里顺带记日志、做转交，管控点天然收拢在一处
// 4. 测试 Staff 时给一个"假部门"即可，不必连带构造经理、总监一串对象

export {};
