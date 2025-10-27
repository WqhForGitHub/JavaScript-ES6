有些计算机程序（例如科学模拟和机器学习模型）属于计算密集型。换句话说，这些程序会持续不断地运行，不会暂停，直到计算出结果为止。不过，大多数现实中的计算机程序则明显是异步的。这意味着它们常常必须停止计算，等待数据到达或某个事件发生。浏览器中的 JavaScript 程序是典型的事件驱动型程序，即它们会等待用户单击或触发，然后才会真正执行。而基于 JavaScript 的服务器则通常要等待客户端通过网络发送请求，然后才能执行操作。

这种异步编程在 JavaScript 中是司空见惯的。本章将介绍三种重要的语言特性，可以让编写异步代码更容易。ES6 新增的期约（Promise）是一种对象，代表某个异步操作尚不可用的结果。关键字 async 和 await 是 ES2017 中引入的，为简化异步编程提供了新语法，它允许开发者将基于期约的异步代码写成同步的形式。最后，异步迭代器和 for/await 循环是 ES2018 中引入的，允许在看起来同步的简单循环中操作异步事件流。

讽刺的是，JavaScript 虽然提供了这些编写异步代码的强大特性，但其核心语言特性中却没有一个是异步的。因此，为了演示期约、async、await 和 for/await，我们首先会介绍客户端和服务器端 JavaScript，解释浏览器和 Node 的某些异步特性（第 15 章和第 16 章将更详尽地介绍客户端和服务器端 JavaScript）。

# 13.1 使用回调的异步编程

在最基本的层面上，JavaScript 异步编程是使用回调实现的。回调就是函数，可以传给其他函数。而其他函数会在满足某个条件或发生某个（异步）事件时调用（“回调”）这个函数。回调函数被调用，相当于通知你满足了某个条件或发生了某个事件，有时这个调用还会包含函数参数，能够提供更多细节。通过具体的示例会更容易理解这些，接下来的几个小节将演示几种不同形式的基于回调的异步编程，包括客户端 JavaScript 和 Node。

## 13.1.1 定时器

一种最简单的异步操作就是在一定时间过后运行某些代码。如 11.10 节所示，可以使用 setTimeout () 函数来实现这种操作：

```javascript
setTimeout(checkForUpdates, 60000);
```

setTimeout () 函数的第一个参数是一个函数，第二个参数是以毫秒为单位的时间间隔。在前面的代码中，假想的函数 checkForUpdates () 会在 setTimeout () 调用之后 60 000 毫秒（1 分钟）被调用。checkForUpdates () 是你的程序中可能会定义的一个回调函数，而 setTimeout () 则是用来注册你的回调函数的函数，它还指定在什么异步条件下调用回调函数。

setTimeout () 只会调用一次指定的回调函数，不传参数，然后就没事了。如果你编写了一个确实会检查更新的函数，那可能需要重复运行它。此时可以使用 setInterval () 而非 setTimeout ()：

```javascript
// 1分钟后调用checkForUpdates，然后每过1分钟就调用一次
let updateIntervalId = setInterval(checkForUpdates, 60000);

// setInterval() 返回一个值，把这个值传给clearInterval()
// 可以停止这种重复调用（类似地，setTimeout()也返回一个值，
// 可以把它传给clearTimeout()）
function stopCheckingForUpdates() {
  clearInterval(updateIntervalId);
}
```

## 13.1.2 事件

客户端 JavaScript 编程几乎全都是事件驱动的。也就是说，不是运行某些预定义的计算，而是等待用户做一些事，然后响应用户的动作。用户在按下键盘按键、移动鼠标、单击鼠标或轻点触摸屏设备时，浏览器会生成事件。事件驱动的 JavaScript 程序在特定上下文中为特定类型的事件注册回调函数，而浏览器在指定的事件发生时调用这些函数。这些回调函数叫作事件处理程序或者事件监听器，是通过 addEventListener () 注册的：

```javascript
// 要求选择器返回一个对象，表示与下面的
// CSS选择器匹配的HTML元素
let okay = document.querySelector('#confirmUpdateDialog button.okay');

// 接下来注册一个回调函数，当用户
// 单击该按钮时会被调用
okay.addEventListener('click', applyUpdate);
```

在这个示例中，applyUpdate () 是一个假想的回调函数，假设是我们在某个地方实现的。调用 document.querySelector () 会返回一个对象，表示网页中单个特定的元素。在这个元素上调用 addEventListener () 可以注册回调函数。addEventListener () 的第一个参数是一个字符串，指定要注册的事件类型（在这里是一次鼠标单击或轻点触摸屏）。如果用户单击或轻点了网页中指定的那个元素，浏览器就会调用 applyUpdate () 回调函数，并给它传入一个对象，其中包含有关事件的详细信息（例如事件发生的时间和鼠标指针的坐标）。

## 13.1.3 网络事件

JavaScript 编程中另一个常见的异步操作来源是网络请求。浏览器中运行的 JavaScript 可以通过类似下面的代码从 Web 服务器获取数据：

```javascript
function getCurrentVersionNumber(versionCallback) { // 注意回调参数
  // 通过脚本后向新版本API发送一个HTTP请求
  let request = new XMLHttpRequest();
  request.open("GET", "http://www.example.com/api/version");
  request.send();

  // 注册一个将在响应到达时调用的回调
  request.onload = function() {
    if (request.status === 200) {
      // 如果HTTP状态码没问题，则取得版本号并调用回调
      let currentVersion = parseFloat(request.responseText);
      versionCallback(null, currentVersion);
    } else {
      // 否则，通过回调报告错误
      versionCallback(response.statusText, null);
    }
  };

  // 注册另一个将在网络出错时调用的回调
  request.onerror = request.ontimeout = function(e) {
    versionCallback(e.type, null);
  };
}
```

客户端 JavaScript 代码可以使用 XMLHttpRequest 类及回调函数来发送 HTTP 请求并异步处理服务器返回的响应<sup>注 1</sup>。这里定义的 getCurrentVersionNumber () 函数（可以想象 13.1.1 节讨论的那个假想的 checkForUpdates () 函数会使用它）会发送 HTTP 请求并定义事件处理程序，后者在收到服务器响应或者超时或其他错误导致请求失败时会被调用。

注意上面的代码示例并没有像之前的示例一样调用 addEventListener ()。对于大多数 Web API（包括 XMLHttpRequest）来说，可以通过在生成事件的对象上调用 addEventListener () 并将相关事件的名字传给回调函数来定义事件处理程序。不过，一般也可以通过将回调函数赋值给这个对象的一个属性来注册事件监听器。我们在上面的示例代码中也是这么做的，即把函数赋值给 onload、onerror 和 ontimeout 属性。按照惯例，像这样的事件监听器属性的名字总是以 on 开头。相较而言，addEventListener () 是一种更灵活的技术，因为它支持多个事件处理程序。不过假如你确定没有别的代码会给同一个对象的同一个事件再注册监听器，就可以简单一点，把相应的属性设置为你的回调。

关于这个示例中的 getCurrentVersionNumber () 函数，还有一点需要注意。因为发送的是异步请求，所以它不能同步返回调用者关心的值（当前版本号）。为此，调用者给它传了一个回调函数，结果或错误发生时会被调用。在这里，调用者提供了一个接收两个参数的回调函数。如果 XMLHttpRequest 正常工作，则 getCurrentVersionNumber () 调用回调时会给第一个参数传 null，把版本号作为第二个参数。否则，如果发生错误，则 getCurrentVersionNumber () 调用回调时将错误细节作为第一个参数，将 null 作为第二个参数。

## 13.1.4 Node 中的回调与事件

Node.js 服务器端 JavaScript 环境底层就是异步的，定义了很多使用回调和事件的 API。例如，读取文件内容的默认 API 就是异步的，会在读取文件内容后调用一个回调函数：

```javascript
const fs = require("fs"); // "fs"模块有文件系统相关的API
let options = {
  // 默认选项可以写在这里 保存程序选项的对象
};

// 读取配置文件，然后调用回调函数
fs.readFile("config.json", "utf-8", (err, text) => {
  if (err) {
    // 如果有错误，显示一条警告消息，但仍然继续
    console.warn("Could not read config file:", err);
  } else {
    // 否则，解析文件内容并赋值给选项对象
    Object.assign(options, JSON.parse(text));
  }

  // 无论是什么情况，都会启动运行程序
  startProgram(options);
});
```

Node 的 fs.readFile () 函数以接收两个参数的回调作为最后一个参数。它会异步读取指定文件，然后调用回调。如果读取文件成功，它会把文件内容传给回调的第二个参数；如果发生错误，它会把错误传给回调的第一个参数。在这个示例中，我们把回调写成了一个箭头函数，对于这种简单操作，箭头函数既简洁又自然。

Node 也定义一些基于事件的 API。下面这个函数展示了在 Node 中如何通过 HTTP 请求获取 URL 的内容。它包含两层处理事件监听器的异步代码。注意，Node 使用 on () 方法而非 addEventListener () 注册事件监听器：

