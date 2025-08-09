# 1. Date

ECMAScript  的 Date 类型参考了 Java 早期版本中的 java.util.Date。为此，Date 类型将日期保存为自协调世界时（UTC，Universal Time Coordinated）时间 1970 年 1 月 1 日午夜（零时）至今所经过的毫秒数。使用这种存储格式，Date 类型可以精确表示 1970 年 1 月 1 日之前及之后 285616 年的日期。

要创建日期对象，就使用 new 操作符来调用 Date 构造函数：

```javascript
let now = new Date();
```

在不给 Date 构造函数传参数的情况下，创建的对象将保存当前日期和时间。要基于其他日期和时间创建日期对象，必须传入其毫秒表示（Unix 纪元 1970 年 1 月 1 日午夜之后的毫秒数）。ECMAScript 为此提供了两个辅助方法：Date.parse() 和 Date.UTC()。

## Date.parse()

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

## Date.UTC()

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

## Date.now()

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

# 2. RegExp



# 3. 原始值包装类型

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

## 1. Boolean

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

## 2. Number

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

### **toFixed()**

该方法返回包含指定小数点位数的数值字符串，如：

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

### toExponential()

另一个用于格式化数值的方法是 toExponential()，返回以科学计数法（也称为指数计数法）表示的数值字符串。与 toFixed() 一样，toExponential() 也接收一个参数，表示结果中小数的位数。来看下面的例子：

```javascript
let num = 10;jj
console.log(num.toExponential(1)); // "1.0e+1"
```

这段代码的输出为 "1.0e+1"。一般来说，这么小的数不用表示为科学记数法形式。如果想得到数值最适当的形式，那么可以使用 toPrecision()。

### toPrecision() 

toPrecision() 方法会根据情况返回最合理的输出结果，可能是固定长度，也可能是科学记数法形式。这个方法接收一个参数，表示结果中数字的总位数（不包含指数）。来看几个例子：

```javascript
let num = 99;
console.log(num.toPrecision(1)); // "1e+2"
console.log(num.toPrecision(2)); // "99"
console.log(num.toPrecision(3)); // "99.0"
```

在这个例子中，首先要用 1 位数字表示数值 99，得到 "1e+2"，也就是 100。因为 99 不能只用 1 位数字来精确表示，所以这个方法就将它舍入为 100，这样就可以只用 1 位数字（及其科学记数法形式）来表示了。用 2 位数字表示 99 得到 "99"，用 3 位数字则是 "99.0"。本质上，toPrecision() 方法会根据数值和精度来决定调用 toFixed() 还是 toExponential()。为了以正确的小数位精确表示数值，这 3 个方法都会向上或向下舍入。

>注意
>
>toPrecision() 方法可以表示带 1~21 个小数位的数值。某些浏览器可能支持更大的范围，但这是通常被支持的范围。

与 Boolean 对象类似，Number 对象也为数值提供了重要能力。但是，考虑到两者在同样的潜在问题，因此并不建议直接实例化 Number 对象。在处理原始数值和引用数值时，typeof 和 instanceof 操作符会返回不同的结果，如下所示：

```javascript
let numberObject = new Number(10);
let numberValue = 10;
console.log(typeof numberObject); // "object"
console.log(typeof numberValue); // "number"
console.log(numberObject instanceof Number); // true
console.log(numberValue instanceof Number); // false
```

原始数值在调用 typeof 时始终返回 "number"，而 Number 对象返回 "object"。类似地，Number 对象是 Number 类型的实例，而原始数值不是。

<br>

### isInteger() 方法与安全整数

#### Number.isInteger()

Number.isInteger() 方法用于辨别一个数值是否保存为整数。有时候，小数位的 0 可能会让人误以为数值是一个浮点值：

```javascript
console.log(Number.isInteger(1)); // true
console.log(Number.isInteger(1.00)); // true
console.log(Number.isInteger(1.01)); // false
```

#### Number.isSafeInteger()

IEEE 754 数值格式有一个特殊的数值范围，在这个范围内二进制值可以表示一个整数值。这个数值范围从 Number.MIN_SAFE_INTEGER（-2^53 + 1）到 Number.MAX_SAFE_INTEGER（2^53 - 1）。对超出这个范围的数值，即使尝试保存为整数，IEEE 754 编码格式也意味着二进制值可能会表示一个完全不同的数值。为了鉴别整数是否在这个范围内，可以使用 .isSafeInteger() 方法：

```javascript
console.log(Number.isSafeInteger(-1 * (2 ** 53))); // false
console.log(Number.isSafeInteger(-1 * (2 ** 53) + 1)); // true

console.log(Number.isSafeInteger(2 ** 53)); // false
console.log(Number.isSafeInteger((2 ** 53) - 1)); // true
```

<br>

## 3. String

String 是对应字符串的引用类型。要创建一个 String 对象，使用 String 构造函数并传入一个数值，如下例所示：

```javascript
let stringObject = new String("hello world");
```

String 对象的方法可以在所有字符串原始值上调用。3 个继承的方法 valueOf()、toLocaleString() 和 toString() 都返回对象的原始字符串值。

每个 String 对象都有一个 length 属性，表示字符串中字符的数量。来看下面的例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.length); // "11"
```

这个例子输出了字符串 "hello world" 中包含的字符数量：11。注意，即使字符串中包含双字节字符（而不是单字节的 ASCII 字符），也仍然会按单字符来计数。

String 类型提供了很多方法来解析和操作字符串。

### 1. JavaScript 字符

#### length

JavaScript 字符串由 16 位码元（code unit）组成。对多数字符串来说，每 16 位码元对应一个字符。换句话说，字符串的 length 属性表示字符串包含多少 16 位码元：

```javascript
let message= "abcde";

console.log(message.length); // 5
```

#### charAt()

此外，charAt() 方法返回给定索引位置的字符，由传给方法的整数参数指定。具体来说，这个方法查找指定索引位置的 16 位码元，并返回该码元对应的字符：

```javascript
let message = "abcde";

console.log(message.charAt(2)); // "c"
```

JavaScript 字符串使用了两种 Unicode 编码混合的策略：UCS-2 和 UTF-16。对于可以采用 16 位编码的字符（U+0000~U+FFFF），这两种编码实际上是一样的。

#### charCodeAt()

使用 charCodeAt() 方法可以查看指定码元的字符编码。这个方法返回指定索引位置的码元值，索引以整数指定。比如：

```javascript
let message = "abcde";

// Unicode "Latin small letter C" 的编码是 U+0063
console.log(message.charCodeAt(2)); // 99

// 十进制 99 等于十六进制 63
console.log(99 == 0x63); // true
```

#### String.fromCharCode()

fromCharCoe() 方法用于根据给定的 UTF-16 码元创建字符串中的字符。这个方法可以接受任意多个数值，并返回将所有数值对应的字符拼接下来的字符串：

```javascript
// Unicode "Latin small letter A"的编码是 U+0061
// Unicode "Latin small letter B"的编码是 U+0062
// Unicode "Latin small letter C"的编码是 U+0063
// Unicode "Latin small letter D"的编码是 U+0064
// Unicode "Latin small letter E"的编码是 U+0065

