虽然 JavaScript 是一门完整的面向对象的编程语言，但这门语言同时也拥有许多函数式语言的特性。

函数式语言的鼻祖是 LISP，JavaScript 在设计之初参考了 LISP 两大方言之一的 Scheme，引入了 Lambda 表达式、闭包、高阶函数等特性。使用这些特性，我们经常可以用一些灵活而巧妙的方式来编写 JavaScript 代码。

本章主要挑选了闭包和高阶函数进行讲解。在 JavaScript 版本的设计模式中，许多模式都可以用闭包和高阶函数来实现。

# 3.1 闭包

对于 JavaScript 程序员来说，闭包（closure）是一个难懂又必须征服的概念。闭包的形成与变量的作用域以及变量的生存周期密切相关。下面我们先简单了解这两个知识点。

## 3.1.1 变量的作用域

变量的作用域，就是指变量的有效范围。我们最常谈到的是在函数中声明的变量作用域。

当在函数中声明一个变量的时候，如果该变量前面没有带上关键字 var，这个变量就会成为全局变量，这当然是一种容易造成命名冲突的做法。

另外一种情况是用 var 关键字在函数中声明变量，这时候的变量即是局部变量，只有在该函数内部才能访问到这个变量，在函数外面是访问不到的。代码如下：

```javascript
var func = function(){
  var a = 1;
  alert( a );  // 输出：1
};
```

```javascript
func();
alert( a );  // 输出：Uncaught ReferenceError: a is not defined
```

在 JavaScript 中，函数可以用来创造函数作用域。此时的函数像一层半透明的玻璃，在函数里面可以看到外面的变量，而在函数外面则无法看到函数里面的变量。这是因为当在函数中搜索一个变量的时候，如果该函数内并没有声明这个变量，那么此次搜索的过程会随着代码执行环境创建的作用域链往外层逐层搜索，一直搜索到全局对象为止。变量的搜索是从内到外而非从外到内的。

下面这段包含了嵌套函数的代码，也许能帮助我们加深对变量搜索过程的理解：

```javascript
var a = 1;
var func1 = function(){
  var b = 2;
  var func2 = function(){
    var c = 3;
    alert( b );  // 输出：2
    alert( a );  // 输出：1
  }
  func2();
  alert( c );  // 输出：Uncaught ReferenceError: c is not defined
};
func1();
```

## 3.1.2 变量的生存周期

除了变量的作用域之外，另外一个跟闭包有关的概念是变量的生存周期。

对于全局变量来说，全局变量的生存周期当然是永久的，除非我们主动销毁这个全局变量。

而对于在函数内用 var 关键字声明的局部变量来说，当退出函数时，这些局部变量即失去了它们的价值，它们都会随着函数调用的结束而被销毁：

```javascript
var func = function(){
  var a = 1;  // 退出函数后局部变量a将被销毁
  alert( a );
};
func();
```

现在来看看下面这段代码：

```javascript
var func = function(){
  var a = 1;
  return function(){
    a++;
    alert( a );
  }
};
var f = func();
f();  // 输出：2
f();  // 输出：3
f();  // 输出：4
f();  // 输出：5
```

跟我们之前的推论相反，当退出函数后，局部变量 a 并没有消失，而是似乎一直在某个地方存活着。这是因为当执行 var f = func (); 时，f 返回了一个匿名函数的引用，它可以访问到 func () 被调用时产生的环境，而局部变量 a 一直处在这个环境里。既然局部变量所在的环境还能被外界访问，这个局部变量就有了不被销毁的理由。在这里产生了一个闭包结构，局部变量的生命看起来被延续了。

利用闭包我们可以完成许多奇妙的工作，下面介绍一个闭包的经典应用。假设页面上有 5 个 div 节点，我们通过循环来给每个 div 绑定 onclick 事件，按照索引顺序，点击第 1 个 div 时弹出 0，点击第 2 个 div 时弹出 1，以此类推。代码如下：

```html
<html>
  <body>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <script>
      var nodes = document.getElementsByTagName( 'div' );
      for ( var i = 0, len = nodes.length; i < len; i++ ){
        nodes[ i ].onclick = function(){
          alert( i );
        }
      };
    </script>
  </body>
</html>
```

测试这段代码就会发现，无论点击哪个 div，最后弹出的结果都是 5。这是因为 div 节点的 onclick 事件是被异步触发的，当事件被触发的时候，for 循环早已结束，此时变量 i 的值已经是 5，所以在 div 的 onclick 事件函数中顺着作用域链从内到外查找变量 i 时，查找到的值总是 5。

解决方法是在闭包的帮助下，把每次循环的 i 值都封闭起来。当在事件函数中顺着作用域链中从内到外查找变量 i 时，会先找到被封闭在闭包环境中的 i，如果有 5 个 div，这里的 i 就分别是 0,1,2,3,4：

```javascript
for ( var i = 0, len = nodes.length; i < len; i++ ){
  (function( i ){
    nodes[ i ].onclick = function(){
      console.log(i);
    }
  })( i )
};
```

根据同样的道理，我们还可以编写如下一段代码：

```javascript
var Type = {};
for ( var i = 0, type; type = [ 'String', 'Array', 'Number' ][ i++ ]; ){
  (function( type ){
    Type[ 'is' + type ] = function( obj ){
      return Object.prototype.toString.call( obj ) === '[object ' + type + ']';
    }
  })( type )
};
Type.isArray( [] );  // 输出：true
Type.isString( "str" );  // 输出：true
```

