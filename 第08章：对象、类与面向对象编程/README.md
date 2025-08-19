# 1. 理解对象

创建自定义对象的通常方式是创建 Object 的一个新实例，然后再给它添加属性和方法，如下例所示：

```javascript
let person = new Object();
person.name = "Alice";
person.age = 29;
person.job = "Software Engineer";

person.sayName = function() {
    console.log(this.name);
};
```

这个例子创建了一个名为 person 的对象，而且有三个属性（name、age 和 job）和一个方法（sayName()）。sayName() 方法会显示 this.name 的值，这个属性会解析为 person.name。早期 JavaScript 开发者频繁使用这种方式创建新对象。几年后，对象字面量变成了更流行的方式。前面的例子如果使用对象字面量则可以这样写：

```javascript
let person = {
    name: "Alice",
    age: 29,
    job: "Software Engineer".
    sayName() {
    	console.log(this.name);
	}
};
```

这个例子中的 person 对象跟前面例子中的 person 对象是等价的，它们的属性和方法都一样。这些属性都有自己的特征，而这些特征决定了它们在 JavaScript 中的行为。

## 1. 属性的类型

ECMA-262 使用一些内部特性来描述属性的特征。这些特性在 ECMAScript 中定义并由 JavaScript 引擎实现，但开发者不能在 JavaScript 中直接访问这些特性。为了将某个特性标识为内部特性，规范会用两个中括号把特性的名称括起来，比如 [[Enumerable]]。

属性分两种：数据属性和访问器属性。

### 1. 数据属性

数据属性包含一个保存数据值的位置。值会从这个位置读取，也会写入到这个位置。数据属性有 4 个特性描述它们的行为。

* [[Configurable]]：表示属性是否可以通过 delete 删除并重新定义，是否可以修改它的特性，以及是否可以把它改为访问器属性。默认情况下，所有直接定义在对象上的属性的这个特性都是 true，如前面的例子所示。
* [[Enumerable]]: 表示属性是否可以通过 for-in 循环返回。默认情况下，所有直接定义在对象上的属性的这个特性都是 true，如前面的例子所示。
* [[Writable]]：表示属性的值是否可以被修改。默认情况下，所有直接定义在对象上的属性的这个特性都是 true，如前面的例子所示。
* [[Value]]：包含属性实际的值。这就是前面提到的那个读取和写入属性值的位置。这个特性的默认值为 undefined。

在像前面例子中那样将属性显式添加到对象之后，[[Configurable]]、[[Enumerable]] 和 [[writable]] 都会被设置为 true，而 [[value]] 特性会被设置为指定的值。比如：

```javascript
let person = {
    name: "Alice"
};
```

这里，我们创建了一个名为 name 的属性，并给它赋予了一个值 "Alice"。这意味着 [[Value]] 特性会被设置为 "Alice"，之后对这个值的任何修改都会保存这个位置。

要修改属性的默认特性，必须使用 Object.defineProperty() 方法。这个方法接收 3 个参数：要给其添加属性的对象、属性的名称和一个描述符对象。最后一个参数，即描述符对象上的属性可以包含：configurable、enumerable、writable 和 value。跟相关特性的名称一一对应。根据要修改的特性，可以设置其中任何一个值。比如：

```javascript
let person = {};
Object.defineProperty(person, "name", {
    writable: false,
    value: "Alice"
});
console.log(person.name); // "Alice"
person.name = "Greg";
console.log(person.name); // "Alice"
```

这个例子创建了一个名为 name 的属性并给它赋予了一个只读的值 "Alice"。这个属性的值就不能再修改了，在非严格模式下尝试给这个属性重新赋值会被忽略。在严格模式下，尝试修改只读属性的值会抛出错误。

类似的规则也适用于创建不可配置的属性。比如：

```javascript
let person = {};
Object.defineProperty(person, "name", {
    configurable: false,
    value: "Alice"
});
console.log(person.name); // "Alice"
delete person.name;
console.log(person.name); // "Alice"
```

这个例子把 configurable 设置为 false，意味着这个属性不能从对象上删除。非严格模式下对这个属性调用 delete 没有效果，严格模式下会抛出错误。此外，一个属性被定义为不可配置之后，就不能再变回可配置的了。再次调用 Object.defineProperty() 并修改任何非 writable 属性会导致错误：

