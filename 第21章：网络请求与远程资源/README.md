2005 年，Jesse James Garrett 攥写了一篇文章，Ajax — A New Apporach to Web Applications。这篇文章中描绘了一个被她称作 Ajax（Asynchronous JavaScript + XML，即异步 JavaScript 加 XML）的技术。这个技术涉及发送服务器请求额外数据而不刷新页面，从而实现更好的用户体验。Garret 解释了这个技术怎样改变自 Web 诞生以来就一直延续的传统单击等待的模式。

把 Ajax 推到历史舞台上的关键技术是 XMLHttpRequest（XHR）对象。这个对象最早由微软发明，然后被其他浏览器所借鉴。在 XHR 出现之前，Ajax 风格的通信必须通过一些黑科技实现，只要是使用隐藏的窗格或内嵌窗格。XHR 为发送服务器请求和获取响应提供了合理的接口。这个接口可以实现异步从服务器获取额外数据，意味着用户点击不用页面刷新也可以获取数据。通过 XHR 对象获取数据后，可以使用 DOM 方法把数据插入网页。虽然 Ajax 这个名称中包含 XML，但实际上 Ajax 通信与数据格式无关。这个技术主要是可以实现在不刷新页面的情况下从服务器获取数据，格式并不一定是 XML。

实际上，Garrett 所称的这种 Ajax 技术已经出现很长时间了。在 Garrett 那篇文章之前，一般称这种技术为远程脚本。这种浏览器与服务器的通信早在 1998 年就通过不同方式实现了。最初，JavaScript 对服务器的请求可以通过中介（如 Java 小程序或 Flash 脚本）来发送。后来 XHR 对象又为开发者提供了原生的浏览器通信能力，减少了实现这个目的的工作量。

在现代 Web 开发中，Fetch API 已经很大程度上取代了 XMLHttpRequest（XHR）。Fetch 为发送网络请求提供了更简单也更直观的接口，同时具有更灵活、更强大的特性。尤其是 Fetch 是基于期约（Promise）的，相比 XHR 复杂且容易出错的回调，期约为处理异步代码提供了更简单、一致的手段。此外，Fetch 支持的流式响应、请求取消和自动请求重发，也都是 XHR 不支持的。虽然在遗留代码中还能见到 XHR，但在新项目中还是推荐使用 Fetch，毕竟其功能太强大了。

>注意
>
>XMLHttpRequest 虽然受到广泛支持，但它是过时的 JavaScript 规范的产物，本章不讨论它。推荐使用各方面都更优越的 Fetch API。

# 1. Fetch API

Fetch API 是 WHATWG 的一个活标准，用规范原文说，就是 Fetch 标准定义请求、响应，以及绑定二者的流程：获取（fetch）。

Fetch API 主要用于通过 JavaScript 请求资源和传输数据，同时这个 API 也能够应用在服务工作者线程（service worker）中，提供拦截、重定向和修改通过 fetch() 生成的请求接口。

## 1. 基本用法

fetch() 方法是暴露在全局作用域中的，包括主页面执行线程、模块和工作线程。调用这个方法，浏览器就会向给定 URL 发送请求。

### 1. 分派请求

fetch() 只有一个必需的参数 input。多数情况下，这个参数是要获取资源的 URL。这个 URL 相对于调用代码所在的页面，当然也可以是绝对路径。

这个方法返回一个期约：

```javascript
let r = fetch('/bar');
console.log(r); // Promise <pending>
```

请求完成、资源可用时，期约会解决为一个 Response 对象。这个对象是 API 的封装，可以通过它取得相应资源。获取资源要使用这个对象的属性和方法，掌握响应的情况并将负载转换为有用的形式，如下所示：

```javascript
fetch('bar.txt')
	.then((response) => {
    	console.log(response);
	});

// Response { type: "basic", url: ... }
```

### 2. 读取响应

读取其响应内容的最简单方式是取得传文本格式的内容，这要用到 text() 方法。这个方法返回一个期约，会解决为取得资源的完整内容：

```javascript
fetch('bar.txt')
	.then((response) => response.text())
	.then((data) => console.log(data));

// bar.txt 的内容
```

### 3. 处理状态码和请求失败

Fetch API 支持通过 Response 的 status（状态码）和 statusText（状态文本）属性检查响应状态。成功获取响应的请求通常会产生值为 200 的状态码，如下所示：

```javascript
fetch('/bar')
	.then((response) => {
    	console.log(response.status); // 200
    	console.log(response.statusText); // OK
	});
```

请求不存在的资源通常会产生值为 404 的状态码：

```javascript
fetch('./does-not-exist')
	.then((response) => {
    	console.log(response.status); // 404
    	console.log(response.statusText); // Not Found
	})
```

请求的 URL 如果抛出服务器错误会产生值为 500 的状态码：

```javascript
fetch('/throw-server-error')
	.then((response) => {
    	console.log(response.status); // 500
    	console.log(response.statusText); // Internal Server Error
	});
```

可以显式地设置 fetch() 在遇到重定向时的行为（本章后面会介绍），不过默认行为是跟随重定向并返回状态码不是 300~399 的响应。跟随重定向时，响应对象的 redirected 属性会被设置为 true，而状态码仍然是 200：

```javascript
fetch('/permanent-redirect')
	.then((response) => {
    	// 默认行为是跟随重定向直到最终 URL
   		// 这个例子会出现两轮网络请求
    	// <origin url>/permanent-redirect -> <redirect url>
    	console.log(response.status); // 200
    	console.log(response.statusText); // OK
    	console.log(response.redirected); // true
	});
```

在前面这几个例子中，虽然请求可能失败（如状态码为 500），但都只执行了期约的解决处理函数。事实上，只要服务器返回了响应，fetch() 期约都会解决。这个行为是合理的：系统级网络协议已经成为完成消息的一次往返传输。至于真正的成功请求，则需要在处理响应时再定义。

通常状态码为 200 时就会被认为成功了，其他情况可以被认为未成功。为区分这两种情况，可以在状态码非 200~299 时检查 Response 对象的 ok 属性：

```javascript
fetch('/bar')
	.then((response) => {
    	console.log(response.status); // 200
    	console.log(response.ok); // true
	});
fetch('/does-not-exist')
	.then((response) => {
    	console.log(response.status); // 404
    	console.log(response.ok); // false
	});
```

因为服务器没有响应而导致浏览器超时，这样真正的 fetch() 失败会导致期约被拒绝：

```javascript
fetch('/hangs-forever')
	.then((response) => {
    	console.log(response);
	}, (err) => {
    	console.log(err);
	});

//（浏览器超时后）
// TypeError: "NetworkError when attempting to fetch resource."
```

违反 CORS、无网络连接、HTTPS 错配及其他浏览器/网络策略问题都会导致期约被拒绝。可以通过 url 属性检查通过 fetch() 发送请求时使用的完整 URL：

