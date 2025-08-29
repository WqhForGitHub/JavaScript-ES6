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

<br>

## 11. 对象解构

对象解构让我们可以在一条语句中使用嵌套数据实现一个或多个赋值操作。简单地说，对象解构就是使用与对象匹配的结构来实现对象属性赋值。

下面的例子展示了两端等价的代码，首先是不使用对象解构的：

```javascript
// 不使用对象解构
let person = {
    name: 'Matt',
    age: 27
};

let personName = person.name,
    personAge = person.age;

console.log(personName); // Matt
console.log(personAge); // 27
```

然后，是使用对象解构的：

```javascript
// 使用对象解构
let person = {
    name: 'Matt',
    age: 27
};

let { name: personName, age: personAge } = person;

console.log(personName); // Matt
console.log(personAge); // 27
```

使用解构，可以同时声明多个变量并执行多个赋值操作。如果想让变量直接使用属性的名称，那么可以使用简写语法，比如：

```javascript
let person = {
    name: 'Matt',
    age: 27
};

let { name, age } = person;

console.log(name); // Matt
console.log(age); // 27
```

解构赋值不一定与对象的属性匹配。赋值的时候可以忽略某些属性，而如果引用的属性不存在，则该变量的值就是 undefined：

```javascript
let person = {
    name: 'Matt',
    age: 27
};

let { name, job } = person;

console.log(name); // Matt
console.log(job); // undefined
```

也可以在解构赋值的同时定义默认值，这适用于前面刚提到的引用的属性不存在源对象中的情况：

```javascript
let person = {
    name: 'Matt',
    age: 27
};

let { name, job = 'Software engineer' } = person;

console.log(name); // Matt
console.log(job); // Software engineer
```

解构在内部使用函数 ToObject()（不能在运行时环境中直接访问）把源数据结构转换为对象。这意味着在对象解构的上下文中，原始值会被当成对象。这也意味着 null 和 undefined 不能被解构，否则会抛出错误。

```javascript
let { length } = 'foobar';jjjjjjjjjjjjjjjj
console.log(length); // 6

let { constructor: c } = 4;
console.log(c === Number); // true

let { _ } = null; // TypeError

let { _ } = undefined; // TypeError
```

解构并不要求变量必须在解构表达式中声明。不过，如果是给事先声明的变量赋值，则赋值表达式必须包含在一对括号中：

```javascript
let personName, personAge;

let person = {
    name: 'Matt',
    age: 27
};

({ name: personName, age: personAge } = person);

console.log(personName, personAge); // Matt, 27
```

<br>

### 1. 嵌套解构

解构对于引用嵌套的属性或赋值目标没有限制。为此，可以通过解构来复制对象属性：

```javascript
let person = {
    name: 'Matt',
    age: 27,
    job: {
        title: 'Software engineer'
    }
};
let personCopy = {};

({
    name: personCopy.name,
    age: personCopy.age,
    job: personCopy.job
} = person);

// 因为一个对象的引用被赋值给 personCopy，所以修改
// person.job 对象的属性也会影响 personCopy
person.job.title = 'Hacker';

console.log(person);
// { name: 'Matt', age: 27, job: { title: 'Hacker' } }

console.log(personCopy);
// { name: 'Matt', age: 27, job: { title: 'Hacker' } }
```

解构赋值可以使用嵌套结构，以匹配嵌套的属性：

```javascript
let person = {
    name: 'Matt',
    age: 27,
    job: {
        title: 'Software engineer'
    }
};

// 声明 title 变量并将 person.job.title 的值赋给它
let { job: { title } } = person;

console.log(title); // Software engineer
```

在外层属性没有定义的情况下不能使用嵌套解构。无论源对象还是目标对象都一样：

```javascript
let person = {
    job: {
        title: 'Software engineer'
    }
};
let personCopy = {};

// foo 在源对象上是 undefined
({
    foo: {
        bar: personCopy.bar
    }
} = person);
// TypeError: Cannot destructure property 'bar' of 'undefined' or 'null'.

// job 在目标对象上是 undefined
({
    job: {
        title: personCopy.job.title
    }
} = person);
// TypeError: Cannot set property 'title' of undefined
```

<br>

### 2. 部分解构

需要注意的是，涉及多个属性的解构赋值是一个输出无关的顺序化操作。如果一个解构表达式涉及多个赋值，开始的赋值成功而后面的赋值出错，则整个解构赋值只会完成一部分：

```javascript
let person = {
    name: 'Matt',jjjjjjjjjj
    age: 27
};

let personName, personBar, personAge;

try {
    // person.foo 是 undefined，因此会抛出错误
    ({ name: personName, foo: { bar: personBar }, age: personAge } = person);
} catch(e) {}

console.log(personName, personBar, personAge);
// Matt, undefined, undefined
```

<br>

### 3. 参数上下文匹配

在函数参数列表中可以进行解构赋值。对参数的解构赋值不会影响 arguments 对象，但可以在函数签名中声明在函数体内使用局部变量：