```javascript
let person = {};
Object.defineProperty(person.name, "name", {
    configurable: false,
    value: "Alice"
});

// 抛出错误
Object.defineProperty(person, "name", {
    configurable: true,
    value: "Alice"
});
```

虽然可以对同一个属性多次调用 Object.defineProperty()，但在把 configurable 设置为 false 之后就会受限制。

在调用 Object.defineProperty() 时，configurable、enumerable 和 writable 的值如果不指定，则都默认为 false。多数情况下，可能都不需要 Object.defineProperty() 提供的这些强大的设置，但要理解 JavaScript 对象，就要理解这些概念。

<br>

### 2. 访问器属性

访问器属性不包含数据值。相反，它们包含一个获取（getter）函数和一个设置（setter）函数，不过这两个函数不是必需的。在读取访问器属性时，会调用获取函数，这个函数的责任就是返回一个有效的值。在写入访问器属性时，会调用设置函数并传入新值，这个函数必须决定对数据做出什么修改。访问器属性有 4 个特性描述它们的行为。

* [[Configurable]]：表示的属性是否可以通过 delete 删除并重新定义，是否可以修改它的特性，以及是否可以把它改为数据属性。默认情况下，所有直接定义在对象上的属性的这个特性都是 true。
* [[Enumerable]]：表示属性是否可以通过 for-in 循环返回。默认情况下，所有直接定义在对象上的属性的这个特性都是 true。
* [[Get]]：获取函数，在读取属性时调用。默认值为 undefined。
* [[Set]]：设置函数，在写入属性时调用。默认值为 undefined。

访问器属性是不能直接定义的，必须使用 Object.defineProperty()。下面是一个例子：

```javascript
// 定义一个对象，包含伪私有成员 year_和公共成员 edition
let book = {
    year_: 2023,
    edition: 1
};
Object.defineProperty(book, "year", {
    get() {
        return this.year_;
    },
    set(newValue) {
        if (newValue > 2023) {
            this.year_ = newValue;
            this.edition += newValue - 2023;
        }
    }
});
book.year = 2024;
console.log(book.edition); // 2
```

在这个例子中，对象 book 有两个默认属性：year_ 和 edition。year_ 中的下划线常用来表示该属性并不希望在对象方法的外部被访问。另一个属性 year 被定义为一个访问器属性，其中获取函数简单地返回 year_ 的值，而设置函数会做一些计算以确定正确的版本（edition）。因此，把 year 属性修改为 2024 会导致 year_ 变成 2024，edition 变成 2。这是访问器属性的典型使用场景，即设置一个属性值会导致一些其他变化发生。

获取函数和设置函数不一定都要定义。只定义获取函数意味着属性是只读的，尝试修改属性会被忽略。在严格模式下，尝试写入只定义了获取函数的属性会抛出错误。类似地，只有一个设置函数的属性是不能读取的，非严格模式下读取会返回 undefined，严格模式下会抛出错误。

在不支持 Object.defineProperty() 的浏览器中没有办法修改 [[Configurable]] 或 [[Enumerable]]。

<br>

## 2. 访问对象属性

要读取对象属性，可以使用点号或方括号语法。点号是最常见也是最直观的方式，需要先写出对象然后加上点号（.）再写出属性名：

```javascript
const person = {
    name: "Alice",
    age: 30
};

console.log(person.name); // Alice
console.log(person.age); // 30
```

此外，也可以使用方括号，传入字符串形式的属性名：

```javascript
console.log(person["name"]); // Alice
console.log(person["age"]); // 30
```

这两种方式的结果相同，但方括号适合属性名需要动态确定或者包含特殊字符或空格的情形。不过，静态代码分析工具不一定总认为 person.name 和 person["name"] 是一样的，因此推荐使用点号语。

<br>

## 3. 连缀属性

### ?.

在一个对象中嵌套另一个对象在 JavaScript 编程中是司空见惯的。从父对象访问子对象的属性非常简单，只要连续写出属性名即可，这称为属性链。比如下面的例子：

