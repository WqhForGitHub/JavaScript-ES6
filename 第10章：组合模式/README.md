# deepseek

组合模式（Composite Pattern）是一种**结构型设计模式**，它允许你将对象组合成树形结构来表示“部分-整体”的层次关系，使客户端能够以统一的方式处理单个对象和组合对象。

## 核心思想

- **统一处理**：无论是单个对象（叶子节点）还是组合对象（容器节点），客户端都通过相同的接口操作。
- **树形结构**：通过递归组合，形成树状层次结构（如文件系统中的文件夹和文件）。

## JavaScript 组合模式的关键角色

1. **Component（抽象构件）**

   - 定义所有对象的通用接口（包括叶子节点和容器节点）。

   - 声明操作子节点的方法（如 `add`, `remove`, `getChild`）。

   - 示例：

     ```javascript
     class Component {
       constructor(name) {
         this.name = name;
       }
       // 默认实现或抛出错误（叶子节点不支持这些操作）
       add(component) { throw new Error("Unsupported Operation"); }
       remove(component) { throw new Error("Unsupported Operation"); }
       getChild(index) { throw new Error("Unsupported Operation"); }
       operation() { throw new Error("Abstract Method!"); }
     }
     ```

2. **Leaf（叶子节点）**

   - 代表树中的末端对象（没有子节点）。
   - 实现 `operation()`方法，但不支持子节点操作。

   ```javascript
   class Leaf extends Component {
     operation() {
       console.log(`Leaf ${this.name}: Performing operation`);
     }
   }
   ```

3. **Composite（复合节点）**

   - 存储子节点（可以是 `Leaf`或其他 `Composite`）。
   - 实现子节点管理方法（`add`, `remove`, `getChild`）。
   - 在 `operation()`中递归调用子节点的操作。

   ```javascript
   class Composite extends Component {
     constructor(name) {
       super(name);
       this.children = [];
     }
     add(component) {
       this.children.push(component);
     }
     remove(component) {
       const index = this.children.indexOf(component);
       if (index !== -1) this.children.splice(index, 1);
     }
     getChild(index) {
       return this.children[index];
     }
     operation() {
       console.log(`Composite ${this.name}: Operating children`);
       this.children.forEach(child => child.operation());
     }
   }
   ```

## 使用示例：文件系统模拟

```javascript
// 定义节点
const folder1 = new Composite("Folder 1");
const folder2 = new Composite("Subfolder");
const file1 = new Leaf("File1.txt");
const file2 = new Leaf("File2.jpg");

// 构建树形结构
folder1.add(file1);
folder1.add(folder2);
folder2.add(file2);

// 统一操作
folder1.operation();
// 输出:
// Composite Folder 1: Operating children
// Leaf File1.txt: Performing operation
// Composite Subfolder: Operating children
// Leaf File2.jpg: Performing operation
```

## 组合模式的优点

1. **一致性**：客户端无需区分叶子节点和组合节点，调用方式统一。
2. **简化代码**：通过递归处理复杂树形结构，避免条件分支判断。
3. **开闭原则**：新增节点类型无需修改现有代码。

## 适用场景

- 需要表示**部分-整体层次结构**（如菜单/子菜单、文件/文件夹）。
- 希望客户端忽略对象是单个还是组合的差异。
- 处理树形数据（如 DOM 操作、UI 组件库）。

## 注意事项

- **过度统一接口**：叶子节点可能不支持某些方法（如 `add`），需合理设计默认行为（如抛出错误）。
- **性能考量**：深度递归可能影响性能，需避免过深嵌套。

## JavaScript 中的实际应用

- **React/Vue 组件树**：父组件可包含子组件（复合节点），叶子组件（如按钮）无子节点。
- **DOM 操作**：`Element`节点可包含子节点（`Composite`），`TextNode`是叶子节点。
- **游戏场景图**：场景（组合）包含子对象（角色、灯光等）。

组合模式通过树形结构和统一接口，简化了复杂层次对象的处理，是 JavaScript 中管理嵌套结构的有效工具。