## 3.1.3 闭包的更多作用

这一小节我们将通过几个例子，进一步讲解闭包的作用。因为篇幅所限，这里仅例举少量示例。在实际开发中，闭包的运用非常广泛。

1. 封装变量

闭包可以帮助把一些不需要暴露在全局的变量封装成 “私有变量”。假设有一个计算乘积的简单函数：

```javascript
var mult = function(){
  var a = 1;
  for ( var i = 0, l = arguments.length; i < l; i++ ){
    a = a * arguments[i];
  }
  return a;
};
```

mult 函数接受一些 number 类型的参数，并返回这些参数的乘积。现在我们觉得对于那些相同的参数来说，每次都进行计算是一种浪费，我们可以加入缓存机制来提高这个函数的性能：

```javascript
var cache = {};
var mult = function(){
  var args = Array.prototype.join.call( arguments, ',' );
  if ( cache[ args ] ){
    return cache[ args ];
  }
  var a = 1;
  for ( var i = 0, l = arguments.length; i < l; i++ ){
    a = a * arguments[i];
  }
  return cache[ args ] = a;
};
alert( mult( 1,2,3 ) );  // 输出：6
alert( mult( 1,2,3 ) );  // 输出：6
```

我们看到 cache 这个变量仅仅在 mult 函数中被使用，与其让 cache 变量跟 mult 函数一起平行地暴露在全局作用域下，不如把它封闭在 mult 函数内部，这样可以减少页面中的全局变量，以避免这个变量在其他地方被不小心修改而引发错误。代码如下：

```javascript
var mult = (function(){
  var cache = {};
  return function(){
    var args = Array.prototype.join.call( arguments, ',' );
    if ( args in cache ){
      return cache[ args ];
    }
    var a = 1;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
      a = a * arguments[i];
    }
    return cache[ args ] = a;
  }
})();
```

提炼函数是代码重构中的一种常见技巧。如果在一个大函数中有一些代码块能够独立出来，我们常常把这些代码块封装在独立的小函数里面。独立出来的小函数有助于代码复用，如果这些小函数有一个良好的命名，它们本身也起到了注释的作用。如果这些小函数不需要在程序的其他地方使用，最好是把它们用闭包封闭起来。代码如下：

```javascript
var mult = (function(){
  var cache = {};
  var calculate = function(){  // 封闭calculate函数
    var a = 1;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
      a = a * arguments[i];
    }
    return a;
  };
  return function(){
    var args = Array.prototype.join.call( arguments, ',' );
    if ( args in cache ){
      return cache[ args ];
    }
    return cache[ args ] = calculate.apply( null, arguments );
  }
})();
```

2. 延续局部变量的寿命

img 对象常用于进行数据上报，如下所示：

```javascript
var report = function( src ){
  var img = new Image();
  img.src = src;
};
report( 'http://xxx.com/getUserInfo' );
```

但是通过查询后台的记录我们得知，因为一些低版本浏览器的实现存在 bug，在这些浏览器下使用 report 函数进行数据上报会丢失 30% 左右的数据，也就是说，report 函数并不是每一次都成功发起了 HTTP 请求。丢失数据的原因是 img 是 report 函数中的局部变量，当 report 函数的调用结束后，img 局部变量随即被销毁，而此时或许还没来得及发出 HTTP 请求，所以此次请求就会丢失掉。

现在我们把 img 变量用闭包封闭起来，便能解决请求丢失的问题：

```javascript
var report = (function(){
  var imgs = [];
  return function( src ){
    var img = new Image();
    imgs.push( img );
    img.src = src;
  }
})();
```

## 3.1.4 闭包和面向对象设计

过程与数据的结合是形容面向对象中的 “对象” 时经常使用的表达。对象以方法的形式包含了过程，而闭包则是在过程中以环境的形式包含了数据。通常用面向对象思想能实现的功能，用闭包也能实现。反之亦然。在 JavaScript 语言的祖先 Scheme 语言中，甚至都没有提供面向对象的原生设计，但可以使用闭包来实现一个完整的面向对象系统。

下面来看看这段跟闭包相关的代码：

```javascript
var extent = function(){
  var value = 0;
  return {
    call: function(){
      value++;
      console.log( value );
    }
  }
};
var extent = extent();
extent.call();  // 输出：1
extent.call();  // 输出：2
extent.call();  // 输出：3
```

如果换成面向对象的写法，就是：

```javascript
var extent = {
  value: 0,
  call: function(){
    this.value++;
    console.log( this.value );
  }
};
extent.call();  // 输出：1
extent.call();  // 输出：2
extent.call();  // 输出：3
```

或者：

```javascript
var Extent = function(){
  this.value = 0;
};
Extent.prototype.call = function(){
  this.value++;
  console.log( this.value );
};
var extent = new Extent();
extent.call();
extent.call();
extent.call();
```

## 3.1.5 用闭包实现命令模式

在 JavaScript 版本的各种设计模式实现中，闭包的运用非常广泛，在后续的学习过程中，我们将体会到这一点。

在完成闭包实现的命令模式之前，我们先用面向对象的方式来编写一段命令模式的代码。虽然还没有进入设计模式的学习，但这个作为演示作用的命令模式结构非常简单，不会对我们的理解造成困难，代码如下：

