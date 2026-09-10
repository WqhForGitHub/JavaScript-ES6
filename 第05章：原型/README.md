# 5.1 [[Prototype]]

JavaScript 中的对象有一个特殊的 [[Prototype]] 内置属性，其实就是对于其他对象的引用。几乎所有的对象在创建时 [[Prototype]] 属性都会被赋予一个非空的值。
注意：很快我们就可以看到，对象的 [[Prototype]]链接可以为空，虽然很少见。
思考下面的代码：
```javascript
var myObject = {
	a: 2
};

myObject.a; // 2 
```
[[Prototype]] 引用有什么用呢？在第 3 章中我们说过，当你试图引用对象的属性时会触发 [[Get]] 操作，比如 myObject.a。对于默认的 [[Get]] 操作来说，第一步是检查对象本身是否有这个属性，如果有的话就使用它。
>ES6 中的 Proxy 超出了本书的范围（但是在本系列之后的书中会介绍），但是要注意，如果包含 Proxy 的话，我们这里对 [[Get]] 和 [[Put]] 的讨论就不适用。

但是如果 a 不在 myObject 中，就需要使用对象的 [[Prototype]] 链了。
对于默认的 [[Get]] 操作来说，如果无法在对象本身找到需要的属性，就会继续访问对象的 [[Prototype]] 链：
```javascript
var anotherObject = {
	a: 2
};

// 创建一个关联到 anotherObject 的对象
var myObject = Object.create(anotherObject);

myObject.a; // 2
```
>稍后我们会介绍 Object.create(..)的原理，现在只需要知道它会创建一个对象并把这个对象的 [[Prototype]] 关联到指定的对象。

现在 myObject 对象的 [[Prototype]] 关联到了 anotherObject。显然 myObject.a 并不存在，但是尽管如此，属性访问仍然成功地（在 anotherObject 中）找到了值 2。

但是，如果 anotherObject 中也找不到 a 并且 [[Prototype]] 链不为空的话，就会继续查找下去。

这个过程会持续到找到匹配的属性名或者查找完整条 [[Prototype]] 链。如果是后者的话，[[Get]] 操作的返回值是 undefined。

使用 for..in 遍历对象时原理和查找 [[Prototype]] 链类似，任何可以通过原型链访问到（并且是 enumerable，参见第 3 章）的属性都会被枚举。使用 in 操作符来检查属性在对象中是否存在时，同样会查找对象的整条原型链（无论属性是否可枚举）：
```javascript
var anotherObject = {
	a: 2
};

// 创建一个关联到 anotherObject 的对象
var myObject = Object.create(anotherObject);

for (var k in myObject) {
	console.log("found: " + k);
}
// found: a

("a" in myObject); // true
```
因此，当你通过各种语法进行属性查找时都会查找 [[Prototype]] 链，直到找到属性或者查找完整条原型链。
## 5.1.1 Object.prototype

但是到哪里是 [[Prototype]] 的尽头呢？

所有普通的 [[Prototype]] 链最终都会指向内置的 Object.prototype。由于所有的普通（内置，不是特定主机的扩展）对象都源于（或者说把 [[Prototype]]）链的顶端设置为）这个 Object.prototype 对象，所以它包含 JavaScript 中许多通用的功能。

有些功能你应该已经很熟悉了，比如说 `.toString()` 和 `.valueOf()`，第 3 章还介绍过 `.hasOwnProperty(..)`。稍后我们还会介绍 `.isPrototypeOf(...)`，这个你可能不太熟悉。
## 5.1.2 属性设置和屏蔽

第 3 章提到过，给一个对象设置属性并不仅仅是添加一个新属性或者修改已有的属性值。现在我们完整地讲解一下这个过程：
```javascript
myObject.foo = "bar";
```
如果 myObject 对象中包含名为 foo 的普通数据访问属性，这条赋值语句只会修改已的属性值。

如果 foo 不是直接存在于 myObject 中，[[Prototype]] 链就会被遍历，类似 [[Get]] 操作。如果原型链上找不到 foo，foo 就会被直接添加到 myObject 上。

然而，如果 foo 存在于原型链上层，赋值语句 myObject.foo = "bar" 的行为就会有些不同（而且可能很出人意料）。稍后我们会进行介绍。

如果属性名 foo 既出现在 myObject 中也出现在 myObject 中也出现在 myObject 的 [[Prototype]] 链上层，那么就会发生屏蔽。myObject 中包含的 foo 属性会屏蔽原型脸上层的所有 foo 属性，因为 myObject.foo 总是会选择原型链中最底层的 foo 属性。

屏蔽比我们想象中更加复杂。下面我们分析一下如果 foo 不直接存在于 myObject 中而是存在于原型链上层时 myObject.foo = "bar" 会出现的三种情况。
1. 如果在 [[Prototype]] 链上层存在名为 foo 的普通数据访问属性（参见第 3 章）并且没有被标记为只读（writable: false），那就会直接在 myObject 中添加一个名为 foo 的新属性，它是屏蔽属性。
2. 如果在 [[Prototype]] 链上层存在 foo，但是它被标记为只读（writable: false）。那么无法修改已有属性或者在 myObject 上创建屏蔽属性。如果运行在严格模式下，代码会抛出一个错误。否则，这条赋值语句会被忽略。总之，不会发生屏蔽。
3. 如果在 [[Prototype]] 链上层存在 foo 并且它是一个 setter（参见第 3 章），那就一定会调用这个 setter。foo 不会被添加到（或者说屏蔽于）myObject，也不会重新定义 foo 这个 setter。

