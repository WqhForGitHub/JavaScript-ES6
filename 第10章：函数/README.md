函数几乎是 ECMAScript 中最有意思的部分，这主要是因为函数实际上是对象。每个函数都是 Function 类型的实例，而 Function 也有属性和方法，跟其他引用类型一样。因为函数是对象，所以函数名就是指向函数对象的指针，而且不一定与函数本身紧密绑定。函数通常以函数声明的方式定义，比如：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}
```

注意函数定义最后没有加分号。

另一种定义函数的语法是函数表达式。函数表达式与函数声明几乎是等价的：

```javascript
let sum = function(num1, num2) {
    return num1 + num2;
};
```

这里，代码定义了一个变量 sum 并将其初始化为一个函数。注意 function 关键字后面没有名称，因为不需要。这个函数可以通过变量 sum 来引用。

注意这里的函数末尾是有分号的，与任何变量初始化语句一样。

还有一种定义函数的方式与函数表达式很像，叫做箭头函数（arrow function），如下所示：

```javascript
let sum = (num1, num2) => {
    return num1 + num2;
};
```

最后一种定义函数的方式是使用 Function 构造函数。这个构造函数接收任意多个字符串参数，最后一个参数始终会被当成函数体，而之前的参数都是新函数的参数。来看下面的例子：

```javascript
let sum = new Function("num1", "num2", "return num1 + num2"); // 不推荐
```

我们不推荐使用这种语法来定义函数，因为这段代码会被解释两次：第一次是将它当作常规 ECMAScript 代码，第二次是解释传给构造函数的字符串。这显然会影响性能。不过，把函数想象为对象，把函数名想象为指针式是很重要的。而上面这种语法很好地诠释了这些概念。

>注意
>
>这几种实例化函数对象的方式之间存在微妙但重要的差别，本章后面会讨论。无论如何，通过其中任何一种方式都可以创建函数。

# 1. 箭头函数

使用胖箭头（=>）语法可以定义函数表达式。很大程度上，箭头函数实例化的函数对象与正式的函数表达式创建的函数对象行为是相同的。任何可以使用函数表达式的地方，都可以使用箭头函数：

```javascript
let arrowSum = (a, b) => {
    return a + b;
};

let functionExpressionSum = function(a, b) {
    return a + b;
};

console.log(arrowSum(5, 8)); // 13
console.log(functionExpressionSum(5, 8)); // 13
```

箭头函数简洁的语法非常适合嵌入函数的场景：

```javascript
let ints = [1, 2, 3];

console.log(ints.map(function(i) { return i + 1; })); // [2, 3, 4]
console.log(ints.map(i) => { return i + 1 }); // [2, 3, 4]
```

如果只有一个参数，也可以不用括号。只有在没有参数，或者有多个参数时才需要使用括号：

```javascript
// 以下两种写法都有效
let double = (x) => { return 2 * x };
let triple = x => { return 3 * x };

// 没有参数需要括号
let getRandom = () => { return Math.random(); };

// 多个参数需要括号
let sum = (a, b) => { return a + b; };

// 无效的写法：
let multiply = a, b => { return a * b; };
```

箭头函数也可以不用大括号，但这样会改变函数的行为。使用大括号就说明包含函数体，可以在其中包含多条语句，跟常规的函数一样。如果不使用大括号，那么箭头后面就只能有一行代码，比如一个赋值操作，或者一个表达式。而且，省略大括号会隐式返回这行代码的值：

```javascript
// 以下两种写法都有效，而且返回相应的值
let double = (x) => { return 2 * x };
let triple = (x) => 3 * x;

// 可以赋值
let value = {};
let setName = (x) => x.name = "Matt";
setName(value);
console.log(value.name); // "Matt"

// 无效的写法：
let multiply = (a, b) => return a * b;
```

箭头函数虽然语法简洁，但也有很多场合不适用。箭头函数不能使用 arguments、super 和 new.target，也不能用作构造函数。此外，箭头函数也没有 prototype 属性。

# 2. 函数名

## name

因为函数名就是指向函数的指针，所以它们跟其他包含对象指针的变量具有相同的行为。这意味着一个函数可以有多个名称，如下所示：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}

console.log(sum(10, 10)); // 20

let anotherSum = sum;
console.log(anotherSum(10, 10)); // 20

sum = null;
console.log(anotherSum(10, 10)); // 20
```

以上代码定义了一个名为 sum() 的函数，用于求两个数之和。然后又声明了一个变量 anotherSum，并将它的值设置为等于 sum。注意，使用不带括号的函数名会访问函数指针，而不会执行函数。此时，anotherSum 和 sum 都指向同一个函数。调用 anotherSum() 还是可以照常调用，没有问题。

所有函数对象都暴露一个只读的 name 属性，其中包含关于函数的信息。多数情况下，这个属性中保存的就是要给函数标识符，或者说是一个字符串化的变量名。即使函数没有名称，也会如实显示成空字符串。如果它是使用 Function 构造函数创建的，则会标识成 anonymous：

```javascript
function foo() {}
let bar = function() {};
let baz = () => {};

console.log(foo.name); // foo
console.log(bar.name); // bar
console.log(baz.name); // baz
console.log((() => {}).name); //（空字符串）
console.log((new Function()).name); // anonymous
```

如果函数是一个获取函数、设置函数，或者使用 bind() 实例化，那么标识符前面会加上一个前缀：

```javascript
function foo() {}

console.log(foo.bind(null).name); // bound foo

let dog = {
    years: 1,
    get age() {
        return this.years;
    },
    set age(newAge) {
        this.years = newAge;
    }
}

let propertyDescriptor = Object.getOwnPropertyDescriptor(dog, 'age');
console.log(propertyDescriptor.get.name); // get age
console.log(propertyDescriptor.set.name); // set age
```

# 3. 理解参数

## arguments

ECMAScript 函数的参数跟大多数其他语言不同。ECMAScript 函数既不关心传入的参数个数，也不关心这些参数的数据类型。定义函数时要接收两个参数，并不意味着调用时就传两个参数。你可以传一个、三个、甚至一个也不传，解释器都不会报错。

之所以会这样，主要是因为 ECMAScript 函数的参数在内部表现为一个数组。函数被调用时总会接收一个数组，但函数并不关心这个数组中包含什么。如果数组中什么也没有，那没问题。如果数组的元素超出了要求，那也没问题。事实上，在使用 function 关键字定义（非箭头）函数时，可以在函数内部访问 arguments 对象，从中取得传进来的每个参数值。

arguments 对象是一个类数组对象（不是 Array 的实例），因此可以使用中括号语法访问其中的元素（第一个参数是 arguments[0]，第二个参数是 arguments[1]）。要确定传进来多少个参数，可以访问 arguments.length 属性。

在下面的例子中，sayHi() 函数的第一个参数叫 name：

```javascript
function sayHi(name, message) {
    console.log("Hello " + name + ", " + message);
}
```

可以通过 arguments[0] 取得相同的参数值。因此，把函数重写成不声明参数也可以：

```javascript
function sayHi() {
    console.log("Hello " + arguments[0] + ", " + arguments[1]);
}
```