```javascript
let person = {
    name: 'Matt',
    age: 27
};

function printPerson(foo, { name, age }, bar) {
    console.log(arguments);
    console.log(name, age);
}

function printPerson2(foo, { name: personName, age: personAge }, bar) {
    console.log(arguments);
    console.log(personName, personAge);
}

printPerson('1st', person, '2nd');
// ['1st', { name: 'Matt', age: 27 }, '2nd']
// 'Matt', 27

printPerson2('1st', person, '2nd');
// ['1st', { name: 'Matt', age: 27 }, '2nd']
// 'Matt', 27
```

<br>

## 12. 剩余操作符

在重新构造对象时，可以使用剩余操作符把所有未明确列出的可枚举属性都收集一个对象中。来看下面的例子：

```javascript
const person = {
    name: 'Matt',
    age: 27,
    job: 'Engineer'
};

const { name, ...remainingData } = person;

console.log(name); // Matt
console.log(remainingData); // { age: 27, job: 'Engineer' } 
```

在每个对象字面量中，最多只能使用一次剩余操作符，而且必须放在最后面。因为每个对象字面量只能用一个剩余操作符，所以就有了嵌套剩余操作符的可能。在嵌套的时候，因为不存在把某个属性子树的元素分配到任意指定剩余操作符的可能，所以得到的对象永远不会出现内容重叠的情况：

```javascript
const person = {
    name: 'Matt',
    age: 27,
    job: {
        title: 'Engineer',
        level: 10
    }
};

const { name, job: { title, ...remainingJobData }, ...remianingPersonData } = person;

console.log(name); // Matt
console.log(title); // Engineer
console.log(remainingPersonData); // { age: 27 }
console.log(remainingJobData); // { level: 10 }

const { ...a, job } = person;
// SyntaxError: Rest element must be last element
```

剩余操作符在对象间执行浅拷贝，因此对象的引用会被拷贝，而非克隆整个对象：

```javascript
const person = {
    name: 'Matt',
    age: 27,
    job: {
        title: 'Engineer',
        level: 10
    }
};

const { ...remainingData } = person;

console.log(person === remainingData); // false
console.log(person.job === remainingData.job); // truejj
```

剩余操作符会拷贝所有可枚举的自有属性，包括符号：

```javascript
const s = Symbol();
const foo = { a: 1, [s]: 2, b: 3 };

const { a, ...remainingData } = foo;

console.log(remainingData);
// { b: 3, Symbol(): 2 }
```

<br>

## 13. 扩展操作符

扩展操作符可以让我们把两个对象以类似数组拼接的方式组合到一起。应用到内部对象的扩展操作符会将所有可枚举的自有属性（包括符号）浅拷贝到外部对象：

```javascript
const s = Symbol();
const foo = { a: 1 };
const bar = { [s]: 2 };

const foobar = { ...foo, c: 3, ...bar };

console.log(foobar);
// { a: 1, c: 3, [Symbol()]: 2 }
```

扩展对象列出的顺序很重要，主要有两个原因。

* 对象会记录插入顺序。从扩展对象拷贝出来的属性将按照它们在对象字面量中被列出来的顺序执行赋值。
* 对象会在遇到重名时覆盖属性。后出现的属性将覆盖先出来的属性。

下面的代码示例展示了顺序的重要性：

```javascript
const foo = { a: 1 };
const bar = { b: 2 };

const foobar = { c: 3, ...bar, ...foo };

console.log(foobar);
// { c: 3, b: 2, a: 1 }

const baz = { c: 4 };

const foobarbaz = { ...foo, ...bar, c: 3, ...baz };

console.log(foobarbaz);
// { a: 1, b: 2, c: 4 }
```

与剩余操作符一样，所有拷贝都是浅拷贝：

```javascript
const foo = { a: 1 };
const bar = { b: 2, c: { d: 3 } };

const foobar = { ...foo, ...bar };

console.log(foobar.c === bar.c); // true
```

<br>

# 2. 创建对象

虽然使用 Object 构造函数或对象字面量可以方便地创建对象，但这些方式也有明显不足：创建具有同样接口地多个对象需要重复编写很多代码。

## 1. 概述

综观 ECMAScript 规范的历次发布，每个版本的特性似乎都出人意料。ECMAScript 5.1 并没有正式支持面向对象的结构，比如类或继承。但是，正如接下来几节会介绍的，巧妙地运用原型式继承可以成功地模拟同样的行为。

ECMAScript 6 开始正式支持类和继承。ECMAScript 的类旨在完全涵盖之前规范设计的基于原型的继承模式。不过，无论从哪方面看，类都仅仅式封装了 ES5.1 构造函数加原型继承的语法糖而已。

>注意
>
>编写面向对象编程模式的 JavaScript 代码还是应该使用 ECMAScript 类。但不管怎么说，理解 ES6 类出现之前的惯例总是有益无害的。特别是 ECMAScript 类定义本身就相当于对原有结构的封装。因此，在介绍类之前，本书会循序渐进地介绍被类取代的那些底层概念。