```javascript
const https = require("https");

// 读取URL的文本内容，并将其异步传给回调
function getText(url, callback) {
  // 对URL发起一个HTTP GET请求
  let request = https.get(url);

  // 注册一个函数处理“response”事件
  request.on("response", response => {
    // 这个响应事件意味着收到了响应头
    let httpStatus = response.statusCode;

    // 此时并没有收到HTTP响应体
    // 因此还要注册几个事件处理程序，以便响应体到达时被调用
    response.setEncoding("utf-8"); // 需要读取的是Unicode文本
    let body = "";

    // 每个响应体块被接收时都会调用这个事件处理程序
    response.on("data", chunk => { body += chunk; });

    // 响应完成时会调用这个事件处理程序
    response.on("end", () => {
      if (httpStatus === 200) { // 如果HTTP响应没问题
        callback(null, body);   // 把响应体传给回调
      } else {                  // 否则传递错误
        callback(httpStatus, null);
      }
    });
  });

  // 这里也为底层网络错误注册了一个事件处理程序
  request.on("error", (err) => {
    callback(err, null);
  });
}
```

# 13.2 期约

前面介绍了在客户端和服务器端 JavaScript 环境中回调和基于事件异步编程的示例。接下来介绍期约（Promise），这是一种为简化异步编程而设计的核心语言特性。

期约是一个对象，表示异步操作的结果。这个结果可能就绪也可能未就绪。而期约的 API 在这方面故意含糊：没有办法同步取得期约的值，只能要求期约在就绪时调用一个回调函数。假设我们要定义一个像上一节中 getText () 函数一样的异步 API，但希望它基于期约，没有回调参数，返回一个期约对象。然后调用者可以在这个期约对象上注册一个或多个回调，当异步计算完成时，它们会被调用。

由此，在最简单的情况下，期约就是一种处理回调的不同方式。不过，使用期约也有实际的好处。基于回调的异步编程有一个现实问题，就是经常会出现回调多层嵌套的情形，造成代码缩进过多以致难以阅读。期约可以让这种嵌套回调以一种更线性的期约链形式表达出来，因此更容易阅读和推断。

回调的另一个问题是难以处理错误。如果一个异步函数（或异步调用的回调）抛出异常，则该异常没有办法传播到异步操作的发起者。异步编程的一个基本事实就是它破坏了异常处理。对此，一个补救方式是使用回调参数严密跟踪和传播错误并返回值。但这样非常麻烦，容易出错。期约则标准化了异步错误处理，通过期约链提供了一种让错误正确传播的途径。

期约表示的是一次异步计算的未来结果。不过，不能使用它们表示重复的异步计算。本章后面，我们会用期约写一个代替`setTimeout()`的函数。但是，不能使用期约代替`setInterval()`，因为后者会重复调用回调函数，而这并不是设计期约时所考虑的用例。类似地，可以使用期约代替`XMLHttpRequest`对象的 “加载”（load）事件处理程序，因为回调只会被调用一次。但显然不能使用期约代替 HTML 按钮对象的 “单击”(click) 事件处理程序，因为我们通常允许用户多次单击按钮。

以下几节将：

- 解释期约相关的术语，展示期约的基本用法。
- 展示如何连缀期约。
- 演示如何基于期约创建自己的 API。

>期约乍一看很简单，而事实上，它的基本用例确实简单而直观。但有时期约也会导致极大的困扰。期约是异步编程的一种强大的惯用方法，只有深刻理解它才能正确自如地运用它。花点时间把它彻底搞清楚是非常值得的。建议读者专心致志地学完这一章，尽管它有点长。

## 13.2.1 使用期约

自从核心 JavaScript 语言支持期约以后，浏览器也开始实现基于期约的 API。上一节我们实现了一个`getText()`函数，它能发送异步 HTTP 请求，并将 HTTP 响应体传给以字符串形式指定的一个回调函数。想象一下这个函数还有一个变体叫`getJSON()`，它不接收回调参数，而是把 HTTP 响应体解析成 JSON 格式并返回一个期约。本章后面会实现这个`getJSON()`函数，现在我们先来看看怎么使用这个返回期约的辅助函数：

```javascript
getJSON(url).then(jsonData => {
  // 这是一个回调函数，它会在解析得到JSON值
  // 之后被异步调用，并接收该JSON值作为参数
});
```

`getJSON()`向指定的 URL 发送一个异步 HTTP 请求，然后在请求结果待定期间返回一个期约对象。这个期约对象有一个实例方法叫`then()`，回调函数并没有被直接传给`getJSON()`，而是传给了这个`then()`方法。当 HTTP 响应到达时，响应体会被解析为 JSON 格式，而解析后的值会被传给作为`then()`的参数的函数。

可以把这个`then()`方法想象成客户端 JavaScript 中注册事件处理程序的`addEventListener()`方法。如果多次调用一个期约对象的`then()`方法，则指定的每个函数都会在预期计算完成后被调用。

不过，与很多事件监听器不同，期约表示的是一次计算，每个通过`then()`方法注册的函数都只会被调用一次。有必要指出的是，即便调用`then()`时异步计算已经完成，传给`then()`的函数也会被异步调用。

在最简单的语法层面，`then()`方法是期约独有的特性，而直接把`.then()`附加给返回期约的函数调用是一种惯用方法，不需要先把期约对象赋值给某个中间变量。

以动词开头来命名返回期约的函数以及使用期约结果的函数也是一种惯例。遵循这个惯例可以增加代码的可读性：

```javascript
// 假设你有一个类似的函数可以显示用户简介【省略实现细节】
function displayUserProfile(profile) { /* 省略实现细节 */ }

// 下面演示了如何在返回期约的函数中使用这个函数
// 注意，这行代码读起来就像一句英语一样容易理解：
getJSON("/api/user/profile").then(displayUserProfile);
```

### 使用期约处理错误

异步操作，尤其是那些涉及网络的操作，通常都会有多种失败原因。健壮的代码必须处理各种无法避免的错误。

对期约而言，可以通过给`then()`方法第二个函数来实现错误处理：

```javascript
getJSON("/api/user/profile").then(displayUserProfile, handleProfileError);
```

期约表示在期约对象被创建之后发生的异步计算的未来结果。因为计算是在返回期约对象之后执行的，所以没办法让该计算像以往那样返回一个值，或者抛出一个可以捕获的异常。我们传给`then()`的函数可以提供一个替代手段：同步计算在正常结束后会向调用者返回计算结果，而基于期约的异步计算在正常结束后，则会把计算结果传给作为`then()`的第一个参数的函数。

同步计算出错会抛出一个异常，该异常会沿调用栈向上一直传播到一个处理它的`catch`子句。而异步计算在运行时，它的调用者已经不在调用栈里，因此如果出现错误，根本没办法向调用者抛回异常。

为此，基于期约的异步计算把异常（通常是某种`Error`对象，尽管不是必需的）传给作为`then()`的第二个参数的函数。因此对于上面的代码而言，如果`getJSON()`正常结束，它会把计算结果传给`displayUserProfile()`。如果出现了错误（如用户没有登录、服务器下线、用户网络中断、请求超时等），则`getJSON()`会把`Error`对象传给`handleProfileError()`。

实际开发中，很少看到给`then()`传两个函数的情况。因为在使用期约时，还有一种更好也更符合传统的错误处理方式。为理解这种方式，可以先考虑一下如果`getJSON()`正常结束但`displayUserProfile()`中发生错误会怎么样。回调函数在`getJSON()`返回时是被异步调用的，因此也是异步执行的，不能明确地抛出一个异常（因为调用栈里没有处理这种异常的代码）。

处理这个代码中错误的更符合传统的方式如下：

```javascript
getJSON("/api/user/profile").then(displayUserProfile).catch(handleProfileError);
```

这行代码意味着`getJSON()`正常返回的结果仍然会传给`displayUserProfile()`，但`getJSON()`和`displayUserProfile()`在执行时发生的任何错误（包括`displayUserProfile`抛出的任何异常）都会传给`handleProfileError()`。这个`catch()`方法只是对调用`then()`时以`null`作为第一个参数，以指定的错误处理函数作为第二个参数的一种简写形式。

在下一节讨论期约链时，我们还会更详尽地介绍`catch()`以及这种惯用的错误处理方式。

>期约相关的术语
>
>在进一步讨论期约之前，有必要熟悉几个术语。如果不是讨论编程，而是讨论人类的承诺，我们会说承诺得到 “信守” 或被 “背弃”。而在讨论 JavaScript 期约时，对应的术语是得到 “兑现”（fulfill）和被 “拒绝”（reject）。想象一下，调用一个期约的`then()`方法时传入了两个回调函数。如果第一个回调被调用，我们说期约得到兑现，而如果第二个回调被调用，我们说期约被拒绝。如果期约既未兑现也未被拒绝，那它就是待定（pending）。而期约一旦兑现或被拒绝，我们说它已经落定（settle），永远不会再从兑现变成拒绝，反之亦然。
>
>还记得本书开始时我们给期约的定义是：“期约是一个对象，表示异步操作的结果。” 关键是要记住期约不仅是在某些异步代码完成时注册回调的抽象方式，它还会存储异步代码的结果。如果异步代码正常结束（期约兑现），那这个结果基本上就是代码的返回值。如果异步代码没有正常结束（期约被拒绝），那这个结果就是一个`Error`对象或者某个其他值（如果异步代码抛出了异常）。任何已经落定的期约有一个与之关联的值，而这个值不会再改变。如果期约兑现，那个值会传给作为`then()`的第一个参数注册的回调函数。如果期约被拒绝，那个值是一个错误，会传给使用`catch()`注册的或作为`then()`的第二个参数注册的回调函数。
>
>之所以要在这里准确定义期约相关的术语，是因为期约也可能被解决（resolve）。这个解决状态很容易与兑现状态或落定状态混淆，但严格来讲它们并不是一回事。理解这个解决状态是深刻理解期约的一个关键。在后面讨论期约之后，我们还会再讨论它。