在重写后的代码中，没有命名参数。name 和 message 参数都不见了，但函数照样可以调用。这就表明，ECMAScript 函数的参数只是为了方便才写出来的，并不是必须写出来。与其他语言不同，在 ECMAScript 中，命名参数不会创建让之后的调用必须匹配的函数签名。

也可以通过 arguments 对象的 length 属性检查传入的参数个数。下面的例子展示了在每调用一个函数时，都会打印出传入的参数个数：

```javascript
function howManyArgs() {
    console.log(arguments.length);
}

howManyArgs("string", 45); // 2
howManyArgs(); // 0
howManyArgs(12); // 1
```

这个例子分别打印出 2、0 和 1（按顺序）。既然如此，那么开发者可以想传多少参数就传多少参数。比如：

```javascript
function doAdd() {
    if (arguments.length === 1) {
        console.log(arguments[0] + 10);
    } else if (arguments.lnegth === 2) {
        console.log(arguments[0] + arguments[1]);
    }
}

doAdd(10); // 20
doAdd(30, 20); // 50
```

这个函数 doAdd() 在只传一个参数时会加 10，在传两个参数时会将它们相加，然后返回。因此 doAdd(10) 返回 20，而 doAdd(30, 20) 返回 50。虽然不像真正的函数重载那么明确，但这已经足以弥补 ECMAScript 在这方面的缺失了。

还有一个必须理解的重点，那就是 arguments 对象可以跟命名参数一起使用，比如：

```javascript
function doAdd(num1, num2) {
    if (arguments.length === 1) {
        console.log(num1 + 10);
    } else if (arguments.length === 2) {
        console.log(arguments[0] + num2);
    }
}
```

这个 doAdd() 函数同时使用了两个命名参数和 arguments 对象。命名参数 num1 保存着与 arguments[0] 一样的值，因此使用谁都无所谓。（同样，num2 也保存着跟 arguments[1] 一样的值。）

arguments 对象的另一个有意思的地方，就是它的值始终会与对应的命名参数同步。来看下面的例子：

```javascript
function doAdd(num1, num2) {
    arguments[1] = 10;
    console.log(arguments[0] + num2);
}
```

这个 doAdd() 函数把第二个参数的值重写为 10。因为 arguments 对象的值会自动同步到对应的命名参数，所以修改 arguments[1] 也会修改 num2 的值，因此两者的值都是 10。但这并不意味着它们都访问同一个内存地址，它们在内存中还是分开的，只不过保持同步而已。另外还要记住一点：如果只传了一个参数，然后把 arguments[1] 设置为某个值，那么这个值并不会反映到第二个命名参数。这是因为 arguments 对象的长度是根据传入的参数个数，而非定义函数时给出的命名参数个人确定的。

对于命名参数而言，如果调用函数时没有传这个参数，那么它的值就是 undefined。这就类似于定义了变量而没有初始化。比如只给 doAdd() 传了一个参数，那么 num2 的值就是 undefined。

严格模式下，arguments 会有一些变化。首先，像前面那样给 arguments[1] 赋值不会影响 num2 的值。就算把 arguments[1] 设置为 10，num2 的值仍然还是传入的值。其次，在函数中尝试重写 arguments 对象会导致语法错误。（代码也不会执行。）

## 箭头函数中的参数

如果函数是使用箭头语法定义的，那么传给函数的参数将不能使用 arguments 关键字访问，而只能通过定义的命名参数访问。

```javascript
function foo() {
    console.log(arguments[0]);
}
foo(5); // 5

let bar = () => {
    console.log(arguments[0]);
};
bar(5); // ReferenceError: argument is not defined
```

虽然箭头函数中没有 arguments 对象，但可以在包装函数中把它提供给箭头函数：

```javascript
function foo() {
    let bar = () => {
        console.log(arguments[0]); // 5
    };
    bar();
}

foo(5);
```

>注意
>
>ECMAScript 中的所有参数都是按值传递的，不可能按引用传递参数。如果把对象作为参数传递，那么传递的值就是这个对象的引用。

# 4. 没有重载

ECMAScript 函数不能像在传统编程中那样重载。在 Java 等其他语言中，一个函数可以有两个定义，只要签名（接收参数的类型和数量）不同就行。如前所述，ECMAScript 函数没有签名，因为参数是由包含零个或多个值的数组表示的。没有函数签名，自然也就没有重载。

如果在 ECMAScript 中定义了两个同名函数，则后定义的会覆盖先定义的。来看下面的例子：

```javascript
function addSomeNumber(num) {
    return num + 100;
}

function addSomeNumber(num) {
    return num + 200;
}

let result = addSomeNumber(100); // 300
```

这里，函数 addSomeNumber() 被定义了两次。第一个版本给参数加 100，第二个版本加 200。最后一行调用这个函数时，返回了 300，因为第二个定义覆盖了第一个定义。

前面也提到过，可以通过检查参数的类型和数量，然后分别执行不同的逻辑来模拟函数重载。

把函数名当成指针也有助于理解为什么 ECMAScript 没有函数重载。在前面的例子中，定义两个同名的函数显然会导致后定义的重写先定义的。而那个例子几乎跟下面这个是一样的：

```javascript
let addSomeNumber = function(num) {
    return num + 100;
};

addSomeNumber = function(num) {
    return num + 200;
};

let result = addSomeNumber(100); // 300
```

看这段代码应该更容易理解发生了什么。在创建第二个函数时，变量 addSomeNumber 被重写成保存第二个函数对象了。

# 5. 默认参数值

在旧版本 ECMAScript 中，实现默认参数的一种常用方式就是检测某个参数是否等于 undefined，如果是则意味着没有传这个参数，那就给它赋一个值：

```javascript
function makeKing(name) {
    name = (typeof name !== 'undefined') ? name : 'Henry';
    return `King ${name} VIII`;
}

console.log(makeKing()); // 'King Henry VIII'
console.log(makeKing('Louis')); // 'King Louis VIII'
```

现在不用这么麻烦了，我们可以显式定义默认参数。下面就是与前面代码等价的写法，只要在函数定义中的参数后面用 = 就可以为参数赋一个默认值：

```javascript
function makeKing(name = 'Henry') {
    return `King ${name} VIII`;
}

console.log(makeKing('Louis')); // 'King Louis VIII'
console.log(makeKing()); // 'King Henry VIII'
```

给参数传 undefined 相当于没有传值，不过这样可以利用多个独立的默认值：

```javascript
function makeKing(name = "Henry") {
    name = "Louis";
    return `King ${arguments[0]}`;
}

console.log(makeKing()); // 'King undefined'
console.log(makeKing('Louis')); // 'King Louis'
```

默认参数值并不限于原始值或对象类型，也可以使用调用函数返回的值：

```javascript
let romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
let orinality = 0;

function getNumerals() {
    // 每次调用后递增
    return romanNumerals[ordinality++];
}

function makeKing(name = 'Henry', numerals = getNumerals()) {
    return `King ${name} ${numerals}`;
}

console.log(makeKing()); // 'King Henry I'
console.log(makeKing('Louis', 'XVI')); // 'King Louis XVI'
console.log(makeKing()); // 'King Henry II'
console.log(makeKing()); // 'King Henry III'
```

