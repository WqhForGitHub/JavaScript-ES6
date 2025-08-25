# deepseek

**模板方法模式**是一种行为设计模式，它在父类（或基类）中定义算法的框架，允许子类在不改变算法结构的前提下重写特定步骤的实现。该模式的核心是**封装不变部分，扩展可变部分**。

## 核心思想

1. **抽象父类**：定义算法的骨架（模板方法），包含多个步骤。
2. **具体子类**：继承父类，重写某些步骤的实现，但不改变算法流程。
3. **控制反转**：父类控制流程，子类提供具体实现。

## JavaScript 实现示例

```javascript
// 1. 定义抽象父类（算法骨架）
class Beverage {
  // 模板方法：定义算法流程（不可被重写）
  prepare() {
    this.boilWater();
    this.brew();
    this.pourInCup();
    this.addCondiments();
  }

  // 固定步骤（子类无需重写）
  boilWater() {
    console.log("煮沸水");
  }

  pourInCup() {
    console.log("倒入杯中");
  }

  // 抽象步骤（由子类实现）
  brew() {
    throw new Error("子类必须实现 brew 方法");
  }

  addCondiments() {
    throw new Error("子类必须实现 addCondiments 方法");
  }
}

// 2. 具体子类：实现特定步骤
class Coffee extends Beverage {
  brew() {
    console.log("用沸水冲泡咖啡粉");
  }

  addCondiments() {
    console.log("加糖和牛奶");
  }
}

class Tea extends Beverage {
  brew() {
    console.log("用沸水浸泡茶叶");
  }

  addCondiments() {
    console.log("加柠檬");
  }
}

// 3. 使用示例
const coffee = new Coffee();
coffee.prepare();
// 输出：
// 煮沸水
// 用沸水冲泡咖啡粉
// 倒入杯中
// 加糖和牛奶

const tea = new Tea();
tea.prepare();
// 输出：
// 煮沸水
// 用沸水浸泡茶叶
// 倒入杯中
// 加柠檬
```

## 关键特点

1. **算法骨架固定**

   父类的 `prepare()`方法定义了不可变的流程（如先煮水再冲泡）。

2. **步骤可扩展**

   子类通过重写 `brew()`和 `addCondiments()`实现个性化逻辑。

3. **避免重复代码**

   公共步骤（如 `boilWater()`）在父类中统一实现。

4. **控制反转**

   父类掌控流程，子类只负责细节，符合“好莱坞原则”（“别调用我们，我们会调用你”）。

## 应用场景

- 多个类有相似流程，但某些步骤不同（如支付流程、数据解析）。
- 需要固定算法执行顺序，同时允许部分步骤灵活扩展。
- 提取公共代码避免冗余，提升可维护性。

## 注意事项

- JavaScript 没有抽象类的原生支持，需手动抛出错误强制子类实现方法。
- 过度使用可能导致子类泛滥，需权衡是否值得拆分。

通过模板方法模式，你可以高效管理算法的统一性和扩展性，提升代码复用性。