## 13.2.2 期约链

期约有一个最重要的优点，就是以线性`then()`方法调用链的形式表达一连串异步操作，而无须把每个操作嵌套在前一个操作的回调内部。例如，下面是一个假想的期约链：

```javascript
fetch(documentURL)               // 发送HTTP请求
  .then(response => response.json()) // 获得响应体并解析它
  .then(document => {                // 获得被解析后的JSON时
    return render(document);         // 把文档显示给用户
  })
  .then(rendered => {                // 在取得渲染后的文档后
    cacheInDatabase(rendered);       // 把它存在本地数据库中
  })
  .catch(error => handle(error));    // 处理发生的错误
```

以上代码说明期约链更容易表达一连串异步操作。在此，我们并不打算讨论这个示例的期约链，而是要继续探讨使用期约链发送 HTTP 请求。

本章前面，我们看到了在 JavaScript 中使用`XMLHttpRequest`对象发送 HTTP 请求的示例。那个名字有点怪的对象有着古老而简陋的 API，很大程度上已经被更新的基于期约的 Fetch API（参见 15.11.1 节）取代。这个新 HTTP API 的最高形式就是函数`fetch()`。传给它一个 URL，它返回一个期约。这个期约会在 HTTP 响应开始到达且 HTTP 状态和头部可用时兑现：

```javascript
fetch("/api/user/profile").then(response => {
  // 在期约解决时，可以访问HTTP状态和头部
  if (response.ok && response.headers.get("Content-Type") === "application/json") {
    // 在这里可以做什么？现在还没有得到响应体
  }
});
```

在`fetch()`返回的期约兑现时，传给它的`then()`方法的函数会被调用，这个函数会收到一个`Response`对象。通过这个响应对象可以访问请求状态和头部，这个对象也定义了`text()`和`json()`等方法，通过它们分别可以取得文本和 JSON 格式的响应体。不过，虽然最初的期约兑现了，但响应体尚未到达。因此用于取得响应体的`text()`和`json()`方法本身也返回期约。下面是使用`fetch()`和`response.json()`方法取得 HTTP 响应体的幼稚方式：

```javascript
fetch("/api/user/profile").then(response => { // 获取HTTP响应
  response.json().then(profile => { // 获取JSON格式的响应体
    // 在响应体到达时，它会自动被解析为
    // JSON格式并传入这个函数；
    displayUserProfile(profile);
  });
});
```

说这是使用期约的幼稚方式，是因为我们像嵌套回调一样嵌套了它们，而这违背了期约的初衷。使用期约的首选方式是像以下代码这样写成一串期约链：

```javascript
fetch("/api/user/profile")
  .then(response => {
    return response.json();
  })
  .then(profile => {
    displayUserProfile(profile);
  });
```

这段代码中的方法调用忽略了传给方法的参数：

```javascript
fetch().then().then()
```

像这样在一个表达式中调用多个方法，我们称其为方法链。我们知道，`fetch()`函数返回一个期约对象，而这个链上的第一个`.then()`调用了返回的期约对象上的一个方法。不过链中还有第二个`.then()`，这意味着第一个`then()`方法调用本身必须返回一个期约。

有时候，当 API 被设计为使用这种方法链时只会有一个对象，它的每个方法都返回对象本身，以便后续调用。然而这并不是期约的工作方式。我们在写`.then()`调用链时，并不会在一个期约上注册多个回调。相反，每个`then()`方法调用都返回一个新期约对象，这个新期约对象在传给`then()`的函数执行结束才会兑现。

我们再回到上面那个原始`fetch()`链的简化形式。如果我们在别的地方定义了要传给`then()`的函数，那么可以把代码重构为如下所示：

```javascript
fetch(url)
  .then(callback1) // 任务2，返回期约2
  .then(callback2) // 任务3，返回期约3
```

下面我们逐步剖析这段代码。

1. 第 1 行，调用`fetch()`并传入一个 URL。这个方法会向该 URL 发送一个 HTTP GET 请求并返回一个期约。我们称这个 HTTP 请求为 “任务 1”，称这个期约为 “期约 1”。
2. 第 2 行，调用期约 1 的`then()`方法，传入`callback1`函数，我们希望这个函数在期约 1 兑现时被调用。这个`then()`方法会把我们的回调函数存在某个地方，并返回一个新期约。我们称这一步返回的新期约为 “期约 2”，并称 “任务 2” 在`callback1`被调用时开始。
3. 第 3 行，调用期约 2 的`then()`方法，传入`callback2`函数，我们希望这个函数在期约 2 兑现时被调用。这个`then()`方法会记住我们的回调并返回另一个期约。我们称最后这个期约为 “期约 3”，但实际上并不需要给它命名，因为根本不会使用它。
4. 当这个表达式一开始执行，前面 3 步将同步发生。然后在第 1 步创建的 HTTP 请求通过互联网发出时有一个异步暂停。
5. 终于，HTTP 响应开始到达。`fetch()`调用的异步逻辑将 HTTP 状态和头部包装到一个`Response`对象中，并将这个`Response`对象作为值兑现期约 1。
6. 期约 1 兑现后，它的值（`Response`对象）会传给`callback1()`函数，此时任务 2 开始。这个任务的职责是以给定的`Response`对象作为输入，获取 JSON 格式的响应体。
7. 假设任务 2 正常结束，即成功解析 HTTP 响应体并生成了一个 JSON 对象。然后这个 JSON 对象被用于兑现期约 2。
8. 兑现期约 2 的值在传给`callback2()`函数时变成了任务 3 的输入。然后任务 3 以某种方式把数据显示给用户。任务 3 完成时（假设正常结束），期约 3 也会兑现。但由于我们并未给期约 3 注册回调，因此在它落定时什么也不会发生。此时这个异步计算链结束。

## 13.2.3 解决期约

在上一节逐步分析抓取 URL 的期约链时，我们说到了期约 1、期约 2 和期约 3，但实际上这里还有第 4 个期约对象。而这也引出了我们关于 “解决”（resolve）期约意味着什么的重要讨论。

我们知道，`fetch()`返回一个期约对象，在兑现时，它会把一个`Response`对象传给我们注册的回调函数。这个`Response`对象定义了`text()`、`.json()`以及其他方法，用于获取不同格式的 HTTP 响应体。但由于响应体可能并未到达，这些方法必须返回期约。在我们研究的这个示例中，“任务 2” 调用`.json()`方法并返回它的值，这个值就是第 4 个期约对象，也就是`callback1()`函数的返回值。

下面我们再重写一次抓取 URL 的代码，这一次使用冗余和非惯用方法，以便回调和期约更加明显：

```javascript
function c1(response) {       // 回调1
  let p4 = response.json();   // 返回期约4
  return p4;                  // 返回期约4
}

function c2(profile) {        // 回调2
  displayUserProfile(profile);
}

let p1 = fetch("/api/user/profile"); // 期约1，任务1
let p2 = p1.then(c1);               // 期约2，任务2
let p3 = p2.then(c2);               // 期约3，任务3
```

为了让期约链有效工作，任务 2 的输出必须成为任务 3 的输入。在该示例中，任务 3 的输入是从 URL 抓取到响应体后又解析生成的 JSON 对象。不过，正如刚才所说，回调`c1`的返回值并不是一个 JSON 对象，而是表示该 JSON 对象的期约`p4`。这看起来好像矛盾了，但并没有：在`p1`兑现后，`c1`被调用，任务 2 开始。而当`p2`兑现时，`c2`被调用，任务 3 开始。不过，`c1`被调用时任务 2 开始并不意味着任务 2 一定在`c1`返回时结束。期约是用于管理异步任务的，如果任务 2 是异步的（这里确实是），那么它在回调返回时就不会结束。

下面我们可以讨论真正掌握期约需要理解的最后一个细节了。当把回调`c`传给`then()`方法时，`then()`返回期约`p`，并安排好在将来某个时刻异步调用`c`。届时，这个回调执行某些计算并返回一个值`v`。当这个回调返回值`v`时，`p`就以这个值得到解决。当期约以一个非期约值解决时，就会立即以这个值兑现。因此如果`c`返回非期约值，则该返回值就变成了`p`的值，然后`p`兑现，结束。可是，如果这个返回值`v`是一个期约，那么`p`会得到解决但并未兑现。此时，`p`要等到期约`v`落定之后才能落定。如果`v`兑现了，那么`p`也会以相同的值兑现。如果`v`被拒绝了，那么`p`也会以相同的理由被拒绝。这就是期约的 “解决” 状态的含义，即一个期约与另一个期约发生了关联（或 “绑定” 了另一个期约）。此时我们并不知道`p`将会兑现还是被拒绝。但回调`c`已经无法控制这个结果了，说`p`得到了 “解决”，意思就是现在它的命运完全取决于期约`v`会怎么样。