<br>

## 2. 构造函数模式

前几章提到过，ECMAScript 中的构造函数是用于创建特定类型对象的。像 Object 和 Array 这样的原生构造函数，运行时可以直接在执行环境中使用。当然也可以自定义构造函数，以函数的形式为自己的对象类型定义属性和方法。

来看一个使用构造函数模式的例子：

```javascript
function Person(nmae, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = function() {
        console.log(this.name);
    };
}

let person1 = new Person("Alice", 29, "Software Engineer");
let person2 = new Person("Greg", 27, "Doctor");

person1.sayName(); // Alice
person2.sayName(); // Greg
```

对于这个例子，要注意以下几点。

* 没有显式地创建对象。
* 属性和方法直接赋值给了 this。
* 没有 return。

另外，要注意函数名 Person 的首字母大写了。按照惯例，构造函数名称的首字母都是要大写的，非构造函数则以小写字母开头。这是从面向对象编程语言那里借鉴的，有助于在 ECMAScript 中区分构造函数和普通函数。毕竟 ECMAScript 的构造函数就是能创建对象的函数。

要创建 Person 的实例，应使用 new 操作符。以这种方式调用构造函数会执行如下操作。

1. 在内存中创建一个新对象
2. 这个新对象内部的 [[Prototype]] 特性被赋值为构造函数的 prototype 属性。
3. 构造函数内部的 this 被赋值为这个新对象（即 this 指向新对象）。
4. 执行构造函数内部的代码（给新对象添加属性）。
5. 如果构造函数返回非空对象，则返回该对象。否则，返回刚创建的新对象。

上一个例子的最后，person1 和 person1 分别保存着 Person 的不同实例。这两个对象都有一个 constructor 属性指向 Person，如下所示：

```javascript
console.log(person1.constructor == Person); // true
console.log(person2.constructor == Person); // true
```

constructor 本来是用于标识对象类型的。不过，一般认为 instanceof 操作符是确定对象类型更可靠的方式。前面例子中的每个对象都是 Object 的实例，同时也是 Person 的实例，如下面调用 instanceof 操作符的结果所示：

```javascript
console.log(person1 instanceof Object); // true
console.log(person1 instanceof Person); // true
console.log(person2 instanceof Object); // true
console.log(person2 instanceof Person); // true
```

定义自定义构造函数可以确保实例被标识为特定类型。在这个例子中，person1 和 person2 之所以也被认为是 Object 的实例，是因为所有自定义对象都继承自 Object（后面再详细讨论这一点）。

构造函数不一定要写成函数声明的形式。赋值给变量的函数表达式也可以作为构造函数：

```javascript
let Person = function(name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = function() {
        console.log(this.name);
    };
}

let person1 = new Person("Alice", 29, "Software Engineer");
let person2 = new Person("Greg", 27, "Doctor");

person1.sayName(); // Alice
person2.sayName(); // Greg

console.log(person1 instanceof Object); // true
console.log(person1 instanceof Person); // true
console.log(person2 instanceof Object); // true
console.log(person2 instanceof Person); // true
```

在实例化时，如果不想传参数，那么构造函数后面的括号可加可不加。只要有 new 操作符，就可以调用相应的构造函数：

```javascript
function Person() {
    this.name = 'Jake';
    this.sayName = function() {
        console.log(this.name);
    };
}

let person1 = new Person();
let person2 = new Person;

person1.sayName(); // Jake
person2.sayName(); // Jake

console.log(person1 instanceof Object); // true
console.log(person1 instanceof Person); // true
console.log(person2 instanceof Object); // true
console.log(person2 instanceof Person); // true
```

<br>

### 1. 构造函数也是函数

构造函数与普通函数唯一的区别就是调用方式不同。除此之外，构造函数也是函数。并没有把某个函数定义为构造函数的特殊语法。任何函数只要使用 new 操作符调用就是构造函数，而不使用 new 操作符调用的函数就是普通函数。比如，前面的例子中定义的 Person() 可以像下面这样调用：

```javascript
// 作为构造函数
let person = new Person("Alice", 29, "Software Engineer");
person.sayName(); // "Alice"

// 作为函数调用
Person("Greg", 27, "Doctor"); // 添加到 window 对象
window.sayName(); // "Greg"

// 在另一个对象的作用域中调用
let o = new Object();
Person.call(o, "Kristen", 25, "Nurse");
o.sayName(); // "Kristen"
```

这个例子一开始展示了典型的构造函数调用方式，即使用 new 操作符创建一个新对象。然后是普通函数的调用方式，这时候没有使用 new 操作符调用 Person()，结果会将属性和方法添加到 window 对象。这里要记住，在调用一个函数而没有明确设置 this 值得情况下（即没有作为某个对象得方法调用，或者没有使用 call() / apply() 调用），this 始终指向 Global 对象（在浏览器中就是 window 对象）。因此在上面的调用之后，window 对象上就有一个 sayName() 方法，调用它会返回 "Greg"。最后展开的调用方式是通过 call()（或 apply()）调用函数，同时将特定对象指定为作用域。这里的调用将对象 o 指定为 Person() 内部的 this 中，因此执行完函数代码后，所有属性和 sayName() 方法都会添加到对象 o 上面。

