// 改前：审批规则全部堆在一个函数里，if-else 一层套一层，加一级审批就得动整个函数

interface LeaveRequest {
  applicant: string; // 申请人
  days: number; // 请假天数
}

// 审批入口：每个层级的权限、批不批、怎么答复，全部写死在这一个函数里
function approveLeave(req: LeaveRequest): string {
  // 组长：只能批 1 天以内
  if (req.days <= 1) {
    return `组长：批准 ${req.applicant} 请假 ${req.days} 天`;
  }

  // 组长权限不够，看经理：能批 3 天以内
  if (req.days <= 3) {
    return `经理：批准 ${req.applicant} 请假 ${req.days} 天`;
  }

  // 经理权限也不够，看总监：能批 7 天以内
  if (req.days <= 7) {
    return `总监：批准 ${req.applicant} 请假 ${req.days} 天`;
  }

  // 走到这里说明整条审批线上没人有权限
  return `HR：${req.applicant} 的申请被拒绝（单次请假上限 7 天）`;
}

console.log(approveLeave({ applicant: '张三', days: 1 })); // 组长批准
console.log(approveLeave({ applicant: '李四', days: 2 })); // 经理批准
console.log(approveLeave({ applicant: '王五', days: 5 })); // 总监批准
console.log(approveLeave({ applicant: '赵六', days: 15 })); // 被拒绝

// 问题：
// 1. 三个审批者的权限规则、答复文案全挤在一个函数里，一个函数干了所有人的活
// 2. 想插入一级审批（如“主管可批 2 天”）或调整审批顺序，只能修改这个函数
// 3. 审批者不是独立对象，无法单独复用（比如换个入口只要组长和经理两级）
// 4. 请求方必须认识这个巨型函数，函数越长，改动风险越大

export {};
