期约和 async/await 是 JavaScript 最重要的两个特性，为开发者处理异步操作提供了优雅又高效的方式。相比回调函数，期约提供更强大的抽象，让开发者能够编写更清晰、更好维护的代码。async/await 用看起来同步的语法实现了异步逻辑，这种自然的语法让我们期约变得更加简单，也让异步代码更容易推理。

>注意
>
>本章示例将大量使用异步日志函数 console.asyncLog() 来输出期约实例的状态。这个函数并不是浏览器的原生函数，而是可以像这样定义的：
>
>console.asyncLog = (...args) => setTimeout(console.log, 0, ...args)
>
>这个函数输出的内容看起来虽然像是同步输出额，但实际上是异步打印的。这样可以让期约等返回的值达到其最终状态。
>
>此外，浏览器控制台的输出经常能打印出 JavaScript 运行中无法获取的对象信息（比如期约的状态）。这个特性在示例中广泛使用，以便辅助我们理解相关概念。

# 1. 异步编程

同步行为和异步行为的对立统一是计算机科学的一个基本概念。特别是在 JavaScript 这种单线程事件循环模型中，同步操作与异步操作更是代码所要依赖的核心机制。异步行为是为了优化因计算量大而时间长的操作。如果在等待其他操作完成的同时，即使运行其他指令，系统也能保持稳定，那么这样做就是务实的。

重要的是，异步操作并不一定计算量大或要等很长时间。只要你不想为等待某个异步操作而阻塞线程执行，那么任何时候都可以使用。

## 1. 同步与异步

同步行为对应内存中顺序执行的处理器指令。每条指令都会严格按照它们出现的顺序执行，而每条指令执行后也能立即获得存储在系统本地（如寄存器或系统内存）的信息。这样的执行流程容易分析程序在执行到代码任意位置时的状态（比如变量的值）。

同步操作的例子可以是执行一次简单的数学计算：

```javascript
let x = 3;
x = x + 4;
```

在程序执行的每一步，都可以推断出程序的状态。这是因为后面的指令总是在前面的指令完成后才会执行。等到最后一条指令执行完毕，存储在 x 的值就立即可以使用。

这两行 JavaScript 代码对应的低级指令（从 JavaScript 到 x86）并不难想象。首先，操作系统会在栈内存上分配一个存储浮点数值的空间，然后针对这个值做一次数学计算，再把计算结果写回之前分配的内存中。所有这些指令都是在单个线程中按顺序执行的。在低级指令的层面，有充足的工具可以确定系统状态。

相对地，异步行为类似于系统中断，即当前进程外部的实体可以触发代码执行。异步操作经常是必要的，因为强制进程等待一个长时间的操作通常是不可行的（伯同步操作则必须要等）。如果代码要访问一些高延迟的资源，比如向远程服务器发送请求并等待响应，那么就会出现长时间的等待。

异步操作的例子可以是在定时回调中执行一次简单的数学计算：

```javascript
let x = 3;
setTimeout(() => x = x + 4, 100);
```

这段程序最终与同步代码执行的任务一样，都是把两个数加在一起，但这一次执行线程不知道 x 值何时会改变，因为这取决于回调何时从消息队列出队并执行。

异步代码不容易推断。虽然这个例子对应的低级代码最终跟前面的例子没什么区别，但第二个指令块（加操作及赋值操作）是由系统计数器触发的，这会生成一个入队执行的中断。到底什么时候会触发这个中断，这对 JavaScript 运行时来说是一个黑盒，因此实际上无法预知（尽管可以保证这发生在当前线程的同步代码执行之后，否则回调都没有机会出队被执行）。无论如何，在排定回调以后基本没办法知道系统状态何时变化。

为了让后续代码能够使用 x，异步执行的函数需要在更新 x 的值以后通知其他代码。如果程序不需要这个值，那么就只管继续执行，不必等待这个结果。

设计一个能够知道 x 什么时候可以读取的系统是非常难的。JavaScript 在实现这样一个系统的过程中也经历了几次迭代。

## 2. 以往的异步编程模式

异步行为是 JavaScript 的基础，但以前的实现不理想。早期的 JavaScript 只支持定义回调函数来表明异步操作完成。串联多个异步操作是一个常见的问题，通常需要深度嵌套的回调函数（俗称回调地狱）来解决。

假设有以下异步函数，使用了 setTimeout 在一秒之后执行某些操作：