函数的默认参数只有在函数被调用时才会求值，不会在函数定义时求值。而且，计算默认值的函数只有在调用函数但未传相应参数时才会被调用。

箭头函数同样也可以这样使用默认参数，只不过在只有一个参数时，就必须使用括号而不能省略了：

```javascript
let makeKing = (name = 'Henry') => `King ${name}`;

console.log(makeKing()); // King Henry
```

## 默认参数作用域与暂时性死区

因为在求值默认参数时可以定义对象，也可以动态调用函数，所以函数参数是在某个作用域中求值的。

给多个参数定义默认值实际上跟使用 let 关键字顺序声明变量一样。来看下面的例子：

```javascript
function makeKinig(name = 'Henry', numerals = 'VIII') {
    return `King ${name} ${numerals}`;
}

console.log(makeKing()); // King Henry VIII
```

这里的默认参数会按照定义它们的顺序依次被初始化。可以依照如下示例想象一下这个过程：

```javascript
function makeKing() {
    let name = 'Henry';
    let numerals = 'VIII';
    
    return `King ${name} ${numerals}`;
}
```

因为参数是按顺序初始化的，所以后定义默认值的参数可以引用先定义的参数。看下面这个例子：

```javascript
function makeKing(name = 'Henry', numerals = name) {
    return `King ${name} ${numerals}`;
}

console.log(makeKing()); // King Henry Henry
```

参数初始化顺序遵循暂时性死区规则，即前面定义的参数不能引用后面定义的。像这样就会抛出错误：

```javascript
// 调用时不传第一个参数会报错
function makeKing(name = numerals, numerals = 'VIII') {
    return `King ${name} ${numerals}`;
}
```

参数也存在于自己的作用域中，它们不能引用函数体的作用域：

```javascript
// 调用时不传第二个参数会报错
function makeKing(name = 'Henry', numerals = defaultNumeral) {
    let defaultNumeral = 'VIII';
    return `King ${name} ${numerals}`;
}
```

# 6. 参数扩展与收集

使用扩展操作符（...）可以非常简洁地操作和收集数据。扩展操作符最有用地场景就是函数定义中的参数列表，在这里它可以充分利用这门语言的弱类型及参数长度可变的特点。扩展操作符既可以用于调用函数时传参，也可以用于定义函数参数。

## 1. 扩展参数

在给函数传参时，有时候可能不需要传一个数组，而是要分别传入数组的元素。

假设有如下函数定义，它会将所有传入的参数累加起来：

```javascript
let values = [1, 2, 3, 4];

function getSum() {
    let sum = 0;
    for (let i = 0; i < arguments.length; i++) {
        sum += arguments[i];
    }
    return sum;
}
```

这个函数希望将所有加数逐个传进来，然后通过迭代 arguments 对象来实现累加。如果不使用扩展操作符，想把定义在这个函数外面的数组拆开，就得借助于 apply() 方法：

```javascript
console.log(getSum.apply(null, values)); // 10
```

通过扩展操作符能够极为简洁地实现这种操作。对可迭代对象应用扩展操作符，并将其作为一个参数传入，可以将可迭代对象拆分，并将迭代返回地每个值单独传入。

比如，使用扩展操作符可以将前面例子中地数组像这样直接传给函数：

```javascript
console.log(getSum(...values)); // 10
```

因为数组的长度已知，所以在使用扩展运算符传参的时候，并不妨碍在其前面或后面再传其他的值，包括使用扩展操作符传其他参数：

```javascript
console.log(getSum(-1, ...values)); // 9
console.log(getSum(...values. 5)); // 15
console.log(getSum(-1, ...values, 5)); // 14
console.log(getSum(...values, ...[5, 6, 7])); // 28
```

对函数中的 arguments 对象而言，它并不知道扩展操作符的存在，而是按照调用函数时传入的参数接收每一个值：

```javascript
let values = [1, 2, 3, 4];

function countArguments() {
    console.log(arguments.length);
}

countArguments(-1, ...values); // 5
countArguments(...values, 5); // 5
countArguments(-1, ...values, 5); // 6
countArguments(...values, ...[5, 6, 7]); // 7
```

arguments 对象只是消费扩展操作符的一种方式。在普通函数和箭头函数中，也可以将扩展操作符用于命名参数，当然同时也可以使用默认参数：

```javascript
function getProduct(a, b, c = 1) {
    return a * b * c;
}

let getSum = (a, b, c = 0) => {
    return a + b + c;
}

console.log(getProduct(...[1, 2])); // 2
console.log(getProduct(...[1, 2, 3])); // 6
console.log(getProduct(...[1, 2, 3, 4])); // 6

console.log(getSum(...[0, 1])); // 1
console.log(getSum(...[0, 1, 2])); // 3
console.log(getSum(...[0, 1, 2, 3])); // 3
```

## 2. 收集参数

在构思函数定义时，可以使用扩展操作符把不同长度的独立参数组合为一个数组。这有点类似 arguments 对象的构造机制，只不过收集参数的结果会得到一个 Array 实例。

```javascript
function getSum(...values) {
    // 顺序累加 values 中的所有值
    // 初始值的总和为 0
    return values.reduce((x, y) => x + y, 0);
}

console.log(getSum(1, 2, 3)); // 6
```

收集参数的前面如果还有命名参数，则只会收集剩余的参数。如果没有则会得到空数组。因为收集参数的结果可变，所以只能把它作为最后一个参数：

```javascript
// 不可以
function getProduct(...values, lastValue) {}

// 可以
function ignoreFirst(firstValue, ...values) {
    console.log(values);
}

ignoreFirst(); // []
ignoreFirst(1); // []
ignoreFirst(1, 2); // [2]
ignoreFirst(1, 2, 3); // [2, 3]
```

箭头函数虽然不支持 arguments 对象，但支持收集参数的定义方式，因此也可以实现与使用 arguments 一样的逻辑：

```javascript
let getSum = (...values) => {
    return values.reduce((x, y) => x + y, 0);
}

console.log(getSum(1, 2, 3)); // 6
```

另外，使用收集参数并不影响 arguments 对象，它仍然反映调用时传给函数的参数：

```javascript
function getSum(...values) {
    console.log(arguments.length); // 3
    console.log(arguments); // [1, 2, 3]
    console.log(values); // [1, 2, 3]
}

console.log(getSum(1, 2, 3));
```

# 7. 函数声明与函数表达式

我们知道，定义函数有两种方式：函数声明和函数表达式。函数声明是这样的：

```javascript
function functionName(arg0, arg1, arg2) {
    // 函数体
}
```

函数声明的关键特点在函数声明提升，即函数声明会在代码执行之前获得定义。这意味着函数声明可以出现在调用它的代码之后：

```javascript
sayHi();
function sayHi() {
    console.log("Hi!");
}
```

这个例子不会抛出错误，因为 JavaScript 引擎会先读取函数声明，然后再执行代码。

第二种创建函数的方式就是函数表达式。函数表达式有几种不同的形式，最常见的是这样的：

```javascript
let functionName = function(arg0, arg1, arg2) {
    // 函数体
};
```

