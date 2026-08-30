// 改后：组合模式 -- 部门和员工实现同一接口，统计口径各自实现

// ========== 组件接口 ==========
interface OrgComponent {
  getName(): string;
  countHeads(): number; // 编制人数
  totalSalary(): number; // 月薪成本
}

// ========== 叶子：正式员工 ==========
class Employee implements OrgComponent {
  constructor(
    private name: string,
    private salary: number,
  ) {}

  getName(): string {
    return this.name;
  }

  countHeads(): number {
    return 1;
  }

  totalSalary(): number {
    return this.salary;
  }
}

// ========== 叶子：外包人员（不计编制，但计入成本） ==========
class Contractor implements OrgComponent {
  constructor(
    private name: string,
    private fee: number,
  ) {}

  getName(): string {
    return this.name;
  }

  countHeads(): number {
    return 0; // 外包不占编制
  }

  totalSalary(): number {
    return this.fee; // 但成本要算
  }
}

// ========== 容器：部门 ==========
class Department implements OrgComponent {
  private members: OrgComponent[] = [];

  constructor(private name: string) {}

  add(member: OrgComponent): void {
    this.members.push(member);
  }

  getName(): string {
    return this.name;
  }

  countHeads(): number {
    return this.members.reduce((sum, member) => sum + member.countHeads(), 0);
  }

  totalSalary(): number {
    return this.members.reduce((sum, member) => sum + member.totalSalary(), 0);
  }
}

// ========== 组装组织架构树 ==========
const techDept = new Department('技术部');
techDept.add(new Employee('前端工程师', 20000));
techDept.add(new Employee('后端工程师', 25000));
techDept.add(new Contractor('外包测试', 8000)); // 外包：0 编制 + 8000 成本

const marketDept = new Department('市场部');
marketDept.add(new Employee('市场专员', 12000));

const company = new Department('总公司');
company.add(new Employee('CEO', 100000));
company.add(techDept);
company.add(marketDept);

console.log(`总公司编制人数：${company.countHeads()}`); // 4
console.log(`总公司月薪成本：${company.totalSalary()}`); // 165000

// 单个部门也能直接统计，用法和整棵树完全一致
console.log(`技术部编制人数：${techDept.countHeads()}`); // 2
console.log(`技术部月薪成本：${techDept.totalSalary()}`); // 53000

// 优势：
// 1. 统计逻辑写在各节点内部，部门只做求和，不再重复遍历模板
// 2. 调用方不感知结构：整棵树和单个部门用法完全一致
// 3. "外包不计编制但计入成本"这类特殊口径封装在自己的类里，
//    部门、调用方、其他叶子类全都零改动

export {};