console.log(String.fromCharCode(0x61, 0x62, 0x63, 0x64, 0x65)); // "abcde"
```

```javascript
// 0x0061 === 97
// 0x0062 === 98
// 0x0063 === 99
// 0x0064 === 100
// 0x0065 === 101

console.log(String.fromCharCode(97, 98, 99, 100, 101)); // "abcde"
```

对于 U+0000~U+FFFF 范围内的字符，length、charAt()、charCodeAt() 和 fromCharCode() 返回的结果都跟预期是一样的。这是因为在这个范围内，每个字符都是用 16 位表示的，而这几个方法也都基于 16 位码元完成操作。只要字符编码大小与码元大小一一对应，这些方法就能如期工作。

这个对应关系在扩展到 Unicode 增补字符平面时就不成立了。问题很简单，即 16 位只能唯一表示 65536 个字符。这对于大多数语言字符集是足够了，在 Unicode 中称为基本多语言平面（BMP）。为了表示更多的字符，Unicode 采用了一个策略，即每个字符使用另外 16 位去选择一个增补平面。这种每个字符使用两个 16 位码元的策略称为代理对。

在涉及增补平面的字符时，前面讨论的字符串方法就会出问题。比如，下面的例子中使用了一个笑脸表情符号，也就是一个使用代理对编码的字符：

```javascript
// "smiling face with smiling eyes" 表情符号的编码是 U+1F60A
// 0x1F60A === 128522
let message = "ab😊de";

console.log(message.length); // 6

console.log(message.charAt(1)); // b
console.log(message.charAt(2)); // <?>
console.log(message.charAt(3)); // <?>
console.log(message.charAt(4)); // d

console.log(message.charCodeAt(1)); // 98
console.log(message.charCodeAt(2)); // 55357
console.log(message.charCodeAt(3)); // 56842
console.log(message.charCodeAt(4)); // 100

console.log(String.fromCodePoint(0xD83D, 0xDE0A)); // 😊

console.log(String.fromCharCode(87, 98, 55357, 56842, 100, 101)); // ab😊de
```

这些方法仍然将 16 位码元当作一个字符，事实上索引 2 和索引 3 对应的码元应该被看成一个代理对，只对应一个字符。fromCharCode() 方法仍然返回正确的结果，因为它实际上是基于提供的二进制表示直接组合成字符串，浏览器可以正确解析代理对（由两个码元构成），并正确地将其识别为一个 Unicode 笑脸字符。

#### codePointAt()

为正确解析既包含单码元字符又包含代理对字符的字符串，可以使用 codePointAt() 来代替 charCodeAt()。跟使用 charCodeAt() 时类似，codePointAt() 接收 16 位码元的索引并返回该索引位置上的码点（code point）。码点是 Unicode 中一个字符的完整标识。比如，"c" 的码点是 0x0063，而 "😊" 的码点是 0x1F60A。码点可能是 16 位，也可能是 32 位，而 codePointAt() 方法可以从指定码元位置识别完整的码点。

```javascript
let message = "ab😊de";

console.log(message.codePointAt(1)); // 98
console.log(message.codePointAt(2)); // 128522
console.log(message.codePointAt(3)); // 56842
console.log(message.codePointAt(4)); // 100
```

注意，如果传入的码元索引并非代理对的开头，就会返回错误的码点。这种错误只有检测单个字符的时候才会出现，可以通过从左到右按正确的码元数遍历字符串来规避。迭代字符串可以智能地识别代码对的码点：

```javascript
console.log([..."ab😊de"]); // ["a", "b", "😊", "d", "e"]
```

#### String.fromCodePoint()

与 charCodeAt() 有对应的 codePointAt() 一样，fromCharCode() 也有一个对应的 fromCodePoint()。这个方法接受任意数量的码点，返回对应字符拼接起来的字符串：

```javascript
console.log(String.fromCharCode(97, 98, 55357, 56842, 100, 101)); // ab😊de
console.log(String.fromCodePoint(87, 98, 128522, 100, 101)); // ab😊de
```

<br>

### 2. normalize() 方法

某些 Unicode 字符可以有多种编码方式。有的字符既可以通过一个 BMP 字符表示，也可以通过一个代理对表示。比如：

```javascript
// U+00C5：上面带圆圈的大写拉丁字符 A
console.log(String.fromCharCode(0x00C5)); // Å

// U+212B：长度单位 "埃"
console.log(String.fromCharCode(0x212B)); // Å

// U+004：大写拉丁字母 A
// U+030A：上面加个圆圈
console.log(String.fromCharCode(0x0041, 0x030A)); // Å
```

比较操作符不在乎字符看起来是什么样的，因此这 3 个字符互不相等。

```javascript
let a1 = String.fromCharCode(0x00C5),
    a2 = String.fromCharCode(0x212B),
    a3 = String.fromCharCode(0x0041, 0x030A);

console.log(a1, a2, a3); // Å, Å, Å

console.log(a1 === a2); // false
console.log(a1 === a3); // false
console.log(a2 === a3); // false
```

`normalize()` 方法支持四种 Unicode 正规化形式，每种形式都有不同的处理方式和用途：

#### 1. NFC 

**规范分解后再规范组合**

- **过程**: 先将字符分解为基本组件，然后重新组合成规范形式
- **结果**: 尽可能使用预组合字符（单个字符）
- **特点**: 这是默认的正规化形式，通常产生最紧凑的表示

```javascript
const str = '\u0065\u0301'; // e + ́ (分解形式)
console.log(str.normalize('NFC')); // é (组合形式)
console.log(str.normalize('NFC').length); // 1
```

#### 2. NFD

**规范分解**

- **过程**: 将预组合字符分解为基本字符和组合标记
- **结果**: 所有字符都以分解形式表示
- **特点**: 便于字符级别的处理和分析

```javascript
const str = '\u00E9'; // é (预组合字符)
console.log(str.normalize('NFD')); // e + ́ (分解形式)
console.log(str.normalize('NFD').length); // 2
```

#### 3. NFKC

**兼容性分解后再规范组合**

- **过程**: 先进行兼容性分解（包括格式字符），然后规范组合
- **结果**: 将格式变体转换为标准形式，如全角字符转半角
- **特点**: 用于文本搜索和比较，会丢失一些格式信息

```javascript
const str = 'ﬁ'; // fi 连字符 (U+FB01)
console.log(str.normalize('NFKC')); // 'fi' (两个普通字符)