函数表达式看起来就像一个普通的变量定义和赋值，即创建一个函数再把它赋值给一个变量 functionName。这样创建的函数叫做匿名函数（anonymous funciton），因为 function 关键字后面没有标识符。（匿名函数有时候也被称为 lambda 函数。）未赋值给其他变量的匿名函数的 name 属性是空字符串。

函数表达式跟 JavaScript 中的其他表达式一样，需要先赋值再使用。下面的例子会导致错误：

```javascript
sayHi(); // Error! function doesn't exist yet
let sayHi = function() {
    console.log("Hi!");
};
```

理解函数声明与函数表达式之间的区别，关键是理解函数声明提升。比如，以下代码的执行结果可能会出乎意料：

```javascript
// 千万别这样做!
if (condition) {
    function sayHi() {
        console.log('Hi!');
    }
} else {
    function sayHi() {
        console.log('Yo!');
    }
}
```

这段代码看起来很正常，就是如果 condition 为 true，则使用第一个 sayHi() 定义。否则，就使用第二个。事实上，这种写法在 ECMAScript 中不是有效的语法。JavaScript 引擎会尝试将其纠正为适当的声明。问题在于浏览器纠正这个问题的方式并不一致。所以这种写法很危险，不要使用。不过，如果把上面的函数声明换成函数表达式就没问题了：

```javascript
// 没问题
let sayHi;
if (condition) {
    sayHi = function() {
        console.log("Hi!");
    };
} else {
    sayHi = function() {
        console.log("Yo!");
    };
}
```

这个例子可以如预期一样，根据 condition 的值为变量 sayHi 赋予相应的函数。

创建函数并赋值给变量的能力也可以用于在一个函数中把另一个函数当作值返回：

```javascript
function createComparisonFunction(propertyName) {
    return function(object1, object2) {
        let value1 = object[propertyName];
        let value2 = object[propertyName];
        
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    };
}
```

这里的 createComparisonFunction() 函数返回一个匿名函数，这个匿名函数可以被赋值给一个变量，也可以直接调用。但在 createComparsionFunction() 内部，那个函数是匿名的。任何时候，只要函数被当作值来使用，它就是一个函数表达式。本章后面会介绍，这并不是使用函数表达式的唯一方式。

# 8. 函数作为值

因为函数名在 ECMAScript 中就是变量，所以函数可以用在任何可以使用变量的地方。这意味着不仅可以把函数作为参数传给另一个函数，还可以在一个函数中返回另一个函数。来看下面的例子：

```javascript
function callSomeFunction(someFunction, someArgument) {
    return someFunction(someArgument);
}
```

这个函数接收两个参数。第一个参数应该是一个函数，第二个参数应该是要传给这个函数的参数值。任何函数都可以像下面这样作为参数传递：

```javascript
function add10(num) {
    return num + 10;
}

let result1 = callSomeFunction(add10, 10);
console.log(result1); // 20

function getGreeting(name) {
    return "Hello, " + name;
}

let result2 = callSomeFunction(getGreeting, "Alice");
console.log(result2); // "Hello, Alice"
```

callSomeFunction() 函数是通用的，第一个参数传入的是什么函数都可以，而且她始终返回调用作为第一个参数传入的函数的结果。要注意的是，如果是访问函数而不是调用函数，那必须不带括号，所以传给 callSomeFunction() 的必须是 add10 和 getGreeting，而不能是它们的执行结果。

从一个函数中返回另一个函数也是可以的，而且非常有用。假设有一个包含对象的数组，而我们想按照任意对象属性对数组进行排序。为此，可以定义一个 sort() 方法需要的比较函数，它接收两个参数，即要比较的值。但这个比较函数还需要想办法确定根据哪个属性来排序。这个问题可以通过定义一个根据属性名来创建比较函数的函数来解决。比如：

```javascript
function createComparisonFunction(propertyName) {
    return function(object1, object2) {
        let value1 = object1[property];
        let value2 = object2[property];
        
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    };
}
```

这个函数的语法乍一看比较复杂，但实际上就是在一个函数中返回另一个函数，注意那个 return 操作符。内部函数可以访问 propertyName 参数，并通过中括号语法取得比较的对象的相应属性值。取得属性值以后，再按照 sort() 方法的需要返回比较值就行了。这个函数可以像下面这样使用：

```javascript
let data = [
    {
        name: "Bob",
        age: 28
    },
    {
        name: "Alice",
        age: 29
    }
];

data.sort(createComparisonFunction("name"));
console.log(daa[0].name); // Alice

data.sort(createComparisonFunction("age"));
console.log(data[0].name); // Bob
```

在上面代码中，数组 data 中包含两个结构相同的对象。每个对象都有一个 name 属性和一个 age 属性。默认情况下，sort() 方法要对这两个对象执行 toString()，然后再决定它们的顺序，但这样得不到有意义的结果。而通过调用 createComparisonFunction("name") 来创建一个比较函数，就可以根据每个对象 name 属性的值来排序，结果 name 属性值为 "Alice"、age 属性值为 29 的对象会排在前面。而调用 createComparisonFunction("age") 则会创建一个根据每个对象 age 属性的值来排序的比较函数，结果 name 属性值为 "Bob"、age 属性值为 28 的对象会排在前面。

# 9. 函数内部

## arguments.callee

## arguments.caller

## new.target

在 ECMAScript 中，函数内部存在三个特殊的对象：arguments、this 和 new.target。

## 1. arguments

arguments 对象前面讨论过很多次了，它是一个类数组对象，包含调用函数时传入的所有参数。这个对象只有以 function 关键字定义函数（相对于使用箭头语法创建函数）时才会有。虽然主要用于包含函数参数，但 arguments 对象其实还有一个 callee 属性，是一个指向 arguments 对象所在函数的指针。来看下面这个经典的阶乘函数：

```javascript
function factorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}
```

阶乘计算是递归性的，只要给函数一个名称，而且这个名称不会变，这样定义就没有问题。但是，这个函数要正确执行必须保证函数名是 factorial，从而导致了紧密耦合。使用 arguments.callee 可以让函数逻辑与函数名解耦：

```javascript
function factorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * arguments.callee(num - 1);
    }
}
```

这个重写之后的 factorial() 函数已经用 arguments.callee 代替了之前硬编码的 factorial。这意味着无论函数叫什么名称，都可以引用正确的函数。考虑下面的情况：

```javascript
let trueFactorial = factorial;

factorial = function() {
    return 0;
};

console.log(trueFactorial(5)); // 120
console.log(factorial(5)); // 0
```

这里，trueFactorial 变量被赋值为 factorial，实际上把同一个函数的指针又保存到了另一个位置。然后，factorial() 函数又被重写为一个返回 0 的函数。如果像 factorial() 最初的版本那样不使用 arugments.callee，那么像上面这样调用 trueFactorial() 就会返回 0。不过，通过将函数与名称解耦，trueFactorial() 就可以正确计算阶乘，而 factorial() 则只能返回 0。

## 2. this

另一个特殊的对象是 this，它在标准函数和箭头函数中有不同的行为。

在标准函数中，this 引用的是把函数当成方法调用的上下文对象，这时候通常称其为 this 值（在网页的全局上下文中调用函数时，this 指向 window）。来看下面的例子：

