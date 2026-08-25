// 第05章：策略模式 - 奖金计算

// ========== 最初的实现：大量 if-else ==========
console.log("===== 最初的实现：大量 if-else =====");

const calculateBonus = function (level, salary) {
  if (level === "S") {
    return salary * 4;
  }
  if (level === "A") {
    return salary * 3;
  }
  if (level === "B") {
    return salary * 2;
  }
};

console.log("S级奖金：", calculateBonus("S", 10000)); // 40000
console.log("A级奖金：", calculateBonus("A", 10000)); // 30000
console.log("B级奖金：", calculateBonus("B", 10000)); // 20000

// 问题：
// 1. calculateBonus 函数庞大，包含大量 if-else
// 2. 如果增加新的绩效等级，必须修改 calculateBonus 函数，违反开放-封闭原则
// 3. 算法复用性差，如果在其他地方也需要这些算法，只能复制粘贴

// ========== 策略模式重构：使用策略对象 ==========
console.log("\n===== 策略模式重构：使用策略对象 =====");

const strategies = {
  S: function (salary) {
    return salary * 4;
  },
  A: function (salary) {
    return salary * 3;
  },
  B: function (salary) {
    return salary * 2;
  },
};

const calculateBonus2 = function (level, salary) {
  return strategies[level](salary);
};

console.log("S级奖金：", calculateBonus2("S", 10000)); // 40000
console.log("A级奖金：", calculateBonus2("A", 10000)); // 30000
console.log("B级奖金：", calculateBonus2("B", 10000)); // 20000

// 优势：
// 1. 策略对象 strategies 与计算逻辑 calculateBonus2 分离
// 2. 增加新的绩效等级只需在 strategies 中添加属性，无需修改 calculateBonus2
// 3. 算法可以独立复用

// ========== 轻松扩展新策略 ==========
console.log("\n===== 轻松扩展新策略 =====");

strategies["C"] = function (salary) {
  return salary * 1;
};

console.log("C级奖金：", calculateBonus2("C", 10000)); // 10000
