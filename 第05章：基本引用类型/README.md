# 1. Date

ECMAScript  的 Date 类型参考了 Java 早期版本中的 java.util.Date。为此，Date 类型将日期保存为自协调世界时（UTC，Universal Time Coordinated）时间 1970 年 1 月 1 日午夜（零时）至今所经过的毫秒数。使用这种存储格式，Date 类型可以精确表示 1970 年 1 月 1 日之前及之后 285616 年的日期。

要创建日期对象，就使用 new 操作符来调用 Date 构造函数：

```javascript
let now = new Date();
```

在不给 Date 构造函数传参数的情况下，创建的对象将保存当前日期和时间。要基于其他日期和时间创建日期对象，必须传入其毫秒表示（Unix 纪元 1970 年 1 月 1 日午夜之后的毫秒数）。ECMAScript 为此提供了两个辅助方法：Date.parse() 和 Date.UTC()。

**Date.parse()**

- 功能 ：解析日期字符串并返回自1970年1月1日00:00:00 UTC以来的毫秒数
- 参数 ：接受一个日期字符串
- 时区处理 ：会根据字符串中的时区信息或本地时区来解析
- 返回值 ：时间戳（毫秒）或NaN（如果无法解析）

```javascript
// 示例
Date.parse('2023-12-25T10:30:00Z')     // UTC时间
Date.parse('2023-12-25T10:30:00')      // 本地时间
Date.parse('December 25, 2023')        // 本地时间
```

<br>

**Date.UTC()**

- 功能 ：根据UTC时间创建时间戳
- 参数 ：接受年、月、日、时、分、秒、毫秒等数值参数
- 时区处理 ：始终按UTC时间计算，不受本地时区影响
- 返回值 ：UTC时间戳（毫秒）

```javascript
// 示例
Date.UTC(2023, 11, 25, 10, 30, 0)  // 2023年12月25日10:30:00 UTC
// 注意：月份从0开始，11表示12月
```

<br>

**Date.now()**

返回表示方法执行时日期和时间的毫秒数，这个方法可以方便地用在代码分析中：

```javascript
// 起始时间
let start = Date.now();

// 调用函数
doSomething();

// 结束时间
let stop = Date.now();
result = stop - start;
```

<br>

## 1. 继承的方法

与其他类型一样，Date 类型重写了 toLocalString()、toString() 和 valueOf() 方法。但与其他类型不同，重写后这些方法的返回值不一样。Date 类型的 toLocaleString() 方法返回与浏览器运行的本地环境一致的日期和时间。这通常意味着格式中包含针对时间的 AM（上午）或 PM（下午），但不包含时区信息（具体格式可能因浏览器而不同）。toString() 方法通常返回带时区信息的日期和时间，而时间也是以 24 小时制（0~23）表示的。下面给出了 toLocalString() 和 toString() 返回的 2019 年 2 月 1 日零点的示例（地区为 "en-US" 的 PST，即 Pacific Standard Time，太平洋标准时间）：

```javascript
toLocalString() = 2/1/2019 12:00:00 AM

toString() - Thu Feb 1 2019 00:00:00 GMT-0800（Pacific Standard Time）
```

现代浏览器在这两个方法的输出上已经趋于一致。在比较老的浏览器上，每个方法被重写返回的是日期的毫秒表示。因此，操作符（如小于号和大于号）可以直接使用它返回的值。比如下面的例子：

```javascript
0let date1 = new Date(2019, 0, 1); // 2019 年 1 月 1 日
let date2 = new Date(2019, 1, 1); // 2019 年 2 月 1 日

console.log(date1 < date2); // true
console.log(date1 > date2); // false
```

日期 2019 年 1 月 1 日在 2019 年 2 月 1 日之前，所以说前者小于后者没问题。因为 2019 年 1 月 1 日的毫秒表示小于 2019 年 2 月 1 日的毫秒表示，所以用小于号比较这两个日期时会返回 true。这也是确保日期先后的一个简单方式。

<br>

## 2. RegExp



## 3. 原始值包装类型

为了方便操作原始值，ECMAScript 提供了 3 种特殊的引用类型：Boolean、Number 和 String。这些类型具有本章介绍的其他引用类型一样的特点，但也具有与各自原始类型对应的特殊行为。每当用到某个原始值的方法或属性时，后台都会创建一个相应原始包装类型的对象，从而暴露出操作原始值的各种方法。来看下面的例子：

```javascript
let s1 = "some text";
let s2 = s1.substring(2);
```

在这里，s1 是一个包含字符串的变量，它是一个原始值。第二行紧接着在 s1 上调用了 substring() 方法，并把结果保存在 s2 中。我们知道，原始值本身不是对象，因此逻辑上不应该有方法。而实际上这个例子又确实按照预期运行了。这是因为后台进行了很多处理，从而实现了上述操作。具体来说，当第二行访问 s1 时，是以读模式访问的，也就是要从内存中读取变量保存的值。在以读模式访问字符串值的任何时候，后台都会执行以下 3 步：

1. 创建一个 String 类型的实例
2. 调用实例上的特定方法
3. 销毁实例

可以把这 3 步想象成执行了如下 3 行 ECMAScript 代码：

```javascript
let s1 = new String("some text");
let s2 = s1.substring(2);
s1 = null;
```

这种行为可以让原始值拥有对象的行为。对布尔值和数值而言，以上 3 步也会在后台发生，只不过使用的是 Boolean 和 Number 包装类型而已。

引用类型与原始值包装类型的主要区别在于对象的生命周期。在通过 new 实例化引用类型后，得到的实例会在离开作用域时被销毁，而自动创建的原始值包装对象则只存在于访问它的那行代码执行期间。这意味着不能在运行时给原始值添加属性和方法。比如下面的例子：