```html
<html>
  <body>
    <button id="execute">点击我执行命令</button>
    <button id="undo">点击我执行命令</button>
    <script>
      var Tv = {
        open: function(){
          console.log( '打开电视机' );
        },
        close: function(){
          console.log( '关闭电视机' );
        }
      };
      var OpenTvCommand = function( receiver ){
        this.receiver = receiver;
      };
      OpenTvCommand.prototype.execute = function(){
        this.receiver.open();  // 执行命令，打开电视机
      };
      OpenTvCommand.prototype.undo = function(){
        this.receiver.close();  // 撤销命令，关闭电视机
      };
      var setCommand = function( command ){
        document.getElementById( 'execute' ).onclick = function(){
          command.execute();  // 输出：打开电视机
        }
        document.getElementById( 'undo' ).onclick = function(){
          command.undo();  // 输出：关闭电视机
        }
      };
      setCommand( new OpenTvCommand( Tv ) );
    </script>
  </body>
</html>
```

命令模式的意图是把请求封装为对象，从而分离请求的发起者和请求的接收者（执行者）之间的耦合关系。在命令被执行之前，可以预先往命令对象中植入命令的接收者。

但在 JavaScript 中，函数作为一等对象，本身就可以四处传递，用函数对象而不是普通对象来封装请求显得更加简单和自然。如果需要往函数对象中预先植入命令的接收者，那么闭包可以完成这个工作。在面向对象版本的命令模式中，预先植入的命令接收者被当成对象的属性保存起来；而在闭包版本的命令模式中，命令接收者会被封闭在闭包形成的环境中，代码如下：

```javascript
var Tv = {
  open: function(){
    console.log( '打开电视机' );
  },
  close: function(){
    console.log( '关闭电视机' );
  }
};
var createCommand = function( receiver ){
  var execute = function(){
    return receiver.open();  // 执行命令，打开电视机
  }
  var undo = function(){
    return receiver.close();  // 执行命令，关闭电视机
  }
  return {
    execute: execute,
    undo: undo
  }
};
var setCommand = function( command ){
  document.getElementById( 'execute' ).onclick = function(){
    command.execute();  // 输出：打开电视机
  }
  document.getElementById( 'undo' ).onclick = function(){
    command.undo();  // 输出：关闭电视机
  }
};
setCommand( createCommand( Tv ) );
```

## 3.1.6 闭包与内存管理

闭包是一个非常强大的特性，但人们对其也有诸多误解。一种耸人听闻的说法是闭包会造成内存泄露，所以要尽量减少闭包的使用。

局部变量本来应该在函数退出的时候被解除引用，但如果局部变量被封闭在闭包形成的环境中，那么这个局部变量就能一直生存下去。从这个意义上看，闭包的确会使一些数据无法被及时销毁。使用闭包的一部分原因是我们选择主动把一些变量封闭在闭包中，因为可能在以后还需要使用这些变量，把这些变量放在闭包中和放在全局作用域，对内存方面的影响是一致的，这里并不能说成是内存泄露。如果在将来需要回收这些变量，我们可以手动把这些变量设为 null。

跟闭包和内存泄露有关系的地方是，使用闭包的同时比较容易形成循环引用，如果闭包的作用域链中保存着一些 DOM 节点，这时候就有可能造成内存泄露。但这本身并非闭包的问题，也并非 JavaScript 的问题。在 IE 浏览器中，由于 BOM 和 DOM 中的对象是使用 C++ 以 COM 对象的方式实现的，而 COM 对象的垃圾收集机制采用的是引用计数策略。在基于引用计数策略的垃圾回收机制中，如果两个对象之间形成了循环引用，那么这两个对象都无法被回收，但循环引用造成的内存泄露在本质上也不是闭包造成的。

同样，如果要解决循环引用带来的内存泄露问题，我们只需要把循环引用中的变量设为 null 即可。将变量设置为 null 意味着切断变量与它此前引用的值之间的连接。当垃圾收集器下次运行时，就会删除这些值并回收它们占用的内存。

# 3.2 高阶函数

高阶函数是指至少满足下列条件之一的函数。

- 函数可以作为参数被传递；
- 函数可以作为返回值输出。

JavaScript 语言中的函数显然满足高阶函数的条件，在实际开发中，无论是将函数当作参数传递，还是让函数的执行结果返回另外一个函数，这两种情形都有很多应用场景，下面就列举一些高阶函数的应用场景。

## 3.2.1 函数作为参数传递

把函数当作参数传递，这代表我们可以抽离出一部分容易变化的业务逻辑，把这部分业务逻辑放在函数参数中，这样一来可以分离业务代码中变化与不变的部分。其中一个重要应用场景就是常见的回调函数。

### 1. 回调函数

在 ajax 异步请求的应用中，回调函数的使用非常频繁。当我们想在 ajax 请求返回之后做一些事情，但又并不知道请求返回的确切时间时，最常见的方案就是把 callback 函数当作参数传入发起 ajax 请求的方法中，待请求完成之后执行 callback 函数：

```javascript
var getUserInfo = function( userId, callback ){
  $.ajax( 'http://xxx.com/getUserInfo?userId=' + userId, function( data ){
    if ( typeof callback === 'function' ){
      callback( data );
    }
  });
};
getUserInfo( 13157, function( data ){
  alert( data.userName );
});
```