```javascript
// example.com/bar/baz 发送的请求
console.log(window.location.href); // https://example.com/bar/baz

fetch('qux').then((response) => console.log(response.url));
// https://example.com/bar/qux

fetch('/qux').then((response) => console.log(response.url));
// https://example.com/qux

fetch('//example.com').then((response) => console.log(response.url));
// https://example.com

fetch('https://example.com').then((response) => console.log(response.url));
// https://example.com
```

### 4. 自定义选项

只使用 URL 时，fetch() 会发送 GET 请求，只包含最低限度的请求头。要进一步配置如何发送请求，需要传入可选的第二个参数 init 对象。init 对象要按照下表中的键/值进行填充。

```
body		指定使用请求体时请求体的内容

			必须是 Blob、BufferSource、FormData、URLSearchParams、ReadableStream 或 String 的实例

cache	    用于控制浏览器与 HTTP 缓存的交互。要跟踪缓存的重定向，请求的 redirect 属性值必须是 "follow"，而且必须符合同源策略限制。必须是下列值之一

			Default
			
			- fetch() 返回命中的有效缓存。不发送请求		
            
			- 命中无效（stale）缓存会发送条件式请求。如果响应已经改变，则更新缓存的值。然后 fetch() 返回缓存的值
			
			- 未命中缓存会发送请求，并缓存响应。然后 fetch() 返回响应
			
            no-store
            
            - 浏览器不检查缓存，直接发送请求
            
            - 不缓存响应，直接通过 fetch() 返回
            
            reload
            
            - 浏览器不检查缓存，直接发送请求
            
            - 不缓存响应，直接通过 fetch() 返回
            
            no-cache
            
            - 无论命中有效缓存还是无效缓存都会发送条件式请求。如果响应已经改变，则更新缓存的值。然后 fetch() 返回缓存的值
            
            - 未命中缓存会发送请求，并缓存响应。然后 fetch() 返回响应
            
            force-cache
            
            - 无论命中有效缓存还是无效缓存都通过 fetch() 返回。不发送请求
            
            - 未命中缓存会发送请求，并缓存响应。然后 fetch() 返回响应
            
            only-if-cached
            
            - 只在请求模式为 same-origin 时使用缓存
            
            - 无论命中有效缓存还是无效缓存都通过 fetch() 返回。不发送请求
            
            - 未命中缓存返回状态码为 504（网关超时）的响应
            
            默认为 default

credentials 用于指定在外发请求中如何包含 cookie
			必须是下列字符串值之一
			
			- omit：不发送 cookie
			
			- same-origin：只在请求 URL 与发送 fetch() 请求的页面同源时发送 cookie
			
			- include：无论同源还是跨源都包含 cookie
			
			在支持 Credential Management API 的浏览器中，也可以是一个 FederatedCredential 或 PasswordCredential 的实例
			默认为 same-origin

headers		用于指定请求头部
			必须是 Headers 对象实例或包含字符串格式键/值对的常规对象
			默认值为不包含键/值对的 Headers 对象。这不意味着请求不包含任何头部，浏览器仍然会随请求发送一些头部。虽然这些头部对 JavaScript 不可见，但浏			览器的网络检查器可以观察到

integrity	用于强制子资源完整性
			必须是包含子资源完整性标识符的字符串
			默认为空字符串

keepalive	用于指示浏览器允许请求存在时间超出页面生命周期。适合报告时间或分析，比如页面在 fetch() 请求后很快卸载。设置 keep-alive 标志的 fetch() 请				求可用于替代 Navigator.sendBeacon()
			必须是布尔值
			默认为 false

method		用于指定 HTTP 请求方法
			基本上就是如下字符串值：
			- GET
			- POST
			- PUT
			- PATCH
			- DELETE
			- HEAD
			- OPTIONS
			- CONNECT
			- TRACE
			默认为 GET

mode		用于指定请求模式。这个模式决定来自跨源请求的响应是否有效，以及客户端可以读取多少响应违反这里指定模式的请求会抛出错误
			必须是下列字符串之一
			- cors：允许遵守 CORS 协议的跨源请求。响应是 CORS 过滤的响应，意思是响应中可以访问的浏览器头部是经过浏览器强制白名单过滤的
			- no-cors：允许不需要发送预检请求的跨源请求（HEAD、GET 和只带有满足 CORS 请求头部的 POST）。响应类型是 opaque，意思是不能读取响应内容
			- same-origin：任何跨源请求都不允许发送
			- navigate：用于支持 HTML 导航，只在文档间导航时使用。基本用不到
			在通过构造函数手动创建 Request 实例时，默认为 cors。否则，默认为 no-cors

redirect	用于指定如何处理重定向响应（状态码为 301、302、303、307 或 308）
			必须是下列字符串值之一
			
			- follow：跟踪重定向请求，以最终非重定向 URL 的响应作为最终响应
			
			- error：重定向请求会抛出错误
			
			- manual：不跟踪重定向请求，而是返回 opaqueredirect 类型的响应，同时仍然暴露期望的重定向 URL。允许以手动方式跟踪重定向
			
			默认为 follow

referrer	用于指定 HTTP 的 Referer 头部的内容
			必须是下列字符串值之一
			
			- no-referrer：以 no-referer 作为值
			
			- client/about:client：以当前 URL 或 no-referer（取决于来源策略 referrerPolicy）作为值
			
			- <URL>：以伪造 URL 作为值。伪造 URL 的源必须与执行脚本的源匹配
			
			默认为 client/about:client

referrerPolicy	用于指定 HTTP 的 Referer 头部
				必须是下列字符串值之一
				
				no-referrer
				
				- 请求中不包含 Referer 头部
				
				no-referrer-when-downgrade
				
				- 对于从安全 HTTPS 上下文发送到 HTTP URL 的请求，不包含 Referer 头部
				
				- 对于所有其他请求，将 Referer 设置为完整 URL
				
				origin
				
				- 对于所有请求，将 Referer 设置为只包含源头
				
				same-origin
				
				- 对于跨源请求，不包含 Referer 头部
				
				- 对于同源请求，将 Referer 设置为完整 URL
				
				strict-orgin
				
				- 对于从安全 HTTPS 上下文发送到 HTTP URL 的请求，不包含 Referer 头部
				
				对于所有其他请求，将 Referer 设置为只包含源
				
				origin-when-cross-origin
				
				- 对于跨源请求，将 Referer 设置为只包含源
				
				- 对于同源请求，将 Referer 设置为完整 URL
				
				strict-origin-when-cross-origin
				
				- 对于从安全 HTTPS 上下文发送到 HTTP URL 的请求，不包含 Referer 头部
				
				- 对于所有其他跨源请求，将 Referer 设置为只包含源
				
				- 对于同源请求，将 Referer 设置为完整 URL
				
				默认为 no-referrer-when-downgrade

signals			用于支持通过 AbortController 中断进行中的 fetch() 请求

				必须是 AbortSignal 的实例
				
				默认为未关联控制器的 AbortSignal 实例
```