```javascript
window.color = 'red';
let o = {
    color: 'blue'
};

function sayColor() {
    console.log(this.color);
}

sayColor(); // 'red'

o.sayColor = sayColor;
o.sayColor(); // 'blue'
```

定义在全局上下文中的函数 sayColor() 引用了 this 对象。这个 this 到底引用哪个对象必须到函数被调用时才能确定。因此这个值在代码执行的过程中可能会变。如果在全局上下文中调用 sayColor()，这结果会输出 "red"，因为 this 指向 window，this.color 相当于 window.color。而在把 sayColor() 赋值给 o 之后再调用 o.sayColor()，this 会指向 o，即 this.color 相当于 o.color，所以会显示 "blue"。

在箭头函数中，this 引用的是定义箭头函数的上下文。下面的例子演示了这一点。在对 sayColor() 的两次调用时，this 引用的都是 window 对象，因为这个箭头函数是在 window 上下文中定义的：

```javascript
window.color = 'red';
let o = {
    color: 'blue'
};

let sayColor = () => console.log(this.color);

sayColor(); // 'red'

o.sayColor = sayColor;
o.sayColor(); // 'red'
```

在事件回调或定时回调中调用某个函数时，this 值指向的并非想要的对象。此时将回调函数写成箭头函数就可以解决问题。这是因为箭头函数中的 this 会引用定义该函数时的上下文：

```javascript
function King() {
    this.royaltyName = 'Henry';
    // this 引用 King 的实例
    setTimeout(() => console.log(this.royaltyName), 1000);
}

function Queen() {
    this.royaltyName = 'Elizabeth';
    
    // this 引用 window 对象
    setTimeout(function() {
        console.log(this.royaltyName);
    }, 1000);
}

new King(); // Henry
new Queen(); // undefined
```

>注意
>
>函数名只是保存指针的变量。因此全局定义的 sayColor() 函数和 o.sayColor() 是同一个函数，只不过执行的上下文不同。

## 3. caller

ECMAScript 也会给函数对象上添加一个属性：caller。这个属性引用的是调用当前函数的函数，或者如果是在全局作用域中调用的则为 null。比如：

```javascript
function outer() {
    inner();
}

function inner() {
    console.log(inner.caller);
}
outer();
```

以上代码会显示 outer() 函数的源代码。这是因为 outer() 调用来了 inner()，inner.caller 指向 outer()。如果要降低耦合度，则可以通过 arguments.callee.caller 来引用同一个值：

```javascript
function outer() {
    inner();
}

function inner() {
    console.log(arguments.callee.caller);
}

outer();
```

在严格模式下访问 arguments.callee 会报错。ECMAScript 5 也定义了 arguments.caller，但在严格模式下访问它会报错，在非严格模式下则始终是 undefined。这是为了分清 arguments.,caller 和函数的 caller 而故意为之的。而作为对这门语言的安全防护，这些改动也让第三方代码无法检测同一上下文中运行的其他代码。

严格模式下还有一个限制，就是不能给函数的 caller 属性赋值，否则会导致错误。

## 4. new.target

函数始终可以作为构造函数实例化一个新对象，也可以作为普通函数被调用。为此，ECMAScript 支持使用 new.target 属性检测函数是否是使用 new 关键字调用的。假设有下面这个简单的函数：

```javascript
function foo() {}
```

如果是函数是使用 foo() 调用的，则 new.target 的值是 undefined。如果是使用 new foo 调用的，则 new.target 将引用被调用的构造函数。

```javascript
function King() {
    if (!new.target) {
        throw 'King must be instantiated using "new"';
    }
    console.log('King instantiated using "new"');
}

new King(); // King instantiated using "new"
King(); // Error: King must be instantiated using "new"
```

# 10. 函数属性与方法

## length

## prototype

## apply()

## call()

## bind()

前面提到过，ECMAScript 中的函数是对象，因此有属性和方法。每个函数都有两个属性：length 和 prototype，其中 length 属性保存函数定义的命名参数的个数，如下例所示：

```javascript
function sayName(name) {
    console.log(name);
}

function sum(num1, num2) {
    return num1 + num2;
}

function sayHi() {
    console.log("hi");
}

console.log(sayName.length); // 1
console.log(sum.length); // 2
console.log(sayHi.length); // 0
```

以上代码定义了 3 个函数，每个函数的命名参数个数都不一样。sayName() 函数有 1 个命名参数，所以其 length 属性为 1。类似地，sum() 函数有两个命名参数，所以其 length 属性是 2。而 sayHi() 没有命名参数，其 length 属性为 0。

prototype 属性也许是 ECMAScript 核心中最有趣的部分。prototype 是保存引用类型所有实例方法的地方，这意味着 toString()、valueOf() 等方法实际上都保存在 prototype 上，进而由所有实例共享。这个属性自定义类型时特别重要。（相关内容已经在第 8 章详细介绍过了。）prototype 属性是不可枚举的，因此使用 for-in 循环不会返回这个属性。

## 1. 使用 apply()、call() 和 bind()

函数还有三个方法：apply()、call() 和 bind()。这些方法会使用不同的策略以指定的 this 值来调用函数，即会设置调用函数时函数体内 this 对象的值。apply() 方法接收两个参数：函数内 this 的值和一个参数数组。第二个参数可以是 Array 的实例，但也可以是 arguments 对象。来看下面的例子：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}

function callSum1(num1, num2) {
    return sum.apply(this, arguments); // 传入 arguments 对象
}

function callSum2(num1, num2) {
    return sum.apply(this, [num1, num2]); // 传入数组
}

console.log(callSum1(10, 10)); // 20
console.log(callSum2(10, 10)); // 20
```

在这个例子中，callSum1() 会调用 sum() 函数，将 this 作为函数体内的 this 值（这里等于 window，因为是在全局作用域中调用的）传入，同时还传入了 arguments 对象。callSum2() 也会调用 sum() 函数，但会传入参数的数组。这两个函数都会执行并返回正确的结果。

>注意
>
>在严格模式下，调用函数时如果没有指定上下文对象，则 this 值不会指向 window。除非使用 apply() 或 call() 把函数指定给一个对象，否则 this 的值会变成 undefined。

call() 方法与 apply() 的作用一样，只是传参的形式不同。第一个参数跟 apply() 一样，也是 this 值，而剩下的要传给被调用函数的参数则是逐个传递的。换句话说，通过 call() 向函数传参时，必须将参数一个一个地列出来，比如：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}

function callSum(num1, num2) {
    return sum.call(this, num1, num2);
}

console.log(callSum(10, 10)); // 20
```

这里的 callSum() 函数必须逐个地把参数传给 call() 方法。结果跟 apply() 的例子一样。到底是使用 apply() 还是 call()，完全取决于怎么给要调用的函数传参更方便。如果想直接传 arguments 对象或者一个数组，那就用 apply()。否则，就用 call()。当然，如果不用给被调用的函数传参免责使用哪个方法都一样。

apply() 和 call() 真正强大的地方并不是给函数传参，而是控制函数调用上下文即函数体内 this 值的能力。考虑下面的例子：