好，我们再回到抓取 URL 的示例。当`c1`返回`p4`时，`p2`得到解决。但解决并不等同于兑现，因此任务 3 还不会开始。当 HTTP 响应体全部可用时，`.json()`方法才可以解析它并以解析后的值兑现`p4`。`p4`兑现后，`p2`也会自动以该解析后的 JSON 值兑现。此时，解析后的 JSON 对象被传给`c2`，任务 3 开始。

这可能是 JavaScript 中最不好理解的地方之一，你可能需要把这一节多读几遍。图 13-1 形象地展示了这个过程，可能有助于你想清楚这一点。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%88%E7%AC%AC7%E7%89%88%EF%BC%89/%E7%AC%AC13%E7%AB%A0%EF%BC%9A%E5%BC%82%E6%AD%A5%20JavaScript/%E9%80%9A%E8%BF%87%E6%9C%9F%E7%BA%A6%E6%8A%93%E5%8F%96%20URL.png)

## 13.2.4 再谈期约和错误

本章前面，我们介绍过可以给`.then()`方法传第二个回调函数，而这第二个函数会在期约被拒绝时调用。在这种情况发生时，传给这第二个回调函数的参数是一个值（通常是一个`Error`对象），表示拒绝理由。我们也知道给一个`.then()`方法传两个回调是很少见的（甚至并非惯用方法）。事实上，基于期约的错误一般是通过给期约链添加一个`.catch()`方法调用来处理的。既然我们已经了解了期约链，现在可以更详尽地讨论错误处理了。在讨论之前，我想要强调一点：细致的错误处理在异步编程中确实非常重要。在同步代码中，如果不编写错误处理逻辑，你至少会看到异常报告，错误只会静默发在查找出错的原因。而在异步代码中，未处理的异常往往会导致程序崩溃，导致它们更难调试。好消息是，`catch()`方法可以让处理期约错误更容易。

### catch 和 finally 方法

期约的`.catch()`方法实际上是对以`null`为第一个参数、以错误处理回调为第二个参数的`.then()`调用的简写。对于任何期约`p`和错误回调`c`，以下两行代码是等价的：

```javascript
p.then(null, c);
p.catch(c);
```

之所以应该首选`.catch()`简写形式，一方面是因为它更简单，另一方面是因为它的名字对应`try/catch`异常处理语句的`catch`子句。如前所述，传统的异常处理在异步代码中并不适用。当同步代码出错时，我们可以说一个异常会 “沿着调用栈向上冒泡”，直到碰上一个`catch`块。而对于异步期约链，类似的比喻可能是一个错误 “沿着期约链向下流淌”，直到碰上一个`.catch()`调用。

在 ES2018 中，期约对象还定义了一个`.finally()`方法，其用途类似`try/catch/finally`语句的`finally`子句。如果你在期约链中添加一个`.finally()`调用，那么传给`.finally()`的回调会在期约落定时被调用。无论这个期约是兑现还是被拒绝，你的回调都会被调用，而且调用时不会给它传任何参数，因此你也无法知晓期约是兑现了还是被拒绝了。但假如你需要在任何情况下都运行一些清理代码（如关闭打开的文件或网络连接），那么`.finally()`回调是做这件事的理想方式。与`.then()`和`.catch()`一样，`.finally()`也返回一个新期约对象。`.finally()`回调的返回值通常会被忽略，而解决或拒绝调用`.finally()`的期约的值一般也会用来解决或拒绝`.finally()`返回的期约。不过，如果`.finally()`回调抛出异常，就会用这个错误值拒绝`.finally()`返回的期约。

前几节展示的 URL 抓取代码并没有做任何错误处理。下面我们来改正一下，并将其重构为一个更接近现实的版本：

```javascript
fetch("/api/user/profile")       // 发送HTTP请求
  .then(response => {            // 在状态和头部就绪时调用
    if (!response.ok) {          // 如果遇到404 Not Found或类似的错误
      return null;               // 可能用户未登录；返回空简介
    }

    // 检查头部以确保服务器发送给我们的是JSON
    // 如果不是，说明服务器坏了，这是一个严重错误
    let type = response.headers.get("content-type");
    if (type !== "application/json") {
      throw new TypeError(`Expected JSON, got ${type}`);
    }

    // 如果到这里了，说明状态码是2xx，内容类型也是JSON
    // 因此我们可以安心地返回一个期约，表示解析响应体
    // 之后得到的JSON对象
    return response.json();
  })
  .then(profile => {             // 调用时传入解析后的响应体或null
    if (profile) {
      displayUserProfile(profile);
    } else {                     // 如果遇到了404错误并返回null，则会走到这里
      displayLoggedOutProfile(loginPage);
    }
  })
  .catch(e => {
    if (e instanceof NetworkError) {
      // fetch()在无法网络连接时会来到这里
      displayErrorMessage("Check your internet connection.");
    } else if (e instanceof TypeError) {
      // 在上面抛出TypeError时会来到这里
      displayErrorMessage("Something is wrong with our server!");
    } else {                     // 走到这里说明发生了意料之外的错误
      console.error(e);
    }
  });
```

下面我们通过分析不同的错误来理解以上代码。我们会使用之前用过的命名模式：`p1`是`fetch()`调用返回的期约。`p2`是第一个`.then()`调用返回的期约，而`c1`是传给该`.then()`调用的回调。`p3`是第二个`.then()`调用返回的期约，而`c2`是我们传给该调用的回调。最后，`c3`是我们传给`.catch()`调用的回调（这个调用也返回一个期约，但不用给它命名）。

第一种可能失败的情况是`fetch()`请求本身。如果网络连接出现故障（或由于其他因素无法发送 HTTP 请求），那么期约`p1`会以一个`NetworkError`对象被拒绝。我们并没有给`.then()`调用传错误处理回调函数作为第二个参数，因此`p2`也会以同一个`NetworkError`对象被拒绝（如果我们给第一个`.then()`调用传了错误处理程序，该程序就会被调用。对象被拒绝返回，`p2`会以该处理程序返回的值解决或兑现）。不过，我们并未传这个处理程序，因此`p2`被拒绝，而`p3`也会以同样的理由被拒绝。此时，`c3`错误处理回调会被调用，其中特定于`NetworkError`的代码会运行。

代码的另一种失败方式是 HTTP 请求返回了 404 Not Found 或其他 HTTP 错误。这些都是有效的 HTTP 响应，因此`fetch()`调用并不会认为它们是错误。此时，`fetch()`会把 404 Not Found 封装在一个`Response`对象中并以该对象兑现`p1`。`p1`兑现导致`c1`被调用。`c1`中的代码会检查`Response`对象的`ok`属性，如果检测到它并未设立一个正常的 HTTP 响应，就会简单地返回`null`。因为这个返回值并不是期约，所以它会立即兑现`p2`，从而导致`c2`被以这个值调用。`c2`中的代码显式检查`null`值是否为假，据此向用户显示不同的结果。这是将反常条件作为非错误且实际上不使用错误处理程序来处理的一个示例。

在`c1`中，如果我们拿到了正常的 HTTP 响应码，但`Content-Type`头部设置得不对，则会发生更严重的错误。我们的代码期待 JSON 格式的响应，因此如果服务器给我们发送的是 HTML、XML 或纯文本，那么后续处理就会出问题。`c1`中包含检查`Content-Type`头部的代码。如果这个头部不对，它会将其视为一个不可恢复问题，抛出`TypeError`。如果传给`.then()`或`.catch()`的回调抛出一个值，则这个`.then()`返回的期约会以这个被抛出的值被拒绝。在这里，`c1`的代码抛出`TypeError`会导致`p2`以该`TypeError`对象被拒绝。因为我们没有给`p2`指定错误处理程序，所以`p3`也会被拒绝。此时不会调用`c2`，`TypeError`会直接传给`c3`，其中包含显式检查和处理这种错误的代码。

关于以上代码有两点需要说明一下。第一，注意这个错误对象是以常规、同步`throw`语句抛出的，而该错误最终在期约链中被一个`.catch()`方法调用处理。这充分说明了为什么应该尽量使用这种简写形式，而不是给`.then()`传第二个参数。同时也说明了为什么在期约链末尾添加一个`.catch()`调用是个惯例。

在结束错误处理这个话题之前，我想再指出一点。尽管在期约链末尾加上一个`.catch()`来清理（或至少记录）链调用中发生的任何错误是一个惯例，在期约链的任何地方使用`.catch()`也是完全有效的。如果期约链的某一环会因错误而失败，而该错误属于某种可恢复的类型，不应该停止后续环节代码的运行，那么可以在链中插入一个`.catch()`调用，得到类似以下所示的代码：

```javascript
startAsyncOperation()
  .then(doStageTwo)
  .catch(recoverFromStageTwoError)
  .then(doStageThree)
  .then(doStageFour)
  .catch(logStageThreeAndFourErrors);
```

记住，传给`.catch()`的回调只会在上一环的回调抛出错误时才会被调用。如果该回调正常返回，那么这个`.catch()`回调就会被跳过，之前回调返回的值会成为下一个`.then()`回调的输入。还有，`.catch()`回调不仅仅可以用于报告错误，还可以处理错误并从错误中恢复。一个错误只要传给了`.catch()`回调，就会停止在期约链中向下传播。`.catch()`回调可以抛出新错误，但如果正常返回，这个返回值就会用于解决或兑现与之关联的期约，从而停止错误传播。