## 2. 常见 Fetch 请求模式

fetch() 既可以发送数据也可以接收数据。使用 init 对象参数，可以配置 fetch() 在请求体中发送各种序列化的数据。

### 1. 发送 JSON 数据

可以像下面这样发送简单 JSON 字符串：

```javascript
let payload = JSON.stringify({
    foo: 'bar'
});

let jsonHeaders = new Headers({
    'Content-Type': 'application/json'
});

fetch('/send-me-json', {
    method: 'POST', // 发送请求体时必须使用 HTTP 方法
    body: payload,
    headers: jsonHeaders
});
```

### 2. 在请求体中发生参数

因为请求体支持任意字符串值，所以可以通过它发送请求参数：

```javascript
let payload = 'foo=bar&baz=qux';

let paramHeaders = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
});

fetch('/send-me-params', {
    method: 'POST', // 发送请求体时必须使用一种 HTTP 方法
    body: payload,
    headers: paramHeaders
});
```

### 3. 发送文件

因为请求体支持 FormData 实现，所以 fetch() 也可以序列化并发送文件字段中的文件：

```javascript
let imageFormData = new FormData();
let imageInput = document.querySelector("input[type='file']");

imageFormDaata.append('image', imageInput.files[0]);

fetch('/img-upload', {
    method: 'POST',
    body: imageFormData
});
```

这个 fetch() 实现可以支持多个文件：

```javascript
let imageFormData = new FormData();
let imageInput = document.queySelector("input[type='file'][multiple]");

for (let i = 0; i < imageInput.files.length; ++i) {
    imageFormData.append('image', imageInput.files[i]);
}

fetch('/img-upload', {
    method: 'POST',
    body: imageFormData
});
```

### 4. 加载 Blob 文件

Fetch API 也能提供 Blob 类型的响应，而 Blob 又可以兼容多种浏览器 API。一种常见的做法是明确将图片文件加载到内存，然后将其添加到 HTML 图片元素。为此，可以使用响应对象上暴露的 blob() 方法。这个方法返回一个期约，解决为一个 Blob 的实例。然后，可以将这个实例传给 URL.createObjectURL() 以生成可以添加给图片元素 src 属性的值：

```javascript
const imageElement = document.querySelector('img');

fetch('my-image.png')
	.then((response) => response.blob())
	.then((blob) => {
    	imageElement.src = URL.createObjectURL(blob);
	});
```

### 5. 发送跨源请求

从不同的源请求资源，响应要包含 CORS 头部才能保证浏览器收到响应。没有这些头部，跨源请求会失败并抛出错误。