```javascript
window.coloe = 'red';
let o = {
    color: 'blue'
};

function sayColor() {
    console.log(this.color);
}

sayColor(); // red

sayColor.call(this); // red
sayColor.call(window); // red
sayColor.call(o); // blue
```

这个例子是在之前那个关于 this 对象的例子基础上修改而成的。同样，sayColor() 是一个全局函数，如果在全局作用域中调用它，那么会显示 "red"。这是因为 this.color 会求值为 window.color。如果在全局作用域中显式调用 sayColor.call(this) 或者 sayColor.call(window)，则同样都会显示 "red"。而在使用 sayColor.call(o) 把函数的执行上下文即 this 切换为对象 o 之后，结果就变成显示 "blue" 了。

使用 call() 和 apply() 的好处是可以将任意对象设置为任意函数的作用域，这样对象可以不用关心方法。在前面例子最初的版本中，为切换上下文需要先把 sayColor() 直接赋值为 o 的属性，然后再调用。而在这个修改后的版本中，就不需要这一步操作了。

bind() 方法会创建一个新的函数实例，其 this 值会被绑定到传给 bind() 的对象。比如：

```javascript
window.color = 'red';
var o = {
    color: 'blue'
};

function sayColor() {
    console.log(this.color);
}
let objectSayColor = sayColor.bind(o);
objectSayColor(); // blue
```

这里，在 sayColor() 上调用 bind() 并传入对象 o 创建了一个新函数 objectSayColor()。objectSayColor() 中的 this 值被设置为 o，因此直接调用这个函数，即使是在全局作用域中调用，也会返回字符串 "blue"。

>注意
>
>对 ECMAScript 后来增补的特性，比如箭头函数和新的 Array 方法而言，apply()、call() 和 bind() 的实用性已经很小了。虽然某些情况下还是有用，但它们在现代 JavaScript 代码库中出现的机会总体上会明显减少。

## 2. 序列化函数

### toLocaleString()

### toString()

### valueOf()

对函数而言，继承的方法 toLocaleString() 和 toString() 始终按照 ECMAScript 的定义返回函数的代码。原生函数只返回占位符。下面的例子展示了区别：

```javascript
function foo(value = "foo") { return value; }
console.log(foo.toString());
// function foo(value = "foo") { return value; }

const bar = (value = "bar") => value;
console.log(bar.toString());
// (value = "bar") => value

console.log(alert);
// function alert() { [native code] }
```

返回代码的具体格式因浏览器而异。有的返回源代码，包含注释，而有的只返回代码的内部形式，会删除注释，甚至代码可能被解释器修改过。由于这些差异，因此不能在重要功能中依赖这些方法返回的值，而只应在调试中使用它们。继承的方法 valueOf() 返回函数本身。

# 11. 递归

递归函数通常的形式是一个函数通过名称调用自己，如下面的例子所示：

```javascript
function factorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}
```

这是经典的递归阶乘函数。虽然这样写是可以的，但如果把这个函数赋值给其他变量，就会出问题：

```javascript
let anotherFactorial = factorial;
factorial = null;
console.log(anotherFactorial(4)); // 报错
```

这里把 factorial() 函数保存在了另一个变量 anotherFactorial 中，然后将 factorial 设置为 null，于是只保留了一个对原始函数的引用。而在调用 anotherFactorial() 时，要递归调用 factorial()，但因为它已经不是函数了，所以会出错。在写递归函数时使用 arguments.callee 可以避免这个问题。

arguments.callee 就是一个指向正在执行的函数的指针，因此可以在函数内部递归调用，如下所示：

```javascript
function factlorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * arguments.callee(num - 1);
    }
}
```

像这里加粗的这一行一样，把函数名称替换成 arguments.callee，可以确保无论通过什么变量调用这个函数都不会出问题。因此在编写递归函数时，arguments.callee 是引用当前函数的首选。

不过，在严格模式下运行的代码是不能访问 arguments.callee 的，因为访问会出错。此时，可以使用命名函数表达式（named function expression）达到目的。比如：

```javascript
const factprial = (function f(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * f(num - 1);
    }
});
```

这里创建了一个命名函数表达式 f()，然后将它赋值给了变量 factorial。即使把函数赋值给另一个变量，函数表达式的名称 f 也不变，因此递归调用不会有问题。这个模式在严格模式和非严格模式下都可以使用。

# 12. 尾调用优化

JavaScript 引擎会在满足条件时重用栈帧以优化内存管理。具体来说，这项优化非常适合尾调用，即外部函数的返回值是一个内部函数的返回值。比如：

```javascript
function outerFunction() {
    return innerFunction(); // 尾调用
}
```

在没有优化的情况下，执行这个例子会在内存中发生如下操作。

1. 执行到 outerFuncton 函数体，第一个栈帧被推到栈上。
2. 执行 outerFunction 函数体，到达 return 语句。计算返回值必须先计算 innerFunction。
3. 执行到 innerFunction 函数体，第二个栈帧被推到栈上。
4. 执行 innerFunction 函数体，计算其返回值。
5. 将返回值传回 outerFunction，然后 outerFunction 再返回值。

6. 将栈帧弹出栈外。

在尾调用优化之后，执行这个例子会在内存中发生如下操作。

1. 执行到 outerFunction 函数体，第一个栈帧被推到栈上。
2. 执行 outerFunction 函数体，到达 return 语句。为求值返回语句，必须先求值 innerFunction。
3. 引擎发现把第一个栈帧弹出栈外也没问题，因为 innerFunction 的返回值也是 outerFunction 的返回值。
4. 弹出 outerFunction 的栈帧。
5. 执行到 innerFunction 函数体，栈帧被推到栈上。
6. 执行 innerFunction 函数体，计算其返回值。
7. 将 innerFunction 的栈帧弹出栈外。

很明显，第一种情况下每多调用一次嵌套函数，就会多增加一个栈帧。而第二种情况下无论调用多少次嵌套函数，都只有一个栈帧。这就是 ES6 尾调用优化的关键：如果函数的逻辑允许基于尾调用将其销毁，则引擎就会那么做。

>注意
>
>没有办法检测尾调用优化是否生效。不过，现代浏览器都能保证在代码满足条件的情况下应用这一优化。

## 1. 尾调用优化的条件

尾调用优化的条件就是确定外部栈帧真的没有必要存在了。涉及的条件如下：

* 代码在严格模式下执行
* 外部函数的返回值是对尾调用函数的调用
* 尾调用函数返回后不需要执行额外的逻辑。
* 尾调用函数不是引用外部函数作用域中自由变量的闭包。

下面展示了几个违反上述条件的函数，因此都不符合尾调用优化的要求：

```javascript
"use strict"

// 无优化：尾调用没有返回
function outerFunction() {
    innerFunction();
}

// 无优化：尾调用没有直接返回
function outerFunction() {
    let innerFunctionResult = innerFunction();
    return innerFunctionResult;
}

// 无优化：尾调用返回后必须转型为字符串
function outerFunction() {
    return innerFunction().toString();
}

// 无优化：尾调用是一个闭包
function outerFunction() {
    let foo = 'bar';
    function innerFunction() { return foo; }
    
    return innerFunction();
}
```