```javascript
const person = {
    name: "Alice",
    address: {
        city: "Chicago",
        street: "1060 W Addison St"
    }
};

console.log(person.address.city); // Chicago
console.log(person.address.postalCode); // undefined

console.log(person.address.postalCode.length);
// TypeError: Cannot read property 'length' of undefined
```

在这个例子中，通过连缀属性可以轻松访问子对象 address 的属性。这就相当于以下逻辑：

```javascript
const person = {};
const address = person.address;
console.log(address.city); // Chicago
```

连缀属性非常适合嵌套对象结构完整的情形，但如果某个中间对象不存在就会出问题，就像上面示例最后一行所展示的：抛出了 TypeError。为避免这个问题，需要检查属性链中涉及的每个对象是否存在，结果代码可能会非常冗长：

```javascript
const person = {};
if (person.address) {
    if (person.address.postalCode) {
        console.log(person.address.postalCode.length);
    }
}
```

为简化这种逻辑，可以使用可选连缀操作符，即在想要访问的属性名后面加上问号（?.）。这样如果属性对应的对象不存在，即访问链中相应部分是 undefined 或 null，则求值就会短路并返回 undefined：

```javascript
console.log(person.address?.postalCode?.length); // undefined

// 只要可选连缀的属性发生短路
// 就不再对操作符右侧表达式求值
console.log(person.address?.postalCode?.foo.bar.baz); // undefined
```

要注意，可选连缀操作符只会短路属性链中特定的部分：

```javascript
console.log(person.address.postalCode?.length); // undefined

console.log(person.address?.postalCode.length); // TypeError: Cannot read property 'length' of undefined
```

<br>

## 4. 对象静态方法

Object 类提供了非常多的静态方法，用于检视和操作对象。因为 JavaScript 中所有的非原始值都继承 Object，所以这些方法可以用于任何对象。下表总结了这些方法并简单描述了每个方法的行为。

| 方法                               | 行为                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| Object.assign()                    | 从一个或多个源对象向目标对象复制所有可枚举属性的值           |
| Object.create()                    | 基于指定的原型对象和属性创建新对象                           |
| Object.defineProperties()          | 使用多个属性描述符定义或修改对象的多个属性                   |
| Object.defineProperty()            | 使用属性描述符定义或修改对象的属性                           |
| Object.entries()                   | 返回对象自有可枚举字符串属性的键值对数组                     |
| Object\.freeze()                   | 冻结对象，防止再添加新属性及修改或删除已有属性               |
| Object.fromEntries()               | 基于传入的键值对可迭代对象（如数组或映射）返回一个新对象     |
| Object.getOwnPropertyDescriptor()  | 返回描述对象上指定属性配置的描述符                           |
| Object.getOwnPropertyDescriptors() | 返回描述对象上多个指定属性配置的描述符对象                   |
| Object.getOwnPropertyNames()       | 返回对象所有自有属性名（包括不可枚举属性）的数组             |
| Object.getOwnPropertySymbols()     | 返回对象所有自有符号属性（包括不可枚举属性）的数组           |
| Object.getPrototypeOf()            | 返回指定对象的原型（即内部的 [[Proptotype]]属性）            |
| Object.hasOwn()                    | 确定对象是否拥有指定的自有属性                               |
| Object.is()                        | 确定两个值是不是同一个值，考虑边界情形 NaN 和 -0             |
| Object.isExtensible()              | 确定对象是否可以扩展，即是否可以添加新属性                   |
| Object.isFrozen()                  | 确定对象是否被冻结，即是否不可扩展且所有属性都不可配置       |
| Object.isSealed()                  | 确定对象是否被封存，即是否不可扩展且所有属性都不可配置       |
| Object.keys()                      | 返回对象自有可枚举属性名的数组                               |
| Object.preventExtensions()         | 将对象设置为不可扩展，即不能添加新属性                       |
| Object.seal()                      | 封存对象，防止再添加新属性及删除或配置已有属性               |
| Object.setPrototypeOf()            | 将对象的原型（即内部的 [[Prototype]] 属性）设置为指定对象或 null |
| Object.values()                    | 返回对象自有可枚举属性值的数组                               |

<br>

## 5. 控制对象是否可修改

Object 提供了控制和操作对象可修改能力的静态方法。开发者可以冻结对象，让对象完全不可修改，决定对象是否可以被添加新属性，也可以封存对象以防止添加和删除属性，但允许修改属性。