```javascript
fetch('//example.com');
// TypeError: Failed to fetch
// No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

如果代码不需要访问响应，也可以发送 no-cors 请求。此时响应的 type 属性值为 opaque，因此无法读取响应内容。这种方式适合发送探测请求或者将响应缓存起来供以后使用。

```javascript
fetch('//example.com', (method: 'no-cors')
      	.then((response) => console.log(response.type));
      
// opaque
```

### 6. 中断请求

Fetch API 支持通过 AbortController/AbortSignal 对中断请求。调用 AbortController.abort() 会中断所有网络传输，特别适合希望停止传输大型负载的情况。中断进行中的 fetch() 请求会导致包含错误的拒绝。

```javascript
let abortController = new AbortController();

fetch('wikipedia.zip', { signal: abortController.signals })
	.catch(() => console.log('aborted!'));

// 10 毫秒后中断请求
setTimeout(() => abortController.abort(), 10);

// 已经中断
```

## 3. Headers 对象

Headers 对象是所有外发请求和入站响应头部的容器。每个外发的 Request 实例都包含一个空的 Headers 实例，可以通过 Request.prototype.headers 访问，每个入站 Response 实例也可以通过 Response.prototype.headers 访问包含着响应头部的 Headers 对象。这两个属性都是可修改属性。另外，使用 new Headers() 也可以创建一个新实例。

Headers 对象与 Map 对象极为相似。这是合理的，因为 HTTP 头部本质上是序列化后的键/值对，它们的 JavaScript 表示则是中间接口。Headers 与 Map 类型都有 get()、set()、has() 和 delete() 等实例方法。这两种类型都可以使用一个可迭代对象来初始化，而且它们也都有相同的 keys()、values() 和 entries() 迭代器接口。

### 1. Headers 独有的特性

Headers 并不是与 Map 处处都一样。在初始化 Headers 对象时，也可以使用键/值对形式的对象，Map 则不可以：

```javascript
let seed = { foo: 'bar' };

let h = new Headers(seed);
console.log(h.get('foo')); // bar

let m = new Map(seed);
// TypeError: object is not iterable
```

一个 HTTP 头部字段可以有多个值，而 Headers 对象通过 append() 方法支持添加多个值。在 Headers 实例中还不存在的头部上调用 append() 方法相当于调用 set()。后续调用会以逗号为分隔符拼接多个值：

```javascript
let h = new Headers();

h.append('foo', 'bar');
console.log(h.get('foo')); // "bar"

h.append('foo', 'baz');
console.log(h.get('foo')); // "bar, bazj"
```

### 2. 头部护卫

某些情况下，并非所有 HTTP 头部都可以被客户端修改，而 Headers 对象使用护卫来防止不被允许的修改。不同的护卫设置会改变 set()、append() 的 delete() 的行为。违反护卫限制会抛出TypeError。

Headers 实例会因来源不同而展现不同的行为，它们的行为由护卫来控制。JavaScript 可以决定 Headers 实例的护卫设置。下表列出了不同的护卫设置和每种设置对应的行为。

| 护卫            | 适用情形                                                     | 限制                                                         |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| none            | 在通过构造函数创建 Headers 实例时激活                        | 无                                                           |
| request         | 在通过构造函数初始化 Request 对象，且 mode 值为非 no-cors 时激活 | 不允许修改禁止修改的头部（参见 MDN 文档中的 forbidden header name 词条） |
| request-no-cors | 在通过构造函数初始化 Request 对象，且 mode 值为 no-cors 时激活 | 不允许修改非简单头部（参见 MDN 文档中的 simple header 词条） |
| response        | 在通过构造函数初始化 Response 对象时激活                     | 不允许修改禁止修改的响应头部（参见 MDN 文档中的 forbidden response header name 词条） |
| immutable       | 在通过 error() 或 redirect() 静态方法初始化 Response 对象时激活 | 不允许修改任何头部                                           |

## 4. Request 对象

顾名思义，Request 对象是获取资源请求的接口。这个接口暴露了请求的相关信息，也暴露了使用请求体的不同方式。

>注意
>
>与请求体相关的属性和方法将在本章 21.1.6 节介绍。

### 1. 创建 Request 对象

可以通过构造函数初始化 Request 对象。为此需要传入一个 input 参数，一般是 URL：

```javascript
let r = new Request('http://example.com');
console.log(r);
// Request {...}
```

Request 构造函数也接收第二个参数，一个 init 对象。这个 init 对象与前面介绍的 fetch() 的 init 对象一样。没有在 init 对象中涉及的值会使用默认值：

```javascript
// 用所有默认值创建 Request 对象
console.log(new Request(''));

// 用指定的初始值创建 Request 对象
console.log(new Request('http://example.com', { method: 'POST' }));
```

### 2. 克隆 Request 对象

Fetch API 提供了两种不太一样的方式用于创建 Request 对象的副本。使用 Request 构造函数和使用 clone() 方法。

将 Request 实例作为 input 参数传给 Request 构造函数，会得到该请求的一个副本：

```javascript
let r1 = new Request('https://example.com');
let r2 = new Request(r1);

console.log(r2.url); // https://example.com/
```

如果再传入 init 对象，则 init 对象的值会覆盖源对象中同名的值：

```javascript
let r1 = new Request('http://example.com');
let r2 = new Request(r1, { method: 'POST' });

console.log(r1.method); // GET
console.log(r2.method); // POST
```

这种克隆方式并不总能得到一模一样的副本。最明显的是，第一个请求的请求体会被标记为已使用：

```javascript
let r1 = new Request('http://example.com', { method: 'POST', body: 'foobar' });
let r2 = r1.clone();

console.log(r1.url); // https://example.com/
console.log(r2.url); // https://example.com/

console.log(r1.bodyUsed); // false
console.log(r2.bodyUsed); // false
```

如果请求对象的 bodyUsed 属性为 true（即请求体已被读取），那么上述任何一种方式都不能用来创建这个对象的副本。在请求体被读取之后再克隆会导致抛出 TypeError。

```javascript
let r = new Request('https://example.com');
r.clone();
new Request(r);
// 没有错误

r.text(); // 设置 bodyUsed 为 true

r.clone();
// TypeError: Failed to execute 'clone' on 'Request': Request body is already used

new Request(r);
// TypeError: Failed to construct 'Request': Cannot construct a Request with
// a Request object that has already been used.
```

### 3. 在 fetch() 中使用 Request 对象

fetch() 和 Request 构造函数拥有相同的函数签名并不是巧合。在调用 fetch() 时，可以传入已经创建好的 Request 实例而不是 URL。与 Request 构造函数一样，传给 fetch() 的 init 对象会覆盖传入请求对象的值：

```javascript
let r = new Request('https://example.com');

// 向 example.com 发送 GET 请求
fetch(r);

// 向 example.com 发送 POST 请求
fetch(r, { method: 'POST' });
```

fetch() 会在内部克隆传入的 Request 对象。与克隆 Request 一样，fetch() 也不能拿请求体已经用过的 Request 对象来发送请求：

```javascript
let r = new Request('https://example.com', { method: 'POST', body: 'foobar' });

r.text();

fetch(r);
// TypeError: Cannot construct a Request with a Request object that has
// already been used.
```

关键在于，通过 fetch 使用 Request 会将请求体标记为已使用。也就是说，有请求体的 Request 只能在一次 fetch 中使用。（不包含请求体的请求不受此限制。）演示如下：

```javascript
let r = new Request('https://example.com', { method: 'POST', body: 'foobar' });

fetch(r);

fetch(r);
// TypeError: Cannot construct a Request with a Request object that has
// already been used.
```

要想基于包含请求体的相同 Request 对象多次调用 fetch()，必须在第一次发送 fetch() 请求前调用 clone()：

```javascript
let r = new Request('https://example.com', { method: 'POST', body: 'foobar' });

// 3 个都会成功
fetch(r.clone());
fetch(r.clone());
fetch(r);
```

## 5. Response 对象

顾名思义，Response 对象是获取资源响应的接口。这个接口暴露了响应的相关信息，也暴露了使用响应体的不同方式。

>注意
>
>与响应体相关的属性和方法将在本章 21.1.6 节介绍。

### 1. 创建 Response 对象

可以通过构造函数初始化 Response 对象且不需要参数。此时响应实例的属性均为默认值，因为它并不代表实际的 HTTP 响应：

```javascript
let r = new Response();
console.log(r);
```

Response 构造函数接收一个可选的 body 参数，这个 body 可以是 null，等同于 fetch() 参数 init 中的 body。还可以接收一个可选的 init 对象，这个对象可以包含下表所列的键和值。

| 键         | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| headers    | 必须是 Headers 对象实例或包含字符串键/值对的常规对象实例<br>默认为没有键/值对的 Headers 对象 |
| status     | 表示 HTTP 响应状态码的整数<br>默认为 200                     |
| statusText | 表示 HTTP 响应状态的字符串<br>默认为空字符串                 |

可以像下面这样使用 body 和 init 来构建 Response 对象“

```javascript
let r = new Response('foobar', {
    status: 418,
    statusText: 'I\'m a teapot'
});
console.log(r);
```

大多数情况下，产生 Response 对象的主要方式是调用 fetch()，它返回一个最后会解决为 Response 对象的期约，这个 Response 对象代表实际的 HTTP 响应。下面的代码展示了这样得到的 Response 对象：

```javascript
fetch('https://example.com')
	.then((response) => {
    	console.log(response);
	});
```

Response 类还有两个用于生成 Response 对象的静态方法：Response.redirect() 和 Response.error()。前者接收一个 URL 和一个重定向状态码（301、302、303、307 或 308），返回重定向的 Response 对象：

```javascript
console.log(Response.redirect('https://example.com', 301));
```

提供的状态码必须对应重定向，否则会抛出错误：

```javascript
Response.redirect('https://example.com', 200);
// RangeError: Failed to execute 'redirect' on 'Response': Invalid status code
```

另一个静态方法 Response.error() 用于产生表示网络错误的 Response 对象（网络错误会导致 fetch() 期约被拒绝）。

```javascript
console.log(Response.error());
```

### 2. 读取响应状态信息

Response 对象包含一组只读属性，描述了请求完成后的状态，如下表所示。

| 属性       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| headers    | 响应包含的 Headers 对象                                      |
| ok         | 布尔值，表示 HTTP 状态码的含义。200~299 的状态码返回 true，其他状态码返回 false |
| redirected | 布尔值，表示响应是否至少经过一次重定向                       |
| status     | 整数，表示响应的 HTTP 状态码                                 |
| statusText | 字符串，包含对 HTTP 状态码的正式描述。这个值派生自可选的 HTTP Reason-Phrase 字段，因此如果服务器以 Reason-Phrase 为由拒绝响应，这个字段可能是空字符串 |
| type       | 字符串，包含响应类型。可能是下列字符串之一<br>- basic：表示标准的同源响应<br>- cors：表示标准的跨源响应<br>- error：表示响应对象是通过 Response.error() 创建的<br>- opaque：表示 no-cors 的 fetch() 返回的跨源响应<br>- opaquereddirect：表示对 redirect 设置为 manual 的请求的响应 |
| url        | 包含响应 URL 的字符串。对于重定向响应，这是最终的 URL，非重定向响应就是它产生的 |

以下代码演示了返回 200、302、404 和 500 状态码的 URL 对应的响应：

```javascript
fetch('//example.com').then(console.log);

fetch('//example.com/redirect-me').then(console.log);

fetch('//example.com/does-not-exist').then(console.log);

fetch('//example.com/throws-error').then(console.log);
```

### 3. 克隆 Response 对象

克隆 Response 对象的主要方式是使用 clone() 方法，这个方法会创建一个一模一样的副本，不会覆盖任何值。这样不会将任何请求的请求体标记为已使用：

```javascript
let r1 = new Response('foobar');
let r2 = r1.clone();

console.log(r1.bodyUsed); // false
console.log(r2.bodyUsed); // false
```

如果响应对象的 bodyUsed 属性为 true（即响应体已被读取），则不能再创建这个对象的副本。在响应体被读取之后再克隆会导致抛出 TypeError。

```javascript
let r = new Response('foobar');
r.clone();
// 没有错误

r.text(); // 设置 bodyUsed 为 true

r.clone();
// TypeError: Failed to execute 'clone' on 'Response': Response body
// is already used
```

有响应体的 Response 对象只能读取一次。（不包含响应体的 Response 对象不受此限制。）比如：

```javascript
let r = new Response('foobar');

r.text().then(console.log); // foobar

r.text().then(console.log);
// TypeError: Failed to execute 'text' on 'Response': body stream is locked
```

更多次读取包含响应体的同一个 Response 对象，必须在第一次读取前调用 clone()：

```javascript
let r = new Response('foobar');

r.clone().text().then(console.log); // foobar
r.clone().text().then(console.log); // foobar
r.text().then(console.log); // foobar
```

此外，通过创建带有原始响应体的 Response 实例，可以执行伪克隆操作。关键是怎样不会把第一个 Response 实例标记为已读，而是会在两个响应之间共享：

```javascript
let r1 = new Response('foobar');
let r2 = new Responser(r1.body);

console.log(r1.bodyUsed); // false
console.log(r2bodyUsed); // false

r2.text().then(console.log); // foobar
r1.text().then(console.log);
// TypeError: Failed to execute 'text' on 'Response': body stream is locked
```

## 6. Request、Response 及 Body 混入

Request 和 Response 都使用了 Fetch API 的 Body 混入，以实现两者承担有效载荷的能力。这个混入为两个类型提供了只读的 body 属性（实现为 ReadableStream）、只读的 bodyUsed 布尔值（表示 body 流是否已读）和一组方法，用于从流中读取内容并将结果转换为某种 JavaScript 对象类型。

通常，将 Request 和 Response 主体作为流来使用只要有两个原因。一个原因是有效载荷的大小可能会导致网络延迟，另一个原因是流 API 本身在处理有效载荷方面是有优势的。除此之外，最好是一次性获取资源主体。

Body 混入提供了 5 个方法，用于将 ReadableStream 转存到缓冲区的内存里，将缓冲区转换为某种 JavaScript 对象类型，以及通过期约来产生结果。在解决之前，期约会等待主体流报告完成及缓冲被解析。这意味着客户端必须等待响应的资源完全加载才能访问其内容。

### 1. Body.text()

Body.text() 方法返回期约，解决为将缓冲区转存得到的 UTF-8 格式字符串。下面的代码展示了在 Response 对象上使用 Body.text()：

```javascript
fetch('https://example.com')
	.then((response) => response.text());
	.then(console.log);
```

以下代码展示了在 Request 对象上使用 Body.text()：

```javascript
let request = new Request('https://example.com', { method: 'POST', body: 'barbazqux' });

request.text()
	.then(console.log);

// barbazqux
```

### 2. Body.json()

Body.json() 方法返回期约，解决为将缓冲区转存得到的 JSON。下面的代码展示了在 Response 对象上使用 Body.json()：

```javascript
fetch('https://example.com')
	.then((response) => response.json())
	.then(console.log);

// {"foo": "bar"}
```

以下代码展示了在 Request 对象上使用 Body.json()：

```javascript
let request = new Request('https://example.com', { method: 'POST', body: JSON.stringify({ bar: 'baz' }) });

request.json()
	.then(console.log);

// { bar: 'baz' }
```

### 3. Body.formData()

浏览器可以将 FormData 对象序列化/反序列化为主体。例如，下面这个 FormData 实例：

```javascript
let myFormData = new FormData();
myFormData.append('foo', 'bar');
```

在通过 HTTP 传送时，Webkit 浏览器将其序列化为下列内容：

------WebkitFormBoundarydR9Q2kOzE6nbN7eR

Content-Disposition: form-data; name="foo"



bar

------WebkitFormBoundarydR9Q2kOzE6nbN7eR--

Body.formData() 方法返回期约，解决为将缓冲区转存得到的 FormData 实例。下面的代码展示了在 Response 对象上使用 Body.formData()：

```javascript
fetch('https://example.com/form-data')
	.then((response) => response.formData())
	.then((formData) => console.log(formData.get('foo')));

// bar
```

以下代码展示了在 Request 对象上使用 Body.formData()：

```javascript
let myFormData = new FormData();
myFormData.append('foo', 'bar');

let request = new Request('https://example.com', { method: 'POST', body: myFormData });

request.,formData()
	.then((formData) => console.log(formData.get('foo')));

// bar
```

### 4. Body.arrayBuffer()

有时候，可能需要以原始二进制格式查看和修改主体。为此，可以使用 Body.arrayBuffer() 将主体内容转换为 ArrayBuffer 实例。Body.arrayBuffer() 方法返回期约，解决为将缓冲区转存得到的 ArrayBuffer 实例。下面的代码展示了在 Response 对象上使用 Body.arrayBuffer()：

```javascript
fetch('https://example.com')
	.then((response) => response.arrayBuffer())
	.then(console.log);

// ArrayBuffer(...) {}
```

以下代码展示了在 Request 对象上使用 Body.arrayBuffer()：

```javascript
let request = new Request('https://example.com', { method: 'POST', body: 'abcdefg' });

// 以整数形式打印二进制编码的字符串
request.arrayBuffer()
	.then((buf) => console.log(new Int8Array(buf)));

// Int8Array(7) [97, 98, 99, 100, 101, 102, 103]
```

### 5. Body.blob()

有时候，可能需要以原始二进制格式使用主体，不用查看和修改。为此，可以使用 body.blob() 将主体内容转换为 Blob 实例。Body.blob() 方法返回期约，解决为将缓冲区转存得到的 Blob 实例。下面的代码展示了在 Response 对象上使用 Body.blob()：

```javascript
fetch('https://example.com')
	.then((response) => response.blob())
	.then(console.log);

// Blob(...) { size: ..., type: "..." }
```

以下代码展示了在 Request 对象上使用 Body.blob()：

```javascript
let request = new Request('https://example.com', { method: 'POST', body: 'abcdefg' });

request.blob()
	.then(console.log);

// Blob(7) { size: 7, type: "text/plain;charset=utf-8" }
```

### 6. 一次性流

因为 Body 混入是构建在 ReadableStream 之上的，所以主体流只能使用一次。这意味着所有主体混入方法都只能调用一次，再次调用就会抛出错误。

```javascript
fetch('https://example.com')
	.then((response) => response.blob().then(() => response.blob()));

// TypeError: Failed to execute 'blob' on 'Response': body stream is locked
let request = new Request('https://example.com', { method: 'POST', body: 'foobar' });

request.blob().then(() => request.blob());
// TypeError: Failed to execute 'blob' on 'Request': body stream is locked
```

即使是在读取流的过程中，所有这些方法也会在它们被调用时给 ReadableStream 加锁，以阻止其他读取器访问：

```javascript
fetch('https://example.com')
	.then((response) => {
    	response.blob(); // 第一次调用给流加锁
    	response.blob(); // 第二次调用再次加锁会失败
	});

// TypeError: Failed to execute 'blob' on 'Response': body stream is locked
let request = new Request('https://example.com', { method: 'POST', body: 'foobar' });

request.blob(); // 第一次调用给流加锁
request.blob(); // 第二次调用再次加锁会失败
// TypeError: Failed to execute 'blob' on 'Request': body stream is locked
```

作为 Body 混入的一部分，bodyUsed 布尔值属性表示 ReadableStream，意思是读取器是否已经在流上加了锁。这不一定表示流已经被完全读取。下面的代码演示了这个属性：

```javascript
let request = new Request('https://example.com', { method: 'POST', body: 'foobar' });

let response = new Response('foobar');

console.log(request.bodyUsed); // false
console.log(response.bodyUsed); // false

request.text().then(console.log); // foobar
response.text().then(console.log); // foobar

console.log(request.bodyUsed); // true
console.log(response.bodyUsed); // true
```

## 7. 使用 ReadableStream 主体

JavaScript 编程逻辑很多时候会将访问网络作为原子操作，比如请求是同时创建和发送的，响应数据也是以统一的格式一次性暴露出来的。这种约定隐藏了底层的混乱，让涉及网络的代码变得很清晰。

从 TCP/IP 角度来看，传输的数据是以分块形式抵达端点的，而且速度收到网速的限制。接收端点会为此分配内存，并将收到的块写入内存。Fetch API 通过 ReadableStream 支持在这些块到达时就实现读取和操作这些数据。

>注意
>
>本节会以获取 Fetch API 规范的 HTML 为例。这个页面差不多有 1MB 大小，足以让示例中接收的数据分成多个块。

正如 Stream API 所定义的，ReadableStream 暴露了 getReader() 方法，用于产生 ReadableStreamDefaultReader，这个读取器可以用于自爱数据到达时异步获取数据块。数据流的格式是 Uint8Array。下面的代码调用了读取器的 read() 方法，把最早可用的块打印了出来：

```javascript
fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then((body) => {
    	let reader = body.getReader();
    
    	console.log(reader); // ReadableStreamDefaultReader {}
    
    	reader.read()
    		.then(console.log);
	});

// { value: Uint8Array{}, done: false }
```

要随着数据流的到来取得整个有效载荷，可以像下面这样递归调用 read() 方法：

```javascript
fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then((body) => {
    	let reader = body.getReader();
    	
    	function processNextChunk({value, done}) {
            if (done) {
                return;
            }
            
            console.log({value, done});
            
            return reader.read()
            	.then(processNextChunk);
        }
    
    	return reader.read()
    		.then(processNextChunk);
	});

// { value: Uint8Array, done: false }
// { value: Uint8Array, done: false }
// { value: Uint8Array, done: false }
// ...
```

异步函数非常适合这样的 fetch() 操作。可以通过使用 async/await 将上面的递归调用大平：

```javascript
fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then(async function(body) {
    	let reader = body.getReader();
    
    	while (true) {
            let { value, done } = await reader.read();
            
            if (done) {
                break;
            }
            
            console.log({value, done});
        }
	});

// { value: Uint8Array(), done: false }
// { value: Uint8Array(), done: false }
// { value: Uint8Array(), done: false }
// ...
```

另外，read() 方法也可以直接封装到 Iterable 接口中。因此就可以在 for-await-for 循环中方便地实现这种转换：

```javascript
fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then(async function(body) {
    	let reader = body.getReader();
    
    	let asyncIterable = {
            [Symbol.asyncIterator]() {
                return {
                    next() {
                        return reader.read();
                    }
                };
            }
        };
    
    	for await (chunk of asyncIterable) {
            console.log(chunk);
        }
	});

// { value: Uint8Array, done: false }
// { value: Uint8Array, done: false }
// { value: Uint8Array, done: false }
// ...
```

通过将异步逻辑包装到一个生成器函数中，还可以进一步简化代码。而且，这个实现通过支持只读取部分流也变得更稳健。如果流因为耗尽或错误而终止，读取器会释放锁，以允许不同的流读取器继续操作：

```javascript
async function* streamGenerator(stream) {
    const reader = stream.getReader();
    
    try {
        while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
                break;
            }
            
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}

fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then(async function(body) {
    	for await (chunk of streamGenerator(body)) {
            console.log(chunk);
        }
	});
```

在这些例子中，当读取完 Uint8Array 块之后，浏览器会将其标记为可以被垃圾回收。对于需要在不连续的内存中连续检查大量数据的情况，这样可以节省很多内存空间。

缓冲区的大小，以及浏览器是否等待缓冲区被填充后才将其提到流中，要根据 JavaScript 运行时的实现。浏览器会控制等待分配的缓冲区被填满，同时会尽快将缓冲区数据（有时候可能未填充数据）发送到流。

不同浏览器中分块大小可能不同，这取决于带宽和网络延迟。此外，浏览器如果决定不等待网络，也可以将部分填充的缓冲区发送到流。最终，我们的代码要准备好处理以下情况：

* 不同大小的 Uint8Array 块
* 部分填充的 Uint8Array 块
* 块到达的时间间隔不确定

默认情况下，块是以 Uint8Array 格式抵达的。因为块的分割不会考虑编码，所以会出现某些值作为多字节字符被分散到两个连续块中的情况。手动处理这些情况是很麻烦的，但很多时候可以使用 Encodeing API 的可插拔方案。

要将 Uint8Array 转换为可读文本，可以将缓冲区传给 TextDecoder，返回转换后的值。通过设置 stream: true，可以将之前的缓冲区保留在内存，从而让跨越两个块的内容能够被正确编码：

```javascript
let decoder = new TextDecoder();

async function* streamGenerator(stream) {
    const reader = stream.getReader();
    
    try {
        while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
                break;
            }
            
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}

fetch('http://www.w3.org/')
	.then((response) => response.body)
	.then(async function (body) {
    	for await (chunk of streamGenerator(body)) {
            console.log(decoder,decode(chunk, { stream: true }));
        }
	});

// <!doctype html><html lang="en"> ...
// whether a <a daa-link-type="dfn" href="#concept-header" ...
// result to <var>rangeValue</var> ...
// ...
```

因为可以使用 ReadableStream 创建 Response 对象，所以就可以在读取流之后，将其通过管道导入另一个流。然后在这个新流再使用 Body 的方法，如 text()。这样就可以随着流的到达实时检查和操作流的内容。下面的代码展示了这种双流技术：

```javascript
fetch('https://www.w3.org/')
	.then((response) => response.body)
	.then((body) => {
    	const reader = body.getReader();
    
    	// 创建第二个流
    	return new ReadableStream({
            async start(controller) {
                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        
                        if (done) {
                            break;
                        }
                        
                        // 将主体流的块推到第二个流
                        controller.enqueue(value);
                    }
                } finally {
                    controller.close();
                    reader.releaseLock();
                }
            }
        })
	})
	.then((secondaryStream) => new Response(secondaryStream))
	.then(response => response.text())
	.then(console.log);