回调函数的应用不仅只在异步请求中，当一个函数不适合执行一些请求时，我们也可以把这些请求封装成一个函数，并把它作为参数传递给另外一个函数，“委托” 给另外一个函数来执行。

比如，我们想在页面中创建 100 个 div 节点，然后把这些 div 节点都设置为隐藏。下面是一

种编写代码的方式：

```javascript
var appendDiv = function(){
  for ( var i = 0; i < 100; i++ ){
    var div = document.createElement( 'div' );
    div.innerHTML = i;
    document.body.appendChild( div );
    div.style.display = 'none';
  }
};
appendDiv();
```

把 `div.style.display = 'none'` 的逻辑硬编码在 `appendDiv` 里显然是不合理的，`appendDiv` 未免有点个性化，成为了一个难以复用的函数，并不是每个人创建了节点之后就希望它们立刻被隐藏。

于是我们把 `div.style.display = 'none'` 这行代码抽出来，用回调函数的形式传入 `appendDiv` 方法：

```javascript
var appendDiv = function( callback ){
  for ( var i = 0; i < 100; i++ ){
    var div = document.createElement( 'div' );
    div.innerHTML = i;
    document.body.appendChild( div );
    if ( typeof callback === 'function' ){
      callback( div );
    }
  }
};
appendDiv(function( node ){
  node.style.display = 'none';
});
```

可以看到，隐藏节点的请求实际上是由客户发起的，但是客户并不知道节点什么时候会创建好，于是把隐藏节点的逻辑放在回调函数中，“委托” 给 `appendDiv` 方法。`appendDiv` 方法当然知道节点什么时候创建好，所以在节点创建好的时候，`appendDiv` 会执行之前客户传入的回调函数。

### 2. Array.prototype.sort

`Array.prototype.sort` 接受一个函数当作参数，这个函数里面封装了数组元素的排序规则。从 `Array.prototype.sort` 的使用可以看到，我们的目的是对数组进行排序，这是不变的部分；而使用什么规则去排序，则是可变的部分。把可变的部分封装在函数参数里，动态传入 `Array.prototype.sort`，使 `Array.prototype.sort` 方法成为了一个非常灵活的方法，代码如下：

```javascript
// 从小到大排列
[ 1, 4, 3 ].sort( function( a, b ){
  return a - b;
});
// 输出：[ 1, 3, 4 ]

// 从大到小排列
[ 1, 4, 3 ].sort( function( a, b ){
  return b - a;
});
// 输出：[ 4, 3, 1 ]
```

## 3.2.2 函数作为返回值输出

相比把函数当作参数传递，函数当作返回值输出的应用场景也许更多，也更能体现函数式编程的巧妙。让函数继续返回一个可执行的函数，意味着运算过程是可延续的。

### 1. 判断数据的类型

我们来看看这个例子，判断一个数据是否是数组，在以往的实现中，可以基于鸭子类型的概念来判断，比如判断这个数据有没有 `length` 属性，有没有 `sort` 方法或者 `slice` 方法等。但更好的方式是用 `Object.prototype.toString` 来计算。`Object.prototype.toString.call( obj )` 返回一个字符串，比如 `Object.prototype.toString.call( [1,2,3] )` 总是返回 `"[object Array]"`，而 `Object.prototype.toString.call( "str" )` 总是返回 `"[object String]"`。所以我们可以编写一系列的 `isType` 函数。代码如下：

```javascript
var isString = function( obj ){
  return Object.prototype.toString.call( obj ) === '[object String]';
};
var isArray = function( obj ){
  return Object.prototype.toString.call( obj ) === '[object Array]';
};
var isNumber = function( obj ){
  return Object.prototype.toString.call( obj ) === '[object Number]';
};
```

我们发现，这些函数的大部分实现都是相同的，不同的只是 `Object.prototype.toString.call( obj )` 返回的字符串。为了避免多余的代码，我们尝试把这些字符串作为参数提前植入 `isType` 函数。代码如下：

```javascript
var isType = function( type ){
  return function( obj ){
    return Object.prototype.toString.call( obj ) === '[object ' + type + ']';
  };
};
```

```javascript
var isString = isType( 'String' );
var isArray = isType( 'Array' );
var isNumber = isType( 'Number' );

console.log( isArray( [ 1, 2, 3 ] ) );  // 输出：true
```

我们还可以用循环语句，来批量注册这些 `isType` 函数：

```javascript
var Type = {};
for ( var i = 0, type; type = [ 'String', 'Array', 'Number' ][ i++ ]; ){
  (function( type ){
    Type[ 'is' + type ] = function( obj ){
      return Object.prototype.toString.call( obj ) === '[object ' + type + ']';
    }
  })( type )
};
Type.isArray( [] );  // 输出：true
Type.isString( "str" );  // 输出：true
```

### 2. getSingle

下面是一个单例模式的例子，在第三部分设计模式的学习中，我们将进行更深入的讲解，这里暂且只了解其代码实现：

```javascript
var getSingle = function ( fn ) {
  var ret;
  return function () {
    return ret || ( ret = fn.apply( this, arguments ) );
  };
};
```

这个高阶函数的例子，既把函数当作参数传递，又让函数执行后返回了另外一个函数。我们可以看看 `getSingle` 函数的效果：

