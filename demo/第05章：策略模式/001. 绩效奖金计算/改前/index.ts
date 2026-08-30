// 改前：一个函数塞满所有绩效等级的算法，if-else 越堆越长
function calculateBonus(level: string, salary: number): number {
  if (level === 'S') {
    return salary * 4;
  } else if (level === 'A') {
    return salary * 3;
  } else if (level === 'B') {
    return salary * 2;
  } else if (level === 'C') {
    return salary * 1;
  }
  return 0;
}

console.log('S级年终奖：', calculateBonus('S', 20000)); // 80000
console.log('A级年终奖：', calculateBonus('A', 20000)); // 60000
console.log('B级年终奖：', calculateBonus('B', 20000)); // 40000

// 问题：
// 1. 函数体庞大，所有等级的算法挤在一起，改任何一个都要动整个函数
// 2. 想加一个"D级"绩效？必须回来修改 calculateBonus，违反开放-封闭原则
// 3. 算法无法复用，别处想要"S级"算法只能复制粘贴
// 4. if-else 链没有"抽象"可言，所有等级共用一个函数体

export {};
