# 1. 实现单例模式

要实现一个标准的单例模式并不复杂，无非是用一个变量来标志当前是否已经为某个类创建过对象，如果是，则在下一次获取该类的实例时，直接返回之前创建的对象。代码如下：

```javascript
var Singleton = function(name) {
    this.name = name;
}

Singleton.instance = null;
Singleton.prototype.getName = function() {
    alert(this.name);
}

Singleton.getInstance = function(name) {
    if (!this.instance) {
        this.intance = new Singleton(name);
    }
    return this.instance;
}

var a = Singleton.getInstance('sven1');
var b = Singleton.getInstance('sven2');

alert(a === b); // true
```

或者：

```javascript
var Singleton = function(name) {
    this.name = name;
};

Singleton.prototype.getName = function() {
    alert(this.name);
};

Singleton.getInstance - (function() {
    var instance = null;
    return function(name) {
        if (!instance) {
            instance = new Singleton(name);
        }
        return instance;
    }
})();
```



# deepseek

JavaScript 中的单例模式是一种**创建型设计模式**，它确保**一个类只有一个实例**，并**提供一个全局访问点**来获取该实例。换句话说，无论你尝试创建多少次该类的对象，你最终得到的都是**同一个实例**。

**核心目标：**

1. **控制实例数量：** 限制特定类只能被实例化**一次**。
2. **全局访问：** 提供一个统一的、易于访问的方式（通常是一个静态方法或属性）来获取这个唯一的实例。

**为什么在 JavaScript 中使用单例模式？**

- **共享全局状态/资源：** 当你需要维护一份全局共享的数据状态（如配置信息、用户会话信息、缓存、日志记录器、数据库连接池、状态管理如 Redux store 或 Vuex store 的核心部分等），并确保整个应用程序中只有一个访问点时。
- **避免不必要的实例化：** 某些对象（如工具类、管理器）只需要一个实例就足够服务所有功能，多次创建是多余且浪费资源的。
- **协调行为：** 当需要一个唯一的对象来协调系统各部分的操作时（例如，一个负责加载资源的管理器）。

**在 JavaScript 中实现单例模式的关键技术：**

实现单例的核心在于利用 JavaScript 的特性来控制对象的创建过程，确保只创建一次。以下是一些常见的实现方式：

1. **使用对象字面量 (Object Literal)：** (最简单的形式，但不完全等同于经典的面向对象单例)

   ```javascript
   const mySingleton = {
     property1: "value1",
     property2: "value2",
     method1() {
       console.log("I'm method1");
     },
     method2() {
       console.log("I'm method2");
     }
   };
   
   // 使用：
   mySingleton.method1();
   console.log(mySingleton.property1);
   
   // 无法创建新实例：const another = new mySingleton(); // 会报错: mySingleton is not a constructor
   ```

   - **优点：** 极其简单。
   - **缺点：** 是一个普通对象，不具备类那样的构造函数或私有状态的能力。它本质就是一个已存在的对象，没有“实例化”过程。

2. **闭包 + IIFE (Immediately Invoked Function Expression) + 模块模式：** (经典且灵活的实现，支持私有变量)

   ```javascript
   const Singleton = (function () {
     // 私有变量，存储唯一实例的引用
     let instance;
   
     // 创建实际单例对象/类的构造函数
     function createInstance() {
       // 这里可以是创建复杂对象的逻辑
       const object = new Object("I am the unique instance!");
       // 可以定义私有变量和方法（通过闭包访问）
       let privateCounter = 0;
   
       function privateIncrement() {
         privateCounter++;
       }
   
       return {
         publicMethod: function () {
           console.log("Public method called.");
           privateIncrement(); // 访问私有方法
         },
         publicProperty: "Public property value",
         getCount: function () {
           return privateCounter; // 暴露获取私有变量的方式
         },
       };
     }
   
     // 公共访问点
     return {
       getInstance: function () {
         if (!instance) {
           instance = createInstance();
         }
         return instance;
       },
     };
   })();
   
   // 使用：
   const instance1 = Singleton.getInstance();
   const instance2 = Singleton.getInstance();
   
   console.log(instance1 === instance2); // 输出: true (是同一个对象)
   instance1.publicMethod(); // 调用公共方法（内部会修改私有变量）
   console.log(instance1.getCount()); // 输出: 1 (证明私有变量被修改)
   ```

   - **优点：** 真正实现了单例控制；支持私有变量和方法（通过闭包）；延迟实例化（实例只在第一次调用 `getInstance()`时才创建）。
   - **缺点：** 稍微复杂一些。