const fullWidth = 'Ａ'; // 全角 A (U+FF21)
console.log(fullWidth.normalize('NFKC')); // 'A' (半角 A)
```

#### 4. NFKD

**兼容性分解**

- **过程**: 进行兼容性分解，包括格式字符的分解
- **结果**: 最彻底的分解形式
- **特点**: 用于文本分析，会丢失所有格式信息

```javascript
const str = 'ﬁ'; // fi 连字符
console.log(str.normalize('NFKD')); // 'fi' (分解为基本字符)

const superscript = '²'; // 上标 2 (U+00B2)
console.log(superscript.normalize('NFKD')); // '2' (普通数字 2)
```

#### 实际应用对比

```javascript
// 测试字符串：包含重音字符、连字符、全角字符
const testStr = 'café ﬁle Ａ²';

console.log('原始:', testStr);
console.log('NFC: ', testStr.normalize('NFC'));
console.log('NFD: ', testStr.normalize('NFD'));
console.log('NFKC:', testStr.normalize('NFKC')); // café file A2
console.log('NFKD:', testStr.normalize('NFKD')); // café file A2 (分解形式)
```

#### 选择指南

##### 使用 NFC：
- 需要紧凑的字符串表示
- 进行一般的字符串比较
- 存储或传输文本数据

##### 使用 NFD：
- 需要分析字符的组成部分
- 处理重音字符的基字符
- 进行字符级别的操作

##### 使用 NFKC：
- 进行文本搜索（忽略格式差异）
- 用户输入标准化
- 需要统一全角/半角字符

##### 使用 NFKD：
- 进行最彻底的文本分析
- 需要移除所有格式信息
- 创建搜索索引

#### 注意事项

1. **不可逆性**: NFKC 和 NFKD 会丢失格式信息，转换是不可逆的
2. **性能**: 兼容性分解（NFKC/NFKD）比规范分解（NFC/NFD）更耗时
3. **用途**: 选择合适的正规化形式取决于具体的应用场景

这四种正规化形式为处理不同的 Unicode 文本需求提供了灵活的选择。

<br>

### 3. 字符串操作方法

#### concat()

本节介绍几个操作字符串值的方法。首先是 concat()，用于将一个或多个字符串拼接成一个新字符串。来看下面的例子：

```javascript
let stringValue = "hello ";
let result = stringValue.concat("world");

console.log(result); // "hello world"
console.log(stringValue); // "hello"
```

在这个示例中，对 stringValue 调用 concat() 方法的结果是得到 "hello world"，但 stringValue 的值保持不变。concat() 方法可以接收任意多个参数，因此可以一次性拼接多个字符串，如下所示：

```javascript
let stringValue = "hello ";
let result = stringValue.concat("world", "!");

console.log(result); // "hello world!"
console.log(stringValue); // "hello"
```

这个修改后的例子将字符串 "world" 和 "!" 追加到了 "hello" 后面。虽然 concat() 方法可以拼接字符串，但更常用的方式是使用加号操作符（+）。而且多数情况下，对于拼接多个字符串来说，使用加号更方便。

#### slice()

#### substr()

#### substring()

ECMAScript 提供了 3 个从字符串中提取子字符串的方法：slice()、substr()、和 substring()。这 3 个方法都返回调用它们的字符串的一个子字符串，而且都接收一或两个参数。第一个参数表示子字符串开始的位置，第二个参数表示子字符串结束的位置。对 slice() 和 substring() 而言，第二个参数是提取结束的位置（即该位置之前的字符会被提出出来）。对 substr() 而言，第二个参数表示返回的子字符串长度。任何情况下，省略第二个参数都意味着提取到字符串末尾。与 concat() 方法一样，slice()、substr() 和 substring() 也不会修改调用它们的字符串，而只会返回提取到的原始新字符串值。来看下面的例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.slice(3)); // "lo world"
console.log(stringValue.substring(3)); // "lo world"
console.log(stringValue.substr(3)); // "lo world"
console.log(stringValue.slice(3, 7)); // "lo w"
console.log(stringValue.substring(3, 7)); // "lo w"
console.log(stringValue.substr(3, 7)); // "lo worl"
```

在这个例子中，slice()、substr() 和 substring() 是以相同方式被调用的，而且多数情况下返回的值也相同。如果只传一个参数 3， 则所有方法都将返回 "lo world"，因为 "hello" 中 "l" 位置为 3。如果传入两个参数 3 和 7，则 slice() 和 substring() 返回 "lo w"（因为 "world" 中 "o" 在位置 7，不包含），而 substr() 返回 "lo worl"，因为第二个参数对它而言表示返回的字符数。

当某个参数是负值时，这 3 个方法的行为又有不同。比如，slice() 方法将所有负值参数都当成字符串长度加上负参数值。

而 substr() 方法将第一个负参数值当成字符串长度加上该值，将第二个负参数值转换为 0。substring() 方法会将所有负参数值都转换为 0。看下面的例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.slice(-3)); // "rld"
console.log(stringValue.substring(-3)); // "hello world"
console.log(stringValue.substr(-3)); // "rld"
console.log(stringValue.slice(3, -4)); // "hel"
console.log(stringValue.substring(3, -4)); // "hel"
console.log(stringValue.substr(3, -4)); // ""（empty string）
```

这个例子明确演示了 3 个方法的差异。在给 slice() 和 substr() 传入负参数时，它们的返回结果相同。这是因为 -3 会被转换为 8（长度加上负参数），实际上调用的是 slice(8) 和 substr(8)。而 substring() 方法返回整个字符串，因为 -3 会转换为 0。

在第二个参数是负值时，这 3 个方法各不相同。slice() 方法将第二个参数转换为 7，实际上相当于调用 slice(3, 7)，因此返回 "lo w"，而 substring() 方法会将较小的参数作为起点，将较大的参数作为终点。对 substr() 来说，第二个参数会被转换为 0，意味着返回的字符串包含零个字符，因而会返回一个空字符串。

<br>

### 4. 字符串位置方法

#### indexof

#### lastIndexOf

有两个方法用于在字符串中定位子字符串：indexOf() 和 lastIndexOf()。这两个方法从字符串中搜索传入的字符串，并返回位置（如果没找到，则返回 -1）.两者的区别在于，indexOf() 方法从字符串开头查找子字符串，而 lastIndexOf() 方法从字符串末尾开始查找子字符串。来看下面的例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.indexOf("o")); // 4
console.log(stringValue.lastIndexOf("o")); // 7
```

这里，字符串中第一个 "o" 的位置是 4，即 "hello" 中的 "o"。最后一个 "o" 的位置是 7，即 "world" 中的 "o"。如果字符串中只有一个 "o"，则 indexOf() 和 lastIndexOf() 返回同一个位置。