下面是几个符合尾调用优化条件的例子：

```javascript
"use strict"

// 有优化：栈帧销毁前执行参数计算
function outerFunction(a, b) {
    return innerFunction(a + b);
}

// 有优化”初始返回值不涉及栈帧
function outerFunction(a, b) {
    if (a < b) {
        return a;
    }
    return innerFunction(a + b);
}

// 有优化：两个内部函数都在尾部
function outerFunction(condition) {
    return condition ? innerFunctionA() : innerFunctionB();
}
```

差异化尾调用和递归调用是容易让人混淆的地方。无论递归尾调用还是非递归尾调用，都可以应用优化。引擎并不区分尾调用中调用的是函数自身还是其他函数。不过，这个优化在递归场景下的效果是最明显的，因为递归代码最容易在栈内存中迅速产生大量栈帧。

>注意
>
>之所以要求严格模式，主要因为在非严格模式下函数调用中允许使用 f.arguments 和 f.caller，而它们都会引用外部函数的栈帧。显然，这意味着不能应用优化了。因此尾调用优化要求必须在严格模式下有效，以防止引用这些属性。

## 2. 尾调用优化的代码

可以通过把简单的递归函数转换为待优化的代码来加深对尾调用优化的理解。下面是一个通过递归计算斐波那契数列的函数：

```javascript
function fib(n) {
    if (n < 2) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

console.log(fib(0)); // 0
console.log(fib(1)); // 1
console.log(fib(2)); // 1
console.log(fib(3)); // 2
console.log(fib(4)); // 3
console.log(fib(5)); // 5
console.log(fib(6)); // 8
```

显然这个函数不符合尾调用优化的条件，因为返回语句中有一个相加的操作。结果，fib(n) 的栈帧数的内存复杂度是 O(2ⁿ)。因此，即使这么简单的调用也可以给浏览器带来麻烦：

```javascript
fib(1000);
```

当然，解决这个问题也有不同的策略，比如把递归改写成迭代循环形式。不过，也可以保持递归实现，但将其重构为满足优化条件的形式。为此可以使用两个嵌套的函数，外部函数作为基础框架，内部函数执行递归：

```javascript
"use strict"

// 基础框架
function fib(n) {
    return fibImp(0, 1, n);
}

// 执行递归
function fibImpl(a, b, n) {
    if (n === 0) {
        return a;
    }
    return fibImpl(b, a + b, n - 1);
}
```

这样重构之后，就可以满足尾调用优化的所有条件，再调用 fib(1000) 就不会对浏览器造成威胁了。

# 13. 闭包

匿名函数经常被人误认为是闭包（closure）。闭包指的是那些引用了另一个函数作用域中变量的函数，通常是再嵌套函数中实现的。比如，下面是之前展示的 createComparisonFunction() 函数，注意其中加粗的代码：

```javascript
function createComparisonFunction(propertyName) {
    return function(object1, object2) {
        let value1 = object1[propertyName];
        let value2 = object2[propertyName];
        
        if (value1 < value2) {
            return -1;
        } else if (value1 > value2) {
            return 1;
        } else {
            return 0;
        }
    };
}
```

这里加粗的代码位于内部函数（匿名函数）中，其中引用了外部函数的变量 propertyName。在这个内部函数被返回并在其他地方被使用后，它仍然引用着那个变量。这是因为内部函数的作用域链包含 createComparisonFunction() 函数的作用域。要理解为什么会这样，可以想一想第一次调用这个函数时会发生什么。

本书在第 4 章介绍过作用域链的概念，理解作用域链创建和使用的细节对理解闭包非常重要。在调用其他命名参数来初始化这个函数的活动对象。外部函数的活动对象是内部函数作用域链上的第二个对象。这个作用域链一直向外串起了所有包含函数的活动对象，直到全局执行上下文才终止。

在函数执行时，要从作用域中查找变量，以便读、写值。来看下面的代码：

```javascript
function compare(value1, value2) {
    if (value1 < value2) {
        return -1;
    } else if (value1 > value2) {
        return 2;
    } else {
        return 0;
    }
}

let result = compare(5, 10);
```

这里定义的 compare() 函数是在全局上下文调用的。第一次调用 compare() 时，会为它创建一个包含 arguments、value1 和 value2 的活动对象，这个对象是其作用域链上的第一个对象。而全局上下文的变量对象则是 compare() 作用域链上的第二个对象，其中包含 this、result 和 compare。下图展示了以上关系。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC10%E7%AB%A0%EF%BC%9A%E5%87%BD%E6%95%B0/%E4%B8%80%E4%B8%AA%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87%E7%9A%84%E4%BD%9C%E7%94%A8%E5%9F%9F%E9%93%BE.png)

函数执行时，每个执行上下文中都会有一个包含其中变量的对象。全局上下文中的叫变量对象，它会在代码执行期间始终存在。而函数局部上下文中的叫活动对象，只在函数执行期间存在。在定义 compare() 函数时，就会为它创建作用域链，预装载全局变量对象，并保存在内部的 [[Scope]] 中。在调用这个函数时，会创建相应的执行上下文，然后通过复制函数的 [[Scope]] 来创建其作用域链。接着会创建函数的活动对象（用作变量对象）并将其推入作用域链的前端。在这个例子中，这意味着 compare() 函数执行上下文的作用域链中有两个变量对象：局部变量对象和全局变量对象。作用域链其实是一个包含指针的列表，每个指针分别指向一个变量对象，物理商并不会包含相应的对象。

函数内部的代码在访问变量时，就会使用给定的名称从作用域链中查找变量。函数执行完毕后，局部活动对象会被销毁，内存中就只剩下全局作用域。不过，闭包就不一样了。

在一个函数内部定义的函数会把其包含函数的活动对象添加到自己的作用域链中。因此，在 createComparsionFunction() 函数中，匿名函数的作用域链中实际上包含 createComparisonFunction() 的活动对象。下图展示了以下代码执行后的结果。

```javascript
let compare = createComparisonFunction('name');
let result = compare({ name: 'Alice' }, { name: 'Matt' });
```

在 createComparisonFunction() 返回匿名函数后，它的作用域链被初始化为包含 createComparisonFunction() 的活动对象和全局变量对象。这样，匿名函数就可以访问到 createComparisonFunction(0 可以访问的所有变量。另一个有意思的副作用就是，createComparisonFunction() 的活动对象并不能在它执行完毕后销毁，因为匿名函数的作用域链会销毁，但它的活动对象仍然会保留在内存中，直到匿名函数被销毁后才会被销毁：

```javascript
// 创建比较函数
let compareNames = createComparisonFunction('name');

// 调用函数
let result = compareNames({ name: 'Alice' }, { name: 'Matt' });

// 解除对函数的引用，这样就可以释放内存了
compareNames = null;
```

这里，创建的比较函数被保存在变量 compareNames 中。把 compareNames 设置为等于 null 会解除对函数的引用，从而让垃圾回收程序可以将内存释放掉。作用域链也会被销毁，其他作用域（除全局作用域之外）也可以销毁。下图展示了调用 compareNames() 之后作用域之间的关系。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC10%E7%AB%A0%EF%BC%9A%E5%87%BD%E6%95%B0/%E9%97%AD%E5%8C%85%E7%9A%84%E4%BD%9C%E7%94%A8%E5%9F%9F%E9%93%BE.png)