```javascript
var getScript = getSingle(function(){
  return document.createElement( 'script' );
});

var script1 = getScript();
var script2 = getScript();

alert( script1 === script2 );  // 输出：true
```

## 3.2.3 高阶函数实现 AOP

AOP（面向切面编程）的主要作用是把一些跟核心业务逻辑模块无关的功能抽离出来，这些跟业务逻辑无关的功能通常包括日志统计、安全控制、异常处理等。把这些功能抽离出来之后，再通过 “动态织入” 的方式掺入业务逻辑模块中。这样做的好处首先是可以保持业务逻辑模块的纯净和高内聚性，其次是可以很方便地复用日志统计等功能模块。

在 Java 语言中，可以通过反射和动态代理机制来实现 AOP 技术。而在 JavaScript 这种语言中，AOP 的实现更加简单，这是 JavaScript 与生俱来的能力。

通常，在 JavaScript 中实现 AOP，都是指把一个函数 “动态织入” 到另外一个函数之中，体的实现技术有很多，本节我们通过扩展 `Function.prototype` 来做到这一点。代码如下：

```javascript
Function.prototype.before = function( beforefn ){
  var _self = this;  // 保存原函数的引用
  return function(){  // 返回包含了原函数和新函数的“代理”函数
    beforefn.apply( this, arguments );  // 执行新函数，修正this
    return _self.apply( this, arguments );  // 执行原函数
  }
};

Function.prototype.after = function( afterfn ){
  var _self = this;
  return function(){
    var ret = _self.apply( this, arguments );
    afterfn.apply( this, arguments );
    return ret;
  }
};

var func = function(){
  console.log( 2 );
};

func = func.before(function(){
  console.log( 1 );
}).after(function(){
  console.log( 3 );
});

func();
```

我们把负责打印数字 1 和打印数字 3 的两个函数通过 AOP 的方式动态植入 `func` 函数。通过执行上面的代码，我们看到控制台顺利地返回了执行结果 1、2、3。

这种使用 AOP 的方式来给函数添加职责，也是 JavaScript 语言中一种非常特别和巧妙的装饰者模式实现。这种装饰者模式在实际开发中非常有用，我们将在第 15 章进行详细的讲解。有兴趣的读者可以提前翻阅第 15 章进行了解。

## 3.2.4 高阶函数的其他应用

前面我们已经学习过高阶函数，本节我们再挑选一些常见的高阶函数应用进行介绍。

### 1. currying

首先我们讨论的是函数柯里化（function currying）。currying 的概念最早由俄国数学家 Moses Schönfinkel 发明，而后由著名的数理逻辑学家 Haskell Curry 将其丰富和发展，currying 由此得名。

currying 又称部分求值。一个 currying 的函数首先会接受一些参数，接受了这些参数之后，该函数并不会立即求值，而是继续返回另外一个函数，刚才传入的参数在函数形成的闭包中被保存起来。待到函数被真正需要求值的时候，之前传入的所有参数都会被一次性用于求值。

从字面上理解 currying 并不太容易，我们来看下面的例子。

假设我们要编写一个计算每月开销的函数。在每天结束之前，我们都要记录今天花掉了多少钱。代码如下：

```javascript
var monthlyCost = 0;
var cost = function( money ){
  monthlyCost += money;
};
cost( 100 );  // 第1天开销
cost( 200 );  // 第2天开销
cost( 300 );  // 第3天开销
// cost( 700 );  // 第30天开销
alert ( monthlyCost );  // 输出：600
```

通过这段代码可以看到，每天结束后我们都会记录并计算到今天为止花掉的钱。但我们其实并不太关心每天花掉了多少钱，而只想知道到月底的时候会花掉多少钱。也就是说，实际上只需要在月底计算一次。

如果在每个月的前 29 天，我们都只是保存好当天的开销，直到第 30 天才进行求值计算，这样就达到了我们的要求。虽然下面的 `cost` 函数还不是一个 currying 函数的完整实现，但有助于我们了解其思想：

```javascript
var cost = (function(){
  var args = [];
  return function(){
    if ( arguments.length === 0 ){
      var money = 0;
      for ( var i = 0, l = args.length; i < l; i++ ){
        money += args[ i ];
      }
      return money;
    }else{
      [].push.apply( args, arguments );
    }
  }
})();

cost( 100 );  // 未真正求值
cost( 200 );  // 未真正求值
cost( 300 );  // 未真正求值
console.log( cost() );  // 求值并输出：600
```

接下来我们编写一个通用的 `function currying(){}`，`function currying(){}` 接受一个参数，即将要被 currying 的函数。在这个例子里，这个函数的作用遍历本月每天的开销并求出它们的总和。代码如下：

```javascript
var currying = function( fn ){
  var args = [];
  return function(){
    if ( arguments.length === 0 ){
      return fn.apply( this, args );
    }else{
      [].push.apply( args, arguments );
      return arguments.callee;
    }
  }
};

var cost = (function(){
  var money = 0;
  return function(){
    for ( var i = 0, l = arguments.length; i < l; i++ ){
      money += arguments[ i ];
    }
    return money;
  }
})();

var cost = currying( cost );  // 转化成currying函数

cost( 100 );  // 未真正求值
cost( 200 );  // 未真正求值
cost( 300 );  // 未真正求值
alert( cost() );  // 求值并输出：600
```