这两个方法都可以接收可选的第二个参数，表示开始搜索的位置。这意味着，indexOf() 会从这个参数指定的位置开始向字符串末尾搜索，忽略该位置之前的字符。lastIndexOf() 则会从这个参数指定的位置向字符串开头搜索，忽略该位置之后直到字符串末尾的字符。下面看一个例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.indexOf("o", 6)); // 7
console.log(stringValue.indexOf("o", 6)); // 4
```

在传入第二个参数 6 以后，结果跟前面的例子恰好相反。这一次，indexOf() 返回 7，因为它从位置 6（字符 "w"）开始向后搜索字符串，在位置 7 找到了 "o"。而 lastIndexOf() 返回 4，因为它从位置 6 开始反向搜索至字符串开头，因此找到了 "hello" 中的 "o"。像这样使用第二个参数并循环调用 indexOf() 或 lastIndexOf()，就可以在字符串中找到所有的目标子字符串，如下所示：

```javascript
let stringValue = "Lorem ipsum dolor sit amet, consectetur adipisicing elit";
let positions = new Array();
let pos = stringValue.indexOf("e");

while(pos > -1) {
    position.push(pos);
    pos = stringValue.indexOf("e", pos + 1);
}

console.log(positions); // [3, 24, 32, 35, 52]
```

这个例子逐步增大开始搜索的位置，通过 indexOf() 遍历了整个字符串。首先取得第一个 "e" 的位置，然后进入循环，将上一次的位置加 1 再传给 indexOf()，确保搜索到最后一个子字符串实例之后。每个位置都保存在 positions 数组中，可供以后使用。

<br>

### 5. 字符串包含方法

#### startsWith()

#### endsWith()

#### includes()

ECMAScript 包含 3 个用于判断字符串中是否包含另一个字符串的方法：startsWith()、endsWith() 和 includes()。这些方法都会从字符串中搜索传入的字符串，并返回一个表示是否包含的布尔值。它们的区别在于，startsWith() 检查开始于索引 0 的匹配项，endsWith() 检查开始于索引（string.length - substring.length）的匹配项，而 includes() 检查整个字符串：

```javascript
let message = "foobarbaz";

console.log(message.startsWith("foo")); // true
console.log(message.startsWith("bar")); // false

console.log(message.endsWith("baz")); // true
console.log(message.endsWith("bar")); // false

console.log(message.includes("bar")); // true
console.log(message.includes("qux")); // false
```

startsWith() 和 includes() 方法接收可选的第二个参数，表示开始搜索的位置。如果传入第二个参数，则意味着这两个方法会从指定位置向着字符串末尾搜索，忽略该位置之前的所有字符。下面是一个例子：

```javascript
let message = "foobarbaz";

console.log(message.startsWith("foo")); // true
console.log(message.startsWith("foo", 1)); // false

console.log(message.includes("bar")); // true
console.log(message.includes("bar", 4)); // false
```

endsWith() 方法接收可选的第二个参数，表示应该当作字符串末尾的位置。如果不提供这个参数，那么默认就是字符串长度。如果提供这个参数，那么就好像字符串只有这么多字符一样：

```javascript
let message = "foobarbaz";

console.log(message.endsWith("bar")); // false
console.log(message.endsWith("bar", 6)); // true
```

<br>

### 6. trim() 方法

ECMAScript 在所有字符串上都提供了 trim() 方法。这个方法会创建字符串的一个副本，删除前、后所有空格符，再返回结果。比如：

```javascript
let stringValue = "     hello world     ";
let trimmedStringValue = stringValue.trim();
console.log(stringValue); // " hello world "
console.log(trimmedStringValue); // "hello world"
```

由于 trim() 返回的是字符串的副本，因此原始字符串不受影响，即原本的前、后空格符都会保留。

另外，trimLeft() 和 trimRight() 方法分别用于从字符串开始和末尾清理空格符。

trimStart() 和 trimEnd() 用于删除目标位置的空格符。这两个方法是为了代替 trimLeft() 和 trimRight() 才出现的，它们在阿拉伯语和希伯来语等从右向左的语言中有着重要意义。

#### trimLeft()

####  trimRight()

#### trimStart()

#### trimEnd()

这两个方法是以空格为第二个参数的 padStart() 和 padEnd() 方法的反方法。下面的例子先给字符串添加了一些空格，然后又从两边空格删掉：

```javascript
let s = '  foo  ';

console.log(s.trimStart()); // "foo  "
console.log(s.trimEnd()); // "  foo"
```

<br>

### 7. repeat() 方法

ECMAScript 在所有字符串上都提供了 repeat() 方法。这个方法接收一个整数参数，表示要将字符串复制多少次，然后返回拼接所有副本后的结果。

```javascript
let stringValue = "na ";
console.log(stringValue.repeat(16) + "batman");
// na na na na na na na na na na na na na na na na batman
```

<br>

### 8. padStart() 和 padEnd() 方法

padStart() 和 padEnd() 方法会复制字符串，如果小于指定长度，则在相应一边填充字符，直至满足长度条件。这两个方法的第一个参数是长度，第二个参数是可选的填充字符串，默认为空格（U+0020）。

```javascript
let stringValue = "foo";

console.log(stringValue.padStart(6)); // "   foo"
console.log(stringValue.padStart(9, ".")); // "......foo"

console.log(stringValue.padEnd(6)); // "foo   "
console.log(stringValue.padEnd(9, ".")); // "foo......"
```

可选的第二个参数并不限于一个字符。如果提供了多个字符的字符串，则会将其拼接并截断以匹配指定长度。此外，如果长度小于或等于字符串长度，则会返回原始字符串。

```javascript
let stringValue = "foo";

console.log(stringValue.padStart(8, "bar")); // "barbafoo"
console.log(stringValue.padStart(2)); // "foo"

console.log(stringValue.padEnd(8, "bar")); // "foobarba"
console.log(stringValue.padEnd(2)); // "foo"
```

<br>

### 9. 字符串迭代与解构

字符串的原型上暴露了一个 @@iterator 方法，表示可以迭代字符串的每个字符。可以下面这样手动使用迭代器：

```javascript
let message = "abc";
let stringIterator = message[Symbol.iterator]();

console.log(stringIterator.next()); // {value: "a", done: false}
console.log(stringIterator.next()); // {value: "b", done: false}
console.log(stringIterator.next()); // {value: "c", done: false}
console.log(stringIterator.next()); // {value: undefined , done: true}
```

在 for-of 循环中可以通过这个迭代器按序访问每个字符：

```javascript
for (const c of "abcde") {
    console.log(c);
}

// a
// b
// c
// d
// e
```

有了这个迭代器之后，字符串可以通过解构操作来解构了。比如，可以更方便地把字符串分割为字符数组：

```javascript
let message = "abcde";