### Object.freeze()

### Object.isFrozen()

### Object.seal()

### Object.isSealed()

### Object.preventExtensions()

### Object.isExtensible()

### 1. 冻结对象

Object.freeze() 方法主要用于冻结对象，把对象变成完全不可修改的状态。被冻结对象变得不能扩展，其全部已有属性变得不能配置。对象被冻结后，不能再添加新属性，已有属性也不能被修改或删除，对象的原型也不能改变。对冻结对象的任何修改操作都会导致错误或失败。可以使用 Object.isFrozen() 检测对象是否被冻结。

```javascript
const person = {
    name: "Alice",
    age: 30
};

console.log(Object.isFrozen(person)); // false
Object.freeze(person);
console.log(Object.isFrozen(person)); // true

person.name = "Bob";
// 非严格模式下会被忽略
// 严格模式下会抛出错误
```

冻结不能撤销，是一个永久性不可逆操作。

>注意
>
>冻结仅限于被冻结对象的直接属性。如果其中某个属性的值是对象，则该对象的属性仍然是可以修改的。要想深度冻结嵌套的对象，必须递归冻结其所有非原始值属性。

<br>

### 2. 封存对象

Object.seal() 方法提供了封存对象的途径，让对象变得不可扩展，并将其全部已有属性标记为不可配置。封存对象可以阻止对属性的添加或删除，同时仍然允许修改已有属性的值。对象被封存后，不能再添加新属性，但仍然可以修改已有属性的值。可以使用 Object.isSealed() 检测对象是否被封存。

```javascript
const person = {
    name: "Alice",
    age: 30
};

console.log(Object.isSealed(person)); // false
Object.seal(person);
console.log(Object.isSealed(person)); // true

person.name = "Bob"; // 封存后仍然允许修改已有属性
person.height = "6 feet";
// 非严格模式下会被忽略
// 严格模式下会抛出错误

delete person.age;
// 非严格模式下会被忽略
// 严格模式下会抛出错误
```

封存对象不会限制对已有属性值的修改，但会阻止添加新属性和删除已有的属性。相对于使用 Object.freeze() 冻结对象，封存相对宽松一些。

<br>

### 3. 控制可扩展能力

Object.preventExtensions() 方法用于将对象设置为不可扩展，也就是不能添加新属性。默认情况下，JavaScript 对象都是可以扩展的，也就是可以添加新属性。可以使用 Object.isExtensible() 方法检测对象是否可扩展。

```javascript
const person = {
    name: "Alice",
    age: 30
};

console.log(Object.isExtensible(person)); // true
Object.preventExtensions(person);
console.log(Object.isExtensible(person)); // false

person.name = "Bob"; // 仍然允许修改已有的属性
person.gender = "Female";
// 非严格模式下会被忽略
// 严格模式下会抛出错误

delete person.age;
// 非严格模式下会被忽略
// 严格模式下会抛出错误i+
```

Object.preventExtensions() 方法可以让对象变得不可扩展，阻止添加新属性，但仍然允许修改和删除已有的属性。相较于 Object.seal()，它不会讲已有属性标记为不可配置，因此还允许修改已有属性。

<br>

## 6. 定义多个属性

### Object.defineProperties()

要在一个对象上同时定义多个属性，可以使用 ECMAScript 提供的 Object.defineProperties() 方法。这个方法可以通过多个描述符一次性定义多个属性。它接收两个参数：要为之添加或修改属性的对象和另一个描述符对象，其属性与要添加或修改的属性一一对应。比如：

```javascript
let book = {};
Object.defineProperties(book, {
    year_: {
        value: 2023
    },
    edition: {
        value: 1
    },
    year: {
        get() {
            return this.year_
        },
        set(newValue) {
            if (newValue > 2023) {
                this.year_ = newValue;
                this.edition += newValue - 2023;
            }
        }
    }
})
```

这段代码在 book 对象上定义了两个数据属性 year_ 和 edition，还定义了一个访问器属性 year。最终的对象跟上一节示例中的一样，并且数据属性的 configurable、enumerable 和 writable 特性值都是 false。

<br>

## 7. 读取属性的特性