至此，我们完成了一个 currying 函数的编写。当调用 `cost()` 时，如果明确地带上了一些参数，表示此时并不进行真正的求值计算，而是把这些参数保存起来，此时让 `cost` 函数返回另外一个函数。只有当我们以不带参数的形式执行 `cost()` 时，才利用前面保存的所有参数，真正开始进行求值计算。

### 2. uncurrying

在 JavaScript 中，当我们调用对象的某个方法时，其实不用去关心该对象原本是否被设计为拥有这个方法，这是动态类型语言的特点，也是常说的鸭子类型思想。

同理，一个对象也未必只能使用它自身的方法，那么有什么办法可以让对象去借用一个原本不属于它的方法呢？

答案对于我们来说很简单，`call` 和 `apply` 都可以完成这个需求：

```javascript
var obj1 = {
  name: 'sven'
};
var obj2 = {
  getName: function(){
    return this.name;
  }
};
console.log( obj2.getName.call( obj1 ) );  // 输出：sven
```

我们常常让类数组对象去借用 `Array.prototype` 的方法，这是 `call` 和 `apply` 最常见的应用场景之一：

```javascript
(function(){
  Array.prototype.push.call( arguments, 4 );  // arguments借用Array.prototype.push方法
  console.log( arguments );  // 输出：[1, 2, 3, 4]
})( 1, 2, 3 );
```

在我们的预期中，`Array.prototype` 上的方法原本只能用来操作 array 对象。但用 `call` 和 `apply` 可以把任意对象当作 `this` 传入某个方法，这样一来，方法中用到 `this` 的地方就不再局限于原来规定的对象，而是加以泛化并得到更广的适用性。

`Array.prototype` 上的方法可以操作任何对象的原理可参阅 2.2 节。

那么有没有办法把泛化 `this` 的过程提取出来呢？本小节讲述的 uncurrying 就是用来解决这个问题的。uncurrying 的话题来自 JavaScript 之父 Brendan Eich 在 2011 年发表的一篇 Twitter。以下代码是 uncurrying 的实现方式之一：

```javascript
Function.prototype.uncurrying = function () {
  var self = this;
  return function() {
    var obj = Array.prototype.shift.call( arguments );
    return self.apply( obj, arguments );
  };
};
```

在讲解这段代码的实现原理之前，我们先来瞧瞧它有什么作用。

在类数组对象 `arguments` 借用 `Array.prototype` 的方法之前，先把 `Array.prototype.push.call` 这句代码转换为一个通用的 `push` 函数：

```javascript
var push = Array.prototype.push.uncurrying();
(function(){
  push( arguments, 4 );
  console.log( arguments );  // 输出：[1, 2, 3, 4]
})( 1, 2, 3 );
```

通过 uncurrying 的方式，`Array.prototype.push.call` 变成了一个通用的 `push` 函数。这样一来，`push` 函数的作用就跟 `Array.prototype.push` 一样了，同样不仅仅局限于只能操作 array 对象。而对于使用者而言，调用 `push` 函数的方式也显得更加简洁和意图明了。

我们还可以一次性地把 `Array.prototype` 上的方法 “复制” 到 `array` 对象上，同样这些方法可操作的对象也不仅仅只是 array 对象：

```javascript
for ( var i = 0, fn, ary = [ 'push', 'shift', 'forEach' ]; fn = ary[ i++ ]; ){
  Array[ fn ] = Array.prototype[ fn ].uncurrying();
};

var obj = {
  "length": 3,
  "0": 1,
  "1": 2,
  "2": 3
};

Array.push( obj, 4 );  // 向对象中添加一个元素
console.log( obj.length );  // 输出：4

var first = Array.shift( obj );  // 截取第一个元素
console.log( first );  // 输出：1
console.log( obj );  // 输出：{0: 2, 1: 3, 2: 4, length: 3}

Array.forEach( obj, function(i, n){
  console.log( n );  // 分别输出：0, 1, 2
});
```

甚至 `Function.prototype.call` 和 `Function.prototype.apply` 本身也可以被 uncurrying，不过这没有实用价值，只是使得对函数的调用看起来更像 JavaScript 语言的前身 Scheme：

```javascript
var call = Function.prototype.call.uncurrying();
var fn = function( name ){
  console.log( name );
};
call( fn, window, 'sven' );  // 输出：sven

var apply = Function.prototype.apply.uncurrying();
var fn = function( name ){
  console.log( this.name );  // 输出："sven"
  console.log( arguments );  // 输出：[1, 2, 3]
};
apply( fn, { name: 'sven' }, [ 1, 2, 3 ] );
```

目前我们已经给出了 `Function.prototype.uncurrying` 的一种实现。现在来分析调用 `Array.prototype.push.uncurrying()` 这句代码时发生了什么事情：

```javascript
Function.prototype.uncurrying = function () {
  var self = this;  // self此时是Array.prototype.push
  return function() {
    var obj = Array.prototype.shift.call( arguments );
    // obj是{
    //   "length": 1,
    //   "0": 1
    // }
    // arguments对象的第一个元素被截去，剩下[2]
    return self.apply( obj, arguments );
    // 相当于Array.prototype.push.apply( obj, 2 )
  };
};

var push = Array.prototype.push.uncurrying();
var obj = {
  "length": 1,
  "0": 1
};
push( obj, 2 );
console.log( obj );  // 输出：{0: 1, 1: 2, length: 2}
```