下面我们来更具体地解释一下。在刚才的代码示例中，无论`startAsyncOperation()`还是`doStageTwo()`抛出错误，都会调用`recoverFromStageTwoError()`函数。如果`recoverFromStageTwoError()`正常返回，那么它的返回值会传给`doStageThree()`，异步操作将正常继续。而如果`recoverFromStageTwoError()`不能恢复，它自己应该抛出一个错误（或者将传给它的错误再抛出来）。此时，`doStageThree()`和`doStageFour()`都不会被调用，`recoverFromStageTwoError()`抛出的错误会直接传给`logStageThreeAndFourErrors()`。

有时候，在复杂的网络环境下，错误可能多少会以某种概率随机发生。处理这些错误时，可以简单地重新发送异步请求。想象一下你写了一个基于期约的操作来查询数据库：

```javascript
queryDatabase()
  .then(displayTable)
  .catch(displayDatabaseError);
```

现在假设瞬间网络负载问题会导致这个查询有 1% 的失败概率。一个简单的解决方案是通过`.catch()`调用来重新发送请求：

```javascript
queryDatabase()
  .catch(e => wait(500).then(queryDatabase)) // 如果失败，等待并重试
  .then(displayTable)
  .catch(displayDatabaseError);
```

如果我们假想的失败真是随机的，那么加上这行代码应该可以把错误率从 1% 降到 0.01%。

>从期约回调中返回
>
>我们最后再回顾一次前面抓取 URL 的示例，看看传给第一个`.then()`的`c1`回调。注意`c1`有三种方式可以终止。首先，它可以正常返回`.json()`调用返回的期约。这会导致`p4`被解决，但该期约是`p2`还是被拒绝则取决于`p4`返回的期约。第二，`c1`可以正常返回`null`，这会导致`p2`立即被兑现。最后，`c1`可以抛出一个错误，这会导致`p2`被拒绝。这些就是一个期约的三种可能的结果，而我们通过`c1`的代码理解了回调如何导致每一种结果。
>
>在期约链中，一个环节返回（或抛出）的值会成为下一个环节的输入。因此每个环节返回什么至关重要。实际开发中，忘记从回调函数中返回值是导致期约相关问题的常见原因。而使用 JavaScript 的箭头函数快捷语法又让这个问题雪上加霜。再看一下在前面看到过的`.then(queryDatabase)`：
>
>```javascript
>.catch(e => wait(500).then(queryDatabase))
>```
>
>通过学习第 8 章我们知道，箭头函数有很多简略写法。因为这里正好只有一个参数（错误值），所以可以省略包含参数的小括号。因为函数体就是一个表达式，所以可以省略包含函数体的大括号。此时表达式的值就成了函数的返回值。因为有这些简略写法，前面的代码是正确的。但我们再看看下面这个乍一看无害的修改：
>
>```javascript
>.catch(e => { wait(500).then(queryDatabase) })
>```
>
>由于加上了大括号，就无法利用自动返回了。现在这个函数返回的是`undefined`，而不是非返回期约。这意味着期约链下一环节会收到`undefined`参数，而非重试查询的结果。这种微妙的错误可能并不容易发现。

## 13.2.5 并行期约

我们已经花了很多时间讨论期约链，但主要针对的是顺序运行一个较大异步操作的多个异步环节。然而有时候，我们希望并行执行多个异步操作。函数`Promise.all()`可以做到这一点。`Promise.all()`接收一个期约对象的数组作为输入，返回一个期约。如果输入期约中的任意一个拒绝，返回的期约也将拒绝；否则，返回的期约会以每个输入期约的值的数组兑现。例如，假想你想抓取多个 URL 的文本内容，可以使用如下代码：

```javascript
// 定义一个URL数组
const urls = [ /* 零或多个URL */ ];
// 然后把它转换为期约对象的数组
promises = urls.map(url => fetch(url).then(r => r.text()));
// 现在用一个期约来并行运行数组中的所有期约
Promise.all(promises)
  .then(bodies => { /* 处理得到的字符串数组 */ })
  .catch(e => console.error(e));
```

`Promise.all()`实际上比刚才描述的稍微更灵活一些。其输入数组可以包含期约对象和非期约值。如果这个数组的某个元素不是期约，那么它就会被当成一个已兑现期约的值，被原封不动地复制到输出数组中。

由`Promise.all()`返回的期约会在任何一个输入期约被拒绝时拒绝。这会在第一个拒绝发生时立即发生，此时其他期约的状态可能还是待定。在 ES2020 中，`Promise.allSettled()`也接收一个输入期约的数组，与`Promise.all()`一样。但是，`Promise.allSettled()`永远不拒绝返回的期约，而是会等所有输入期约全部落定后兑现。这个返回的期约解决为一个对象数组，其中每个对象都对应一个输入期约，且都有一个`status`属性、一个`value`属性或`reason`属性。如果`status`属性值为`"fulfilled"`，那么该对象还会有一个`value`属性，包含兑现的值。而如果`status`属性值为`"rejected"`，那么该对象还会有一个`reason`属性，包含对应期约的错误或拒绝理由：

```javascript
Promise.allSettled([Promise.resolve(1), Promise.reject(2), 3]).then(results => {
  results[0] // => { status: "fulfilled", value: 1 }
  results[1] // => { status: "rejected", reason: 2 }
  results[2] // => { status: "fulfilled", value: 3 }
});
```

你可能偶尔想同时运行多个期约，但只关心第一个兑现的值。此时，可以使用`Promise.race()`(而不是`Promise.all()`)。`Promise.race()`返回一个期约，这个期约会在输入数组中的期约有一个兑现或拒绝时马上兑现或拒绝（或者，如果输入数组中有非期约值，则直接返回其中第一个非期约值）。

## 13.2.6 创建期约

在前面的几个示例中，我们一直使用返回期约的函数`fetch()`，因为它是浏览器内置返回期约的一个最简单的函数。我们关于期约的讨论也建立在假想的返回期约的函数`getJSON()`和`wait()`上。让函数返回期约是很有用的，本章将展示如何创建你自己基于期约的 API。特别地，我们会看到`getJSON()`和`wait()`的实现。

### 基于其他期约的期约

如果有其他返回期约的函数，那么基于这个函数写一个返回期约的函数很容易。给定一个期约，调用`.then()`就可以创建（并返回）一个新期约。因此，如果以已有的`fetch()`函数为起点，可以像下面这样实现`getJSON()`：

```javascript
function getJSON(url) {
  return fetch(url).then(response => response.json());
}
```

这段代码没什么可说的，因为`fetch()` API 的`Response`对象有一个预定义的`json()`方法。这个`json()`方法返回一个期约，这个期约又通过我们的回调返回（这个回调是一个箭头函数，只包含一个表达式，因此会隐式返回）。所以，`getJSON()`返回的期约会解决为`response.json()`返回的期约。当该期约兑现时，`getJSON()`返回的期约也会以相同的值兑现。注意，`getJSON()`的实现没有错误处理。没有检查`response.ok`和`Content-Type`头部，我们只是简单地让`json()`方法在响应体无法解析为 JSON 时以`SyntaxError`拒绝返回的期约。

下面我们再写另一个返回期约的函数，这一次把`getJSON()`作为初始期约的来源：

```javascript
function getHighScore() {
  return getJSON("/api/user/profile").then(profile => profile.highscore);
}
```

我们假设这个函数是某个 Web 游戏的代码，而 URL `/api/user/profile`返回一个 JSON 格式的数据结构，其中包含`highscore`属性。

### 基于同步值的期约

有时候，我们可能需要实现一个已有的基于期约的 API，并从一个函数返回期约，尽管要执行的计算实际上并不涉及异步操作。在这种情况下，静态方法`Promise.resolve()`和`Promise.reject()`可以帮你达成目的。`Promise.resolve()`接收一个值作为参数，并返回一个会立即（但异步）以该值兑现的期约。`Promise.reject()`也接收一个参数，并返回一个以该参数作为理由拒绝的期约（明确一下：这两个静态方法返回的期约会在被返回时并未兑现或拒绝，但它们会在当前同步代码运行结束后立即兑现或拒绝。通常，这会在几毫秒之后发生，除非有很多待定的异步任务等待运行）。

我们在 13.2.3 节讨论过，解决期约并不等同于兑现期约。调用`Promise.resolve()`时，我们通常会传入兑现值，创建一个很快就兑现为该值的期约对象。但是这个方法的名字并不叫`Promise.fulfill()`。如果把期约`p1`传给`Promise.resolve()`，它会返回一个新期约`p2`，`p2`会立即解决，但要等到`p1`兑现或被拒绝时才会兑现或被拒绝。

写一个基于期约的函数，其中值是同步计算得到的，但使用`Promise.resolve()`异步返回是可能的，但不常见。不过在一个异步函数中包含同步执行的代码，通过`Promise.resolve()`和`Promise.reject()`来处理这些同步操作的值倒是相当常见。特别地，如果在开始异步操作前检测错误条件（如坏参数值），那可以通过返回`Promise.reject()`创建的期约来报告错误（这种情况下也可以同步抛出一个错误，但这种做法并不推荐，因为这样一来，函数的调用者为了处理错误既要写同步的`catch`子句，还要使用异步的`.catch()`方法）。最后，`Promise.resolve()`有时候也可以用来创建一个期约链的第一个期约。稍后可以看到几个这样使用它的示例。