### Object.getOwnPropertyDescriptor()

### Object.getOwnPropertyDescriptors()

使用 Object.getOwnPropertyDescriptor() 方法可以取得指定属性的属性描述符。这个方法接收两个参数：属性所在的对象和要取得其描述符的属性名。返回值是一个对象，对于访问器属性包含 configurable、enumerable、get 和 set 属性，对于数据属性包含 configurable、enumerable、writable 和 value 属性。比如：

```javascript
let book = {};
Object.defineProperties(book, {
    year_: {
        value: 2023
    },
    edition: {
        value: 1
    },
    year: {
        get: function() {
            return this.year_;
        },
        set: function(newValue) {
            if (newValue > 2023) {
                this.year_ = newValue;
                this.edition += newValue - 2023;
            }
        }
    }
});

let descriptor = Object.getOwnPropertyDescriptor(book, "year_");
console.log(descriptor.value); // 2023
console.log(descriptor.configurable); // false
console.log(typeof descriptor.get); // "undefined"
let descriptor = Object.getOwnPropertyDescriptor(book, "year");
console.log(descriptor.value); // undefined
console.log(descriptor.enumerable); // false
console.log(typeof descriptor.get); // "function"
```

对于数据属性 year_，value 等于原来的值，configurable 是 false，get 是 undefined。对于访问器属性 year，value 是 undefined，enumerable 是 false，get 是一个指向获取函数的指针。

Object.getOwnPropertyDescriptors() 静态方法实际上会在每个自有属性上调用 Object.getOwnPropertyDescriptor() 并在一个新对象中返回它们。自有属性指的是直接在对象上定义的属性，不是从原型链傻瓜继承来的属性。

对于前面的例子，使用这个静态方法会返回如下对象：

```javascript
let book = {};
Object.defineProperties(book, {
    year_: {
        value: 2023
    },
    edition: {
        value: 1
    },
    year: {
        get: function() {
            return this.year_
        },
        set: function(newValue) {
            if (newValue > 2023) {
                this.year_ = newValue;
                this.edition += newValue - 2023;
            }
        }
    }
});

console.log(Object.getOwnPropertyDescriptors(book));
// {
//    edition: {
//        configurable: false,
//        enumerable: false,
//        value: 1,
//        writable: false
//    },
//    year: {
//        configurable: false,
//        enumerable: false,
//        get: f(),
//        set: f(newValue)
//    },
//    year_: {
//        configurable: false,
//        enumerable: false,
//        value: 2017,
//        writable: false
//    }
//}
```

<br>

## 8. 合并对象

### Object.assign()

JavaScript 开发者经常觉得合并（merge）两个对象很有用。更具体地说，就是把源对象所有地本地属性一起复制到目标对象上，而在遇到冲突时源对象上的属性优先。

Object.assign() 方法接收一个目标对象和一个或多个源对象作为参数，然后将每个源对象中可枚举（Object.propertyIsEnumerable() 返回 true）和自有（Object.hasOwnProperty() 返回 true）属性复制到目标对象。以字符串和符号为键的属性会被复制。对每个符合条件的属性，这个方法会使用源对象上的 [[Get]] 取得属性的值，然后使用目标对象上的 [[Set]] 设置属性的值。

```javascript
let dest, src, result;

/**
 * 简单复制
 */
dest = {};
src = { id： 'src' };

result = Object.assign(dest, src);

// Object.assign 修改目标对象
// 也会返回修改后的目标对象
console.log(dest === result); // true
console.log(dest !== src); // true
console.log(result); // { id: src }
console.log(dest); // { id: src }

/**
 * 多个源对象
 */
dest = {};

result = Object.assign(dest, { a: 'foo' }, { b: 'bar' });
console.log(result); // { a: foo, b: bar }

/**
 * 获取函数与设置函数
 */
dest = {
    set a(val) {
        console.log(`Invoked dest setter with param ${val}`);
    }
};
src = {
    get a() {
        console.log(`Invoked src getter`);
        return 'foo';
    }
};

Object.assign(dest, src);
// 调用 src 的获取方法
// 调用 dest 的设置方法并传入参数 "foo"

// 因为这里的设置函数不执行赋值操作
// 所以实际上并没有把值转移过来
console.log(dest); // { set a(val) {...} }
```