大多数开发者都认为如果向 [[Prototype]] 链上层已经存在的属性（[[Put]]）赋值，就一定会触发屏蔽，但是如你所见，三种情况中只有一种（第一种）是这样的。

如果你希望在第二种和第三种情况下也屏蔽 foo，那就不你能使用 = 操作符来赋值，而是使用 Object.deifneProperty(..)（参见第 3 章）来向 myObject 添加 foo。
>第二种情况可能是最令人意外的，只读属性会阻止 [[Prototype]] 链下层隐式（屏蔽）同名属性。这样做主要是为了模拟类属性的继承。你可以把原型链上层的 foo 看作是父类中的属性，它会被 myObject 继承（复制），这样一来 myObject 中的 foo 属性也是只读，所以无法创建。但是一定要注意，实际上并不会发生类似d的继承复制（参见第 4 章和 第 5 章）。这看起来有点奇怪，myObject 对象竟然会因为其他对象中有一个只读 foo 就不能包含 foo 属性。更奇怪的是，这个限制只存在于 = 赋值中，使用 Object.defineProperty(..) 并不会收到影响。

如果需要对屏蔽方法进行委托的话就不得不使用丑陋的显式伪多态（参见第 4 章）。通常来说，使用屏蔽得不偿失，所以应当尽量避免使用。第 6 章会介绍另一种不适用屏蔽的更加简洁的设计模式。
有些情况下会隐式产生屏蔽，一定要当心。思考下面的代码：
```javascript
var anotherObject = {
	a: 2
};

var myObject = Object.create(anotherObject);

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty("a"); // true
myObject.hasOwnProperty("a"); // false

myObject.a++; // 隐式屏蔽

anotherObject.a; // 2
myObject.a; // 3

myObject.hasOwnProperty("a"); // true
```
尽管 myObject.a++ 看起来应该（通过委托）查找并增加 anotherObject,a 属性，但是别忘了 ++ 操作相当于 myObject.a = myObject.a + 1。因此 ++ 操作首先会通过 [[Prototype]] 查找属性 a 赋给 myObject 中新建的屏蔽属性属性 a，天呐。
修改委托属性时一定要小心。如果想让 anotherObject.a 的追增加，唯一的办法是 antherObject.a++。
# 5.2 类

现在你可能会很好奇：为什么一个对象需要关联到另一个对象？这样做有什么好处？这个问题非常好啊，但是在回答之前我们首先要理解 [[Prototype]] 不是什么。

第 4 章中我们说过，JavaScript 和面向类的语言不同，它并没有类来作为对象的抽象模式或者说蓝图。JavaScript 中只有对象。

实际上，JavaScript 才是真正应该被称为面向对象的语言，因为它是少有的可以不通过类，直接创建对象的语言。
## 5.2.1 类函数

多年以来，JavaScript 中有一种奇怪的行为一直在被无耻地滥用，那就是模仿类。我们会仔细分析这种方法。

这种奇怪的类似类的行为利用了函数的一种特殊特性：所有的函数默认都会拥有一个名为 prototype 的公有并且不可枚举（参见第 3 章）的属性，它会指向另一个对象：
```javascript
function foo() {
	// ...
}

Foo.prototype; // { }
```
这个对象通常被称为 Foo 的原型，因为我们通过名为 Foo.prototype 的属性引用来访问它。然而不幸的是，这个术语对我们造成了极大的误导，稍后我们就会看到。如果是我的话就会叫它之前被称为 Foo 的原型的那个对象。好吧我是开玩笑的，你觉得被贴上 Foo点prototype 标签的对象这个名字怎么样？

抛开名字不谈，这个对象到底是什么？

最直接的解释就是，通过调用 new Foo()（参见第 2 章）创建的每个对象将最终（有点武断地）被 [[Prototype]] 链接到这个 Foo.prototype 对象。

我们在验证一下：
```javascript
function Foo() {
	// ...
}

var a = new Foo();

Object.getPrototypeOf(a) === Foo.prototype; // true
```
调用 new Foo() 时会创建 a（具体的 4 个步骤参见第 2 章节），其中你一步就是将 a 内部的 [[Protoytpe]] 链接到 Foo.prototype 所指向的对象。

暂停一下，仔细思考这条语句的含义。

在面向类的语言中，类可以被复制（或者说实例化）多次，就像用模具制作东西一样。我们在第 4 章中看到过，之所以会这样是因为实例化（或者继承）一个类就意味着把类的行为复制到物理对象中，对于每一个新实例来说都会重复这个过程。

但是在 JavaScript 中，并没有类似的复制机制。你不能创建一个类的多个实例，只能创建多个对象，它们 [[Prototype]] 关联的是同一个对象，但是在默认情况下并不会进行复制，因此这些对象之间并不会完全失去联系，它们是互相关联的。

new Foo() 会生成一个新对象（我们称之为 a），这个新对象的内部链接 [[Prototype]] 关联的是 Foo.protoytpe 对象。

最后我们得到了两个对象，它们之间互相关联，就是这样。我们并没d有初始化一个类，实际上我们并没有从类中复制任何行为到一个对象中，只是让两个对象互联关联。

实际上，绝大多数 JavaScript 开发者不知道的秘密是，new Foo() 这个函数调用实际上并没有直接创建关联，这个关联只是一个意外的副作用。new Foo() 只是间接完成了我们的目标：一个关联到其他对象的新对象。

那么有没有更直接的方法来做到这一点呢？当然，功臣就是 Object.create(...)，不过我们现在暂时不介绍它。






