// <!doctype html><html lang="en"><head><meta charset="urf-8">...
```

# 2. 跨源资源共享

浏览器联网的一个主要限制是跨源安全策略。默认情况下，脚本只能访问与发起请求的页面在同一个域内的资源。这个安全限制可以防止某些恶意行为。不过，浏览器也需要支持合法跨源访问的能力。

跨源资源共享（CORS，Cross-origin Resource Sharing）定义了浏览器与服务器如何实现跨源通信。CORS 背后的基本思路就是使用自定义 HTTP 头部允许浏览器和服务器相互沟通，以确定请求或响应应该成功还是失败。

对于简单的请求，比如 GET 或 POST 请求，没有自定义头部，而且请求体是 text/plain 类型，这样的请求在发送时会有一个额外的头部叫 Origin。Origin 头部包含发送请求的页面的源（协议、域名和端口），以便服务器确定是否为其提供响应。下面是 Origin 头部的一个示例：

```javascript
Origin: https://www.wiley.com
```

如果服务器决定响应请求，那么应该发送 Access-Control-Allow-Origin 头部，包含相同的源。或者如果资源是公开的，那么就包含 "*"。比如：

```javascript
Access-Control-Allow-Origin: https://www.wiley.com
```

如果没有这个头部，或者有但源不匹配，则表明不会响应浏览器请求。否则，服务器就会处理这个请求。注意，无论请求还是响应都不会包含 cookie 信息。

现代浏览器原生支持 CORS。在浏览器尝试访问不同源的资源时，这个行为会被自动触发。要向不同域的源发送请求，可以使用 fetch() 方法并传入一个绝对 URL，比如：

```javascript
fetch("http://www.example.com/page/")
	.then(response => {
    	if (response.ok) {
            return response.text();
        } else {
            throw new Error("Request was unsuccessful: " + response.status);
        }
	});