<br>

### 2. 构造函数的问题

构造函数虽然有用，但也不是没有问题。构造函数的主要问题在于，其定义的方法会在每个实例上都创建一遍。因此对前面的例子而言，person1 和 person2 都有名为 sayName() 的方法，但这两个方法不是同一个 Function 实例。我们知道，在 ECMAScript 中的函数是对象，因此每次定义函数都会初始化一个对象。逻辑上讲，这个构造函数应该类似这样：

```javascript
function Person(name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = new Function("console.log(this.name)"); // 逻辑等价
}
```

这样理解这个构造函数可以更清楚地知道，每个 Person 实例都会有自己的 Function 实例用于显示 name 属性。当然了，以这种方式创建函数会带来不同的作用域链和标识符解析。但创建新 Function 实例的机制是一样的。因此不同实例上的函数虽然同名却不相等，如下所示：

```javascript
console.log(person1.sayName == person2.sayName); // false
```

因为都是做一样的事，所以没必要定义两个不同的 Function 实例。况且，this 对象可以把函数与对象的绑定推迟到运行时。

要解决这个问题，可以把函数定义转移到构造函数的外部：

```javascript
function Person(name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = sayName;
}

function sayName() {
    console.log(this.name);
}

let person1 = new Person("Alice", 29, "Software Engineer");
let person2 = new Person("Greg", 27, "Doctor");

person1.sayName(); // Alice
person2.sayName(); // Greg
```

在这里，sayName() 被定义在了构造函数外部。在构造函数内部，sayName 属性等于全局 sayName() 函数。因为第一次 sayName 属性包含的只是一个指向外部函数的指针，所以 person1 和 person2 共享了定义在全局作用域上的 sayName() 函数。这样虽然解决了相同逻辑的函数重复定义的问题，但全局作用域也因此被搞乱了，因为那个函数实际上只能在一个对象上调用。如果这个对象需要多个方法，那么就要在全局作用域中定义多个函数。这会导致自定义类型引用的代码不能很好地聚集一起。这个新问题可以通过原型模式来解决。

<br>

## 3. 原型模式

### isPrototypeOf()

### Object.getPrototypeOf()

### Object.setPrototypeOf()

### Object.create()

### hasOwnProperty()

### Object.hasOwn()

### Object.getOwnPropertyDescriptor()

### in 操作符

### for-in 循环

### Object.keys()

### Object.getOwnPropertyNames()

### Object.getOwnPropertySymbols()

### Object.assign()

### Object.values()

### Object.entries()

### Object.fromEntries()

每个函数都会创建一个 prototype 属性，这个属性是一个对象，包含应该由特定引用类型地实例共享的属性和方法。实际上，这个对象就是通过调用构造函数创建的对象的原型。使用原型对象的好处是，在它上面定义的属性和方法可以被对象实例共享。原来在构造函数中直接赋给对象实例的值，可以直接赋值给它们的原型，如下所示：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
person1.sayName(); // "Alice"

let person2 = new Person();
person2.sayName(); // "Alice"

console.log(person1.sayName == person2.sayName); // true
```

使用函数表达式也可以：

```javascript
let person = function() {};

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
person1.sayName(); // "Alice"

let person2 = new Person();
person2.sayName(); // "Alice"