### 从头开始创建期约

对于`getJSON()`和`getHighScore()`，我们都是一开始先调用一个现有函数得到初始期约，然后再通过调用该期约的`.then()`方法创建并返回新期约。如果我们不能使用一个返回期约的函数作为起点，那么怎么写一个返回期约的函数呢？这时候，可以使用`Promise()`构造函数来创建一个新期约对象，而且可以完全控制这个新期约。过程如下：调用`Promise()`构造函数，给它传一个函数作为唯一参数。这个函数通常要写成接收两个参数，按惯例要将它们命名为`resolve`和`reject`。构造函数同步调用你的函数并为`resolve`和`reject`参数传入对应的函数值。调用你的函数后，`Promise()`构造函数返回新创建的期约。这个返回的期约由你传给`Promise()`构造函数的函数控制。你传的函数应该执行某些异步操作，然后调用`resolve`函数解决或兑现返回的期约，或者调用`reject`函数拒绝返回的期约。你的函数不一定非要执行异步操作，可以同步调用`resolve`或`reject`，但此时创建的期约仍会异步解决、兑现或拒绝。

如果单独阅读代码，可能很难理解把一个函数传给构造函数，而构造函数又把其他函数传给这个函数。也许看几个示例就好理解了。下面是本章前面几个示例中用到的基于期约的`wait()`函数的实现：

```javascript
function wait(duration) {
  // 创建并返回新期约
  return new Promise((resolve, reject) => { // 这两个函数控制期约
    // 如果参数无效，拒绝期约
    if (duration <= 0) {
      reject(new Error("Time travel not yet implemented"));
    }
    // 否则，异步等待，然后解决期约
    // setTimeout调用的resolve()值未传参，
    // 这意味着新期约将会以undefined值来兑现
    setTimeout(resolve, duration);
  });
}
```

注意，用来控制`Promise()`构造函数创建的期约的命运的那对函数叫`resolve()`和`reject()`，不是`fulfill()`和`reject()`。如果把一个期约传给`resolve()`，返回的期约将会解决为该新期约。不过，通常在这里都会传一个非期约值，这个值会兑现返回的期约。

示例 13-1 是另一个使用`Promise()`构造函数的示例。这个示例实现在了 Node 中使用的`getJSON()`函数，而 Node 并没有内置的`fetch()` API。本章一开始，我们就介绍了异步回调与事件。这个示例中也用到了回调和事件处理程序，因此它很好地示范了如何在其他异步编程风格基础上实现基于期约的 API。

示例 13-1: 异步`getJSON()`函数

```javascript
const http = require("http");

function getJSON(url) {
  // 创建并返回一个新期约
  return new Promise((resolve, reject) => {
    // 向指定的URL发送一个HTTP GET请求
    const request = http.get(url, response => { // 收到响应时调用
      // 如果HTTP状态码不对，拒绝这个期约
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Status: ${response.statusCode}`));
        response.resume(); // 这样才不会导致内存泄漏
      }
      // 如果响应头不对同样拒绝
      else if (response.headers["content-type"] !== "application/json") {
        reject(new Error("Invalid content-type"));
        response.resume(); // 不会造成内存泄漏
      }
      else {
        // 否则，注册事件处理程序读取响应体
        let body = "";
        response.setEncoding("utf-8");
        response.on("data", chunk => { body += chunk; });
        response.on("end", () => {
          // 接收全部响应体后，尝试解析它
          try {
            let parsed = JSON.parse(body);
            // 如果解析成功，兑现期约
            resolve(parsed);
          } catch (e) { // 如果解析失败，拒绝期约
            reject(e);
          }
        });
      }
    });
    // 如果收到响应之前请求失败（如网络故障），
    // 我们也会拒绝期约
    request.on("error", error => {
      reject(error);
    });
  });
}
```

## 13.2.7 串行期约

使用`Promise.all()`可以并行执行任意数量的期约，而期约链则可以表达一连串固定数量的期约。不过，按顺序运行任意数量的期约有点棘手。比如，假设我们有一个要抓取的 URL 数组，但为了避免网络过载，你想一次只抓取一个 URL。假如这个数组是任意长度，内容也未知，那就不能提前把期约链写出来，而是要像以下代码这样动态构建：

```javascript
function fetchSequentially(urls) {
  // 抓取URL时，要把响应体保存在这里
  const bodies = [];
  // 这个函数返回一个期约，它只抓取一个URL响应体
  function fetchOne(url) {
    return fetch(url)
      .then(response => response.text())
      .then(body => {
        // 把响应体保存到数组，这里故意
        // 省略了返回值（返回undefined）
        bodies.push(body);
      });
  }
  // 从一个立即（以undefined值）兑现的期约开始
  let p = Promise.resolve(undefined);
  // 现在循环目标URL，构建任意长度的期约链，
  // 链的每个环节都会拿取一个URL的响应体
  for (let url of urls) {
    p = p.then(() => fetchOne(url));
  }
  // 期约链的最后一个期约兑现后，响应体数组（bodies）
  // 也已经就绪。因此，可以将这个bodies数组通过期约
  // 返回。注意，这里并未包含任何错误处理程序
  // 我们希望把错误传播给调用者
  return p.then(() => bodies);
}
```

有了这个`fetchSequentially()`函数定义，就可以像使用前面演示的`Promise.all()`并行抓取一样，按顺序依次抓取每个 URL：

```javascript
fetchSequentially(urls)
  .then(bodies => { /* 处理得到的字符串数组 */ })
  .catch(e => console.error(e));
```

`fetchSequentially()`函数首先会创建一个返回后立即兑现的期约。然后基于这个初始期约构建一个线性的长期约链并返回链中的最后一个期约。这有点类似摆好一排多米诺骨牌，然后推倒第一张。

还有一种（可能更简练）的实现方式。不是事先创建期约，而是让每个期约的回调创建并返回下一个期约。换句话说，不是创建并连串一期约，而是创建解决为其他期约的期约。这种方式创建的就不是多米诺骨牌形式的期约链了，而是像俄罗斯套娃那样一系列相互嵌套的期约。此时，我们的代码可以返回第一个（最外层的）期约，知道它最终会兑现（或拒绝）为序列中最后一个（最内层的）期约兑现（或拒绝）的值。下面这个`promiseSequence()`函数是一个通用函数，不限于抓取 URL。之所以把它放到讨论期约的最后，是因为它比较复杂。不过，如果你认真读了这一章，应该可以理解它的工作原理。特别要注意`promiseSequence()`内部的那个函数，看起来它是在递归地调用自身，但因为这个 “递归” 调用是通过`.then()`方法完成的，所以不会有任何传统递归的行为发生：

```javascript
// 这个函数接收一个输入值数组和一个promiseMaker函数
// 对输入数组中的任何值x，promiseMaker(x)都应该返回
// 一个以预期的输出值y。这个函数返回一个期约，该期约
// 最终会兑现为一个包含计算得到的输出值的数组
// promiseSequence()不是一次性拥有所有期约后让它们
// 并行运行，而是每次运行一个期约，直到上一个期约兑现
// 之后，才会调用promiseMaker()计算下一个值
function promiseSequence([...inputs], promiseMaker) {
  // 为数组创建一个可以修改的私有副本
  inputs = [...inputs];
  // 这是要递归调用的函数
  function handleNextInput(outputs) {
    if (inputs.length === 0) {
      // 如果没有输入值了，则返回输出值的数组
      // 这个数组最终将兑现这个期约，以及所有之前
      // 已经解决但尚未兑现的期约
      return outputs;
    } else {
      // 如果还有要处理的输入值，那么我们将返回
      // 一个期约的对象，把当前值传给从
      // 新期约的对象来求值，当shim为f()时，取得下一个输入值
      let nextInput = inputs.shift(); // 计算出一个输出值
      return promiseMaker(nextInput) // 计算出一个输出值
        .then(output => outputs.concat(output)) // 把新的输出值添加到输出值的数组
        .then(outputs => { // 然后“递归”，传入新的、更长的输出值数组
          return handleNextInput(outputs);
        });
    }
  }
  // 从一个空的输出数组开始
  return Promise.resolve([]).then(handleNextInput);
}
```

这个`promiseSequence()`故意写成了通用的。我们可以像下面这样使用它抓取多个 URL 的响应：

```javascript
// 传入一个URL，返回一个以该URL的响应体文本兑现的期约
function fetchBody(url) { return fetch(url).then(r => r.text()); }
// 使用它依次抓取一组URL的响应体
promiseSequence(urls, fetchBody)
  .then(bodies => { /* 处理字符串数组 */ })
  .catch(console.error);