3. **利用 ES6 `class`和静态属性：** (更现代的面向对象风格)

   ```javascript
   class Singleton {
     // 静态属性，用于存储唯一实例
     static #instance; // 私有静态字段 (ES2022+)
     // 或者 (在不支持私有静态字段的环境中)：static instance;
   
     // 构造函数声明为私有（约定上，JS暂时没有真正的私有构造）
     constructor() {
       // 确保不能通过 'new' 多次实例化
       if (Singleton.#instance) { // 或 Singleton.instance
         throw new Error("Use Singleton.getInstance() to get the instance.");
       }
       // 初始化逻辑
       this.property = "Initialized";
     }
   
     // 静态方法：获取单例实例
     static getInstance() {
       if (!Singleton.#instance) { // 或 !Singleton.instance
         Singleton.#instance = new Singleton(); // 第一次调用时创建
       }
       return Singleton.#instance;
     }
   
     // 实例方法
     showProperty() {
       console.log(this.property);
     }
   }
   
   // 使用：
   const inst1 = Singleton.getInstance();
   const inst2 = Singleton.getInstance();
   
   console.log(inst1 === inst2); // 输出: true
   inst1.showProperty(); // 输出: Initialized
   
   // 尝试直接 new 会抛出错误（根据约定）
   // const badInst = new Singleton(); // Error: Use Singleton.getInstance()...
   ```

   - **优点：** 使用 `class`语法，结构清晰；符合现代 JS 习惯；也支持延迟实例化。

   - **挑战：** JavaScript 本身没有提供私有的构造函数。需要依靠规范（如抛出错误）或 ES2022+ 的私有静态字段 (`#instance`) 来增强保护。在 TypeScript 中可以用 `private constructor()`更明确地解决这个问题。

   - **ES2022 静态初始化块 (可选)：** 可以在静态初始化块中进行更复杂的初始化：

     ```javascript
     class Singleton {
       static #instance;
       constructor() {
         if (Singleton.#instance) {
           throw new Error(...);
         }
         // ...
       }
       static {
         try {
           Singleton.#instance = new Singleton();
         } catch (err) {
           // 处理初始化错误
           Singleton.#instance = null; // 或设置一个默认安全状态
         }
       }
       static getInstance() {
         return Singleton.#instance;
       }
     }
     ```

**实际应用示例（模块化）：**

在模块系统中（如 ES Modules, CommonJS），每个模块本身就是天然的单例：

```javascript
// singletonModule.js
let instance = null;
let privateData = 0;

export default {
  getInstance() {
    if (!instance) {
      instance = {
        publicMethod() {
          console.log("Public method called.");
          privateData++;
        },
        getPrivateData() {
          return privateData;
        }
      };
    }
    return instance;
  }
};

// app.js
import singletonModule from './singletonModule.js';
const singletonA = singletonModule.getInstance();
const singletonB = singletonModule.getInstance();
console.log(singletonA === singletonB); // true
```

**单例模式的潜在缺点：**

- **全局状态：** 单例通常意味着全局状态，这会使代码更难理解和测试。状态变化可能难以追踪。
- **违反单一职责原则：** 单例类需要管理自己的生命周期（确保唯一性），又包含业务逻辑。
- **测试困难：** 单例的全局状态会破坏测试的隔离性，使得单元测试更加复杂。通常需要额外的机制（如依赖注入）来模拟单例。
- **过度使用：** 可能导致设计僵化，使组件耦合过于紧密。

**总结：**

JavaScript 单例模式确保了一个类仅有一个实例并提供全局访问点。实现方式多样，从简单的对象字面量到利用闭包、IIFE 的模块模式，再到现代的基于 ES6 `class`（配合静态属性和方法）的方式。模块系统也为实现单例提供了天然的支持。虽然单例在管理共享资源或全局状态时非常有用，但应谨慎使用，避免其带来的全局状态和测试复杂化的问题。