console.log(person1.sayName == person2.sayName); // true
```

这里，所有属性和 sayName() 方法都直接添加到了 Person 的 prototype 属性上，构造函数体中什么也没有。但这样定义之后，调用构造函数创建的新对象仍然拥有相应的属性和方法。与构造函数模式不同，使用这种原型模式定义的属性和方法是由所有实例共享的。因此 person1 和 person2 访问的都是相同的属性和相同的 sayName() 函数。要理解这个过程，就必须理解 ECMAScript 中原型的本质。

### 1. 理解原型

无论何时，只要创建一个函数，就会按照特定的规则为这个函数创建一个 prototype 属性（指向原型对象）。默认情况下，所有原型对象自动获得一个名为 constructor 的属性，指向与之关联的构造函数。对前面的例子而言，Person.prototype.constructor 指回 Person。然后，因构造函数而异，可能会给原型对象添加其他属性和方法。

在自定义构造函数时，原型对象默认只会获得 constructor 属性，其他的所有方法都继承自 Object。每次调用构造函数创建一个新实例，新实例都会有一个指针指向构造函数的原型对象。在 ECMA-262 规范中，这个指针叫做 [[Prototype]]。我们在脚本不能直接访问这个 [[Prototype]] 特性，但现代浏览器会在每个对象上暴露 `__proto__` 属性，通过这个属性可以访问对象的原型。关键是要理解这一点：实例与构造函数原型之间有直接的联系，但实例与构造函数之间没有。

这种关系不好可视化，但我们可以通过下面的代码片段表格来理解构造函数、原型与实例的关系。

| 概念                                                         | 代码片段                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 构造函数声明与函数表达式                                     | function Person() {}<br>let Person = function() {}           |
| 构造函数的 prototype 对象                                    | console.log(typeof Person.prototype);<br>console.log(Person.prototype);<br>`// {`<br>`//	constructor: f Person(),` <br>`//	__proto__: Object`<br>`// }` |
| 构造函数与 prototype 对象间的循环引用<br>原型链终止于 Object 的原型 | console.log(Person.prototype.constructor === Person);<br>// true<br>console.log(`Person.prototype.__proto__` === Object.prototype);<br>// true<br>console.log(`Person.prototype.__proto__.constructor` === Object);<br>// true<br>console.log(`Person.prototype.__proto__.__proto__` === null);<br>// true<br><br>console.log(`Person.prototype.__proto__`);<br>`// {`<br>`//  constructor: f Object(),`<br>`//  toString: ...`<br>`//  hasOwnProperty: ...`<br>`//  isPrototypeOf: ...`<br>`//  ...`<br>`// }` |
| 创建构造函数的实例                                           | let person1 = new Person(),<br>     person2 = new Person();  |
| 区分对象实例、构造函数、以及 prototype 对象                  | console.log(person1 !== Person);<br>// true<br><br>console.log(person1 !== Person.prototype);<br>// true<br>console.log(person.prototype !== Person);<br>// true |
| 实例、constructor 和 prototype 的关系                        | console.log(`person1.__proto__ === Person.prototype`);<br>// true<br><br>console.log(`person1.__proto__.constructor === Person`); |
| 实例共享同一个 prototype                                     | console.log(`person1.__proto__` === `person2.__proto__`);<br>// true |
| 使用 instanceof 操作符                                       | console.log(person1 instanceof Person);<br>// true<br><br>console.log(person1 instanceof Object);<br>// true<br><br>console.log(Person.prototype instanceof Object);<br>// true |

对于前面例子中的 Person 构造函数和 Person.prototype，可以通过下图看出各个对象之间的关系。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC8%E7%AB%A0%EF%BC%9A%E5%AF%B9%E8%B1%A1%E3%80%81%E7%B1%BB%E4%B8%8E%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%BC%96%E7%A8%8B/%E5%8F%AF%E8%A7%86%E5%8C%96%20constructor%E3%80%81prototype%20%E5%92%8C%E5%AE%9E%E4%BE%8B%E4%B9%8B%E9%97%B4%E7%9A%84%E5%85%B3%E7%B3%BB.png)

上图展示了 Person 构造函数、Person 的原型对象和 Person 现有两个实例之间的关系。注意，Person.prototype 指向原型对象，而 Person.prototype.constructor 指回 Person 构造函数。原型对象包含 constructor 属性和其他后来添加的属性。Person 的两个实例 person1 和 person2 都只有一个内部属性指回 Person.prototype，而且两者都与构造函数没有直接联系。另外要注意，虽然这两个实例都没有属性和方法，但 person1.sayName() 可以正常调用。这是由于对象属性查找机制的原因。

虽然不是所有实现都对外暴露了 [[Prototype]]，但可以使用 isPrototypeOf() 方法确定两个对象之间的这种关系。本质上，isPrototypeOf() 会在传入参数的 [[Prototype]] 指向调用它的对象时返回 true，如下所示：

```javascript
console.log(Person.prototype.isPrototypeOf(person1)); // true
console.log(Person.prototype.isPrototypeOf(person2)); // true
```

这里通过原型对象调用 isPrototypeOf() 方法检查了 person1 和 person2。因为这两个例子内部都有链接指向 Person.prototype，所以结果都返回 true。

ECMAScript 的 Object 类型有一个方法叫 Object.getPrototypeOf()，返回参数的内部特性 [[Prototype]] 的值。例如：

```javascript
console.log(Object.getPrototypeOf(person1) == Person.prototype); // true
console.log(Object.getPrototypeOf(person1).name); // "Alice"
```

第一行代码简单确认了 Object.getPrototypeOf() 返回的对象就是传入对象的原型对象。第二行代码则取得了原型对象上 name 属性的值，即 "Alice"。使用 Object.getPrototypeOf() 可以方便地取得一个对象的原型，而这在通过原型实现继承时显得尤为重要（本章后面会介绍）。

Object 类型还有一个 setPrototypeOf() 方法，可以向实例的私有属性 [[Prototype]] 写入一个新值。这样就可以重写要给对象的原型继承关系：

```javascript
let biped = {
    numLegs: 2
};
let person = {
    name: 'Matt'
};

Object.setPrototypeOf(person, biped);

console.log(person.name); // Matt
console.log(person.numLegs); // 2
console.log(Object.getPrototypeOf(person) === biped); // true
```

