// 改后：最少知识原则 -- 财务只问部门"多少人、人力成本多少"，数人头与翻工资全是部门自己的家务事

// ========== 员工：工资是自己的私事 ==========
class Employee {
  constructor(
    public name: string,
    private salary: number,
  ) {}

  getSalary(): number {
    return this.salary;
  }
}

// ========== 部门：统计能力封装在内部，不再外泄员工数组 ==========
class Department {
  constructor(
    public name: string,
    private employees: Employee[],
  ) {}

  getHeadcount(): number {
    return this.employees.length; // 人头自己数
  }

  getTotalPayroll(): number {
    // 账自己算：遍历只发生在部门内部，外界看不到员工名单
    return this.employees.reduce((total, employee) => total + employee.getSalary(), 0);
  }
}

// ========== 财务：只跟部门要两个数字，员工是谁、怎么存一概不知 ==========
function printPayroll(department: Department): void {
  console.log(
    `${department.name} 共 ${department.getHeadcount()} 人，工资总额：${department.getTotalPayroll()} 元`,
  );
}

// ========== HR 查编制：同样只问部门要数字 ==========
function printHeadcount(department: Department): void {
  console.log(`HR 记录：${department.name} 编制 ${department.getHeadcount()} 人`);
}

const salesDept = new Department('销售部', [
  new Employee('张三', 8000),
  new Employee('李四', 12000),
  new Employee('王五', 9500),
]);

printPayroll(salesDept); // 销售部 共 3 人，工资总额：29500 元
printHeadcount(salesDept); // HR 记录：销售部 编制 3 人

// ========== 扩展：销售部口径升级为"底薪 + 提成池"，换个部门实现，财务与 HR 一行不改 ==========
class SalesDepartment extends Department {
  constructor(
    name: string,
    employees: Employee[],
    private commissionPool: number,
  ) {
    super(name, employees);
  }

  getTotalPayroll(): number {
    return super.getTotalPayroll() + this.commissionPool; // 口径变化锁在部门内部
  }
}

const salesDeptV2 = new SalesDepartment('销售部', [new Employee('张三', 8000)], 5000);
printPayroll(salesDeptV2); // 财务的 printPayroll 原样复用，总额自动含提成

// 优势：
// 1. 财务只依赖部门的两个数字方法，员工数组、工资字段从它的世界里消失
// 2. 部门内部把数组换成 Map、改成分页拉取，只影响部门自己，调用方无感
// 3. 不再交出内部数组的活引用，外界删不掉也塞不进"幽灵员工"，数据控制权回到部门手里
// 4. 统计口径升级只需换部门实现，财务、HR 等所有调用方自动共享同一口径

export {};