```

因为无论同域还是跨域请求都使用同一个接口，所以最好在访问本地资源时使用相对 URL，在访问远程资源时使用绝对 URL。这样可以更明确地区分使用场景，同时避免出现访问本地资源时出现头部或 cookie 信息访问受限的问题。

## 1. 预检请求

CORS 通过一种叫预检查请求的服务器验证机制，允许使用自定义头部、除 GET 和 POST 之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，浏览器会先向服务器发送一个预检请求。这个请求使用 OPTIONS 方法发送并包含以下头部。

* Origin：与简单请求相同
* Access-Control-Request-Method：请求希望使用的方法
* Access-Control-Request-Headers：（可选）要使用的逗号分隔的自定义头部列表

下面是一个假设的 POST 请求，包含自定义的 FRIZ 头部：

```javascript
Origin: https://www.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: FRIZ
```

在这个请求发送后，服务器可以确定是否允许这种类型的请求。服务器会通过在响应中发送如下头部与浏览器沟通这些信息。

* Access-Control-Allow-Origin：与简单请求相同
* Access-Control-Allow-Methods：允许的方法（逗号分隔的列表）
* Access-Control-Allow-Headers：服务器允许的头部（逗号分隔的列表）
* Access-Control-Max-Age：缓存预检请求的秒数

例如：

```javascript
Access-Control-Allow-Origin: https://www.example.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: FRIZ
Access-Control-Allow-Max-Age: 1728000
```

预检请求返回后，结果会按响应指定的时间缓存一段时间。换句话说，只有第一次发送这种类型的请求时才会多发送一次额外的 HTTP 请求。

## 2. 凭据请求

默认情况下，跨源请求不提供凭据（cookie、HTTP 认证和客户端 SSL 证书）。可以通过将 withCredentials 属性设置为 true 来表明请求会发送凭据。如果服务器允许带凭证的请求，那么可以在响应中包含如下 HTTP 头部：

```javascript
Access-Control-Allow-Credentials: true
```

如果发送了凭据请求而服务器返回的响应中没有这个头部，则浏览器不会把响应交给 JavaScript（responseText 是空字符串，status 是 0，onerror() 被调用）。注意，服务器也可以在预检请求的响应中发送这个 HTTP 请求，以表明这个源允许发送凭据请求。

# 3. Beacon API

为了把尽量多的页面信息传到服务器，很多分析工具需要在页面生命周期中尽量晚的时候向服务器发送遥测或分析数据。因此，理想的情况下是通过浏览器的 unload 事件发送的网络请求。这个事件表示用户要离开当前页面，不会再生成别的有用信息了。

在 unload 事件触发时，分析工具要停止收集信息并把收集到的数据发给服务器。这时候有一个问题，因为 unload 事件对浏览器意味着没有理由再发送任何结果未知的网络请求（因为页面都要被销毁了）。例如，在 unload 事件处理程序中创建的任何异步请求都会被浏览器取消。为此，fetch() 不适合这个任务。

为解决这个问题，W3C 引入了补充性的 Beacon API。这个 API 给 navigator 对象增加了一个 sendBeacon() 方法。这个简单的方法接收一个 URL 和一个数据有效载荷参数，并会发送一个 POST 请求。可选的数据有效载荷参数有 ArrayBufferView、Blob、DOMString、FormData 实例。如果请求成功进入了最终要发送的任何队列，则这个方法返回 true，否则返回 false。

可以像下面这样使用这个方法：

```javascript
// 发送 POST 请求
// URL: 'https://example.com/analytics-reporting-url'
// 请求负载：'{ foo: 'bar' }'