```javascript
function double(value) {
    setTimeout(() => console.asyncLog(value * 2), 1000);
}

double(3);
// 6（大约 1000 毫秒之后）
```

这里的代码没什么神秘的，但关键是理解为什么说它是一个异步函数。setTimeout 可以定义一个在指定时间之后会被调度执行的回调函数。对这个例子而言，1000 毫秒之后，JavaScript 运行时会把回调函数推到自己的消息队列上去等待执行。推到队列之后，回调什么时候出队被执行对 JavaScript 代码就完全不可见了。还有一点，double() 函数在 setTimeout 成功调度异步操作之后会立即退出。

### 1. 异步返回值

假设 setTimeout 操作会返回一个有用的值。有什么好办法把这个值传给需要它的地方？广泛接受的一个策略是给异步操作提供一个回调，这个回调中包含要使用（作为回调参数的）异步返回值的代码。

```javascript
function double(value, callback) {
    setTimeout(() => callback(value * 2), 1000);
}

double(3, (x) => console.log(`I was given: ${x}`));
// I was given: 6（大约 1000 毫秒之后）
```

这里的 setTimeout 调用告诉 JavaScript 运行时在 1000 毫秒之后把一个函数推到消息队列上。这个函数会由运行时负责异步调度执行。而位于函数闭包中的回调及其参数在异步执行时仍然是可用的。

### 2. 失败处理

异步操作的失败处理在回调模型中也要考虑，因此自然就出现了成功回调和失败回调：

```javascript
function double(value, success, failure) {
    setTimeout(() => {
        try {
            if (typeof value !== 'number') {
                throw 'Must provide number as first argument';
            }
            success(2 * value);
        } catch (e) {
            failure(e);
        }
    }, 1000);
}

const successCallback = (x) => console.log(`Sucess: ${x}`);
const failureCallback = (e) => console.log(`Failure: ${e}`);

double(3, successCallback, failureCallback);
double('b', successCallback, failureCallback);

// Success: 6（大约 1000 毫秒之后）
// Failure: Must provide number as first argument（大约 100 毫秒之后）
```

这种模式已经不可取了，因为必须在初始化异步操作时定义回调。异步函数的返回值只在短时间内存在，只有预备好将这个短时间内存在的值作为参数的回调才能接收到它。

### 3. 嵌套异步回调

如果异步返值又依赖另一个异步返回值，那么回调的情况还会进一步变复杂。在实际的代码中，这就要求嵌套回调：

```javascript
function double(value, success, failure) {
    setTimeout(() => {
        try {
            if (typeof value !== 'number') {
                throw 'Must provide number as first argument';
            }
            success(2 * value);
        } catch(e) {
            failure(e);
        } 
    }, 1000);
}

const successCallback = (x) => {
    double(x, (y) => console.log(`Sucess: ${y}`));
};
const failureCallback = (e) => console.log(`Failure: ${e}`);

double(3, sucessCallback, failureCallback);

// Success: 12（大约 1000 毫秒之后）
```

显然，随着代码越来越复杂，回调策略是不具有扩展性的。回调地狱这个称呼可谓实至名归。嵌套回调的代码维护起来就是噩梦。

# 2. 期约

期约是对尚不存在结果的一个替身。期约（promise）这个名字最早是由 Daniel Friedman 和 David Wise 在他们于 1976 年发表的论文 "The Impact of Applicative Programming on Multiprocessing" 中提出来的。但直到十几年以后，Barbara Liskov 和 Liuba Shrira 在 1988 年发表了论文 "Promises: Linguistic Suppoer for Efficient Asymchronous Procedure Calls in Distributed Systems"，这个概念才真正确立下来。同一时期的计算机科学家还使用了终局（eventual）、期许（future）、延迟（delay）和迟付（deferred）等术语指代同样的概念。所有这些概念描述的都是一种异步程序执行的机制。

## 1. Promises/A+ 规范

早期的期约机制在 jQuery 和 Dojo 中是以 Deferred API 的形式出现的。到了 2010 年，CommonJS 项目实现的 Promises/A 规范日益流行起来。Q 和 Bluebird 等第三方 JavaScript 期约也越来越得到社区认可，虽然这些库的实现多少都有些不同。为弥合既有实现之间的差异，2012 年 Promises/A+ 组织分叉（fork）了 CommonJS 的 Promises/A 建议，并以相同的名称制定了 Promises/A+ 规范。这个规范最终成为了 ECMAScript 6 规范实现的范本。