console.log([...message]); // ["a", "b", "c", "d", "e"]
```

<br>

### 10. 字符串大小写转换

#### toLowerCase()

#### toLocaleLowerCase()

#### toUpperCase()

#### toLocalUpperCase()

下一组方法涉及大小写转换，包括 4 个方法：toLowerCase()、toLocaleLowerCase()、toUpperCase() 和 toLocaleUpperCase()。toLowerCase() 和 toUpperCase() 方法是原来就有的方法，与 java.lang.String 中的方法同名。toLocaleLowerCase() 和 toLocaleUpperCase() 方法旨在基于特定地区实现。在很多地区，地区特定的方法与通用的方法是一样的。但在少数语言中（如土耳其语），Unicode 大小写转换需应用特殊规则，要使用地区特定的方法才能实现正确转换。下面是几个例子：

```javascript
let stringValue = "hello world";
console.log(stringValue.toLocalUpperCase()); // "HELLO WORLD"
console.log(stringValue.toUpperCase()); // "HELLO WORLD"
console.log(stringValue.toLocaleLowerCase()); // "hello world"
console.log(stringValue.toLowerCase()); // "hello world"
```

这里，toLowerCase() 和 toLocaleLowerCase() 都返回 hello world，而 toUpperCase() 和 toLocaleUpperCase() 都返回 HELLO WORLD。通常，如果不知道代码涉及什么语言，则最好使用地区特定的转换方法。

<br>

### 11. 字符串模式匹配方法

#### match()

#### matchAll()

String 类型专门为在字符串中实现模式匹配哦设计了几个方法。第一个就是 match() 方法，这个方法本质上跟 RegExp 对象的 exec() 方法相同。match() 方法接收一个参数，可以是一个正则表达式字符串，也可以是一个 RegExp 对象。来看下面的例子：

```javascript
let text = "cat, bat, sat, fat";
let pattern = /.at/;

// 等价于 pattern.exec(text)
let matches = text.match(pattern);
console.log(matches.index); // 0
console.log(matches[0]); // "cat"
console.log(pattern.lastIndex); // 0
```

match() 方法返回的数组与 RegExp 对象的 exec() 方法返回的数组是一样的：第一个元素是与整个模式匹配的字符串，其余元素则是与表达式中的捕获组匹配的字符串（如果有的话）。

在使用全局标记时，match() 只会返回一个匹配数组，所有捕获组都会丢掉。要想在匹配多个值时保留捕获组，应使用 matchAll()。matchAll() 只接受一个全局正则表达式，返回包含每个 match() 结果的可迭代对象 RegExpStringIterator。它们的区别如下面的例子所示：

```javascript
const text = "abcdeazcde";

console.log(text.match(/a(.)c/));
// ['abc', 'b', index: 0, input: 'abcdeazcde', groups: undefined]

console.log(text.match(/a(.)c/g));
// ['abc', 'azc']

console.log([...text.matchAll(/a(.)c)/g)]);
// [
//. ['abc', 'b', index: 0, input: 'abcdeazcde', groups: undefined]
//. ['azc', 'z', index: 5, input: 'abcdeazcde', groups: undefined]
// ]
```

#### search()

另一个查找模式的字符串方法是 search()。这个方法唯一的参数与 match() 方法一样：正则表达式字符串或 RegExp 对象。这个方法返回模式第一个匹配的位置索引，如果没找到则返回 -1。search() 始终从字符串开头向后匹配模式。看下面的例子：

```javascript
let text = "cat, bat, sat, fat";
let pos = text.search(/at/);
console.log(pos); // 1
```

这里，search(/at/) 返回 1，即 "at" 在字符串中第一次出现的位置。

#### replace()

#### replaceAll()

为简化子字符串替换操作，ECMAScript 提供了 replace() 方法。这个方法接受两个参数，第一个参数可以是一个 RegExp 对象或一个字符串（这个字符串不会转换为正则表达式），第二个参数可以是一个字符串或一个函数。如果 replace() 的第一个参数是字符串，那么只会替换第一个子字符串。要想替换所有子字符串有两种方式，首先是第一个参数用正则表达式并且带全局标记，其次是使用 replaceAll() 方法，如下面的例子所示：

```javascript
const text = "cat, bat, sat, fat";
let result = text.replace("at", "ond");
console.log(result); // "cond, bat, sat, fat"

result = text.replace(/at/g, "ond");
console.log(result); // "cond, bond, sond, fond"

result = text.replaceAll("at", "ond");
console.log(result); // "cond, bond, sond, fond"
```

在这个例子中，字符串 "at" 先传给 replace() 函数，而替换文本是 "ond"。结果是 "cat" 被修改为 "cond"，而字符串的剩余部分保持不变。通过将第一个参数改为带全局标记的正则表达式，字符串中的所有 "at" 都被替换成了 "ond"。replaceAll() 方法直接实现了全局标记的行为。

在第二个参数是字符串的情况下，有几个特殊的字符序列可以用来插入正则表达式匹配的值。ECMA-262 中规定了下表中的值。

| 字符序列 | 替换文本                                                     |
| -------- | ------------------------------------------------------------ |
| $$       | $                                                            |
| $&       | 匹配整个模式的子字符串。与 RegExp.lastMatch 相同             |
| $'       | 匹配的子字符串之前的字符串。与 RegExp.rightContext 相同      |
| $`       | 匹配的子字符串之后的字符串。与 RegExp.leftContext 相同       |
| $n       | 匹配第 n 个捕获组的字符串，其中 n 是 0~9。比如，$1 是匹配第一个捕获组的字符串，$2 是匹配第二个捕获组的字符串，以此类推。如果没有捕获组，则值为空字符串 |
| $nn      | 匹配第 nn 个捕获组字符串，其中 nn 是 01~99。比如，$01 是匹配第一个捕获组的字符串，$02 是匹配第二个捕获组的字符串，以此类推。如果没有捕获组，则值为空字符串 |

使用这些特殊的序列，可以在替换文本中使用之前匹配的内容，如下面的例子所示：

```javascript
let text = "cat, bat, sat, fat";
result = text.replace(/(.at)/g, "word ($1)");
console.log(result); // word (cat), word (bat), word (sat), word (fat)
```

这里，每个以 "at" 结尾的词都会被替换成 "word" 后跟一对小括号，其中包含捕获组匹配的内容 $1。

replace() 或者 replaceAll() 的第二个参数可以是一个函数。在只有一个匹配项时，这个函数会收到 3 个参数：与整个模式匹配的字符串、匹配项在字符串中的开始位置，以及整个字符串。在有多个捕获组的情况下，每个匹配捕获组的字符串也会作为参数传给这个函数，但最后两个参数还是与整个模式匹配的开始位置和原始字符串。这个函数应该返回一个字符串，表示应该把匹配项替换成什么。使用函数作为第二个参数可以更细致地控制替换过程，如下所示：

```javascript
function htmlEscape(text) {
    return text.replace(/[<>"&]/g, function (match, pos, originalText) {
        switch(match) {
            case "<":
                return "<";
            case ">":
                return ">";
            case "&":
                return "&";
            case "\"":
                return """;
        }
    });
}

console.log(htmlEscape("<p class=\"greeting\">Hello world!<p>"));
// "<p class="greeting">Hello world!</p>"
```