```

# 13.3 async 和 await

ES2017 新增了两个关键字：`async`和`await`，代表异步 JavaScript 编程范式的迁移。这两个新关键字极大简化了期约的使用，允许我们像编写因网络请求或其他异步事件而阻塞的同步代码一样，编写基于期约的异步代码。虽然理解期约的工作原理仍然很重要，但在通过`async`和`await`使用它们时，很多复杂性（有时候甚至连期约自身的存在感）都消失了。

正如本章前面所讨论的，异步代码不能像常规同步代码那样返回一个值或抛出一个异常。这也是期约会像一个同步函数返回的值，而拒绝期约的值就像一个同步函数抛出的值。后者的相似性通过`.catch()`方法的命名变得很明确。`async`和`await`接收期约的高效代码并且隐藏期约，让你的异步代码像低效阻塞的同步代码一样容易理解和推理。

## 13.3.1 await 表达式

`await`关键字接收一个期约并将其转换为一个返回值或一个抛出的异常。给定一个期约`p`，表达式`await p`会一直等到`p`落定。如果`p`兑现，那么`await p`的值就是兑现`p`的值。如果`p`被拒绝，那么`await p`表达式就会抛出拒绝`p`的值。我们通常并不会使用`await`来接收一个保存期约的变量，更多的是把它放在一个会返回期约的函数调用前面：

```javascript
let response = await fetch('/api/user/profile');
let profile = await response.json();
```

这里的关键是要明白，`await`关键字并不会导致你的程序阻塞或者在指定的期约落定前什么都不做。你的代码仍然是异步的，而`await`只是掩盖了这个事实。这意味着任何使用`await`的代码本身都是异步的。

## 13.3.2 async 函数

因为任何使用`await`的代码都是异步的，所以有一条重要的规则：**只能在以`async`关键字声明的函数内部使用`await`关键字**。以下是使用`async`和`await`将本章前面的`getHighScore()`函数重写之后的样子：

```javascript
async function getHighScore() {
  let response = await fetch('/api/user/profile');
  let profile = await response.json();
  return profile.highScore;
}
```

把函数声明为`async`意味着该函数的返回值将是一个期约，即便函数体中不出现期约相关的代码。如果`async`函数会正常返回，那么作为该函数真正返回值的期约对象将解决为这个明显的返回值。如果`async`函数会抛出异常，那么它返回的期约对象将以该异常被拒绝。

这个`getHighScore()`函数前面加了`async`，因此它会返回一个期约。由于它返回期约，所以我们可以对它使用`await`关键字：

```javascript
displayHighScore(await getHighScore());
```

不过要记住，这行代码只有在它位于另一个`async`函数内部时才能运行！你可以在`async`函数中嵌套`await`表达式，多深都没关系。但如果是在**顶级**<sup>注 2</sup>或因为某种原因在一个非`async`函数内部，那么就不能使用`await`关键字，而是必须以常规方式来处理返回的期约：

```javascript
getHighScore().then(displayHighScore).catch(console.error);
```

可以对任何函数使用`async`关键字。例如，可以在`function`关键字作为语句和作为表达式时使用，也可以对箭头函数和类及对象字面量中的简写方法使用（关于不同函数的各种写法，可以参考第 8 章）。

## 13.3.3 等候多个期约

假设我们使用`async`重写了`getJSON()`函数：

```javascript
async function getJSON(url) {
  let response = await fetch(url);
  let body = await response.json();
  return body;
}
```

再假设我们想使用这个函数抓取两个 JSON 值：

```javascript
let value1 = await getJSON(url1);
let value2 = await getJSON(url2);
```

以上代码的问题在于它不顺序执行。这样写就意味着必须等到抓取第一个 URL 的结果之后才会开始抓取第二个 URL 的值。如果第二个 URL 并不依赖从第一个 URL 抓取的值，那么应该可以尝试同时抓取两个值。这个示例显示了`async`函数本质上是基于期约的，要等候一组并发执行的`async`函数，可以像使用期约一样直接使用`Promise.all()`：

```javascript
let [value1, value2] = await Promise.all([getJSON(url1), getJSON(url2)]);
```

## 13.3.4 实现细节

最后，为了理解`async`函数的工作原理，有必要了解一下后台都发生了什么。

假设你写了一个这样的`async`函数：

```javascript
async function f(x) { /* 函数体 */ }
```

可以把这个函数想象成一个返回期约的包装函数，它包装了你原始函数的函数体：

```javascript
function f(x) {
  return new Promise(function(resolve, reject) {
    try {
      resolve((function(x) { /* 函数体 */ })(x));
    } catch(e) {
      reject(e);
    }
  });
}
```

像这样以语法转换的形式解释`await`关键字比较困难。但可以把`await`关键字想象成隔离体分割成的一系列独立的同步代码块。ES2017 解释器可以把函数体分割成一系列独立的同步代码块，每个子函数都将被传给位于它前面的以`await`标记的那个期约的`then()`方法。

# 13.4 异步迭代

本章开始先讨论了基于回调和事件的异步编程，之后在介绍期约时，也强调过它只适合单次运行的异步计算，不适合与重复性异步事件来源一起使用，例如`setInterval()`、浏览器中的`click`事件，或者 Node 流的`data`事件。由于一个期约无法用于连续的异步事件，我们也不能使用常规的`async`函数和`await`语句来处理这些事件。

不过，ES2018 为此提供了一个解决方案。异步迭代器与第 12 章描述的迭代器类似，但它们是基于期约的，而且使用时要配合一个新的`for/of`循环：`for/await`。

## 13.4.1 for/await 循环

Node 12 的可读流实现了异步可选代。这意味着可以像下面这样使用`for/await`循环从一个流中读取连续的数据块：

```javascript
const fs = require("fs");

