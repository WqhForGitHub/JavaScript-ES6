// 改后：拆分循环 + 合并重复的条件片段 -- 一个循环只干一件事，重复的日志移到条件之外；统计口径（排除休假员工）提炼成 filter，顺便修掉最高薪初值的隐患

// ========== 员工 ==========
interface Employee {
  name: string;
  salary: number;
  onLeave: boolean; // 是否休假中
}

// ========== 统计口径：参与工资统计的员工 ==========
function getActiveEmployees(employees: Employee[]): Employee[] {
  return employees.filter((employee) => !employee.onLeave);
}

// ========== 职责一：算工资总额 ==========
function calculateTotalSalary(actives: Employee[]): number {
  return actives.reduce((sum, employee) => sum + employee.salary, 0);
}

// ========== 职责二：找最高薪员工（过滤后不可能为空时使用） ==========
function findTopEarner(actives: Employee[]): Employee {
  return actives.reduce((top, employee) => (employee.salary > top.salary ? employee : top));
}

// ========== 职责三：拼报表明细 ==========
function buildReportLines(employees: Employee[]): string[] {
  return employees.map((employee) =>
    employee.onLeave
      ? `${employee.name}（休假中）：本月 0 元`
      : `${employee.name}：${employee.salary} 元`,
  );
}

// ========== 主函数：只负责编排，日志在循环外只写一次 ==========
function generateSalaryReport(employees: Employee[]): void {
  for (const employee of employees) {
    console.log(`[日志] 已处理：${employee.name}`); // 每个分支都要打，那就挪到分支外面统一打
  }

  const actives = getActiveEmployees(employees);
  const lines = buildReportLines(employees);

  console.log('--- 部门工资报表 ---');
  lines.forEach((line) => console.log(line));
  console.log(`工资总额：${calculateTotalSalary(actives)} 元`);
  console.log(`最高薪员工：${findTopEarner(actives).name}`);
}

// ========== 使用：结果与改前一致 ==========
const employees: Employee[] = [
  { name: '张三', salary: 12000, onLeave: false },
  { name: '李四', salary: 8000, onLeave: true },
  { name: '王五', salary: 20000, onLeave: false },
  { name: '赵六', salary: 9500, onLeave: false },
];

generateSalaryReport(employees);

// ========== 扩展：财务想单独拿到工资总额，直接复用 calculateTotalSalary ==========
const financeTotal = calculateTotalSalary(getActiveEmployees(employees));
console.log(`财务口径总额：${financeTotal} 元`); // 财务口径总额：41500 元

// 优势：
// 1. 每个循环只干一件事：总额、最高薪、明细各是一个小函数，可单独阅读、单独复用、单独测试
// 2. 重复的日志合并到条件之外：日志格式要加时间戳只改一处，杜绝各分支不一致
// 3. "排除休假员工"的口径收敛在 getActiveEmployees：算总额和找最高薪共用同一份名单，不会各排各的
// 4. findTopEarner 在过滤后的名单里找最高薪：休假员工再也不会被错标成"最高薪员工"，改前的隐患顺手修掉

export {};