navigator.sendBeacon('https://example.com/analytics-reporting-url', '{ foo: "bar" }');
```

这个方法虽然看起来只不过是 POST 请求的一个语法糖，但它有几个重要的特性。

* sendBeacon() 并不是只能在页面生命周期末尾使用，而是任何时候都可以使用
* 调用 sendBeacon() 后，浏览器会把请求添加到一个内部的请求队列。浏览器会主动地发送队列中的请求
* 浏览器保证在原始页面已经关闭的情况下也会发送请求
* 状态码、超时和其他网络原因造成的失败完全是不透明的，不能通过编程方式处理
* 信标（beacon）请求会携带调用 sendBeacon() 时所有相关的 cookie

# 4. Web Socket

Web Socket（套接字）的目标是通过一个长时连接实现与服务器全双工、双向的通信。在 JavaScript 中创建 Web Socket 时，一个 HTTP 请求会发送到服务器以初始化连接。服务器响应后，连接使用 HTTP 的 Upgrade 头部从 HTTP 协议切换到 Web Socket 协议。这意味着 Web Socket 不能通过标准 HTTP 服务器实现，而必须使用支持该协议的专有服务器。

因为 Web Socket 使用了自定义协议，所以 URL 方案（scheme）稍有变化：不能再使用 http:// 或 https://，而要使用 ws:// 和 wss://。前者是不安全的连接，后者是安全连接。在指定 Web Socket URL 时，必须包含 URL 方案，因为将来有可能再支持其他方案。

使用自定义协议而非 HTTP 协议的好处是，客户端与服务器之间可以发送非常少的数据，不会对 HTTP 造成任何负担。使用更小的数据包让 Web Socket 非常适合带宽和延迟问题比较明显的移动应用。使用自定义协议的缺点是，定义协议的时间比定义 JavaScript API 要长。

## 1. API

要创建一个新的 Web Socket，就要实例化一个 WebSocket 对象并传入提供连接 URL：

```javascript
let socket = new WebSocket("ws://www.example.com/server.php");
```

注意，必须给 WebSocket 构造函数传入一个绝对 URL。同源策略不适用于 Web Socket，因此可以打开到任意站点的连接。至于是否与来自特定源的页面通信，则完全取决于服务器。（在握手阶段就可以确定请求来自哪里。）

浏览器会在初始化 WebSocket 对象之后立即创建连接。WebSocket 也有一个 readyState 属性表示当前状态，取值如下。

* WebSocket.OPENING（0）：连接正在建立
* WebSocket.OPEN（1）：连接已经建立
* WebSocket.CLOSING（2）：连接正在关闭
* WebSocket.CLOSE（3）：连接已经关闭

WebSocket 对象没有 readystatechange 事件，而是有与上述不同状态对应的其他事件。readyState 值从 0 开始。

任何时候都可以调用 close() 方法关闭 Web Socket 连接：

```javascript
socket.close();
```

调用 close() 之后，readyState 立即变为 2（连接正在关闭），并会在关闭后变为 3（连接已经关闭）。

## 2. 发送和接收数据

打开 Web Socket 之后，可以通过连接发送和接收数据。要向服务器发送数据，使用 send() 方法并传入一个字符串、ArrayBuffer 或 Blob，如下所示：

```javascript
let socket = new WebSocket("ws://www.example.com/server.php");

