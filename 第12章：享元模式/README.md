# deepseek

**享元模式**是一种结构型设计模式，旨在通过共享对象来最小化内存使用或计算开销。它适用于存在大量相似对象时，通过分离对象的**内部状态（可共享）**和**外部状态（不可共享）**，减少重复对象的创建。

## 核心思想：

1. **内部状态（Intrinsic State）**：对象中不变的、可共享的部分（如类型、颜色等）。
2. **外部状态（Extrinsic State）**：对象中变化的、不可共享的部分（如位置、大小等），由客户端在运行时传递。

## 实现步骤：

1. **创建享元工厂**：管理共享对象的创建与复用。
2. **分离状态**：将对象的内部状态与外部状态解耦。
3. **客户端传递外部状态**：使用时动态传入外部状态。

## 代码示例：渲染大量圆形

假设需要渲染 1000 个圆形，颜色只有 3 种（红、蓝、绿），但位置和半径不同。

### 1. 定义享元对象（内部状态）

```javascript
class Circle {
  constructor(color) {
    this.color = color; // 内部状态（可共享）
  }

  // 外部状态由参数传入
  draw(x, y, radius) {
    console.log(`Drawing ${this.color} circle at (${x}, ${y}) with radius ${radius}`);
  }
}
```

### 2. 创建享元工厂

```javascript
class CircleFactory {
  constructor() {
    this.circles = {}; // 存储共享对象
  }

  getCircle(color) {
    if (!this.circles[color]) {
      this.circles[color] = new Circle(color); // 按需创建
    }
    return this.circles[color];
  }
}
```

### 3. 客户端使用

```javascript
const factory = new CircleFactory();
const colors = ["red", "blue", "green"];

// 渲染 1000 个圆形（仅创建 3 个享元对象）
for (let i = 0; i < 1000; i++) {
  const color = colors[Math.floor(Math.random() * 3)];
  const circle = factory.getCircle(color); // 获取共享对象
  
  // 动态传入外部状态（位置、半径）
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const radius = Math.random() * 10;
  
  circle.draw(x, y, radius);
}
```

## 享元模式的优势：

1. **减少内存占用**：1000 个对象 → 3 个共享对象 + 外部状态。
2. **提高性能**：避免重复创建相似对象。
3. **简化逻辑**：分离不变与可变状态，代码更清晰。

## 适用场景：

- 大量相似对象导致内存开销过大。
- 对象的大部分状态可外部化（如游戏中的粒子、字符渲染）。
- 需要缓存池或对象复用的场景。

## 注意事项：

- 过度使用可能增加代码复杂度。
- 需确保内部状态是真正不可变的。
- 外部状态应由客户端管理，避免享元对象持有外部引用。

通过享元模式，JavaScript 应用可以高效处理大规模相似对象，优化资源消耗。