这里，函数 thmlEscape() 用于将一段 HTML 中的 4 个字符替换成对应的实体：小于号、大于号、和号，还有双引号（都必须经过转义）。实现这个任务最简单的方法就是用一个正则表达式查找这些字符，然后定义一个函数，根据匹配的每个字符分别返回特定的 HTML 实体。

#### split()

最后一个与模式匹配相关的字符串方法是 split()。这个方法会根据传入的分隔符将字符串分成数组。作为分隔符的参数可以是字符串，也可以是 RegExp 对象。（字符串分隔符不会被这个方法当成正则表达式）。还可以传入第二个参数，即数组大小，确保返回的数组不会超过指定大小，来看下面的例子：

```javascript
let colorText = "red,blue,green,yellow";
let colors1 = colorText.split(","); // ["red", "blue", "green", "yellow"]
let colors2 = colorText.split(",", 2); // ["red", "blue"]
let colors3 = colorText.split(/[^,]+/); // ["", ",", ",", ",", ""]
```

在这里，字符串 colorText 是一个逗号分隔的颜色名称字符串。调用 split(",") 会得到包含这些颜色名的数组，基于逗号进行拆分。要把数组元素限制为 2 个，传入第二个参数 2 即可。最后，使用正则表达式可以得到一个包含逗号的数组。注意在最后一次调用 split() 时，返回的数组前后包含两个空字符串。这是因为正则表达式指定的分隔符出现在了字符串开头（"red"）和末尾（"yellow"）。

<br>

### 12. localeCompare() 方法

最后一个方法是 localCompare()，这个方法比较两个字符串，返回如下 3 个值中的一个。

* 如果按照字母表顺序，字符串应该排在字符串参数前头，则返回负值。（通常是 -1，具体还要看与实际值相关的实现）。
* 如果字符串与字符串参数相等，则返回 0。
* 如果按照字母表顺序，字符串应该排在字符串参数后头，则返回正值。（通常是 1，具体还要看与实际值相关的实现）。

下面是一个例子：

```javascript
let stringValue = "yellow";
console.log(stringValue.localCompare("brick")); // 1
console.log(stringValue.localCompare("yellow")); // 0
console.log(stringValue.localCompare("zoo")); // -1
```

在这里，字符串 "yellow" 与 3 个不同的值进行了比较："brick"、"yellow" 和 "zoo"。"brick" 按字母表顺序应该排在 "yellow" 前头，因此 localeCompare() 返回 1。"yellow" 等于 "yellow"，因此 localeCompare() 返回 0。最后，"zoo" 在 "yellow" 后面，因此 localeCompare() 返回 -1。强调一下，因为返回的具体值可能因具体实现而异，所以最好像下面的示例中一样使用 localeCompare()：

```javascript
function determineOrder(value) {
    let result = stringValue.localeCompare(value);
    if (result < 0) {
        console.log(`The string 'yellow' comes before the string '${value}'.`);
    } else if (result > 0) {
        console.log(`The string 'yellow' comes after the string '${value}'.`);
    } else {
        console.log(`The string 'yellow' is equal to the string '${value}'.`);
    }
}

determineOrder("brick");
determineOrder("yellow");
determineOrder("zoo");
```

这样一来，就可以保证在所有实现中都能正确判断字符串的顺序了。

localeCompare() 的独特之处在于，实现所在的地区（国家和语言）决定了这个方法如何比较字符串。在美国，英语是 ECMAScript 实现的标准语言，localeCompare() 区分大小写，大写字母排在小写字母前面。但其他地区未必是这种情况。

<br>

# 4. 单例内置对象

ECMA-262 对内置对象的定义是任何由 ECMAScript 实现提供、与宿主环境无关，并在 ECMAScript 程序开始执行时就存在的对象。这就意味着，开发者不用显式地实例化内置对象，因为它们已经实例化好了。前面我们已经接触了大部分内置对象，包括 Object、Array 和 String。本节介绍 ECMA-262 定义的另外两个单例内置对象：Global 和 Math。

## 1. Global

Global 对象是 ECMAScript 中最特别的对象，因为代码不会显式地访问它。ECMA-262 规定 Global 对象为一种兜底对西安给，它所针对地是不属于任何对象地属性和方法。事实上，不存在全局变量或全局函数这种东西。在全局作用域中定义的变量和函数都会变成 Global 对象的属性。本书前面介绍的函数，包括 isNaN()、isFinite()、parseInt() 和 parseFloat()，实际上都是 Global 对象的方法。除了这些，Global 对象上还有另外一些方法。

### 1. URI 编码方法

#### encodeURI()

#### encodeURIComponent()

#### decodeURI()

#### decodeURIComponent()

encodeURI() 和 encodeURIComponent() 方法用于编码统一资源标识符（URI），以便传给浏览器。有效的 URI 不能包含某些字符，比如空格。使用 URI 编码方法来编码 URI 可以让浏览器能够理解它们，同时又以特殊的 UTF-8 编码替换掉所有无效字符。

encodeURI() 方法用于对整个 URI 进行编码，比如 "www.wiley.com/illegal value.js"。而 encodeURIComponent() 方法用于编码 URI 中单独的组件，比如前面 URI 中的 "illegal value.js"。这两个方法的主要区别是，encodeURI() 不会编码属于 URI 组件的特殊字符，比如冒号、斜杠、问号、井号，而 encodeURIComponent() 会编码它发现的所有非标准字符。来看下面的例子：

```javascript
let uri = "http://www.wiley.com/illegal value.js#start";

// "http://www.wiley.com/illegal%20value.js#start"
console.log(encodeURI(uri));

// "http%3A%2F%2Fwww.wiley.com%2Fillegal%20value.js%23start"
console.log(encodeURIComponent(uri));
```

这里使用 encodeURI() 编码后，除空格被替换成 %20 之外，没有任何变化。而 encodeURIComponent() 方法将所有非字母字符都替换成了相应的编码形式。这就是使用 encodeURI() 编码整个 URI，但只使用 encodeURIComponent() 编码那些会追加到已有 URI 后面的字符串的原因。

>注意
>
>一般来说，使用 encodeURIComponent() 应该比使用 encodeURI() 的频率更高，这是因为编码查询字符串参数比编码基准 URI 的次数更多。

与 encodeURI() 和 encodeURIComponent() 相对的是 decodeURI() 和 decodeURIComponent()。decodeURI() 只对使用 encodeURI() 编码过的字符解码。例如，%20 会被替换为空格，但 %23 不会被替换为井号（#），因为井号不是由 encodeURI() 替换的。类似地，decodeURIComponent() 解码所有被 encodeURIComponent() 编码的字符，基本上就是解码所有特殊值。来看下面的例子：