>注意
>
>Object.setPrototypeOf() 可能会严重影响代码性能。Mozilla 文档是这样说的：在所有浏览器和 JavaScript 引擎中，修改继承关系对性能的影响都是微妙且深远的。这种影响并不仅是执行 Object.setPrototypeOf() 语句这么简单，而是涉及所有会访问那些被修改过 [[Prototype]] 的对象的代码。

为避免使用 Object.setPrototypeOf() 可能造成的性能下降，可以通过 Object.create() 来创建一个新对象，同时为其指定原型：

```javascript
let biped = {
    numLegs: 2
};
let person = Object.create(biped);
person.name = 'Matt';

console.log(person.name); // Matt
console.log(person.numLegs); // 2
console.log(Object.getPrototypeOf(person) === biped); // true
```

<br>

### 2. 原型层级

在通过对象访问属性时，会按照这个属性的名称开始搜索。搜索开始于对象实例本身。如果在这个实例上发现了给定的名称，则返回该名称对应的值。如果没有找到这个属性，则搜索会沿着指针进入原型对象，然后在原型对象上找到属性后，再返回对应的值。

在调用 person1.sayName() 时，会发生两步搜索。首先，JavaScript 引擎会检查：person1 实例有 sayName 属性吗？答案是没有。然后，继续搜索并检查：person1 的原型有 sayName 属性吗？答案是有。于是就返回了保存在原型上的这个函数。在调用 person2.sayName() 时，会发生同样的搜索过程，而且也会返回相同的结果。

这就是原型用于在多个对象实例间共享属性和方法的原理。

>注意
>
>前面提到的 constructor 属性只存在于原型对象，因此通过实例对象也是可以访问到的。

虽然可以通过实例读取原型对象上的值，但不可能通过实例重写这些值。如果在实例上添加了一个与原型对象中同名的属性，那就会在实例上创建这个属性，这个属性会遮盖原型对象上的同名属性。下面看一个例子：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
let person2 = new Person();

person1.name = "Greg";
console.log(person1.name); // "Greg"，来自实例
console.log(person2.name); // "Alice"，来自原型
```

在这个例子中，person1 的 name 属性遮盖了原型对象上的同名属性。虽然 person1.name 和 person2.name 都返回了值，但前者返回的是 "Greg"（来自实例），后者返回的是 "Alice"（来自原型）。当访问 person1.name 时，会先在实例上搜索这个属性。因为这个属性在实例上存在，所以就不会再搜索原型对象了。而在访问 person2.name 时，并没有在实例上找到这个属性，所以会继续搜索原型对象并使用定义在原型上的属性。

只要给对象实例添加一个属性，这个属性就会遮盖原型对象上的同名属性，也就是虽然不会修改它，但会屏蔽对它的访问。即使在实例上把这个属性设置为 null，也不会恢复它和原型的联系。不过，使用 delete 操作符可以完全删除实例上的这个属性，从而让标识符解析过程能够继续搜索原型对象。

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
let person2 = new Person();

person1.name = "Greg";
console.log(person1.name); // "Greg"，来自实例
console.log(person2.name); // "Alice"，来自原型

delete person1.name;
console.log(person1.name); // "Alice"，来自原型
```

这个修改后的例子中使用 delete 删除了 person1.name，这个属性之前以 "Greg" 遮盖了原型上的同名属性。然后原型上 name 属性的联系就恢复了，因此再访问 person1.name 时，就会返回原型对象上这个属性的值。

hasOwnProperty() 方法用于确定某个属性是存在实例上还是存在原型对象上。这个方法是继承自 Object 的，会在属性存在于调用它的对象实例上时返回 true，如下面的例子所示：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
let person2 = new Person();
console.log(person1.hasOwnProperty("name")); // false

person1.name = "Greg";
console.log(person1.name); // "Greg"，来自实例
console.log(person1.hasOwnProperty("name")); // true

console.log(person2.name); // "Alice"，来自原型
console.log(person2.hasOwnProperty("name")); // false

