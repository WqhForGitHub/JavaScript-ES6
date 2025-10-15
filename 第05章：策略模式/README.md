

# 1. 使用策略模式计算奖金

策略模式有着广泛的应用。本节我们就以年终奖的计算为例进行介绍。

很多公司的年终奖是根据员工的工资基数和年底绩效情况来发放的。例如，绩效为 S 的人年终奖有 4 倍工资，绩效为 A 的人年终奖有 3 倍工资，而绩效为 B 的人年终奖是 2 倍工资。假设财务部要求我们提供一段代码，来方便他们计算员工的年终奖。

## 1. 最初的代码实现

我们可以编写一个名为 calculateBonus 的函数来计算每个人的奖金数额。很显然，calculationBonus 函数要正确工作，就需要接收两个参数：员工的工资数额和他的绩效考核等级。代码如下：

```javascript
var calculateBonus = function(performanceLevel, salary) {
    if (performanceLevel === '5') {
        return salary * 4;
    }
    
    if (performanceLevel === 'A') {
        return salary * 3;
    }
    
    if (performanceLevel === 'B') {
        return salary * 2;
    }
};

calculateBonus('B', 20000); // 输出: 40000
calculateBonus('S', 6000); // 输出: 24000
```

# deepseek

## JavaScript 的策略模式（Strategy Pattern）

**策略模式**是一种行为设计模式，它允许在运行时根据需求动态选择算法或行为。核心思想是将算法封装成独立的策略对象，使它们可以互相替换，从而让算法的变化独立于使用它的客户端代码。

### 核心概念：

1. **策略（Strategy）**

   定义一组算法或行为的公共接口（通常是一个对象或函数）。

2. **具体策略（Concrete Strategies）**

   实现策略接口的具体算法。

3. **上下文（Context）**

   持有策略对象的引用，并通过策略接口执行具体算法。

------

## 实现示例

### 场景：电商促销策略（普通折扣、满减、无优惠）

```javascript
// 1. 定义策略接口（约定所有策略的调用方式）
class DiscountStrategy {
  calculate(price) {
    throw new Error("必须实现 calculate 方法");
  }
}

// 2. 具体策略实现
class RegularDiscount extends DiscountStrategy {
  calculate(price) {
    return price * 0.9; // 9折
  }
}

class FullReduction extends DiscountStrategy {
  calculate(price) {
    return price >= 200 ? price - 50 : price; // 满200减50
  }
}

class NoDiscount extends DiscountStrategy {
  calculate(price) {
    return price; // 原价
  }
}

// 3. 上下文（使用策略）
class ShoppingCart {
  constructor() {
    this.strategy = new NoDiscount(); // 默认策略
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  checkout(price) {
    return this.strategy.calculate(price);
  }
}

// 客户端使用
const cart = new ShoppingCart();

// 动态切换策略
cart.setStrategy(new RegularDiscount());
console.log(cart.checkout(100)); // 输出: 90

cart.setStrategy(new FullReduction());
console.log(cart.checkout(250)); // 输出: 200

cart.setStrategy(new NoDiscount());
console.log(cart.checkout(100)); // 输出: 100
```

------

### 策略模式的优点

1. **开闭原则**

   新增策略无需修改上下文代码（只需添加新策略类）。

2. **消除条件分支**

   避免复杂的 `if-else`或 `switch`语句。

3. **复用性与组合性**

   策略对象可被多个上下文复用，也可组合使用。

4. **职责分离**

   算法逻辑与客户端代码解耦。

------

### 实际应用场景

1. **表单验证**

   不同字段使用不同验证策略（邮箱、手机号、密码强度）。

2. **支付系统**

   动态切换支付方式（支付宝、微信、信用卡）。

3. **游戏开发**

   角色行为根据状态切换（行走、奔跑、跳跃）。

4. **数据处理**

   选择不同的排序或过滤算法。

------

### 策略模式 vs. 状态模式

- **策略模式**：主动选择算法（客户端控制策略切换）。
- **状态模式**：状态自动变迁（行为随内部状态改变）。

通过策略模式，JavaScript 代码能更灵活地应对需求变化，提升可维护性和扩展性。