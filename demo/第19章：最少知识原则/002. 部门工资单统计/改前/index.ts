// 改前：财务统计部门工资时，先问部门"借"出员工数组，再挨个翻员工的钱包，部门内部怎么存人被摸得一清二楚

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

// ========== 部门：内部用一个数组存放员工 ==========
class Department {
  constructor(
    public name: string,
    private employees: Employee[],
  ) {}

  getEmployees(): Employee[] {
    return this.employees; // 把内部数组原样交了出去
  }
}

// ========== 财务：深入部门内部，自己数人头、自己翻工资 ==========
function printPayroll(department: Department): void {
  const employees = department.getEmployees(); // 拿到部门的内部数组

  let total = 0;
  employees.forEach((employee) => {
    total += employee.getSalary(); // 财务直接找每个员工要工资
  });

  console.log(`${department.name} 共 ${employees.length} 人，工资总额：${total} 元`);
}

const salesDept = new Department('销售部', [
  new Employee('张三', 8000),
  new Employee('李四', 12000),
  new Employee('王五', 9500),
]);

printPayroll(salesDept);

// ========== 更危险的一幕：交出去的是"原数组"，外界随手一改就污染了部门数据 ==========
const handle = salesDept.getEmployees();
handle.push(new Employee('临时工', 0)); // 财务手滑塞了个人进去

printPayroll(salesDept); // 部门莫名多出"幽灵员工"，人数变成 4，部门毫不知情

// 问题：
// 1. 财务知道了"部门用数组存员工"的存储细节，部门换成 Map 或分页加载后财务代码直接崩
// 2. 工资统计的算法散落在部门之外的每个调用处，口径一变（如不算实习生）得满系统改
// 3. 交出去的是内部数组的活引用：外界能删能塞，部门对自己的数据失去了控制权
// 4. 部门无法在统计环节做任何管控（脱敏、审计、缓存），因为统计根本不经过它

export {};