delete person1.name;
console.log(person1.name); // "Alice"，来自原型
console.log(person1.hasOwnProperty("name")); // false
```

在这个例子中，通过调用 hasOwnProperty() 能够清楚地看到访问的是实例属性还是原型属性。调用 person1.hasOwnProperty("name") 只在重写 person1 上 name 属性的情况下才返回 true，表明此时 name 是一个实例属性，不是原型属性。下图形象地展示了上面例子中各个步骤的状态。（为简单起见，图中省略了 Person 构造函数）。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC8%E7%AB%A0%EF%BC%9A%E5%AF%B9%E8%B1%A1%E3%80%81%E7%B1%BB%E4%B8%8E%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%BC%96%E7%A8%8B/%E8%B5%8B%E5%80%BC%E5%92%8C%E5%88%A0%E9%99%A4%E6%93%8D%E4%BD%9C%E7%9A%84%E5%BD%B1%E5%93%8D.png)

Object.hasOwn() 方法是 Object.prototype.hasOwnProperty() 的替代简写方法。因此下面两行代码是等价的：

```javascript
person.hasOwnProperty("name");
Object.hasOwn(person, "name");
```

>注意
>
>ECMAScript 的 Object.getOwnPropertyDescriptor() 方法只对实例属性有效。要取得原型属性的描述符，必须直接在原型对象上调用 Object.getOwnPropertyDescriptor()。

### 3. 原型和 in 操作符

有两种方式使用 in 操作符：单独使用和在 for-in 循环中使用。单独使用时，in 操作符会在可以通过对象访问指定属性时返回 true，无论该属性是在实例上还是在原型上。来看下面的例子：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
let person2 = new Person();

console.log(person1.hasOwnProperty("name")); // false
console.log("name" in person1); // true

person1.name = "Greg";
console.log(person1.name); // "Greg"，来自实例
console.log(person1.hasOwnProperty("name")); // true
console.log("name" in person1); // true

console.log(person2.name); // "Alice"，来自原型
console.log(person2.hasOwnProperty("name")); // false
console.log("name" in person2); // true

delete person1.name;
console.log(person1.name); // "Alice"，来自原型
console.log(person1.hasOwnProperty("name")); // false
console.log("name" in person1); // true
```

在上面整个例子中，name 随时可以通过实例或通过原型访问到。因此，调用 "name" in person1 时始终返回 true，无论这个属性是否在实例上。如果要确定某个属性是否存在于原型上，可以像下面这样同时使用 hasOwnProperty() 和 in 操作符：

```javascript
function hasPrototypeProperty(object, name) {
    return !object.hasOwnProperty(name) && (name in object);
}
```

只要通过对象可以访问，in 操作符就返回 true，而 hasOwnProperty() 只有属性存在于实例上时才返回 true。因此，只要 in 操作符返回 true 且 hasOwnProperty() 返回 false，就说明该属性是一个原型属性。来看下面的例子：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person = new Person();
console.log(hasPrototypeProperty(person, "name")); // true

person.name = "Greg";
console.log(hasPrototypeProperty(person, "name")); // false
```

在这里，name 属性首先只存在于原型上，所以 hasPrototypeProperty() 返回 true。而在实例上重写这个属性后，实例上也有了这个属性，因此 hasPrototypeProperty() 返回 false。即便此时原型对象还有 name 属性，但因为实例上的属性遮盖了它，所以不会用到该属性。

在 for-in 循环中使用 in 操作符时，可以通过对象访问且可以被枚举的属性都会返回，包括实例属性和原型属性。遮盖原型中不可枚举（[[Enumeralbe]] 特性被设置为 false）属性的实例属性也会在 for-in 循环中返回，因为默认情况下我们手动定义的属性都是可枚举的。

要获得对象上所有可枚举的实例属性，可以使用 Object.keys() 方法。这个方法接收一个对象作为参数，返回包含该对象所有可枚举属性名称的字符串数组。比如：

```javascript
function Person() {}

Person.prototype.name = "Alice";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function() {
    console.log(this.name);
};

let keys = Object.keys(Person.prototype);
console.log(keys); // "name,age,job,sayName"
let p1 = new Person();
p1.name = "Rob";
p1.age = 31;
let p1keys = Object.keys(p1);
console.log(p1keys); // "[name,age]"
```

这里，keys 变量保存的数组中包含 "name"、"age"、"job" 和 "sayName"。这是正常情况下通过 for-in 返回的顺序。而在 Person 的实例上调用时，Object.keys() 返回的数组中只包含 "name" 和 "age" 两个属性。

如果想列出所有实例属性（包括不可枚举的属性），可以使用 Object.getOwnPropertyNames()：

```javascript
let keys = Object.getOwnPropertyNames(Person.prototype);
console.log(keys); // "[constructor,name,age,job,sayName]"
```

注意，返回的结果中包含了一个不可枚举的属性 constructor。Object.keys() 和 Object.getOwnPropertyNames() 在适当的时候都可用来代替 for-in 循环。

因为以符号为键的属性没有名称的概念，所以就需要一个与 getOwnPropertyNames() 类似的方法。Object.getOwnPropertySymbols() 与 Object.getOwnPropertyNames() 类似，只是针对符号而已：

```javascript
let k1 = Symbol('k1'),
    k2 = Symbol('k2');

let o = {
    [k1]: 'k1',
    [k2]: 'k2'
};

console.log(Object.getOwnPropertySymbols(o));
// [Symbol(k1), Symbol(k2)]
```

<br>

### 4. 属性枚举顺序

for-in 循环、Object.keys()、Object.getOwnPropertyNames()、Object.,getOwnPropertySymbols() 以及 Object.assign() 在属性枚举顺序方面有很大区别。for-in 循环和 Object.keys() 的枚举顺序是不确定的，取决于 JavaScript 引擎，可能因浏览器而异。

Object.getOwnPropertyNames()、Object.getOwnPropertySymbols() 和 Object.assign() 的枚举顺序是确定性的。先以升序枚举数值键，然后以插入顺序枚举字符串键和符号键。在对象字面量中定义的键以它们逗号分隔的顺序插入。

```javascript
let k1 = Symbol('k1'),
    k2 = Symbol('k2');