>注意
>
>因为闭包会保留它们包含函数的作用域，所以比其他函数更占用内存。过度使用闭包可能导致内存过度占用，因此建议仅在十分必要时使用。V8 等优化的 JavaScript 引擎会努力回收被闭包困住的内存，不过我们还是建议在使用闭包时要谨慎。

## 1. this 对象

在闭包中使用 this 会让代码变复杂。如果内部函数没有使用箭头函数定义，则 this 对象会正在运行时绑定到执行函数的上下文。如果在全局函数中调用，则 this 在非严格模式下等于 window，在严格模式下等于 undefined。如果作为某个对象的方法调用，则 this 等于这个对象。匿名函数在这种情况下不会绑定到某个对象，这就意味着 this 会指向 window，除非在严格模式下 this 是 undefined。不过，由于闭包的写法所致，这个事实有时候没有那么容易看出来。来看下面的例子：

```javascript
window.identity = 'The Window';

let object = {
    identity: 'My Object',
    getIdentityFunc() {
        return function() {
            return this.identity;
        }
    }
};

console.log(object.getIdentityFunc()()); // 'The Window'
```

这里先创建了一个全局变量 identity，之后又创建一个包含 identity 属性的对象。这个对象还包含一个 getIdentityFunc() 方法，返回一个匿名函数。这个匿名函数返回 this.identity。因为 getIdentityFunc() 返回函数，所以 object.getIdentifyFunc()() 会立即调用这个返回的函数，从而得到一个字符串。可是，此时返回的字符串是 "The Window"，即全局变量 identity 的值。为什么匿名函数没有使用其包含作用域（getIdentityFunc()）的 this 对象呢？

前面介绍过，每个函数在被调用时都会自动创建两个特殊变量：this 和 arguments。内部函数永远不可能直接访问外部函数的这两个变量。但是，如果把 this 保存到闭包可以访问的另一个变量中，则是行得通的。比如：

```javascript
window.identity = 'The Window';

let object = {
    identity: 'My Object',
    getIdentityFunc() {
        let that = this;
        return function() {
            return that.identity;
        }
    }
};

console.log(object.getIdentityFunc()()); // 'My Object'
```

这里加粗的代码展示了与前面那个例子的区别。在定义匿名函数之前，先把外部函数的 this 保存到变量 that 中。然后在定义闭包时，就可以让它访问 that，因为这是包含函数中没有任何名称冲突的一个变量。即使在外部函数返回之后，that 仍然指向 object，所以调用 object.getIdentityFunc()() 就会返回 "My Object"。

>注意
>
>this 和 arguments 都是不能直接在内部函数中访问的。如果想访问包含作用域中的 arguments 对象，则同样需要将其引用先保存到闭包能访问的另一个变量中。

在一些特殊情况下，this 值可能并不是我们所期待的值。比如下面这个修改后的例子：

```javascript
window.identity = 'The Window';
let object = {
    identity: 'My Object',
    getIdentity() {
        return this.identity;
    }
};
```

getIdentity() 方法就是返回 this.identity 的值。以下是几种调用 object.getIdentity() 的方式及返回值：

```javascript
object.getIdentity(); // 'My Object'
(object.getIdentity)(); // 'My Object'
(object.getIdentity = object.getIdentity)(); // 'The Window'
```

第一行调用 object.getIdentity() 是正常调用，会返回 "My Object"，因为 this.identity 就是 object.identity，第二行在调用时把 object.getIdentity 放在了括号里。虽然加了括号之后看起来是对一个函数的引用，但 this 值并没有变。这是因为按照规范，object.getIdentity 和（object.getIdentity）是相等的。第三行执行了一次赋值，然后再调用赋值后的结果。因为赋值表达式的值是函数本身，this 值不再与任何对象绑定，所以返回的是 "The Window"。

一般情况下，不大可能像第二行和第三行这样调用对象上的方法。但通过这个例子我们可以知道，即使语法稍有不同，也可能影响 this 的值。

## 2. 内存泄露

在使用不当的情况下，闭包会导致内存泄漏。如果程序持续分配内存但又不释放内存，就会发生内存泄漏。内存泄漏会导致程序运行变慢，甚至崩溃。函数闭包之所以会导致内存泄漏，是因为闭包允许变量超出它们预期的生命周期而存在。下面看一个函数闭包导致内存泄漏的例子：

```javascript
function createArrayAppender() {
    const arr = [];
    return function appendTo(num) {
        arr.push(num);
    };
}

const appendToLargetArray = createArrayAppender();
for (let i = 0; i < 1e8; i++) {
    appendToLargeArray(i);
}
```

在这个例子中，createArrayAppender 函数返回一个闭包，闭包引用了父作用域中的变量 arr。每次调用 appendTo 函数，都会向数组中推入一个数值。

这段代码的问题在于变量 arr 永远不会从内存中释放，即使闭包外面不再需要它。由于闭包维持着对这个数组的引用，即使在 createArrayAppender 函数执行之后，数组也不会被当作垃圾回收。于是，当我们在循环中调用 appendToLargeArray 时，就会不断向同一个数组中推入数值，导致数组在内存中越来越大。经测试，单单是在网页中运行这段代码，内存占用就达到令人瞠目的 1087 MB。

要解决这个问题，可以重构上面的代码，允许垃圾回收程序在代码执行完成后释放数组占用的内存。

```javascript
function appendToArray(arr, num) {
    arr.push(num);
}

const largeArray = [];
for (let i = 0; i < 1e8; i++) {
    appendToArray(largeArray, i);
}
```

# 14. 立即调用的函数表达式

立即调用的匿名函数又被称作立即调用的函数表达式（IIFE，Immediately Invoked Function Expression），有时候也被称为自执行匿名函数。它类似于函数声明，但由于被包含在括号中，所以会被解释为函数表达式。紧跟在第一组括号后面的第二组括号会立即调用前面的函数表达式。下面是一个简单的例子：

```javascript
(function() {
    // 块的代码
})();
```

如果你在写一个库或插件，那可能想把自己的代码封装起来，避免与同一页面加载的其他库发生冲突。此时，IIFE 就可以用来为你的代码创建一个私有作用域，避免命名冲突。

```javascript
(function($) {
    // 使用 jQuery 的代码
})(jQuery)
```

这里，我们将 jQuery 作为参数传入，然后在函数内部通过 $ 引用它。这样就可以保证始终引用正确的 jQuery 版本，即使另外一个库也定义了自己的 $ 变量，也不会影响这个函数内部。

另一个使用异步 IIFE 的场景是执行某些异步准备逻辑。比如，在应用开始渲染前，先从某个 API 获取一些数据并将其保存在局部变量中。再比如，我们想再一个非异步函数内部使用 async/await 语法。此时异步 IIFE 就能让我们在局部作用域中立即执行异步逻辑，比如：

```javascript
(async function() {
    const data = await fetch('/api/data');
    const result = await data.json();
    // 对 result 执行某些操作
})();
```



























