Object.assign() 实际上对每个源对象执行的是浅复制。如果多个源对象都有相同的属性，则使用最后一个复制的值。此外，从源对象访问器属性取得的值，比如获取函数，会作为一个静态值赋给目标对象。换句话说，不能在两个对象间转移获取函数和设置函数。

```javascript
let dest, src, result;

/**
 * 覆盖属性
 */
dest = { id: 'dest' };

result = Object.assign(dest, { id: 'src1', a: 'foo' }, { id: 'src2', b: 'bar' });

// Object.assign 会覆盖重复的属性
console.log(result); // { id: src2, a: foo, b: bar }

// 可以通过目标对象上的设置函数观察到覆盖的过程：
dest = {
    set id(x) {
        console.log(x);
    }
};

Object.assign(dest, { id: 'first' }, { id: 'second' }, { id: 'third' });
// first
// second
// third

/**
 * 对象引用
 */
dest = {};
src = { a: {} };

Object.assign(dest, src);

// 浅复制意味着只会复制对象的引用
console.log(dest); // { a: {} }
console.log(dest.a === src.a); // true
```

如果赋值期间出错，则操作会中止并退出，同时抛出错误。Object.assign() 没有回滚之前赋值的概念，因此它是一个尽力而为、可能只会完成部分复制的方法。

```javascript
let dest, src, result;

/**
 * 错误处理
 */
dest = {};
src = {
    a: 'foo',
    get b() {
        // Object.assign 在调用这个获取函数时会抛出错误
        throw new Error();
    },
    c: 'bar'
};

try {
    Object.assign(dest, src);
} catch(e) {}

// Object.assign() 没办法回滚已经完成的修改
// 因此在抛出错误之前，目标对象上已经完成的修改会继续存在
console.log(dest); // { a: foo }
```

<br>

## 9. 对象标识及相等判定

### Object.is()

在某些边界情况下，=== 操作符会表现出不符合预期的行为：

```javascript
// 这些是 === 符合预期的情况
console.log(true === 1); // false
console.log({} === {}); // false
conosole.log("2" === 2); // false

// 这些情况在不同 JavaScript 引擎中表现不同，但仍被认为相等
console.log(+0 === -0); // true
console.log(+0 === 0); // true
console.log(-0 === 0); // true

// 要确定 NaN 的相等性，必须使用极为讨厌的 isNaN()
console.log(NaN === NaN); // false
console.log(isNaN(NaN)); // true
```

为解决这类情况，ECMAScript 定义了 Object.is()，这个方法与 === 很像，但同时也考虑到了上述边界情形。这个方法必须接收两个参数：

```javascript
console.log(Object.is(true, 1)); // false
console.log(Object.is({}, {})); // false
console.log(Object.is("2", 2)); // false

// 正确的 0、-0、+0 相等/不等判定
console.log(Object.is(+0, -0)); // false
console.log(Object.is(+0, 0)); // true
console.log(Object.is(-0, 0)); // false

// 正确的 NaN 相等判定
console.log(Object.is(NaN, NaN)); // truej
```

要检查超过两个值，递归地利用相等性传递即可：

```javascript
function recursiveCheckEqual(x, ...rest) {
    return Object.is(x, rest[0]) && (rest.length < 2 || recursivelyCheckEqual(...rest));
}
```

这一行包含了整个函数的核心逻辑，可以分解为几个部分：

1. Object.is(x, rest[0]) - 使用 Object.is() 方法比较第一个参数 x 和剩余参数数组的第一个元素 rest[0] 是否严格相等

2. && - 逻辑与操作符，只有当左侧条件为真时，才会执行右侧的表达式
   (rest.length < 2 || recursivelyCheckEqual(...rest)) - 这是一个括号内的逻辑或表达式

- rest.length < 2 - 检查剩余参数数组的长度是否小于2（即只有0个或1个元素）
- || - 逻辑或操作符
- recursivelyCheckEqual(...rest) - 递归调用自身，传入剩余的所有参数

<br>

## 10. 增强的对象语法

ECMAScript 为定义和操作对象提供了很多极其有用的语法糖特性。这些特性都没有改变现有引擎的行为，但极大地提升了处理对象的方便程度。