```javascript
let uri = "http%3A%2F%2Fwww.wiley.com%2Fillegal%20value.js%23start";

// http%3A%2F%2Fwww.wiley.com%2Fillegal value.js%23start
console.log(decodeURI(uri));

// http:// www.wiley.com/illegal value.js#start
console.log(decodeURIComponent(uri));
```

这里，uri 变量中包含一个使用 encodeURIComponent() 编码过的字符串。首先输出的是使用 decodeURI() 解码的结果，可以看到只用空格替换了 %20。然后是使用 decodeURIComponent() 解码的结果，其中替换了所有特殊字符，并输出了没有包含任何转义的字符串。（这个字符串是有效的 URI）。

>注意
>
>URI 方法 encodeURI()、encodeURIComponent()、decodeURI() 和 decodeURIComponent() 取代了 escape() 和 unescape() 方法，后者在 ECMA-262 第 3 版中就已经废弃了。URI 方法始终是首选方法，因为它们对所有 Unicode 字符进行编码，而原来的方法只能正确编码 ASCII 字符。不要在生产环境中使用 escape() 和 unescape()。

<br>

### 2. eval() 方法

最后一个方法可能是整个 ECMAScript 语言中最强大的了，它就是 eval()。这个方法就是一个完整的 ECMAScript 解释器，它接受一个参数，即一个要执行的 ECMAScript（JavaScript）字符串。来看一个例子：

```javascript
eval("console.log('hi')");
```

上面这行代码的功能与下面这一行等价：

```javascript
console.log("hi");
```

当解释器发现 eval() 调用时，会将参数解释为实际的 ECMAScrpt 语句，然后将其插入到该位置。通过 eval() 执行的代码属于该调用所在上下文，被执行的代码与该上下文拥有相同的作用域链。这意味着定义在包含上下文中的变量可以在 eval() 调用内部被引用，比如下面这个例子：

```javascript
let msg = "hello world";
eval("console.log(msg)"); // "hello world"
```

这里，变量 msg 是在 eval() 调用的外部上下文中定义的，而 console.log() 显示了文本 "hello world"。这是因为第二行会被替换成一行真正的函数调用代码。类似地，可以在 eval() 内部定义一个函数或变量，然后在外部代码中引用，如下所示：

```javascript
eval("function sayHi() { console.log('hi'); }");
sayHi();
```

这里，函数 sayHi() 是在 eval() 内部定义的。因为该调用会被替换为真正的函数定义，所以才可能在下一行代码中调用 sayHi()。对于变量也是一样的：

```javascript
eval("let msg = 'hello world';");
console.log(msg); // "hello world"
```

通过 eval() 定义的任何变量和函数都不会被提升，这是因为在解析代码的时候，它们是被包含在一个字符串中的。它们只是在 eval() 执行的时候才会被创建的。

在严格模式下，在 eval() 内部创建的变量和函数无法被外部访问。换句话说，最后两个例子会报错。同样，在严格模式下，赋值给 eval 也会导致报错：

```javascript
"use strict";
eval = "hi"; // 导致错误
```

>注意
>
>解释代码字符串的能力是非常强大的，但也非常危险。在使用 eval() 的时候必须极为慎重，特别是在解释用户输入的内容时，因为这个方法会对 XSS 利用暴露出很大的攻击面。恶意用户可能插入会导致你网站或应用崩溃的代码。

<br>

### 3. Global 对象属性

Global 对象有很多属性，其中一些前面已经提到过了。像 undefined、NaN 和 Infinity 等特殊值都是 Global 对象的属性。此外，所有原生引用类型构造函数，比如 Object 和 Function，也都是 Global 对象的属性。下表列出了所有这些属性。

| 属性           | 说明                      |
| -------------- | ------------------------- |
| undefined      | 特殊值 undefined          |
| NaN            | 特殊值 NaN                |
| Infinity       | 特殊值 Infinity           |
| Object         | Object 的构造函数         |
| Array          | Array 的构造函数          |
| Function       | Function 的构造函数       |
| Boolean        | Boolean 的构造函数        |
| String         | String 的构造函数         |
| Number         | Number 的构造函数         |
| Date           | Date 的构造函数           |
| RegExp         | RegExp 的构造函数         |
| Symbol         | Symbol 的伪构造函数       |
| Error          | Error 的构造函数          |
| EvalError      | EvalError 的构造函数      |
| RangeError     | RangeError 的构造函数     |
| ReferenceError | ReferenceError 的构造函数 |
| SyntaxError    | SyntaxError 的构造函数    |
| TypeError      | TypeError 的构造函数      |
| URIError       | URIError 的构造函数       |

<br>

### 4. window 对象

虽然 ECMA-262 没有规定直接访问 Global 对象的方式，但浏览器将 window 对象实现为 Global 对象的代理。因此，所有全局作用域中声明的变量和函数都变成了 window 的属性。来看下面的例子：

```javascript
var color = "red";

function sayColor() {
    console.log(window.color);
}

window.sayColor(); // "red"
```

这里定义了一个名为 color 的全局变量和一个名为 sayColor() 的全局变量。在 sayColor() 内部，通过 window.color 访问了 color 变量，说明全局变量变成了 window 的属性。接着，又通过 window 对象直接调用了 window.sayColor() 函数，从而输出字符串。

>注意
>
>window 对象在 JavaScript 中远不止实现了 ECMAScript 的 Global 对象那么简单。关于 window 对象的更多介绍，请参考第 12 章。

另一种获取 Global 对象的方式是使用如下的代码：

```javascript
let global = function() {
    return this;
}();
```

这段代码创建了一个立即调用的函数表达式，返回 this 的值。如前所述，当一个函数在没有明确（通过成为某个对象的方法，或者通过 call()/apply()）指定 this 值得情况下执行时，this 值等于 Global 对象。因此，调用一个简单返回 this 的函数是在任何执行上下文中获取 Global 对象的通用方式。

<br>

## 2. Math

ECMAScript 提供了 Math 对象作为保存数学公式、信息和计算的地方。Math 对象提供了一些辅助计算的属性和方法。

>注意
>
>Math 对象上提供的计算要比直接在 JavaScript 中实现的快得多，因为 Math 对象上的计算使用了 JavaScript 引擎中更高效的实现和处理器指令。但使用 Math 计算的问题是精度会因浏览器、操作系统、指令集和硬件而异。

### 1. Math 对象属性

Math 对象有一些属性，主要用于保存数学中的一些特殊值。下表列出了这些属性。

| 属性         | 说明                  |
| ------------ | --------------------- |
| Math.E       | 自然对数的基数 e 的值 |
| Math.LN10    | 10 为底的自然对数     |
| Math.LN2     | 2 为底的自然对数      |
| Math.LOG2E   | 以 2 为底 e 的对数    |
| Math.LOG10E  | 以 10 为底 e 的对数   |
| Math.PI      | Π的值                 |
| Math.SQRT1_2 | 1/2 的平方根          |
| Math.SQRT2   | 2 的平方根            |