ECMAScript 6 增加了对 Promises/A+ 规范的完善支持，即 Promise 类型。一经推出，Promise 就大受欢迎，成为了主导性的异步编程机制。所哟现代浏览器都支持 ES6 期约，很多其他浏览器 API（如 fetch() 和 Battery Status API）也以期约为基础。

## 2. 期约基础

Promise 可以通过 new 操作符来实例化。创建新期约时需要传入执行器（executor）函数作为参数（后面马上会介绍），下面的例子使用了一个空函数对象来应付一下解释器：

```javascript
let p = new Promise(() => {});
console.asyncLog(p); // Promise <pending>
```

之所以说是应付解释器，是因为如果不提供执行器函数，就会抛出 SyntaxError。

### 1. 期约状态机

在把一个期约实例传给 console.asyncLog() 时，控制台输出（可能因浏览器不同而略有差异）表明该实例处于待定（pending）状态。如前所述，期约是一个有状态的对象，可能处于如下 3 种状态之一：

* 待定（pending）
* 兑现（fulfilled，有时候也称为解决，resolved）
* 拒绝（rejected）

待定（pending）是期约的最初始状态。在待定状态下，期约可以落定（settled）为代表成功的兑现（fulfilled）状态，或者代表失败的拒绝（rejected）状态。

无论落定为哪种状态都是不可逆的。只要从待定转换为兑现或拒绝，期约的状态就不再改变。而且，也不能保证期约必然会脱离待定状态。因此，无论期约解决（resolve）还是拒绝（reject），甚至永远处于待定（pending）状态，组织合理的代码都应该具有恰当的行为。

重要的是，期约的状态是私有的，不能直接通过 JavaScript 检测到。这主要是为了避免根据读取到的期约状态以同步方式处理期约对象。另外，期约的状态也不能被外部 JavaScript 代码修改。这与不能读取该状态的原因是一样的：期约故意将异步行为封装起来，从而隔离外部的同步代码。

### 2. 兑现的值、拒绝理由及期约用例

期约主要有两大用途。首先是抽象地表示一个异步操作。期约的状态代表期约是否完成。待定表示尚未开始或者正在执行中。兑现表示已经成功完成，而拒绝表示没有成功完成。

某些情况下，这个状态机就是期约可以提供的最有用的信息。知道一段异步代码已经完成，对于其他代码而言已经足够了。比如，假设期约要向服务器发送一个 HTTP 请求。请求返回 200~299 范围内的状态码就足以让期约状态变为兑现。类似地，如果请求返回的状态码不在 200~299 这个范围内，那么就会把期约状态切换为拒绝。

在另外一些情况下，期约封装的异步操作会实际生成某个值，而程序期待期约状态改变时可以访问这个值。相应地，如果期约被拒绝，程序就会期待期约状态改变时可以拿到拒绝的理由。比如，假设期约向服务器发送一个 HTTP 请求并预定会返回 JSON。如果请求返回范围在 200~299 的状态码，则足以让期约的状态变为兑现。此时期约内部就可以收到一个 JSON 字符串。类似地，如果请求返回的状态码不在 200~299 这个范围内，那么就会把期约状态切换为拒绝。此时拒绝的理由可能是一个 Error 对象，包含着 HTTP 状态码及相关错误消息。

为了支持这两种用例，每个期约只要状态切换为兑现，就会有一个私有的内部值（value）。类似地，每个期约只要状态切换为拒绝，就会有一个私有的内部理由（reason）。无论值还是理由，都是包含原始值或对象的不可修改的引用。二者都是可选的，而且默认值为 undefined。在期约到达某个落定状态时执行的异步代码始终会收到这个值或理由。

### 3. 通过执行器函数控制期约状态

由于期约的状态是私有的，因此只能在内部进行操作，内部操作在期约的执行器函数中完成。执行器函数主要有两项职责：初始化期约的异步行为和控制状态的最终转换。控制期约状态的转换是通过调用它的两个函数参数实现的。这两个函数参数通常都命名为 resolve 和 reject。调用 resolve() 会把状态切换为兑现，调用 reject() 会把状态切换为拒绝并抛出错误（本章后面会讨论这个错误）。

```javascript
let p1 = new Promise((resolve, reject) => resolve());
console/asyncLog(p1); // Promise <fulfilled>>

let p2 = new Promise((resolve, reject) => reject());
console.asyncLog(p2); // Promise <rejected>
// Uncaught error (in promise)
```