let stringData = "Hello world!";
let arrayBufferData = Uint8Array.from(['f', 'o', 'o']);
let blobData = new Blob(['f', 'o', 'o']);

socket.send(stringData);
socket.send(arrayBufferData.buffer);
socket.send(blobData);
```

服务器向客户端发送消息时，WebSocket 对象上会触发 message 事件。这个 message 事件与其他消息协议，可以通过 event.data 属性访问到有效载荷：

```javascript
socket.onmessage = function(event) {
    let data = event.data;
    // 对数据执行某些操作
};
```

与通过 send() 方法发送的数据类似，event.data 返回的数据也可能是 ArrayBuffer 或 Blob。这由 WebSocket 对象的 binaryType 属性决定，该属性的值可能是 "blob" 或 "arraybuffer"。

## 3. 其他事件

WebSocket 对象在连接生命周期中有可能触发 3 个其他事件。

* open：在连接成功建立时触发
* error：在发送错误时触发。连接无法存续
* close：在连接关闭时触发

WebSocket 对象不支持 DOM Level 2 事件监听器，因此需要使用 DOM Level 0 风格的事件处理程序来监听这些事件：

```javascript
let socket = new WebSocket("ws://www.example.com/server.php");
socket.onpen = function() {
    alert("Connection established.")
};
socket.onerror = function() {
    alert("Connection error.");
};
socket.onclose = function() {
    alert("Connection closed.");
};
```

在这些事件中，只有 close 事件的 event 对象上有额外信息。这个对象上有 3 个额外属性：wasClean、code 和 reason，其中 wasClean 是一个布尔值，表示连接是否干净地关闭。code 是一个来自服务器地数值状态码。reason 是一个字符串，包含服务器发来的消息。可以将这些信息显示给用户或记录到日志：

```javascript
socket.onclose = function(event) {
    console.log(`as clean? ${event.wasClean} Code=${event.code} Reason=${event.reason}`);
};
```

# 5. EventSource API

EventSource API 支持客户端通过一个 HTTP 连接接收服务器的实时更新。这个 API 已经得到多数现代浏览器的支持，可以与 SSE（Server-Sent Event， 服务器发送事件）配合在 Web 应用中实现实时更新。

要使用 EventSource API，必须以 SSE 格式向客户端发送事件。SSE 是一种轻量协议，用于通过 HTTP 从服务器向客户端发送基于文件的事件。每个事件都包含一个字段名和值，又冒号分隔。多个事件使用两个换行符分隔。客户端可以使用 EventSource 对象监听事件，并处理连接和解析事件。

下面是一个使用 EventSource API 的例子：

```javascript
const eventSource = new EventSource("https://api.example.com/events");
eventSource.onmessage = event => {
    console.log(event.data);
};
eventSource.onerror = error => {
    console.log("Error:", error);
};
```

在这个例子中，我们使用 URL "https://api.example.com/events" 创建了一个 EventSource 对象。事件处理程序 onmessage 负责把事件数据打印到控制台。而 onerror 事件处理程序则会打印连接期间发生的错误。

在服务器端，可以使用 MIME 类型 Content-Type: text/event-stream 和 Cache-Control: no-cache header 来发送 SSE 事件，以确保浏览器始终请求最新的资源。

















































​	   													