除了刚刚提供的代码实现，下面的代码是 uncurrying 的另外一种实现方式：

```javascript
Function.prototype.uncurrying = function(){
  var self = this;
  return function(){
    return Function.prototype.call.apply( self, arguments );
  }
};
```

### 3. 函数节流

JavaScript 中的函数大多数情况下都是由用户主动调用触发的，除非是函数本身的实现不合理，否则我们一般不会遇到跟性能相关的问题。但在一些少数情况下，函数的触发不是由用户直接控制的。在这些场景下，函数有可能被非常频繁地调用，而造成大的性能问题。下面将列举一些这样的场景。

#### (1) 函数被频繁调用的场景

- `window.onresize` 事件：我们给 `window` 对象绑定了 `resize` 事件，当浏览器窗口大小被拖动而改变的时候，这个事件触发的频率非常之高。如果我们在 `window.onresize` 事件函数里有一些跟 DOM 节点相关的操作，而跟 DOM 节点相关的操作往往是非常消耗性能的，这时候浏览器可能就会吃不消而造成卡顿现象。
- `mousemove` 事件：同样，如果我们给一个 div 节点绑定了拖曳事件（主要是 `mousemove`），当 div 节点被拖动的时候，也会频繁地触发该拖曳事件函数。
- 上传进度：微云的上传功能使用了公司提供的一个浏览器插件。该浏览器插件在真正开始上传文件之前，会对文件进行扫描并随时通知 JavaScript 函数，以便在页面中显示当前的扫描进度。但该插件通知的频率非常之高，大约一秒钟 10 次，很显然我们在页面中不需要如此频繁地去提示用户。

#### (2) 函数节流的原理

我们整理上面提到的三个场景，发现它们面临的共同问题是函数被触发的频率太高。

比如我们在 `window.onresize` 事件中要打印当前的浏览器窗口大小，在我们通过拖曳来改变窗口大小的时候，打印窗口大小的工作 1 秒钟进行了 10 次。而我们实际上只需要 2 次或者 3 次。这就需要我们按时间段来忽略掉一些事件请求，比如确保在 500ms 内只打印一次。很显然，我们可以借助 `setTimeout` 来完成这件事情。

#### (3) 函数节流的代码实现

关于函数节流的代码实现有许多种，下面的 `throttle` 函数的原理是，将即将被执行的函数用 `setTimeout` 延迟一段时间执行。如果该次延迟执行还没有完成，则忽略接下来调用该函数的请求。`throttle` 函数接受 2 个参数，第一个参数为需要被延迟执行的函数，第二个参数为延迟执行的时间。具体实现代码如下：

```javascript
var throttle = function ( fn, interval ) {
  var _self = fn,  // 保存需要被延迟执行的函数引用
      timer,       // 定时器
      firstTime = true;  // 是否是第一次调用
  return function () {
    var args = arguments,
        _me = this;
    if ( firstTime ) {  // 如果是第一次调用，不需延迟执行
      _self.apply( _me, args );
      return firstTime = false;
    }
    if ( timer ) {  // 如果定时器还在，说明前一次延迟执行还没有完成
      return false;
    }
```

```javascript
var ary = [];
for ( var i = 1; i <= 1000; i++ ){
  ary.push( i );  // 假设 ary 装载了 1000 个好友的数据
};

var renderFriendList = function( data ){
  for ( var i = 0, l = data.length; i < l; i++ ){
    var div = document.createElement( 'div' );
    div.innerHTML = i;
    document.body.appendChild( div );
  }
};

renderFriendList( ary );
```

这个问题的解决方案之一是下面的 `timeChunk` 函数，`timeChunk` 函数让创建节点的工作分批进行，比如把 1 秒钟创建 1000 个节点，改为每隔 200 毫秒创建 8 个节点。

`timeChunk` 函数接受 3 个参数，第 1 个参数是创建节点时需要用到的数据，第 2 个参数是封装了创建节点逻辑的函数，第 3 个参数表示每一批创建的节点数量。代码如下：

```javascript
var timeChunk = function( ary, fn, count ){
  var obj,
      t;
  var len = ary.length;
  var start = function(){
    for ( var i = 0; i < Math.min( count || 1, ary.length ); i++ ){
      var obj = ary.shift();
      fn( obj );
    }
  };
  return function(){
    t = setInterval(function(){
      if ( ary.length === 0 ){  // 如果全部节点都已经被创建好
        return clearInterval( t );
      }
      start();
    }, 200 );  // 分批执行的时间间隔，也可以用参数的形式传入
  };
};
```

最后我们进行一些小测试，假设我们有 1000 个好友的数据，我们利用 `timeChunk` 函数，每一批只往页面中创建 8 个节点：

```javascript
var ary = [];
for ( var i = 1; i <= 1000; i++ ){
  ary.push( i );
};

var renderFriendList = timeChunk( ary, function( n ){
  var div = document.createElement( 'div' );
  div.innerHTML = n;
  document.body.appendChild( div );
}, 8 );

renderFriendList();
```

### 4. 分时函数

在前面关于函数节流的讨论中，我们提供了一种限制函数被频繁调用的解决方案。下面我们将遇到另外一个问题，某些函数确实是用户主动调用的，但因为一些客观的原因，这些函数会严重地影响页面性能。