在前面的例子中，并没有什么异步操作，因为在初始化期约时，执行器函数已经改变了每个期约的状态。这里的关键在于，执行器函数是同步执行的。这是因为执行器函数是期约的初始化程序。通过下面的例子可以看出上面代码的执行顺序：

```javascript
new Promise(() => console.asyncLog('executor'));
console.asyncLog('promise initialized');

// executor
// promise initialized
```

添加 setTimeout 可以推迟切换状态：

```javascript
let p = new Promise((resolve, reject) => setTimeout(resolve, 1000));

// 在 console.asyncLog 打印期约实例的时候，还不会执行超时回调（即 resolve()）
console.asyncLog(p); // Promise <pending>
```

无论 resolve 和 reject 中的哪个被调用，状态切换都不可撤销。于是继续修改状态会静默失败，如下所示：

```javascript
let p = new Promise((resolve, reject) => {
    resolve();
    reject(); // 没有效果
});

console.asyncLog(p); // Promise <fulfilled>
```

为避免期约卡在待定状态，可以添加一个定时退出功能。比如，可以通过 setTimeout 设置一个 10 秒后无论如何都会拒绝期约的回调：

```javascript
let p = new Promise((resolve, reject) => {
    setTimeout(reject, 10000); // 11 秒后再检查状态
});

console.asyncLog(p); // Promise <pending>
setTimeout(console.log, 11000, p); // 11 秒后再检查状态

//（After 10 seconds）Uncaught error
//（After 11 seconds）Promise <rejected>
```

因为期约的状态只能改变一次，所以这里的超时拒绝逻辑可以放心地设置让期约处于待定状态地最长时间。如果执行器中的代码在超时之前已经解决或拒绝，那么超时回调再尝试拒绝也会静默失败。

### 4. Promise.resolve()

期约并非一开始必须处于待定状态，然后通过执行器函数才能转换为落定状态。通过调用 Promise.resolve() 静态方法，可以实例化一个兑现的期约。下面两个期约实例实际上是一样的：

```javascript
let p1 = new Promise((resolve, reject) => resolve());
let p2 = Promise.resolve();
```

这个兑现的期约的值对应着传给 Promise.resolve() 的第一个参数。使用这个静态方法，实际上可以把任何值都转换为一个期约：

```javascript
console.asyncLog(Promise.resolve());
// Promise <fulfilled>: undefined

console.asyncLog(Promise.resolve(3));
// Promise <fulfilled>: 3

// 多余的参数会忽略
console.asyncLog(Promise.resolve(4, 5, 6));
// Promise <fulfilled>: 4
```

对这个静态方法而言，如果传入的参数本身是一个期约，那它的行为就类似于一个空包装。因此，Promise.resolve() 可以说是一个幂等方法，如下所示：

```javascript
let p = Promise.resolve(7);

console.log(p === Promise.resolve(p));
// true

console.log(p === Promise.resolve(Promise.resolve(p)));
// true
```

这个幂等性会保留传入期约的状态：

```javascript
let p = new Promise(() => {});

console.asyncLog(p); // Promise <pending>
console.asyncLog(Promise.resolve(p)); // Promise <pending>

console.asyncLog(p === Promise.resolve(p)); // true
```

注意，这个静态方法能够包装任何非期约值，包括错误对象，并将其转换为兑现的期约。因此，也可能导致不符合预期的行为：

```javascript
let p = Promise.resolve(new Error('foo'));

console.asyncLog(p); // Promise <fulfilled>: Error: foo
```

### 5. Promise.reject()

与 Promise.resolve() 类似，Promise.reject() 会实例化一个拒绝的期约并抛出一个异步错误（这个错误不能通过 try/catch 捕获，只能通过拒绝处理程序捕获）。下面的两个期约实例实际上是一样的：

```javascript
let p1 = new Promise((resolve, reject) => reject());
let p2 = Promise.reject();
```

这个拒绝的期约的理由就是传给 Promise.reject() 的第一个参数。这个参数也会传给后续的拒绝处理程序：

```javascript
let p = Promise.reject(3);
console.asyncLog(p); // Promise <rejected>: 3

p.then(undefined, (e) => console.asyncLog(e)); // 3
```

关键在于，Promise.reject() 并没有照搬 Promise.resolve() 的幂等逻辑。如果给它传一个期约对象，则这个期约会成为它返回的拒绝期约的理由：