这些值的含义和用法超出而来本书的范畴，但都是 ECMAScript 规范定义的，并可以在你需要时使用。

<br>

### 2. min() 和 max() 方法

#### Math.min()

#### Math.max()

Math 对象也提供了很多辅助执行简单或复杂数学计算的方法。

min() 和 max() 方法用于确定一组数值中的最小值和最大值。这两个方法都接收任意多个参数，如下面的例子所示：

```javascript
let max = Math.max(3, 54, 32, 16);
console.log(max); // 54

let min = Math.min(3, 54, 32, 16);
console.log(min); // 3
```

在 3、54、32 和 16 中，Math.max() 返回 54，Math.min() 返回 3。使用这两个方法可以避免使用额外的循环和 if 语句来确定一组数值的最大或最小值。

要知道数组中的最大值和最小值，可以像下面这样使用扩展运算符：

```javascript
let values = [1, 2, 3, 4, 5, 6, 7, 8];
let max = Math.max(...values);
```

<br>

### 3. 舍入方法

#### Math,ceil()

#### Math.floor()

#### Math.round()

#### Math.fround()

接下来是用于把小数值舍入为整数的 4 个方法：Math.ceil()、Math.floor()、Math.round() 和 Math.fround()。这几个方法处理舍入的方式如下所述。

* Math.ceil() 方法始终向上舍入为最接近的整数。
* Math.floor() 方法始终向下舍入为最接近的整数。
* Math.round() 方法执行四舍五入。
* Math.fround() 方法返回数值最接近的单精度（32 位）浮点中表示。

以下示例展示了这个方法的用法：

```javascript
console.log(Math.ceil(25.9)); // 26
console.log(Math.ceil(25.5)); // 26
console.log(Math.ceil(25.1)); // 26

console.log(Math.round(25.9)); // 26
console.log(Math.round(25.5)); // 26
console.log(Math.round(25.1)); // 25

console.log(Math.fround(0.4)); // 0.4000000059604645
console.log(Math.fround(0.5)); // 0.5
console.log(Math.frond(25.9)); // 25.899999618530273

console.log(Math.floor(25.9)); // 25
console.log(Math.floor(25.5)); // 25
console.log(Math.floor(25.1)); // 25
```

对于 25 和 26（不包含）之间的所有值，Math.ceil() 都会返回 26，因为它始终向上舍入。Math,round() 只在数值大于等于 25.5 时返回 26，否则返回 25。最后，Math.floor() 对所有 25 和 26（不包含）之间的值都返回 25。

<br>

### 4. random() 方法

#### Math.random()

Math.random() 方法返回一个 0~1 范围内的随机数，其中包含 0 但不包含 1。对于希望显示随机名言或随机新闻的网页，这个方法是非常方便的。可以基于如下公式使用 Math.random() 从一组整数中随机选择一个数：

```javascript
number = Math.floor(Math.random() * total_number_of_choices + first_possible_value)
```

这里使用了 Math.floor() 方法，因为 Math.random() 始终返回小数，即便乘以一个数再加上一个数也是小数。因此，如果想从 1~10 范围内随机选择一个数，代码就是这样的：

```javascript
let num = Math.floor(Math.random() * 10 + 1);
```

这样就有 10 个可能的值（1~10），其中最小的值是 1。如果想选择一个 2~10 范围内的值，则代码要写成这样：

```javascript
let num = Math.floor(Math.random() * 9 + 2);
```

2~10 只有 9 个数，所以可选总数（total_number_of_choices）是 9，而最小可能的值（first_possible_value）是 2。很多时候，通过函数来算出可选总数和最小可能的值可能更方便，比如：

```javascript
function selectFrom(lowerValue, upperValue) {
    let choices - upperValue - lowerValue;
    return Math.floor(Math.random() * choices + lowerValue);
}

let num = selectFrom(2, 10);
console.log(num); // 2~10 范围内的值，其中包含 2 和 10
```

这里的函数 selectFrom() 接收两个参数：应该返回的最小值和最大值。通过将这两个值相减再加 1 得到可选总数，然后再套用上面的公式。于是，调用 selectFrom(2, 10) 就可以从 2~10（包含）范围内选择一个值了。使用这个函数，从一个数组中随机选择一个元素就很容易，比如：

```javascript
let colors = ["red", "green", "blue", "yellow", "black", "purple", "brown"];
let color = colors[selectFrom(0, colors.length - 1)];
```

在这个例子中，传给 selectFrom() 的第二个参数是数组长度减 1，即数组最大的索引值。

>注意
>
>Math.random() 方法在这里出于演示目的是没有问题的。如果是为了加密而需要生成随机数（传给生成器的输入需要较高的不确定性），那么建议使用 window.crypto.getRandomValues()。

<br>

### 5. 其他方法

Math 对象还有很多涉及各种简单或高阶数运算的方法。讨论每种方法的具体细节或者它们的适用场景超出了本书的范畴。不过，下表还是总结了 Math 对象的其他方法。

| 方法                | 说明                              |
| ------------------- | --------------------------------- |
| Math.abs(x)         | 返回 x 的绝对值                   |
| Math.exp(x)         | 返回 Math.E 的 x 次幂             |
| Math.expm1(x)       | 等于 Math.exp(x) - 1              |
| Math.log(x)         | 返回 x 的自然对数                 |
| Math.log1p(x)       | 等于 1 + Math.log(x)              |
| Math.pow(x, power)  | 返回 x 的 power 次幂              |
| Math.hypot(...nums) | 返回 nums 中每个数平方和的平方根  |
| Math.clz32(x)       | 返回 32 位整数 x 的前缀零的数量   |
| Math.sign(x)        | 返回表示 x 的符号的 1、0、-0 或 1 |
| Math.trunc(x)       | 返回 x 的整部部分，删除所有小数   |
| Math.sqrt(x)        | 返回 x 的平方根                   |
| Math.cbrt(x)        | 返回 x 的立方根                   |
| Math.acos(x)        | 返回 x 的反余弦                   |
| Math.acosh(x)       | 返回 x 的反双曲余弦               |
| Math.asin(x)        | 返回 x 的 反正弦                  |
| Math.asinh(x)       | 返回 x 的反双曲正弦               |
| Math.atan(x)        | 返回 x 的反正切                   |
| Math.atanh(x)       | 返回 x 的双曲正切                 |
| Math.atan2(y, x)    | 返回 y/x 的反正切                 |
| Math.cos(x)         | 返回 x 的余弦                     |
| Math.sin(x)         | 返回 x 的正弦                     |
| Math.tan(x)         | 返回 x 的正切                     |

即便这些方法都是由 ECMA-262 定义的，对正弦、余弦、正切等计算的实现仍然取决于浏览器，因为计算这些值的方式有很多种。结果，这些方法的精度可能因实现而异。







































