本节介绍的所有对象语法同样适用于 ECMAScript 的类，本章后面会讨论。

>注意：
>
>相比以往的替代方案，本节介绍的增强对象语法更加简洁，表达力更强。因此本章及本书会默认使用这些新语法特性。

### 1. 属性值简写

在给对象添加变量的时候，开发者经常会发现属性名和变量名是一样的。例如：

```javascript
let name = 'Matt';

let person = {
    name: name
};

console.log(person); // { name: 'Matt' }
```

为此，简写属性值语法出现了。简写属性值只要使用变量名（不用再写冒号）就会自动被解释为同名的属性键。如果没有找到同名变量，则会抛出 ReferenceError。

以下代码使用了简单语法：

```javascript
let name = 'Matt';

let person = {
    name
};

console.log(person); // { name: 'Matt' }
```

代码压缩程序足够聪明，能在不同作用域间保留属性名，以防止找不到引用。以下面的代码为例：

```javascript
function makePerson(name) {
    return {
        name
    };
}

let person = makePerson('Matt');
console.log(person.name); // Matt
```

在这里，即使参数标识符只限定于函数作用域，编译器也会保留初始的 name 标识符。比如，如果使用 Google Closure 编译器压缩，那么函数参数会被缩短，而属性名不变：

```javascript
function makePerson(a) {
    return {
        name: a
    };
}

var person = makePerson("Matt");
console.log(person.name); // Matt
```

<br>

### 2. 可计算属性

在引入可计算属性之前，如果想使用变量的值作为属性，那么必须先声明对象，然后使用中括号语法来添加属性。换句话说，不能在对象字面量中直接动态命名属性。比如：

```javascript
const nameKey = 'name';
const ageKey = 'age';
const jobKey = 'job';

let person = {};
person[nameKey] = 'Matt';
person[ageKey] = 27;
person[jobKey] = 'Software engineer';

console.log(person); // { name: 'Matt', age: 27, job: 'Softwware engineer' }
```

有了可计算属性，就可以在对象字面量中完成动态属性赋值。中括号包围的对象属性键告诉运行时将其作为 JavaScript 表达式而不是字符串来求值：

```javascript
const nameKey = 'name';
const agekey = 'age';
const jobKey = 'job';

let person = {
    [nameKey]: 'Matt',
    [ageKey]: 27,
    [jobKey]: 'Software engineer'
};

console.log(person); // { name: 'Matt', age: 27, job: 'Software engineer' }
```

因为被当作 JavaScript 表达式求值，所以可计算属性本身可以是复杂的表达式，在实例化时再求值：

```javascript
const nameKey = 'name';
const ageKey = 'age';
const jobKey = 'job';
let uniqueToken = 0;

function getUniqueKey(key) {
    return `${key}_${uniqueToken++}`;
}

let person = {
    [getUniqueKey(nameKey)]: 'Matt',
    [getUniqueKey(agekey)]: 27,
    [getUniqueKey(jobKey)]: 'Software engineer'
};

console.log(person); // { name_0: 'Matt', age_1: 27, job_2: 'Software engineer' }
```

>注意
>
>可计算属性表达式中抛出任何错误都会中断对象创建。如果计算属性的表达式有副作用，那就要小心了，因为如果表达式抛出错误，那么之前完成的计算是不能回滚的。

<br>

### 3. 简写方法名

在给对象定义方法时，通常都要写一个方法名、冒号，然后再引用一个匿名函数表达式，如下所示：

```javascript
let person = {
    sayName: function(name) {
        console.log(`My name is ${name}`);
    }
};

person.sayName('Matt'); // My name is Matt
```

简写方法名对获取函数和设置函数也是适用的：

```javascript
let person = {
    name_: '',
    get name() {
        return this.name_;
    },
    set name(name) {
        this.name_ = name;
    },
    sayName() {
        console.log(`My name is ${this.name_}`);
    }
};

person.name = 'Matt';
person.sayName(); // My name is Matt
```

简写方法名与可计算属性键可以一起使用：

```javascript
const methodKey = 'sayName';

let person = {
    [methodKey](name) {
        console.log(`My name is ${name}`);
    }
}

person.sayName('Matt'); // My name is Matt
```