```javascript
console.asyncLog(Promise.reject(Promise.resolve()));
// Promise <rejected>: Promose <fulfilled>
```

### 6. 同步/异步执行的二元性

Promise 的设计很大程度上会导致一种完全不同于 JavaScript 的计算模式。下面的例子完美地展示了这一点，其中包含了两种模式下抛出错误的情形：

```javascript
try {
    throw new Error('foo');
} catch(e) {
    console.log(e); // Error: foo
}

try {
    Promise.reject(new Error('bar'));
} catch(e) {
    console.log(e);
}
// Uncaught (in promise) Error: bar
```

第一个 try/catch 抛出并捕获了错误，第二个 try/catch 抛出错误却没有捕获到。乍一看这可能有点违反直觉，因为代码中确实是同步创建了一个拒绝的期约实例，而这个实例也抛出了包含拒绝理由的错误。这里的同步代码之所以没有捕获期约抛出的错误，是因为它没有通过异步模式捕获错误。从这里就可以看出期约真正的异步特性：它们是同步对象（在同步执行模式中使用），但也是异步执行模式的媒介。

在前面的例子中，拒绝期约的错误并没有抛到执行同步代码的线程里，而是通过浏览器异步消息队列来处理的。因此，try/catch 块并不能捕获该错误。代码一旦开始以异步模式执行，则唯一与之交互的方式就是使用异步结构，更具体地说，就是期约的方法。

## 3. 期约的实例方法

期约实例的方法是连接外部同步代码与内部异步代码的桥梁。这些方法可以访问异步操作返回的数据、处理期约成功和失败的结果、连续对期约求值，或者添加只有期约进入终止状态时才会执行的代码。

### 1. 实现 Thenable 接口

在 ECMAScript 暴露的异步结构中，任何对象都有一个 then() 方法。这个方法被认为实现了 Thenable 接口。下面的例子展示了实现这一接口的最简单的类：

```javascript
class MyThenable {
    then() {}
}
```

ECMAScript 的 Promise 类型实现了 Thenable 接口。这个简化的接口跟 TypeScript 或其他包中的接口或类型定义不同，它们都设定了 Thenable 接口更具体的形式。

>注意
>
>本章后面再介绍异步函数时还会再谈到 Thenable 接口的用途和目的。

### 2. 使用 Promise.prototype.then()

Promise.prototype.then() 是为期约实例添加处理程序的主要方法，这个 then() 方法最多接收两个参数：onFulfilled 处理程序和 onRejected 处理程序。这两个参数都是可选的，如果提供的话，则会在期约分别进入兑现和拒绝状态时执行。

```javascript
function onFulfilled(id) {
    console.asyncLog(id, 'fulfilled');
}
function onRejected(id) {
    console.asyncLog(id, 'rejected');
}

let p1 = new Promise((resolve, reject) => setTimeout(resolve, 3000));
let p2 = new Promise((resolve, reject) => setTimeout(reject, 3000));

p1.then(() => onFulfilled('p1'),
        () => onRejected('p1'));
p2.then(() => onFulfilled('p2'),
       	() => onRejected('p2'));

//（3 秒后）
// p1 fulfilled
// p2 rejected
```

因为期约只能转换为最终状态一次，所以这两个操作一定是互斥的。

如前所述，两个处理程序参数都是可选的。而且，传给 then() 的任何非函数类型的参数都会被静默忽略。如果想只提供 onRejected 参数，那就要在 onFulfilled 参数的位置上传 null 或 undefined。这样有助于避免在内存中创建多余的对象，对期待函数参数的类型系统也是一个交代。

```javascript
function onFulfilled(id) {
    console.asyncLog(id, 'fulfilled');
}
function onRejected(id) {
    console.asyncLog(id, 'rejected');
}

let p1 = new Promise((resolve, reject) => setTimeout(resolve, 3000));
let p2 = new Promise((resolve, reject) => setTimeout(reject, 3000));

// 非函数处理程序会被静默忽略，不推荐
p1.then('gobbeltygook');

// 不传 onFulfilled 处理程序的规范写法
p2.then(null, () => onRejected('p2'));

// p2 rejected（3 秒后）
```

Promise.prototype.then() 方法返回一个新的期约实例：

```javascript
let p1 = new Promise(() => {});
let p2 = p1.then();
console.asyncLog(p1); // Promise <pending>
console.asyncLog(p2); // Promise <pending>
console.asyncLog(p1 === p2); // false
```







































