```javascript
let s1 = "some text";
s1.color = "red";
console.log(s1.color); // undefined
```

这里的第二行代码尝试给字符串 s1 添加了一个 color 属性。可是，第三行代码访问 color 属性时，它却不见了。原因就是第二行代码运行时会临时创建一个 String 对象，而当第三行代码执行时，这个对象已经被销毁了。实际上，第三行代码在这里创建了自己的 String 对象，但这个对象没有 color 属性。

可以显式地使用 Boolean、Number 和 String 构造函数创建原始值包装对象。不过应该在确实必要时再这么做，否则容易让开发者疑惑，分不清它们到底是原始值还是引用值。在原始值包装类型的实例上调用 typeof 会返回 "object"，所有原始值包装对象都会转换为布尔值 true。

另外，Object 构造函数作为一个工厂方法，能够根据传入值的类型返回相应原始值包装类型的实例。比如：

```javascript
let obj = new Object("sone text");
console.log(obj instanceof String); // true
```

如果传给 Object 的是字符串，则会创建一个 String 的实例。如果是数值，则会创建 Number 的实例。布尔值则会得到 Boolean 的实例。

注意，使用 new 调用原始值包装类型的构造函数，与调用同名的转型函数并不一样。例如：

```javascript
let value = "25"; // 转型函数
let number = Number(value); // "number"
let obj = new Number(value); // 构造函数
console.log(typeof obj); // "object"
```

在这个例子中，变量 number 中保存的是一个值为 25 的原始数值，而变量 obj 中保存的是一个 Number 的实例。

虽然不推荐显式创建原始值包装类型的实例，但它们对于操作原始值的功能是很重要的，每个原始值包装类型都有相应的一套方法来方便数据操作。

<br>

### 1. Boolean

Boolean 是对应布尔值的引用类型。要创建一个 Boolean 对象，就使用 Boolean 构造函数并传入 true 或 false，如下例所示：

```javascript
let booleanObject = new Boolean(true);
```

Boolean 的实例会重写 valueOf() 方法，返回一个原始值 true 或 false。toString() 方法被调用时也会被覆盖，返回字符串 "true" 或 "false"。不过，Boolean 对象在 ECMAScript 中用得很少。不仅如此，它们还容易引起误会，尤其是布尔表达式中使用 Boolean 对象时，比如：

```javascript
let falseObject = new Boolean(false);
let result = falseObject && true;
console.log(result); // true

let falseValue = false;
result = falseValue && true;
console.log(result); // false
```

在这段代码中，我们创建一个值为 false 的 Boolean 对象。然后，在一个布尔表达式中通过 && 操作符将这个对象与一个原始值 true 组合起来。在布尔算术中，false && true 等于 false。可是，这个表达式是对 falseObject 对象而不是对它表示的值（false）求值。前面刚刚说过，所有对象在布尔表达式中都会自动转换为 true，因此 falseObject 在这个表达式里实际上表示一个 true 值。那么 true && true 当然是 true。

除此之外，原始值和引用值（Boolean 对象）还有几个区别。首先，typeof 操作符对原始值返回 "boolean"，但对引用值返回 "object"。同样，Boolean 对象是 Boolean 类型的实例，在使用 instaneof 操作符时返回 true，但对原始值则返回 false，如下所示：

```javascript
console.log(typeof falseObject); // object
console.log(typeof falseValue); // boolean
console.log(falseObject instanceof Boolean); // true
console.log(falseValue instanceof Boolean); // false
```

理解原始布尔值和 Boolean 对象之间的区别非常重要，强烈建议永远不要使用后者。

<br>

### 2. Number

Number 是对应数值的引用类型。要创建一个 Number 对象，就使用 Number 构造函数并传入一个数值，如下例所示：

```javascript
let numberObject = new Number(10);
```

与 Boolean 类型一样，Number 类型重写了 valueOf()、toLocaleString() 和 toString() 方法。valueOf() 方法返回 Number 对象表示的原始数值，另外两个方法返回数值字符串。toString() 方法可选地接收一个表示基数的参数，并返回相应基数形式的数值字符串，如下所示：

```javascript
let num = 10;
console.log(num.toString()); // "10"
console.log(num.toString(2)); // "1010"
console.log(num.toString(8)); // "12"
console.log(num.toString(10)); // "10"
console.log(num.toString(16)); // "a"
```

除了继承的方法，Number 类型还提供了几个用于将数值格式化为字符串的方法。

toFixed() 方法返回包含指定小数点位数的数值字符串，如：

```javascript
let num = 10;
console.log(num.toFixed(2)); // "10.00"
```

这里的 toFixed() 方法接收了参数 2，表示返回的数值字符串要包含两位小数。结果返回值为 "10.00"，小数位填充了 0。如果数值本身的小数位超过了参数指定的位数，则四舍五入到最接近的小数位：

```javascript
let num = 10.005;
console.log(num.toFixed(2)); // "10.01"
```

toFixed() 自动舍入的特点可以用于处理货币。不过要注意的是，多个浮点数值的数学计算不一定得到精确的结果。比如，0.1 + 0.2 = 0.30000000000000004。

>注意
>
>toFixed() 方法可以表示有 0~20 个小数位的数值。某些浏览器可能支持更大的范围，但这是通常被支持的范围。

另一个用于格式化数值的方法是 toExponential()，返回以科学计数法（也称为指数计数法）表示的数值字符串。与 toFixed() 一样，toExponential() 也接收一个参数，表示结果中小数的位数。来看下面的例子：

```javascript
let num = 10;
console.log(num.toExponential(1)); // "1.0e+1"
```







