一个例子是创建 WebQQ 的 QQ 好友列表。列表中通常会有成百上千个好友，如果一个好友用一个节点来表示，当我们在页面中渲染这个列表的时候，可能要一次性往页面中创建成百上千个节点。

在短时间内往页面中大量添加 DOM 节点显然也会让浏览器吃不消，我们看到的结果往往就是浏览器的卡顿甚至假死。代码如下：

```javascript
var ary = [];
for ( var i = 1; i <= 1000; i++ ){
  ary.push( i );  // 假设 ary 装载了 1000 个好友的数据
};

var renderFriendList = function( data ){
  for ( var i = 0, l = data.length; i < l; i++ ){
    var div = document.createElement( 'div' );
    div.innerHTML = i;
    document.body.appendChild( div );
  }
};

renderFriendList( ary );
```

这个问题的解决方案之一是下面的 `timeChunk` 函数，`timeChunk` 函数让创建节点的工作分批进行，比如把 1 秒钟创建 1000 个节点，改为每隔 200 毫秒创建 8 个节点。

`timeChunk` 函数接受 3 个参数，第 1 个参数是创建节点时需要用到的数据，第 2 个参数是封装了创建节点逻辑的函数，第 3 个参数表示每一批创建的节点数量。代码如下：

```javascript
var timeChunk = function( ary, fn, count ){
  var obj,
      t;
  var len = ary.length;
  var start = function(){
    for ( var i = 0; i < Math.min( count || 1, ary.length ); i++ ){
      var obj = ary.shift();
      fn( obj );
    }
  };
  return function(){
    t = setInterval(function(){
      if ( ary.length === 0 ){  // 如果全部节点都已经被创建好
        return clearInterval( t );
      }
      start();
    }, 200 );  // 分批执行的时间间隔，也可以用参数的形式传入
  };
};
```

最后我们进行一些小测试，假设我们有 1000 个好友的数据，我们利用 `timeChunk` 函数，每一批只往页面中创建 8 个节点：

```javascript
var ary = [];
for ( var i = 1; i <= 1000; i++ ){
  ary.push( i );
};

var renderFriendList = timeChunk( ary, function( n ){
  var div = document.createElement( 'div' );
  div.innerHTML = n;
  document.body.appendChild( div );
}, 8 );

renderFriendList();
```

### 5. 惰性加载函数

在 Web 开发中，因为浏览器之间的实现差异，一些嗅探工作总是不可避免。比如我们需要一个在各个浏览器中能够通用的事件绑定函数 `addEvent`，常见的写法如下：

```javascript
var addEvent = function( elem, type, handler ){
  if ( window.addEventListener ){
    return elem.addEventListener( type, handler, false );
  }
  if ( window.attachEvent ){
    return elem.attachEvent( 'on' + type, handler );
  }
};
```

这个函数的缺点是，当它每次被调用的时候都会执行里面的 if 条件分支，虽然执行这些 if 分支的开销不算大，但也许有一些方法可以让程序避免这些重复的执行过程。

第二种方案是这样，我们把嗅探浏览器的操作提前到代码加载的时候，在代码加载的时候就立刻进行一次判断，以便让 `addEvent` 返回一个包裹了正确逻辑的函数。代码如下：

```javascript
var addEvent = (function(){
  if ( window.addEventListener ){
    return function( elem, type, handler ){
      elem.addEventListener( type, handler, false );
    }
  }
  if ( window.attachEvent ){
    return function( elem, type, handler ){
      elem.attachEvent( 'on' + type, handler );
    }
  }
})();
```

目前的 `addEvent` 函数依然有个缺点，也许我们从头到尾都没有使用过 `addEvent` 函数，这样看来，前一次的浏览器嗅探就是完全多余的操作，而且这也会稍稍延长页面 ready 的时间。

第三种方案即是我们将要讨论的惰性载入函数方案。此时 `addEvent` 依然被声明为一个普通函数，在函数里依然有一些分支判断。但是在第一次进入条件分支之后，在函数内部会重写这个函数，重写之后的函数就是我们期望的 `addEvent` 函数，在下一次进入 `addEvent` 函数的时候，`addEvent` 函数里不再存在条件分支语句：

```html
<html>
  <body>
    <div id="div1">点我绑定事件</div>
    <script>
      var addEvent = function( elem, type, handler ){
        if ( window.addEventListener ){
          addEvent = function( elem, type, handler ){
            elem.addEventListener( type, handler, false );
          }
        }else if ( window.attachEvent ){
          addEvent = function( elem, type, handler ){
            elem.attachEvent( 'on' + type, handler );
          }
        }
        addEvent( elem, type, handler );
      };

      var div = document.getElementById( 'div1' );
      addEvent( div, 'click', function(){
        alert(1);
      });
      addEvent( div, 'click', function(){
        alert(2);
      });
    </script>
  </body>
</html>
```

# 3.3 小结

在进入设计模式的学习之前，本章挑选了闭包和高阶函数来进行讲解。这是因为在 JavaScript 开发中，闭包和高阶函数的应用极多。就设计模式而言，因为 JavaScript 这门语言的自身特点，许多设计模式在 JavaScript 之中的实现跟在一些传统面向对象语言中的实现相差很大。在 JavaScript 中，很多设计模式都是通过闭包和高阶函数实现的。这并不奇怪，相对于模式的实现过程，我们更关注的是模式可以帮助我们完成什么。