async function parseFile(filename) {
  let stream = fs.createReadStream(filename, { encoding: "utf-8" });
  for await (let chunk of stream) {
    parseChunk(chunk); // 假设parseChunk()是在其他地方定义的
  }
}
```

与常规的`await`表达式类似，`for/await`循环也是基于期约的。大体上说，这里的异步迭代器会产生一个期约，而`for/await`循环会等待该期约兑现，将兑现值赋给循环变量，然后再运行循环体。之后再从头开始，从迭代器取得另一个期约并等待这个新期约兑现。

假设有如下 URL 数组：

```javascript
const urls = [url1, url2, url3];
```

可以对每个 URL 调用`fetch()`以取得一个期约的数组：

```javascript
const promises = urls.map(url => fetch(url));
```

在本章前面我们看到过，此时可以使用`Promise.all()`来等待数组中的所有期约兑现。但假设我们希望第一次抓取的结果尽快可用，不想因此而等待其他 URL（当然，也许第一次抓取的时间是最长的，因此这并不一定比用`Promise.all()`更快）。数组是可迭代的，因此我们可以使用常规的`for/of`循环来迭代这个期约数组：

```javascript
for(const promise of promises) {
  response = await promise;
  handle(response);
}
```

这个示例代码使用了常规的`for/of`循环和一个常规迭代器。但由于这个迭代器返回期约，所以我们也可以使用新的`for/await`循环让代码更简单：

```javascript
for await (const response of promises) {
  handle(response);
}
```

这里的`for/await`循环只是把`await`调用内置在循环中，从而让代码稍微简洁了一点，但这两个示例做的事情是一样的。关键在于，这两个示例都只能在以`async`声明的函数内部才能使用。从这方面来说，`for/await`循环与常规的`await`表达式没什么不同。

不过，最重要的是应该知道，在这个示例中我们是对一个常规的迭代器使用了`for/await`。如果是完全异步的迭代器，那么还会更有意思。

## 13.4.2 异步迭代器

让我们来回顾几个第 12 章的术语。可迭代对象是可以在`for/of`循环中使用的对象，它以一个符号名字`Symbol.iterator`定义了一个方法，该方法返回一个迭代器对象。这个迭代器对象有一个`next()`方法，可以反复调用它获取可迭代对象的值。迭代器对象的这个`next()`方法返回迭代结果对象。迭代结果对象有一个`value`属性或一个`done`属性。

异步迭代器与常规迭代器非常相似，但有两个重要区别。第一，异步可迭代对象以符号名字`Symbol.asyncIterator`而非`Symbol.iterator`实现了一个方法（如前所示，`for/await`与常规迭代器兼容，但它更适合异步可迭代对象，因此会在尝试`Symbol.iterator`法前先尝试`Symbol.asyncIterator`方法）。第二，异步迭代器的`next()`方法返回一个期约，解决为一个迭代器结果对象，而不是直接返回一个迭代器结果对象。

上一节，当我们对一个常规同步可迭代的期约数组使用`for/await`时，操作的是同步迭代器结果对象。其中，`value`属性是一个期约对象，但`done`属性是一个同步值。真正的异步迭代器返回的是迭代结果对象的期约，其中`value`和`done`都是异步值。两者的区别很微妙：对于异步迭代器，关于迭代何时结束的选择可以异步实现。

## 13.4.3 异步生成器

如第 12 章所述，实现迭代器的最简单方式通常是使用生成器。同理，对于异步迭代器也是如此，我们可以使用声明为`async`的生成器函数来实现它。声明为`async`的异步生成器同时具有异步函数和生成器的特性，即可以像在常规异步函数中一样使用`await`，也可以像在常规生成器中一样使用`yield`。但通过`yield`生成的值会自动包装到期约中。就连异步生成器的语法也是`async function`和`function*`的组合：`async function*`。下面这个示例展示了使用异步生成器和`for/await`循环，通过循环代码而非`setInterval()`回调函数实现以固定的时间间隔重复运行代码：

```javascript
// 一个基于期约的包装函数，以固定的时间间隔重复运行代码：
// 一个setTimeout的期约版，可以实现等待
function elapsedTime(ms) { // 会在指定毫秒数之后兑现
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 一个异步迭代器函数，按照固定的时间间隔
// 递增并生成指定（或无穷）个数的计数器
async function* clock(interval, max=Infinity) {
  for(let count = 1; count <= max; count++) { // 常规for循环
    await elapsedTime(interval); // 等待时间流逝
    yield count;                 // 生成计数器
  }
}

// 一个测试函数，使用异步迭代器和for/await
async function test() {
  for await (let tick of clock(300, 100)) { // 循环100次，每次间隔300ms
    console.log(tick);
  }
}
```

## 13.4.4 实现异步迭代器

除了使用异步生成器实现异步迭代器，还可以直接实现异步迭代器。这需要定义一个包含`[Symbol.asyncIterator]()`方法的对象，该方法要返回一个包含`next()`方法的对象，而这个`next()`方法要返回解决为一个迭代器结果对象的期约。在下面的代码中，我们重新实现了前面示例中的`clock()`函数，但它在这里并不是一个生成器，只是会返回一个新异步可迭代对象。注意这个示例中的`next()`方法，它并没有显式返回期约，我们只是把它声明为了`async next()`：

```javascript
function clock(interval, max = Infinity) {
    // 注意参数是一个绝对时间而非时间间隔
    // 一个setTimeout的期约版，可以实现等待
    function until(time) {
        return new Promise(resolve => setTimeout(resolve, time - Date.now()));
    }

    let start = Date.now(); // 记住开始时间
    let count = 0;          // 记住第几次迭代

    // 返回一个异步可迭代对象
    return {
        async next() { // next()方法使其成为迭代器
            if (++count > max) { // 该结果表示结束的迭代结果
                return { done: true };
            }
            // 计算下次迭代什么时候开始
            let targetTime = start + count * interval;
            // 等待该时间到来
            await until(targetTime);
            // 在迭代结果对象中返回计数器的值
            return { value: count };
        },
        // 这个方法意味着这个迭代器对象同时也是一个可迭代对象
        [Symbol.asyncIterator]() { return this; }
    };
}
```

这个基于迭代器的`clock()`函数修复了基于生成器版本的一个缺陷。注意，在这个更新的代码中，我们使用的是每次迭代应该开始的绝对时间减去当前时间，得到要传给`setTimeout()`的时间间隔。如果在`for/await`循环中使用`clock()`，这个版本会更精确地按照指定的时间间隔运行循环迭代。因为这个时间间隔包含了循环体运行的时间。不过这个修复并不仅仅与计时精度有关。`for/await`循环在开始下一次迭代之前，总会等待一次迭代返回的期约兑现。但如果不是在`for/await`循环中使用异步迭代器，那你可以在任何时候调用`next()`方法。对于基于生成器的`clock()`版本，如果连续调用 3 次`next()`方法，就可以得到 3 个期约，而这 3 个期约将几乎同时兑现，而这可能并非你想要的。在这里实现的这个基于迭代器的版本则没有这个问题。

异步迭代器的优点是它允许我们表示异步事件流或数据流。前面讨论的`clock()`函数写起来相当简单，因为其中的异步性源于由我们决定的`setTimeout()`调用。但是，在面对其他异步源时，比如事件处理程序的触发，要实现异步迭代器就会困难很多。因为通常我们只有一个事件处理程序响应事件，但每次调用迭代器的`next()`方法都必须返回一个独一无二的期约对象，而在第一个期约解决之前很有可能出现多次调用`next()`的情况。这意味着任何异步迭代器方法都必须能在内部维护一个期约队列，让这些期约按照异步事件发生的顺序依次解决。如果把这个期约队列的逻辑封装到一个`AsyncQueue`类中，再基于这个类编写异步迭代器就会简单多了<sup>注 3</sup>。

下面定义的这个`AsyncQueue`类包含一个队列就会简单多了<sup>注 3</sup>。

下面定义的这个`AsyncQueue`类包含一个迭代器类应有的`enqueue()`和`dequeue()`方法。其中，`dequeue()`方法返回一个期约而不是一个实际的值。这意味着在尚未调用`enqueue()`之前调用`dequeue()`是没有问题的。这个`AsyncQueue`类也是一个异步迭代器（有意设计为与`for/await`循环配合使用，其循环体会在每次入队一个新值时运行一次）。`AsyncQueue`类有一个`close()`方法，一经调用就不能再向队列中加入值了。当一个关闭的队列变空时，`for/await`循环会停止循环。

注意，`AsyncQueue`类的实现没有使用`async`和`await`，而是直接使用期约。实现代码有点复杂，你可以通过它来测试自己对本章那么大篇幅所介绍内容的理解。即使不能完全理解这个`AsyncQueue`的实现，也要看一看它后面那个更短的示例，它基于`AsyncQueue`实现一个简单但非常有意思的异步迭代器。

```javascript
/**
 * 一个异步可迭代队列类。使用enqueue()添加值，
 * 使用dequeue()移除值，dequeue()返回一个期约。
 * 这意味着，值可以在传入[Symbol.asyncIterator]之前出队。这个类实现了
 * [Symbol.asyncIterator]和next()，因而可以
 * 与for/await循环一起配合使用（这个循环会在调用
 * close()方法前不会终止）
 */
class AsyncQueue {
    constructor() {
        // 已经入队尚未出队的值保存在这里
        this.values = [];
        // 被dequeue()调用但它们对应的值尚未入队，
        // 就把后期约的解决方法保存在这里
        this.resolvers = [];
        // 一旦关闭，任何值都不能再入队，
        // 也不会再返回任何未兑现的期约
        this.closed = false;
    }

    enqueue(value) {
        if (this.closed) {
            throw new Error("AsyncQueue closed");
        }
        if (this.resolvers.length > 0) {
            // 如果这个值已有对应的期约，则解决该期约
            const resolve = this.resolvers.shift();
            resolve(value);
        } else {
            // 否则，让它去排队
            this.values.push(value);
        }
    }

    dequeue() {
        if (this.values.length > 0) {
            // 如果有一个排队的值，为它返回一个解决期约
            const value = this.values.shift();
            return Promise.resolve(value);
        } else if (this.closed) {
            // 如果这个队列认为是空，而且队列已关闭，
            // 返回一个解决为EOS（流终止）标记的期约
            return Promise.resolve(AsyncQueue.EOS);
        } else {
            // 否则，返回一个未解决的期约，
            // 将解决方法排队，以便后面使用
            return new Promise((resolve) => { this.resolvers.push(resolve); });
        }
    }

    close() {
        // 一旦关闭，任何值都不能再入队
        // 一旦关闭，标记解决所有待解决期约
        while (this.resolvers.length > 0) {
            this.resolvers.shift()(AsyncQueue.EOS);
        }
        this.closed = true;
    }

    // 定义这个方法，让这个类成为异步可迭代对象
    [Symbol.asyncIterator]() { return this; }

    // 定义这个方法，让这个类成为异步迭代器
    // dequeue()返回的期约都会解决为一个值，
    // 或者在关闭时解决为EOS标记。这里，我们
    // 需要返回一个解决为迭代器结果对象的期约
    next() {
        return this.dequeue().then(value => (value === AsyncQueue.EOS)
            ? { value: undefined, done: true }
            : { value: value, done: false });
    }
}

// dequeue()方法返回的标记值，在关闭时表示“流终止”
AsyncQueue.EOS = Symbol("end-of-stream");
```

因为这个`AsyncQueue`类定义了异步迭代的基础，所以我们可以创建更有意思的异步迭代器，只要简单地对值异步排队即可。下面这个示例使用`AsyncQueue`产生了一个浏览器事件流，可以通过`for/await`循环来处理：

```javascript
// 把指定文档元素上指定类型的事件推入一个AsyncQueue对象，
// 然后返回这个队列，以便将其作为事件流来使用
function eventStream(elt, type) {
  const q = new AsyncQueue();
  elt.addEventListener(type, e=>q.enqueue(e)); // 入队事件
  return q;
}

async function handleKeys() {
  // 取得一个keypress事件流，对每个事件都执行一次循环
  for await (const event of eventStream(document, "keypress")) {
    console.log(event.key);
  }
}
```

# 13.5 小结

本章，我们学习了如下内容：

- 实际当中的大部分 JavaScript 编程都是异步编程。
- 过去，异步操作都以事件和回调函数的方式处理。然而，这样可能导致代码逻辑复杂化。因为回调可能发生多层嵌套，另外也很难进行可靠的错误处理。
- 期约提供了一种结构化回调函数的新方式。如果使用得当（可惜的是，期约很容易使用失当），它们可以把原本需要嵌套的异步代码转换为线性的`then()`调用链，其中前一个异步操作之后把一个新操作环节环相扣。另外，期约也支持在`then()`调用链的末尾用一个`catch()`调用集中处理错误。
- `async`和`await`关键字可以让我们以同步代码的形式写出基于期约的异步代码。这样可以让代码更容易理解和推断。如果把函数声明为`async`，它会隐式返回一个期约。在`async`函数内部，你可以使用`await`等候一个期约（或一个返回期约的函数），就像该期约值是同步计算得到的一样。
- 异步迭代的对象可以在`for/await`循环中使用。要创建异步可迭代对象，可以实现`[Symbol.asyncIterator]()`方法，也可以调用一个`async function*`生成器函数。异步迭代器在 Node 中可能代替基于流的`data`事件，在客户端 JavaScript 中可以用来表示用户输入事件流。









