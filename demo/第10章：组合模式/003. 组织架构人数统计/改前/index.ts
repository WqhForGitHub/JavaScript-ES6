// 改前：部门和员工是两种数据，统计人数、薪资都要写带类型判断的递归
interface EmployeeData {
  kind: 'employee';
  name: string;
  salary: number;
}

interface DepartmentData {
  kind: 'department';
  name: string;
  members: OrgNode[];
}

type OrgNode = EmployeeData | DepartmentData;

const company: DepartmentData = {
  kind: 'department',
  name: '总公司',
  members: [
    { kind: 'employee', name: 'CEO', salary: 100000 },
    {
      kind: 'department',
      name: '技术部',
      members: [
        { kind: 'employee', name: '前端工程师', salary: 20000 },
        { kind: 'employee', name: '后端工程师', salary: 25000 },
      ],
    },
    {
      kind: 'department',
      name: '市场部',
      members: [{ kind: 'employee', name: '市场专员', salary: 12000 }],
    },
  ],
};

function countHeads(node: OrgNode): number {
  if (node.kind === 'department') {
    return node.members.reduce((sum, member) => sum + countHeads(member), 0);
  }
  return 1;
}

function totalSalary(node: OrgNode): number {
  if (node.kind === 'department') {
    return node.members.reduce((sum, member) => sum + totalSalary(member), 0);
  }
  return node.salary;
}

console.log(`总公司总人数：${countHeads(company)}`);
console.log(`总公司月薪总支出：${totalSalary(company)}`);

// 问题：
// 1. 每个统计指标都要重写一遍"判断 kind + 递归"的模板
// 2. 组织结构数据（members/salary）暴露给所有调用方
// 3. 新增成员类型（如"外包人员"：不计编制但计入成本）要改所有统计函数
//    而且编制和成本的口径差异只能靠 if-else 越叠越多

export {};
