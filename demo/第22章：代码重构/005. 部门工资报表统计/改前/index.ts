// 改前：生成部门工资报表的函数里，一个循环同时干"算总工资、找最高薪、拼明细"三件事，而且每个分支里都重复写着同一句"记录处理日志"

// ========== 员工 ==========
interface Employee {
  name: string;
  salary: number;
  onLeave: boolean; // 是否休假中
}

// ========== 生成报表：一个循环三种职责 + 分支里重复的日志 ==========
function generateSalaryReport(employees: Employee[]): void {
  let totalSalary = 0;
  let topEarner = employees[0];
  const lines: string[] = [];

  for (const employee of employees) {
    if (employee.onLeave) {
      console.log(`[日志] 已处理：${employee.name}`); // 重复的日志
      lines.push(`${employee.name}（休假中）：本月 0 元`);
    } else {
      console.log(`[日志] 已处理：${employee.name}`); // 又一句重复的日志
      totalSalary += employee.salary;
      if (employee.salary > topEarner.salary) {
        topEarner = employee;
      }
      lines.push(`${employee.name}：${employee.salary} 元`);
    }
  }

  console.log('--- 部门工资报表 ---');
  lines.forEach((line) => console.log(line));
  console.log(`工资总额：${totalSalary} 元`);
  console.log(`最高薪员工：${topEarner.name}`);
}

// ========== 使用 ==========
const employees: Employee[] = [
  { name: '张三', salary: 12000, onLeave: false },
  { name: '李四', salary: 8000, onLeave: true },
  { name: '王五', salary: 20000, onLeave: false },
  { name: '赵六', salary: 9500, onLeave: false },
];

generateSalaryReport(employees);

// 问题：
// 1. 一个循环干三件事：算总额、找最高薪、拼明细全搅在一起，想单独复用"算总额"只能整段复制
// 2. `console.log('[日志] ...')` 在每个分支里都写一遍：一旦日志格式要加时间戳，得逐个分支改，漏改一处日志就不一致
// 3. 循环体越来越长后没人说得清哪些变量（totalSalary、topEarner、lines）在哪一步被修改，排查问题像走迷宫
// 4. 休假员工不参与统计，但"最高薪员工"的初值取 employees[0]：如果排第一的恰好是休假员工且工资偏高，最高薪会错标给一个根本没参与统计的人

export {};