let o = {
    1: 1,
    first: 'first',
    [k1]: 'sym2',
    second: 'second',
    0: 0
};

o[k2] = 'sym2';
o[3] = 3;
o.third = 'third';
o[2] = 2;

console.log(Object.getOwnPropertyNames(o));
// ["0", "1", "2", "3", "first", "second", "third"]

console.log(Object.getOwnPropertySymbols(o));
// [Symbol(k1), Symbol(k2)]
```

<br>

### 5. 对象迭代

静态方法 Object.values() 和 Object.entries() 用于将对象内容转换为序列化且可迭代的格式。这两个方法都接收对象，返回数组。Object.values() 返回对象值的数组，Object.entries() 返回键值对的数组。

下面的示例展示了这两个方法：

```javascript
const o = {
    foo: 'bar',
    baz: 1,
    qux: {}
};

console.log(Object.values(o));
// ["bar", 1, {}]

console.log(Object.entries(o));
// [["foo", "bar"], ["baz", 1], ["qux", {}]]
```

注意，非字符串属性会被转换为字符串输出。另外，这两个方法执行对象的浅复制：

```javascript
const o = {
    qux: {}
};

console.log(Object.values(o)[0] === o.qux);
// true

console.log(Object.entries(o)[0][1] === o.qux);
// true
```

符号属性会被忽略：

```javascript
const sym = Symbol();
const o = {
    [sym]: 'foo'
};

console.log(Object.values(o));
// []

console.log(Object.entries(o));
// []
```

ECMAScript 也提供了静态方法 Object.fromEntries()，可以基于键值对的集合构建对象。这个方法执行与 Object.entries() 相反的操作，如下所示：

```javascript
const obj = {
    foo: 'bar',
    baz: 'qux'
};

const objEntries = Object.entries(obj);

console.log(objEntries);
// [["foo", "bar"], ["baz", "qux"]]

console.log(Object.fromEntries(objEntries));
// { foo: "bar", baz: "qux" }
```

这个静态方法的参数是一个可迭代对象，包含任意个数大小为 2 的可迭代对象。在需要把 Map 实例转换为 Object 实例时，这个方法非常方便。因为 Map 迭代器的输出恰好与 fromEntries() 参数的签名完全匹配：

```javascript
const map = new Map().set('foo', 'bar');

console.log(Object.fromEntries(map));
// { foo: "bar" }
```

<br>

### 6. 原型的动态性

因为从原型上搜索值得过程是动态得，所以即使实例在修改原型之前已经存在，任何时候对原型对象所做的修改也会在实例上反映出来。下面是一个例子：

```javascript
let friend = new Person();

Person.prototype.sayHi = function() {
    console.log("hi");
};

friend.sayHi(); // "hi"，没问题
```

以上代码先创建一个 Person 实例并保存在 friend 中。然后一条语句在 Person.prototype 上添加了一个名为 sayHi() 的方法。虽然 friend 实例是在添加方法之前创建的，但它仍然可以访问这个方法。之所以会这样，主要原因是实例与原型之间松散的联系。在调用 friend.sayHi() 时，首先会从这个实例中搜索名为 sayHi 的属性。在没有找到的情况下，运行时会继续搜索原型对象。因为实例和原型之间的链接就是简单的指针，而不是保存的副本，所以会在原型上找到 sayHi 属性并返回这个属性保存的函数。

虽然随时能给原型添加属性和方法，并能够立即反映在所有对象实例上，但这跟重写这个原型是两回事。实例的 [[Prototype]] 指针是在调用构造函数时自动赋值的，这个指针即使把原型修改为不同的对象也不会变。重写整个原型会切断最初原型与构造函数的联系，但实例引用的仍然是最初的原型。记住，实例只有指向原型的指针，没有指向构造函数的指针。来看下面的例子：

```javascript
function Person() {}

let friend = new Person();
Person.prototype = {
    constructor: Person,
    name: "Alice",
    age: 29,
    job: "Software Engineer",
    sayName() {
        console.log(this.name);
    }
};

friend.sayName(); // 错误
```

在这个例子中，Person 的新实例是在重写原型对象之间创建的。在调用 friend.sayName() 的时候，会导致错误。这是因为 friend 指向的原型还是最初的原型，而这个原型上并没有 sayName 属性。下图展示了这里的原因。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC8%E7%AB%A0%EF%BC%9A%E5%AF%B9%E8%B1%A1%E3%80%81%E7%B1%BB%E4%B8%8E%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%BC%96%E7%A8%8B/%E5%8E%9F%E5%9E%8B%E8%B5%8B%E5%80%BC%E5%89%8D%E5%90%8E.png)

重写构造函数上的原型之后再创建的实例才会引用新的原型。而在此之前创建的实例仍然还会引用最初的原型。







































































































