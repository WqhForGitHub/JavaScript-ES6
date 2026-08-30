// 改后：策略模式 -- 算法各自封装成策略对象，函数只负责"委托"

// ========== 策略对象：每个等级的算法独立封装，各自可单独复用 ==========
const bonusStrategies: Record<string, (salary: number) => number> = {
  S: (salary) => salary * 4,
  A: (salary) => salary * 3,
  B: (salary) => salary * 2,
  C: (salary) => salary * 1,
};

// ========== 环境类(Context)：不含任何算法，只把请求委托给指定策略 ==========
function calculateBonus(level: string, salary: number): number {
  const strategy = bonusStrategies[level];
  if (!strategy) {
    throw new Error(`不存在的绩效等级：${level}`);
  }
  return strategy(salary);
}

console.log('S级年终奖：', calculateBonus('S', 20000)); // 80000
console.log('A级年终奖：', calculateBonus('A', 20000)); // 60000
console.log('B级年终奖：', calculateBonus('B', 20000)); // 40000

// ========== 扩展新等级：只加策略，不动 calculateBonus（对扩展开放，对修改关闭） ==========
bonusStrategies['D'] = (salary) => salary * 0.5;

console.log('D级年终奖：', calculateBonus('D', 20000)); // 10000

// 优势：
// 1. 算法各自独立，改"S级"的系数绝不会碰坏"A级"
// 2. 新增等级 = 注册一个新策略，calculateBonus 一行不改
// 3. 策略可以被其他模块直接复用：bonusStrategies.S(20000)

export {};
