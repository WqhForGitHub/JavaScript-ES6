t随着浏览器能力的增加，其复杂性也在迅速增加。从很多方面看，现代浏览器已经成为构建于诸多规范之上、集各种 API 于一身的瑞士军刀。浏览器规范的生态在某种程序上是混乱而无序的。一些 规范如 HTML5，定义了一批增强已有标准的 API 和浏览器特性。而另一些规范如 Web Cryptography API 和 Notifications API，只为一个特性定义了一个 API。不同浏览器实现这些新 API 的情况也不同，有的会实现其中一部分，有的则干脆尚未实现。

>注意
>
>Web API 的数量之多令人难以置信（参见 MDN 文档的 Web APIs 词条）。本章要介绍的 API 仅限于与大多数开发者有关、已经得到多个浏览器支持，且本书其他章节没有涵盖的部分。

# 1. Atomics 与 SharedArrayBuffer

多个上下文访问 SharedArrayBuffer 时，如果同时对缓冲区执行操作，就可能出现资源争用问题。Atomics API 通过强制同一时刻只能对缓冲区执行一个操作，可以让多个上下文安全地读写一个 SharedArrayBuffer。

仔细研究会发现 Atomics API 非常像一个简化版的指令集架构（ISA），这并非意外。原子操作的本质会排斥操作系统或计算机硬件通常会自动执行的优化（比如指令重新排序）。原子操作也让并发访问内存变得不可能，如果应用不当就可能导致程序执行变慢。为此，Atomics API 的设计初衷是在最少但很稳定的原子行为基础之上，构建复杂的多线程 JavaScript 程序。

## 1. SharedArrayBuffer

SharedArrayBuffer 与 ArrayBuffer 具有同样的 API。二者的主要区别是 ArrayBuffer 必须在不同执行上下文间切换，SharedArrayBuffer 则可以被任意多个执行上下文同时使用。

在多个执行上下文间共享内存意味着并发线程操作成为了可能。传统 JavaScript 操作对于并发内存访问导致的资源争用没有提供保护。下面的例子演示了 4 个专用工作线程访问同一个 SharedArrayBuffer 导致的资源争用问题：

```javascript
const workerScript = `
self.onmessage = ({data}) => {
	const view = new Uint32Array(data);
	
	// 执行 1000000 次加操作
	for (let i = 0; i < 1E6; ++i) {
		// 线程不安全加操作会导致资源争用
		view[0] += 1;
	}
	
	self.postMessage(null);
};
`;

const workerScriptBlobUrl = URL.createObjectURL(new Blob([workerScript]));

// 创建容量为 4 的工作线程池
const workers = [];
for (let i = 0; i < 4; ++i) {
    workers.push(new Worker(workerScriptBlobUrl));
}

// 在最后一个工作线程完成后打印出最终值
let responseCount = 0;
for (const worker of workers) {
    worker.onmessage = () => {
        if (++responseCount == workers.length) {
            console.log(`Final buffer value: ${view[0]}`);
        }
    };
}

// 初始化 SharedArrayBuffer
const sharedArrayBuffer = new SharedArrayBuffer(4);
const view = new Uint32Array(sharedArrayBuffer);
view[0] = 1;

// 把 SharedArrayBuffer 发送到每个工作线程
for (const worker of workers) {
    worker.postMessage(sharedArrayBuffer);
}

// （期待结果为 4000001。实际输出可能类似这样：）
// Final buffer value: 2145106
```

为解决这个问题，Atomics API 应运而生。Atomics API 可以保证 SharedArrayBuffer 上的 JavaScript 操作是线程安全的。

>注意
>
>SharedArrayBuffer API 等同于 ArrayBuffer API，后者在第 6 章介绍过。关于如何在多个上下文中使用 SharedArrayBuffer，可以参考第 24 章。

## 2. 原子操作基础

任何全局上下文中都有 Atomics 对象，这个对象上暴露了用于执行线程安全操作的一套静态方法，其中多数方法以一个 TypedArray 实例（一个 SharedArrayBuffer 的引用）作为第一个参数，以相关操作数作为后续参数。

### 1. 算术及位操作方法

Atomics API 提供了一套简单的方法用以执行就地修改操作。在 ECMA 规范中，这些方法被定义为 AtomicReadModifyWrite 操作。在底层，这些方法都会从 SharedArrayBuffer 中某个位置读取值，然后执行算术或位操作，最后再把计算结果写回相同的位置。这些操作的原子本质意味着上述读取、修改、写回操作会按照顺序执行，不会被其他线程中断。

以下代码演示了所有算术方法：

```javascript
// 创建大小为 1 的缓冲区
let sharedArrayBuffer = new SharedArrayBuffer(1);

// 基于缓冲创建 Uint8Array
let typedArray = new Uint8Array(sharedArrayBuffer);

// 所有 ArrayBuffer 全部初始化为 0
console.log(typedArray); // Uint8Array[0]

const index = 0;
const increment = 5;

// 对索引 0 处的值执行原子加 5
Atomics.add(typedArray, index, increment);

console.log(typedArray); // Uint8Array[5]

// 对索引 0 处的值执行原子减 5
Atomics.sub(typedArray, index, increment);

console.log(typedArray); // Uint8Array[0]
```

以下代码演示了所有位方法：

```javascript
// 创建大小为 1 的缓冲区
let sharedArrayBuffer = new SharedArrayBuffer(1);

// 基于缓冲创建 Uint8Array
let typedArray = new Uint8Array(sharedArrayBuffer);

// 所有 ArrayBuffer 全部初始化为 0
console.log(typedArray); // Uint8Array[0]

const index = 0;

// 对索引 0 处的值执行原子或 0b1111
Atomics.or(typedArray, index, 0b1111);

console.log(typedArray); // Uint8Array[15]

// 对索引 0 处的值执行原子与 0b1100
Atomics.and(typedArray, index, 0b1100);

console.log(typedArray); // Uint8Array[12]

// 对索引 0 处的值执行原子异或 0b1111
Atomics.xor(typedArray, index, 0b1111);

console.log(typedArray); // Uint8Array[3]
```

前面线程不安全的例子可以改写为下面这样：

```javascript
const workerScript = `
self.onmessage = ({data}) => {
	const view = new Uint32Array(data);
	
	// 执行 1000000 次加操作
	for (let i = 0; i < 1E6; ++i) {
		// 线程安全的加操作
		Atomics.add(view, 0, 1);
	}
	
	self.postMessage(null);
};
`;

const workerScriptBlobUrl = URL.createObjectURL(new Blob([workerScript]));

// 创建容量为 4 的工作线程池
const workers = [];
for (let i = 0; i < 4; ++i) {
    workers.push(new Worker(workerScriptBlobUrl));
}

// 在最后一个工作线程完成后打印处最终值
let responseCount = 0;
for (const worker of workers) {
    worker.onmessage = () => {
        if (++responseCount == workers.length) {
            console.log(`Final buffer value: ${view[0]}`);
        }
    };
}

// 初始化 SharedArrayBuffer
const sharedArrayBuffer = new SharedArrayBuffer(4);
const view = new Uint32Array(sharedArrayBuffer);
view[0] = 1;

// 把 SharedArrayBuffer 发送到每个工作线程
for (const worker of workers) {
    worker.postMessage(sharedArrayBuffer);
}

//（期待结果为 4000001）
// Final buffer value: 4000001
```

# 2. Clipboard API

## navigator.clipboard

传统的使用 document.execCommand() 访问系统剪贴板的方法有很多局限性。比如，操作是同步执行的、读写仅限于 DOM 之内，不适合传输较大内容等。这就导致内容无害化处理、图片解码、加载链接的资源等操作会产生延迟，阻塞页面渲染。而且，与 document.execCommand() 操作剪贴板相关的浏览器权限始终不统一，也没有明确的规范。

Clipboard API 致力于取代旧的方法，提供一种简单的方式，满足对剪贴板进行常见的剪切、复制、粘贴等操作的需求。这个 API 有三个接口。

* Clipboard：Clipboard API 的主接口，提供对剪贴板进行读写的能力
* ClipboardEvent：表示提供剪贴板操作的事件
* ClipboardItem：提供一种方式，表示可以复制到系统剪贴板的数据，包括文本、图片、文件等

与之前的方法不同，Clipboard API 是异步的，因此所有方法都返回期约。这个 API 暴露在 navigator.clipboard

## 1. 权限

由于剪贴板信息涉及用户隐私，在使用 Clipboard API 前必须获得用户授权。授权方式类似于通知或地理位置：在第一次访问 API 时，浏览器会弹出一个阻塞对话框请求用户授权。用户授权或拒绝之后，浏览器将记住用户对相应域的选择，直到用户明确地变更权限。

剪贴板权限可以分为两部分。

* clipboard-read：允许页面读取剪贴板的内容，必须由用户明确授权
* clipboard-write：允许页面将内容写入剪贴板。写权限在当前页面是激活标签页时自动授权给页面

以下代码展示了如何检查读取剪切板的权限：

```javascript
navigator.permissions.query({ name: "clipboard-read" }).then(result => {
    if (result.state === "granted") {
        // 用户授权了读的权限
    }
})
```

# 3. 跨上下文消息

## postMessage()

跨文档消息，有时候也简称为 XDM（cross-document messaging），是一种在不同执行上下文（如不同工作线程或不同源的页面）间传递信息的能力。例如，www.wiley.com 上的页面需要与包含在内嵌窗格中的 p2p.wiley.com 上面的页面通信。在 XDM 之前，要以安全方式实现这种通信需要很多工作。XDM 以安全易用的方式规范化了这个功能。

>注意
>
>跨上下文消息用于窗口之间通信或工作线程之间通信。本节主要介绍使用 postMessage() 与其他窗口通信。关于工作线程之间通信、MessageChannel 和 BroadcastChannel，可以参考第 24 章。

XDM 的核心是 postMessage() 方法。除了 XDM，这个方法名还在 HTML5 中很多地方用到过，但目的都一样，都是把数据传送到另一个位置。

postMessage() 方法接收 3 个参数：消息、表示目标接收源的字符串和可选的可传输对象的数组（只与工作线程有关）。第二个参数对于安全非常重要，其可以限制浏览器交付数据的目标。下面来看一个例子：

```javascript
let iframeWindow = document.getElementById("myframe").contentWindow;
iframeWindow.postMessage("A secret", "http://www.wiley.com");
```

最后一行代码尝试向内窗格中发送一条消息，而且指定了源必须是 "www.wiley.com"。如果源匹配，那么消息将会交付到内嵌窗格。否则，postMessage() 什么也不做。这个限制可以保护信息不会因地址改变而泄漏。如果不想限制接收目标，则可以给 postMessage() 的第二个参数传 "*"，但不推荐这么做。

接收到 XDM 消息后，window 对象上会触发 message 事件。这个事件是异步触发的，因此从消息发出到接收到消息（接收窗口触发 message 事件）可能会有延迟。传给 onmessage 事件处理程序的 event 对象包含以下 3 方面重要信息。

* data：作为第一个参数传递给 postMessage() 的字符串数据
* origin：发送消息的文档源，例如 "www.wiley.com"
* source：发送消息的文档中 window 对象的代理。这个代理对象主要用于在发送上一条消息的窗口中执行 postMessage() 方法。如果发送窗口有相同的源，那么这个对象应该就是 window 对象。

接收消息之后验证发送窗口的源是非常重要的。与 postMessage() 的第二个参数可以保证数据不会意外传给未知页面一样，在 onmessage 事件处理程序中检查发送窗口的源可以保证数据来自正确的地方。基本的使用方式如下所示：

```javascript
window.addEventListener("message", (event) => {
    // 确保来自预期发送者
    if (event.origin === "http://www.wiley.com") {
        // 对数据进行一些处理
        processMessage(event.data);
        // 可选：向来源窗口发送一条消息
        event.source.postMessage("Recevied!", "http://p2p.wiley.com");
    }
});
```

大多数情况下，event.source 是某个 window 对象的代理，而非实际的 window 对象。因此不能通过它访问所有窗口下的消息。最好只使用 postMessage()，这个方法永远存在而且可以调用。

XDM 有一些怪异之处。首先，postMessage() 的第一个参数的最初实现始终是一个字符串。后来，第一个参数改为允许任何结构的数据传入，不过并非所有浏览器都实现了这个改变。为此，最好就是只通过 postMessage() 发送字符串。如果需要传递结构化数据，那么最好先对该数据调用 JSON.stringify()，通过 postMessage() 传过去之后，再在 onmessage 事件处理程序中调用 JSON.parse()。

在通过内嵌窗格加载不同域时，使用 XDM 是非常方便的。通过使用 XDM 与内嵌窗格中的网页通信，可以保证包含页面的安全。XDM 也可以用于同源页面之间通信。

# 5. File API 与 Blob API

## files

## onload

## onprogress

## onerror

## slice()

## URL.createObjectURL()

Web 应用程序的一个主要的痛点是无法操作用户计算机上的文件。1800 年之前，处理文件的唯一方法是把 `<input type="file">` 放到一个表单里，仅此而已。File API 与 Blob API 是为了让 Web 开发者能以安全的方式访问客户端机器上的文件，从而更好地与这些文件交互而设计的。

## 1. File 类型

File API 仍然以表单中的文件输入字段为基础，但是增加了直接访问文件信息的能力。HTML5 在 DOM 上为文件输入元素添加了 files 集合。当用户在文件字段中选择一个或多个文件时，这个 files 集合中会包含一组 File 对象，表示被选中的文件。每个 File 对象都有一些只读属性。

* name：本地系统中的文件名
* size：以字节计的文件大小
* type：包含文件 MIME 类型的字符串
* lastModifiedDate：表示文件最后修改时间的字符串

例如，通过监听 change 事件然后遍历 files 集合可以取得每个选中文件的信息：

```javascript
let fileList = document.getElementById("files-list");
filesList.addEventListener("change", (event) => {
    let files = event.target.files,
        i = 0,
        len = files.length;
    
    while (i < len) {
        const f = files[i];
        console.log(`${f.name} (${f.type}, ${f.size} bytes)`);
        i++;
    }
});
```

这个例子简单地在控制台输出了每个文件的信息。仅就这个能力而言，已经可以说是 Web 应用向前迈进的一大步了。不过，File API 还提供了 FileReader 类型，让我们可以实际从文件中读取数据。

## 2. FileReader 类型

FileReader 类型表示一种异步文件读取机制。可以把 FileReader 想象成类似于 fetch，只不过是用于从文件系统读取文件，而不是服务器读取数据。FileReader 类型提供了几个读取文件数据的方法。

* readAsText(file, encoding)：从文件中读取纯文本内容并保存在 result 属性中。第二个参数表示编码，是可选的。
* readAsDataURL(file)：读取文件并将内容的数据 URI 保存在 result 属性中
* readAsBinaryString(file)：读取文件并将每个字符的二进制数据保存在 result 属性中
* readAsArrayBuffer(file)：读取文件并将文件内容以 ArrayBuffer 形式保存在 result 属性

这些读取数据的方法为处理文件数据提供了极大的灵活性。例如，为了向用户显示图片，可以将图片读取为数据 URI，而为了解析文件内容，可以将文件读取为文本。

因为这些读取方法是异步的，所以每个 FileReader 会发布几个事件，其中 3 个最有用的事件是 progress、error 和 load，分别表示还有更多数据、发生了错误和读取完成。

progress 事件每 50 毫秒就会触发一次，包含以下信息：elngthComputable、loaded 和 total。此外，在 progress 事件中可以读取 FileReader 的 result 属性，即使其中尚未包含全部数据。

error 事件会在由于某种原因无法读取文件时触发。触发 error 事件时，FileReader 的 error 属性会包含错误信息。这个属性是一个对象，只包含一个属性：code。这个错误码的值可能是 1（未找到文件）、2（安全错误）、3（读取被中断）、4（文件不可读）或 5（编码错误）。

load 事件会在文件成功加载后触发。如果 error 事件被触发，则不会再触发 load 事件。下面的例子演示了所有这 3 个事件：

```javascript
let fileList = document.getElementById("file-list");
filesList.addEventListener("change", (event) => {
    let info = "",
        output = document.getElementById("output"),
        progress = document.getElementById("progress"),
        files = event.target.files,
        type = "default",
        reader = new FileReader();
    
    if (/image/.test(files[0].type)) {
        reader.readAsDataURL(files[0]);
        type = "image";
    } else {
        reader.readAsText(files[0]);
        type = "text";
    }
    
    reader.onerror = function() {
        output.innerHTML = "Could not read file, error code is " + 
            reader.error.code;
    };
    
    reader.onprogress = function(event) {
        if (event.lengthComputable) {
            progress.innerHTML = `${event.loaded}/${event.total}`;
        }
    };
    
    reader.onload = function() {
        let html = "";
        
        switch(type) {
            case "image":
                html = `<img src="${reader.result}"`;
                break;
            case "text":
                html = reader.result;
                break;
        }
        output.innerHTML = html;
    }
});
```

以上代码从表单字段中读取一个文件，并将其内容显示在了网页上。如果文件的 MIME 类型表示它是一个图片，那么就将其读取后保存为数据 URI，在 load 事件触发时将数据 URI 作为图片插入页面中。如果文件不是图片，则读取后将其保存为文本并原样输出到网页上。progress 事件用于跟踪和显示读取文件的进度，而 error 事件用于监控错误。

如果想提前结束文件读取，则可以在过程中调用 abort() 方法，从而触发 abort 事件。在 load、error 和 abort 事件触发后，还会触发 loadend 事件。loadend 事件表示在上述 3 种情况下，所有读取操作都已经结束。

## 3. FileReaderSync 类型

顾名思义，FileReaderSync 类型就是 FileReader 的同步版本。这个类型拥有与 FileReader 相同的方法，只有在整个文件都加载到内存之后才会继续执行。FileReaderSync 只在工作线程中可用，因为如果读取整个文件耗时太长则会影响全局。

假设通过 postMessage() 向工作线程发送了一个 File 对象。以下代码会让工作线程同步将文件读取到内存中，然后将文件的数据 URL 发回来：

```javascript
// worker.js

self.onmessage = (messageEvent) => {
    const syncReader = new FileReaderSync();
    console.log(syncReader); // FileReaderSync {}
    
    // 读取文件时阻塞工作线程
    const result = syncReader.readAsDataUrl(messageEvent.data);
    
    // PDF 文件的示例响应
    console.log(result); // data:application/odf;base64,JVBERI0xLjQK...
    
    // 把 URL 发回去
    self.postMessage(result);
};
```

## 4. Blob 与部分读取

某些情况下，可能需要部分文件而不是整个文件。为此，File 对象提供了一个名为 slice() 的方法。slice() 方法接收两个参数：起始字节和要读取的字节数。这个方法返回一个 Blob 的实例，而 Blob 实际上是 File 的超类。

blob 表示二进制大对象（binary larget object），是 JavaScript 对不可修改二进制数据的封装类型。包含字符串的数组、ArrayBuffers、ArrayBufferViews，甚至其他 Blob 都可以用来创建 blob。Blob 构造函数可以接收一个 optiions 参数，并在其中指定 MIME 类型：

```javascript
console.log(new Blob(['foo']));
// Blob { size: 3, type: "" }

console.log(new Blob(['{"a": "b"}'], { type: 'application/json' }));
// Blob { size: 10, type: "application/json" }

console.log(new Blob(['<p>Foo</p>', '<p>Bar</p>'], { type: 'text/html' }));
// Blob { size: 20, type: "text/html" }
```

Blob 对象有一个 size 属性和一个 type 属性，还有一个 slice() 方法用于进一步切分数据。另外也可以使用 FileReader 从 Blob 中读取数据。下面的例子只会读取文件的前 32 字节：

```javascript
let fileList = document.getElementById("files-list");
fileList.addEventListener("change", (event) => {
    let info = "",
        output = document.getElementById("output"),
        progress = document.getElementById("progress"),
        files = event.target.files,
        reader = new FileReader(),
        blob = blobSlice(files[0], 0, 32);
    
    if (blob) {
        reader.readAsText(blob);
        
        reader.onerror = function() {
            output.innerHTML = "Could not read file, error code is " + 
                reader.error.code;
        };
        
        reader.onload = function() {
            output.innerHTML = reader.result;
        };
    } else {
        console.log("Your browser doesn't support slice().");
    }
});
```

只读取部分文件可以节省时间，特别是在只需要数据特定部分比如文件头的时候。

## 5. 对象 URL 与 Blob

对象 URL 有时候也称作 Blob URL，是指引用存储在 File 或 Blob 中数据的 URL。对象 URL 的优点是不用把文件内容读取到 JavaScript 也可以使用文件。只要在适当位置提供对象 URL 即可，要创建对象 URL，可以使用 window.URL.createObjectURL() 方法并传入 File 或 Blob 对象。这个函数返回的值是一个指向内存中地址的字符串。因为这个字符串是 URL，所以可以在 DOM 中直接使用。例如，以下代码使用对象 URL 在页面中显示了一张图片：

```javascript
let fileList = document.getElementById("files-list");
fileList.addEventListener("change", (event) => {
    let info = "",
        output = document.getElementById("output"),
        progress = document.getElementById("progress"),
        files = event.target.files,
        reader = new FileReader(),
        url = window.URL.createObjectURL(files[0]);
    if (url) {
        if (/image/.test(files[0]).type) {
            output.innerHTML = `<img src="${url}">`;
        } else {
            output.innerHTML = "Not an image."
        }
    } else {
        output.innerHTML = "Your browser doesn't support object URLs.";
    }
});
```

如果对象 URL 直接放到 `<img>` 标签，就不需要把数据先读到 JavaScript 中了。`<img>` 标签可以直接从相应内存位置把数据读取到页面上。

使用完数据之后，最好能释放与之关联的内存。只要对象 URL 在使用中，就不能释放内存。如果想表明不再使用某个对象 URL，则可以把它传给 window.URL.revokeObjectURL()。页面卸载时，所有对象 URL 占用的内存都会被释放。不过，最好在不使用时立即释放内存，以便尽可能保持页面占用最少资源。

## 6. 读取拖放文件

组合使用 HTML5 拖放 API 与 File API 可以创建读取文件信息的有趣功能。在页面上创建放置目标后，可以从桌面上把文件拖动并放到放置目标。这样会像拖放图片或链接一样触发 drop 事件。被放置的文件可以通过事件的 event.dataTransfer.files 属性读到，这个属性保存着一组 File 对象，就像文本输入字段一样。

下面的例子会把拖放到页面放置目标上的文件信息打印出来：

```javascript
let droptarget = document.getElementById("droptarget");
function handleEvent(event) {
    let info = "",
        output = document.getElementById("output"),
        files, i, len;
    event.preventDefault();
    
    if (event.type == "drop") {
        files = event.dataTransfer.files;
        i = 0;
        len = files.length;
        
        while (i < len) {
            info += `${files[i].name} (${files[i].type}, ${files[i].size} bytes)<br>`;
            i++;
        }
        
        output.innerHTML = info;
    }
}
droptarget.addEventListener("dragenter", handleEvent);
droptarget.addEventListener("dragover", handleEvent);
droptarget.addEventListener("drop", handleEvent);
```

必须取消 dragenter、dragover 和 drop 的默认行为。在 drop 事件处理程序中，可以通过 event.dataTransfer.files 读到文件，此时可以获取文件的相关信息。

# 6. Fullscreen API

## requestFullscreen()

## exitFullscreen()

## document.fullscreenEnabled

## document.fullscreenElement

## fullscreenchange

Fullscreen API 可以让网页方便地以全屏模式显示，为用户提供沉浸式体验。全屏模式意味着元素会被拉伸以填满整个屏幕，完全覆盖浏览器和操作系统。任何时候都只能有一个元素可以全屏。

要让一个元素全屏显示，调用它地 requestFullscreen() 方法。这个方法可以在任何 HTML 元素上调用：

```javascript
myDiv.requestFullscreen().catch(err => {
    console.error(`Unable to enter fullscreen mode: ${err}`);
});
```

用户可以手动退出全局模式，也可以在 document 对象上调用 exitFullscreen() 方法退出：

```javascript
document.exitFullscreen().catch(() => {
    console.error('Unable to exit fullscreen mode');
});
```

要检查页面是否可以进入全屏模式，可以使用 document.fullscreenEnabled 属性。要检查页面当前是否处于全屏模式，可以使用 document.fullscreenElement 属性。后一个属性在页面全屏时返回全局显示的元素，或者在非全局模式时返回 null。

```javascript
if (document.fullscreenElement) {
    console.log('In fullscreen mode');
} else {
    console.log('Not in fullscreen mode');
}
```

可以监听 fullscreenchange 事件，以了解页面全屏的状态变化：

```javascript
document.addEvenListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        console.log(`Entered fullscreen mode`);
    } else {
        console.log(`Exited fullscreen mode`);
    }
});
```

# 7. Geolocation API

## navigator.geolocation

Geolocation API 是通过 navigator.geolocation 属性暴露出来的，浏览器脚本可以通过这个 API 获取当前设备的地理位置。这个 API 只能在安全执行上下文（即通过 HTTPS 分发的脚本）中使用。

这个 API 可以查询宿主系统并尽可能精确地返回设备地位置信息。根据宿主系统地硬件和配置，返回结果的精度可能不一样。手机 GPS 的坐标系统可能具有极高的精度，而 IP 地址的精度就要差很多。根据 Geolocation API 规范：

地理位置信息的主要来源是 GPS 和 IP 地址、射频识别（RFID）、Wi-Fi 及蓝牙 Mac 地址、GSM/CDMA 蜂窝 ID 以及用户输入等信息。

>注意
>
>浏览器也可能会利用 Google Location Service（Chrome 和 Firefox）等服务确定位置。有时候，你可能会发现自己并没有 GPS，但浏览器给出的坐标却费差个精确。浏览器会收集所有可用的无限网络，包括 Wi-Fi 和蜂窝信号。拿到这些信息后，再去查询网络数据库。这样就可以精确地报告出你的设备位置。

要获取浏览器当前的位置，可以使用 getCurrentPosition() 方法。这个方法返回一个 Coordinates 对象，其中包含的信息不一定完全依赖宿主系统的能力：

```javascript
// getCurrentPosition() 会以 position 对象为参数调用传入的回调函数
let p;
navigator.geolocation.getCurrentPosition((position) => { p = position; });
```

这个 position 对象中有一个表示查询的时间的时间戳，以及包含坐标信息的 Coordimates 对象：

```javascript
console.log(p.timestamp); // 1525364883361
console.log(p.coords); // Coordinates {...}
```

Coordinates 对象中包含标准格式的经度和纬度，以及以米为单位的精度。精度同样以确定设备位置的机制来判定。

```javascript
console.log(p.coords.latitude, p.coords.longitude); // 37.4854409, -122.2325506
console.log(p.coords.accuracy); // 58
```

Coordinates 对象包含一个 altitude（海拔高度）属性，是相对于 1984 世界大地坐标系地球表面的以米为单位的距离。此外还有一个 altitudeAccuracy 属性，这个精度值单位也是米。为了取得 Coordinates 中包含的这些信息，当前设备必须具备相应的能力（比如 GPS 或高度计）。很多设备因为没有能力测量高度，所以这两个值经常有一个或两个是空的。

```javascript
console.log(p.coords.altitude); // -8.800000190734863
console.log(p.coords.altitudeAccurracy); // 200
```

Coordinates 对象包含一个 speed 属性，表示设备每秒移动的速度。还有一个 heading（朝向）属性，表示相对于正北方向移动的角度（0<=heading<360）。为获取这些信息，当前设备必须具备相应的能力（比如加速计或指南针）。很多设备因为没有能力测量高度，所以这两个值经常有一个是空的，或者两个都是空的。

>注意
>
>设备不会根据两点的向量来测量速度和朝向。不过，如果可能的话，可以尝试基于两次连续的测量数据得到的向量来手动计算。当然，如果向量的精度不够，那么计算结果的精度肯定也不够。

获取浏览器地理位置并不能保证成功。因此 getCurrentPosition() 方法也接收失败回调函数作为第二个参数，这个函数会收到一个 PositionError 对象中会包含一个 code 属性和一个 message 属性，后者包含对错误的简短描述。code 属性是一个整数，表示以下 3 种错误。

* PERMISSION_DENIED：浏览器未被允许访问设备位置。页面第一次尝试访问 Geolocation API 时，浏览器会弹出确认对话框取得用户授权（每个域分别获取）。如果返回了这个错误码，则要么是用户不同意授权，要么是在不安全的环境下访问了 Geolocation API。message 属性还会提供额外信息
* POSITION_UNAVAILABLE：系统无法返回任何位置信息。这个错误码可能代表各种失败原因，但相对来说并不常见，因为只要设备能上网，就至少可以根据 IP 地址返回一个低精度的坐标。
* TIMEOUT：系统不能在超时时间内返回位置信息。关于如何配置超时，会在后面介绍。

```javascript
// 浏览器会提示用户允许访问 Geolocation API
// 这个例子显示了用户拒绝之后的结果
navigator.geolocation.getCurrentPosition(() => {}, (e) => {
    console.log(e.code); // 1
    console.log(e.message); // User denied Geolocation
});

// 这个例子展示了在不安全的上下文中执行代码的结果
navigator.geolocation.getCurrentPosition(() => {}, (e) => {
    console.log(e.code); // 1
    console.log(e.message); // Only secure origins are allowed
});
```

Geolocation API 位置请求可以使用 PositionOptions 对象来配置，作为第三个参数提供。这个对象支持以下 3 个属性。

* enableHighAccuracy：布尔值，true 表示返回的值应该尽量准确，默认值为 false。默认情况下，设备通常会选择最快、最省电的方式返回坐标。这通常意味着返回的是不够精确的坐标。比如，在移动设备上，默认位置查询通常只会采用 Wi-Fi 和蜂窝网络的定位信息。而在 enableHighAccuracy 为 true 的情况下，则会使用设备的 GPS 确定设备位置，并返回这些值的混合结果。使用 GPS 会更耗时、耗电，因此在使用 enableHighAccuracy 配置时要仔细权衡一下。
* timeout：毫秒，表示在以 TIMEOUT 状态调用错误回调函数之前等待的最长时间。默认值是 0xFFFFFFFF（2^32 - 1）。表示完全跳过系统调用而立即以 TIMEOUT 调用错误回调函数。
* maximumAge：毫秒，表示返回坐标的最长有效期，默认值为 0。因为查询设备位置会消耗资源，所以系统通常会缓存坐标并在下次返回缓存的值（遵从位置缓存失败策略）。系统会计算缓存期，如果 Geolocation API 请求的配置要求比缓存的结果更新，则系统会重新查询并返回值。0 表示强制系统忽略缓存的值，每次都重新查询。而 Infinity 会阻止系统重新查询，只会返回缓存的值。JavaScript 可以通过检查 Position 对象的 timestamp 属性值是否重复来判断返回的是不是缓存值。

# 8. Device API

## navigator.oscpu

## navigator.vendor

## navigator.platform

## screen.colorDepth

## screen.pixelDepth

## screen.orientation

## navigator.getBattery()

## navigator.hardwareConcurrency

## navigator.deviceMemory

## navigator.maxTouchPoints

现代浏览器提供了一组与页面执行环境相关的信息，包括浏览器、操作系统、硬件和周边设备信息。这些属性可以通过暴露在 window.,navigator 上的一组 API 获得。不过，这些 API 的跨浏览器支持还不够好，远未达到标准化的程序。

>注意
>
>对这些 API 的支持可能因浏览器而异。

## 1. 浏览器与操作系统信息

navigator 和 screen 对象也提供了关于页面所在软件环境的信息。

>注意
>
>以下几节列出的 navigator 的属性已经废弃，使用时请小心。

### 1. navigator.oscpu

navigator.oscpu 属性是一个字符串，通常对应用户代理字符串中操作系统/系统架构相关信息。根据 HTML 事实标准：

oscpu 属性的获取方法必须返回空字符串或者表示浏览器所在平台的字符串，比如 "Windows NT 10.0; Win64; x64" 或 "Linux x86_64"。

比如，Windows 10 上的 Firefox 的 oscpu 属性应该对应于以下加粗的部分：

```javascript
console.log(navigator.userAgent);
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
console.log(navigator.oscpu);
"Windows NT 10.0; Win64; x64"
```

### 2. navigator.vendor

navigator.vendor 属性是一个字符串，通常包含浏览器开发商信息。返回这个字符串是浏览器 navigator 兼容模式的一个功能。根据 HTML 实时标准“

navigator.vendor 返回一个空字符串，也可能返回字符串 "Apple Computer, Inc." 或字符串 "Google Inc."

例如，Chrome 中的这个 navigator.vendor 属性返回下面的字符串：

```javascript
console.log(navigator.vendor); // "Google Inc."
```

### 3. navigator.platform

navigator.platform 属性是一个字符串，通常表示浏览器所在的操作系统。根据 HTML 实时标准：

navigator.platform 必须返回一个字符串或表示浏览器所在平台的字符串，例如 "MacIntel"、"Win32"、"FreeBSD i386" 或 "WebTV OS"

例如，Windows 系统下 Chrome 中的这个 navigator.platform 属性返回下面的字符串：

```javascript
console.log(navigator.platform); // "Win32"
```

### 4. screen.colorDepth 和 screen.pixelDepth

screen.colorDepth 和 screen.pixelDepth 返回一样的值，即显示器每像素颜色的位深。根据 CSS 对象模型（CSSON）规范：

screen.colorDepth 和 screen.pixelDepth 属性应该返回输出设备中每像素用于显示颜色的位数，不包含 alpha 通道。

Chrome 中这两个属性的值如下所示：

```javascript
console.log(screen.colorDepth); // 24
console.log(screen.pixelDepth); // 24
```

### 5. screen.orientation

screen.orientation 属性返回一个 ScreenOrientation 对象，其中包含 Screen Orientation API 定义的屏幕信息。这里面最有意思的属性是 angle 和 type，前者返回相对于默认状态下屏幕的角度，后者返回以下 4 种枚举值之一：

* portrait-primary
* portrait-secondary
* landscape-primary
* landscape-secondary

例如，在 Chrome 移动版中，screen.orientation 返回的信息如下：

```javascript
// 垂直看
console.log(screen.orientation.type); // portrait-primary
console.log(screen.orientation.angle); // 0

// 向左转
console.log(screen.orientation.type); // landscape-primary
console.log(screen.orientation.angle); // 90

// 向右转
console.log(screen.orientation.type); // landscape-secondary
console.log(screen.orientation.angle); // 270
```

根据规范，这些值的初始化取决于浏览器和设备状态。因此，不能假设 portrait-primary 和 0 始终是初始值。这两个值主要用于确定设备旋转后浏览器的朝向变化。

## 2. Connection State 和 NetworkInformation API

浏览器会跟踪网络连接状态并以两种方式暴露这些信息：连接事件和 navigator.onLine 属性。在设备连接到网络时，浏览器会记录这个事实并在 window 对象商触发 online 事件。相应地，当设备断开网络连接后，浏览器会在 window 对象上触发 offline 事件。任何时候，都可以通过 navigator.onLine 属性来确定浏览器的联网状态。这个属性返回一个布尔值，表示浏览器是否联网。

```javascript
const connectionStateChange = () => console.log(navigator.onLine);

window.addEventListener('online', connectionStateChange);
window.addEventListener('offline', connectionStateChange);

// 设备联网时：
// true

// 设备断网时：
// false
```

当然，到底怎么才算联网取决于浏览器与系统实现。有些浏览器可能会认为只要连接到局域网就算在线，而不管是否真正接入了互联网。

navigator 对象还暴露了 NetworkInformation API，可以通过 navigator.connection 属性使用。这个 API 提供了一些只读属性，并为连接属性变化事件处理程序定义了一个事件对象。

以下是 Networkinformation API 暴露的属性。

* downlink：整数，表示当前设备的带宽（以 Mbit/s 为单位），舍入到最接近的 25 kbit/s。这个值可能会根据历史网络吞吐量计算，也可能根据连接技术的能力来计算
* downlinkMax：整数，表示当前设备最大的下行带宽（以 Mbit/s 为单位），根据网络的第一跳来确定。因为第一跳不一定反映到端的网络速度，所以这个值只能用作粗略的上限值
* effectiveType：字符串枚举值，表示连接速度和质量。这些值对应不同的蜂窝数据网络连接技术，但也用于分类无线网络。这个值有以下 4 种可能。
  * slow-2g
    * 往返时间 > 2000ms
    * 下行带宽 < 50kbit/s
  * 2g
    * 2000ms > 往返时间 >= 1400ms
    * 70kbit/s > 下行带宽 >= 50kbit/s
  * 3g
    * 1400ms > 往返时间 >= 270ms
    * 700kbit/s > 下行带宽 >= 70kbit/s
  * 4g
    * 270ms > 往返时间 >= 0ms
    * 下行带宽 >= 700kbit/s
* rtt：毫秒，表示当前网络实际的往返时间，舍入为最接近的 25 毫秒。这个值可能根据历史网络吞吐量计算，也可能根据连接技术的能力来计算。
* type：字符串枚举值，表示网络连接技术。这个值可能为下列值之一。
  * bluetooth：蓝牙
  * cellular：蜂窝
  * ethernet：以太网
  * none：无网络连接。相当于 navigator.onLine === false
  * mixed：多种网络混合
  * other：其他
  * unknown：不确定
  * wifi：Wi-Fi
  * wimax：WiMAX
* saveData：布尔值，表示用户设备是否启用了节流模式
* onchange：事件处理程序，会在任何连接状态变化时触发一个 change 事件。可以通过 navigator.connection.addEventListener('change', changeHandler) 或 navigator.connection.onchange = changeHandler 等方式使用。

## 3. Battery Status API

浏览器可以访问设备电池及充电状态的信息。navigator.getBattery() 方法会返回一个期约实例，解决为一个 BatteryManager 对象。

```javascript
navigator.getBattery().then((b) => console.log(b));
// BatteryManager { ... }
```

BatteryManager 包含 4 个只读属性，提供了设备电池的相关信息。

* charging：布尔值，表示设备当前是否正接入电源充电。如果设备没有电池，则返回 true
* chargingTime：整数，表示预计离电池充满还有多少秒。如果电池已充满或设备没有电池，则返回 0
* dischargingTime：整数，表示预计离电量耗尽还有多少秒。如果设备没有电池，则返回 Infinity
* level：浮点数，表示电量百分比。电量完全耗尽 返回 0.0，电池充满返回 1.0。如果设备没有电池，则返回 1.0。

这个 API 还提供了 4 个事件属性，可用于设置在相应的电池事件发生时调用的回调函数。可以通过给 BatteryManager 添加事件监听器，也可以通过给事件属性赋值来使用这些属性。

* onchargingchange
* onchargingtimechange
* ondischargingtimechange
* onlevelchange

```javascript
navigator.getBattery().then((battery) => {
    // 添加充电状态变化时的处理程序
    const chargingChangeHandler = () => console.log('chargingchange');
    battery.onchargingchange = chargingChangeHandler;
    // 或
    battery.addEventListener('chargingchange', chargingChangeHandler);
    
    // 添加充电时间变化时的处理程序
    const chargingTimeChangeHandler = () => console.log('chargingtimechange');
    battery.onchargingtimechange = chargingTimeChangeHandler;
    // 或
    battery.addEventListener('chargingtimechange', chargingTimeChangeHandler);
    
    // 添加放电时间变化时的处理程序
    const dischargingTimeChangeHandler = () => console.log('dischargingtimechange');
    battery.ondischargingtimechange = dischargingTimeChangeHandler;
    // 或
    battery.addEventListener('dischargingtimechange', dischargingTimeChangeHandler);
    
    // 添加电量百分比变化时的处理程序
    const levelChangeHandler = () => console.log('levelchange');
    battery.onlevelchange = levelChangeHandler;
    // 或
    battery.addEventListener('levelchange', levelChangeHandler);k
});
```

## 4. 硬件

浏览器检测硬件的能力相当有限。不过，navigator 对象还是通过一些属性提供了基本信息。

### 1. 处理器核心数

navigator.hardwareConcurrency 属性返回浏览器支持的逻辑处理器核心数量，包含表示核心数的一个整数值（如果核心数无法确定，这个值就是 1）.关键在于，这个值表示浏览器可以并行执行的最大工作线程数量，不一定是实际的 CPU 核心数。

### 2. 设备内存大小

navigator.deviceMemory 属性返设备大小的系统内存大小，包含单位为 GB 的浮点数（舍入为最接近的 2 的幂：512 MB 返回 0.5，4GB 返回 4）。

### 3. 最大触点数

navigator.maxTouchPoints 属性返回触摸屏支持的最大关联触点数量，包含一个整数值。

# 9. 媒体元素

HTML5 新增了两个与媒体相关的元素，即 `<audio>` 和 `<video>`，从而为浏览器提供了嵌入音频和视频的统一解决方案。这两个元素既支持 Web 开发者在页面中嵌入媒体文件，也支持 JavaScript 实现对媒体的自定义控制。以下是它们的用法：

```html
<!-- 嵌入视频 -->
<video src="conference.mpg" id="myVideo">Video player not available.</video>
<!-- 嵌入音频 -->
<audio src="song.mp3" id="myAudio">Audio player not available.</audio>
```

每个元素至少要求有一个 src 属性，以表示要加载的媒体文件。我们也可以指定表示视频播放器大小的 width 和 height 属性，以及在视频加载期间显示图片 URI 的 poster 属性。另外，controls 属性如果存在，则表示浏览器应该显示播放界面，让用户可以直接控制媒体。开始和结束标签之间的内容是在媒体播放器不可用时显示的替代内容。

由于浏览器支持的媒体格式不同，因此可以指定多个不同的媒体源。为此，需要从元素中删除 src 属性，使用一个或多个 `<source>` 元素代替，如下面的例子所示：

```html
<!-- 嵌入视频 -->
<video id="myVideo">
    <source src="conference.webm" type="video/webm; cpdecs='vp8, vorbis'">
    <source src="conference.ogv" type="video/ogg; codeecs='theora, vorbis'">
    <source src="conference.mpg">
    Video player not available
</video>
<!-- 嵌入音频 -->
<audio id="myAudio">
    <source src="song.ogg" type="audio/ogg">
    <source src="song.mp3" type="audio/mpeg">
    Audio player not available
</audio>
```

讨论不同音频和视频的编解码超出了本书范畴，但浏览器支持的编解码确实可能有所不同，因此指定多个源文件通常是必需的。

## 1. 属性

`<video>` 和 `<audio>` 元素提供了稳健的 JavaScript 接口。这两个元素有很多共有属性，可以用于确定媒体的当前状态，如下表所示。

| 属性                | 数据类型   | 说明                                                         |
| ------------------- | ---------- | ------------------------------------------------------------ |
| autoplay            | Boolean    | 取得或设置 autoplay 标签                                     |
| buffered            | TimeRanges | 对象，表示已下载缓冲的时间范围                               |
| bufferedBytes       | ByteRanges | 对象，表示已下载缓冲的字节范围                               |
| bufferingRate       | Integer    | 平均每秒下载的位数                                           |
| bufferingThrottled  | Boolean    | 表示缓冲是否被浏览器截流                                     |
| controls            | Boolean    | 取得或设置 controls 属性，用于显示或隐藏浏览器内置控件       |
| currentLoop         | Integer    | 媒体已经播放的循环次数                                       |
| currentSrc          | String     | 当前播放媒体的 URL                                           |
| currentTime         | Float      | 已经播放的秒数                                               |
| defaultPlaybackRate | Float      | 取得或设置默认回放速率。默认为 1.0 秒                        |
| duration            | Float      | 媒体的总秒数                                                 |
| ended               | Boolean    | 表示媒体是否播放完成                                         |
| loop                | Boolean    | 取得或设置媒体是否应该在播放完再循环开始                     |
| muted               | Boolean    | 取得或设置媒体是否静音                                       |
| networkState        | Integer    | 表示媒体当前网络连接状态。0 表示空，1 表示加载中，2 表示加载元数据，3 表示加载了第一帧，4 表示加载完成 |
| paused              | Boolean    | 表示播放器是否暂停                                           |
| playbackRate        | Float      | 取得或设置当前播放速率。用户可能会让媒体播放快一些或慢一些。与 defaultPlaybackRate 不同，该属性会保持不变，除非开发者修改 |
| played              | TimeRanges | 到目前为止已经播放的时间范围                                 |
| readyState          | Integer    | 表示媒体是否已经准备就绪。0 表示媒体不可用，1 表示可以显示当前帧，2 表示媒体可以开始播放，3 表示媒体可以从头播到尾 |
| seekable            | TimeRanges | 可以跳转的时间范围                                           |
| seeking             | Boolean    | 表示播放器是否正移动到媒体文件的新位置                       |
| src                 | String     | 媒体文件源。可以再任何时候重写                               |
| start               | Float      | 取得或设置媒体文件中的位置，以秒为单位，从该处开始播放       |
| totalBytes          | Integer    | 资源需要的字节总数（如果知道的话）                           |
| videoHeight         | Integer    | 返回视频（不一定是元素）的高度。只适用于 `<video>`           |
| videoWidth          | Integer    | 返回视频（不一定是元素）的宽度。只适用于 `<video>`           |
| volume              | Float      | 取得或设置当前音量，值为 0.0 到 1.0                          |

上述很多属性也可以在 `<audio>` 或 `<video>` 标签上设置。

## 2. 事件

除了有很多属性，媒体元素还有很多事件。这些事件会监控由于媒体回放或用户交互导致的不同属性的变化。下表列出了这些事件。

| 事件                | 何时触发                                                     |
| ------------------- | ------------------------------------------------------------ |
| abort               | 下载被中断                                                   |
| canplay             | 回放可以开始，readyState 为 2                                |
| canplaythrough      | 回放可以继续，不应该中断，readState 为 3                     |
| canshowcurrentframe | 已经下载当前帧，readyState 为 1                              |
| dataunavailable     | 不能回放，因为没有数据，readyState 为 0                      |
| durationchange      | duration 属性的值发生变化                                    |
| emptied             | 网络连接关闭了                                               |
| empty               | 发生了错误，阻止媒体下载                                     |
| ended               | 媒体已经播放完一遍，且停止了                                 |
| error               | 下载期间发生了网络错误                                       |
| load                | 所有媒体已经下载完毕。这个事件已被废弃，使用 canplaythrough 代替 |
| loadeddata          | 媒体的第一帧已经下载                                         |
| loadedmetadata      | 媒体的元数据已经下载                                         |
| loadstart           | 下载已经开始                                                 |
| pause               | 回放已经暂停                                                 |
| play                | 媒体已经收到开始播放的请求                                   |
| playing             | 媒体已经实际开始播放了                                       |
| progress            | 下载中                                                       |
| ratechange          | 媒体播放速率发生变化                                         |
| seeked              | 跳转已结束                                                   |
| seeking             | 回放已移动到新位置                                           |
| stalled             | 浏览器尝试下载，但尚未收到数据                               |
| timeupdate          | currentTime 被非常规或意外地更改了                           |
| volumechange        | volume 或 muted 属性值发生了变化                             |
| waiting             | 回放暂停，以下载更多数据                                     |

## 3. 自定义媒体播放器

使用 `<audio>` 和 `<video>` 的 play() 和 pause() 方法，可以手动控制媒体文件的播放。综合使用属性、事件和这些方法，可以方便地创建自定义的媒体播放器，如下面的例子所示：

```html
<div class="mediaplayer">
    <div class="video">
        <video id="player" src="movie.mov" poster="mymovie.jpg" width="200" height=“200”>
            Video player not available
        </video>
    </div>
    <div class="controls">
        <input type="button" value="Play" id="video-btn">
        <span id="curtime">0</span>/<span id="duration">0</span>
    </div>
</div>
```

通过使用 JavaScript 创建一个简单的视频播放器，上面这个基本的 HTML 就可以被激活了，如下所示：

```javascript
// 取得元素的引用
let player = document.getElementById("player"),
    btn = document.getElementById("video-btn"),
    curtime = document.getElementById("curtime"),
    duration = document.getElementById("duration");
// 更新时长
duration.innerHTML = player.duration;

// 为按钮添加事件处理程序
btn.addEventListener("click", (event) => {
    if (player.paused) {
        player.play();
        btn.value = "Pause";
    } else {
        player.pause();
        btn.value = "Play";
    }
});

// 周期性更新当前时间
setInterval(() => {
    curtime.innerHTML = player.currentTime;
}, 250);
```

## 4. 检测编解码器

如前所述，并不是所有浏览器都支持 `<video>` 和 `<audio>` 的所有编解码器，这通常意味着必须提供多个媒体源。为此，也有 JavaScript API 可以用来检测浏览器是否支持给定格式和编解码器。这两个媒体元素都有一个名为 canPlayType() 的方法，该方法接收一个格式/编解码器字符串，返回一个字符串值："probably"、"maybe" 或 ""（空字符串），其中空字符串就是假值，意味着可以在 if 语句中像这样使用 canPlayType()：

```javascript
if (audio.canPlayType("audio/mpeg")) {
    // 执行某些操作
}
```

"probably" 和 "maybe" 都是真值，在 if 语句的上下文中可以转型为 true。

在只给 canPlayType() 提供一个 MIME 类型的情况下，最可能返回的值是 "maybe" 和空字符串。这是因为文件实际上只是一个包装音频和视频数据的容器，而真正决定文件是否可以播放的是编码。在同时提供 MIME 类型和编解码器的情况下，返回值的可能性会提高到 "probably"。下面是几个例子：

```javascript
let audio = document.getElementById("audio-player");
// 很可能是 "maybe"
if (audio.canPlayType("audio/mpeg")) {
    // 执行某些操作
}
// 可能是 "probably"
if (audio.canPlayType("audio/ogg; codecs=\"vorbis\"")) {
    // 执行某些操作
}
```

注意，编解码器必须放到引号中。同样，也可以在视频元素上使用 canPlayType() 检测视频格式。

## 5. 音频类型

`<audio>` 元素还有一个名为 Audio 原生 JavaScript 构造函数，支持在任何时候播放音频。Audio 类型与 Image 类似，都是 DOM 元素的对等体，只是不需要插入文档即可工作。要通过 Audio 播放音频，只需创建一个新实例并传入音频源文件：

```javascript
let audio = new Audio("sound.mp3");
EventUtil.addHandler(audio, "canplaythrough", function(event) {
    audio.play();
});
```

创建 Audio 的新实例就会开始下载指定的文件。下载完毕后，可以调用 play() 来播放音频。

# 10. Notifications API

Notifications API 用于向用户显示通知。无论从哪个角度看，这里的通知都很类似 alert() 对话框：都使用 JavaScript API 触发页面外部的浏览器行为，而且都允许页面处理用户与对话框或通知弹层的交互。不过，通知提供更灵活的自定义能力。

Notifications API 在 Service Worker 中非常有用。渐进式 Web 应用（PWA，Progressive Web Application）通过触发通知可以在页面不活跃时向用户显示消息，看起来就像原生应用。

## 1. 通知权限

Notifications API 有被滥用的可能，因此默认会开启两项安全措施：

* 通知只能在运行在安全上下文的代码中被触发
* 通知必须按照每个源的原则明确得到用户允许

用于授权显示通知是通过浏览器内部的一个对话框完成的。除非用户没有明确给出允许或拒绝的答复，否则这个权限请求对每个域只会出现一次。浏览器会记住用户的选择，如果被拒绝则无法重来。

页面可以使用全局对象 Notification 向用户请求通知权限。这个对象有一个 requestPemission() 方法，该方法返回一个期约，用户在授权对话框上执行操作后这个期约会解决。

```javascript
Notification.requestPermission().then((permission) => {
    console.log('User responded to permission request:', permission);
});
```

"granted" 值意味着用户明确授权了显示通知的权限。除此之外的其他值意味着显示通知会静默失败。如果用户拒绝授权，这个值就是 "denied"。一旦拒绝，就无法通过编程方式挽回，因为不可能再触发授权提示。

## 2. 显示和隐藏通知

Notification 构造函数用于创建和显示通知。最简单的通知形式是只显示一个标题，这个标题内容可以作为第一个参数传给 Notification 构造函数。以下面这种方式调用 Notification，应该会立即显示通知：

```javascript
new Notification('Title text!');
```

可以通过 options 参数对通知进行自定义，包括设置通知的主体、图片和振动等：

```javascript
new Notification('Title text!', {
    body: 'Body text!',
    image: 'path/to/image/png',
    vibrate: true
});
```

调用这个构造函数返回的 Notification 对象的 close() 方法可以关闭显示的通知。下面的例子展示了显示通知后 1000 毫秒再关闭它：

```javascript
const n = new Notification('I will close in 1000ms');
setTimeout(() => n.close(), 1000);
```

## 3. 通知生命周期回调

通知并非只用于显示文本字符串，也可用于实现交互。Notifications API 提供了 4 个用于添加回调的生命周期方法：

* onshow 在通知显示时触发
* onclick 在通知被点击时触发
* onclose 在通知消失或通过 close() 关闭时触发
* onerror 在发生错误阻止通知显示时触发

下面的代码将每个生命周期事件都通过日志打印了出来：

```javascript
const n = new Notification('foo');

n.onoshow = () => console.log('Notification was shown!');
n.onclick = () => console.log('Notification was clicked!');
n.onclose = () => console.log('Notification was closed!');
n.onerror = () => console.log('Notification experienced an error!');
```

# 11. Page Visibility API

Web 开发中一个常见的问题是开发者不知道用户什么时候真正在使用页面。如果页面被最小化或隐藏在其他标签页的后面，那么轮询服务器或更新动画等功能可能就没必要了。Page Visibility API 旨在为开发者提供页面对用户是否可见的信息。

这个 API 本身非常简单，由 3 部分构成。

* document.visibilityState 字符串值，表示下面几种状态之一。
  * visible：页面当前对用户可见
  * hidden：页面当前不可见或最小化
  * prerender：页面正在预渲染，尚未对用户可见
* visibilitychange 事件，该事件会在文档从隐藏变可见（或反之）时触发
* document.hidden 布尔值，表示页面是否隐藏。这可能意味着页面在后台标签页或浏览器中被最小化了。这个值是为了向后兼容才继续被浏览器支持的，应该优先使用 document.visibilityState 检测页面可见性。

要想在页面从可见变为隐藏或从隐藏变为可见时得到通知，需要监听 visibilitychange 事件。

# 13. URL API

URL API 为 JavaScript 创建、解析和操作 URL 提供了便捷的手段。在这些 API 出现以前，开发者需要通过拼接组件（如协议、主机、路径）或者部分修改已有 URL 的方式来创建 URL。为此经常是正则表达式和字符串操作乱作一团。URL API 原生支持 URL 格式，通过相应的属性和方法让操作 URL 变得非常轻松。

## 1. URL 对象

可以使用 URL() 构造函数创建一个表示给定 URL 的对象，它接受两个参数。

* url：字符串形式的 URL
* base（可选）：字符串或其他 URL 对象，作为解析相对 URL 的基准

下面是创建 URL 对象的例子：

```javascript
const baseURL = new URL('https://example.com/base/path/');
const relativeURL = new URL('relative/path', baseURL);

console.log(relativeURL.toString());
// https://example.com/base/path/relative/path
```

URL 对象提供了很多属性，用于读取或修改 URL 的不同组件。

* href：字符串形式的完整 URL。可以使用这个属性创建一个新 URL
* protocol：协议，包括末尾的冒号（如 `http:` 或 `https:`）
* username：URL 中的用户名
* password：URL 中的密码
* host：主机名和端口的组合（如："example.com:8080"）
* hostname：域名或 IP 地址（如："example.com"）
* port：端口
* pathname：URL 的路径（比如："/path.page"）
* search：查询字符串，包括前置的 "?" 字符
* hash：片段标识符，包括前置的 "#" 字符
* searchParams：只读的 URLSearchParams 对象，可用于操作查询字符串

下面是一个读写 URL 属性的例子：

```javascript
// 创建一个新 URL 对象
const url = new URL("https://example.com:8080/path.page?q1=val1&q2=val2#fragment");

console.log(url.href); //（等同于 url.toString()）
// "https://example.com:8080/path/page?q1=val1&q2=val2#fragment"

console.log(url.protocol); // "https:"
console.log(url.host); // "example.como:8080"
console.log(url.hostname); // "example.com"
console.log(url.port); // "8080"
console.log(url.pathname); // "/path/page"
console.log(url.search); // "?q1=val&q2=val2"
console.log(url.hash); // "#fragment"

// 操作属性
url.host = "wiley.com:8081";
url.pathname = "/new/path/page";

console.log(url.href);
// "https://wiley.com:8081/new/path/page?q1=val1&q2=val2#fragment"
```

## 2. URLSearchParams 对象

URLSearchParams 提供了一组标准 API 方法，通过它们可以检查和修改查询字符串。开发者通常有两种方式使用这个对象。

* 通过 URL 对象的 searchParams 属性操作 URLSearchParams。修改这个对象会修改原始的 URL
* 通过 new URLSearchParams() 传入查询字符串来创建独立的 URLSearchParams 实例。

URLSearchParams 有以下方法。

* append(name, value)：以指定的 name 和 value 来追加新的查询参数
* delete(name)：删除指定 name 的所有查询参数
* get(name)：返回与指定 name 匹配的第一个值，如果没有找到则返回 null
* getAll(name)：返回与指定 name 匹配的所有值，如果没有找到则返回空数组
* has(name)：如果至少有一个查询参数的名字是 name，返回 true，否则返回 false
* set(name, value)：以指定的 name 和 value 来设置或更新查询参数。如果没有该参数，则新增
* sort()：按照 name 对所有查询参数进行排序

下面来看一个例子：

```javascript
let qs = "?q=javascript&num=10";

let searchParams = new URLSearchParams(qs);

alert(searchParams.toString()); // "q=javascript&num=10"
searchParams.has("num"); // true
searchParams.get("num"); // 10

searchParams.set("page", "3");
alert(searchParams.toString()); // "q=javascript&num=10&page=3"

searchParams.delete("q");
alert(searchParams.toString()); // "num=10&page=3"
```

URLSearchParams 的实例是可迭代对象：

```javascript
let qs = "?q=javascript&num=10";

let searchParams = new URLSearchParams(qs);

for (let param of searchParams) {
    console.log(param);
}
// ["q", "javascript"]
// ["num", "10"]
```

# 14. 计时 API

## performance.now()

## performance.getEntries()

## performance.getEntriesByType()

页面性能始终是 Web 开发者关心的话题。Performance 接口通过 JavaScript API 暴露了浏览器内部的度量指标，允许开发者直接访问这些信息并基于这些信息实现自己想要的功能。这个接口暴露在 window.performance 对象上。所有与页面相关的指标，包括已经定义和将来会定义的，都会存在于这个对象上。

Performance 接口由多个 API 构成，除了 Paint Timing API 都有两个级别：

* High Resolution Time API
* Performance Timeline API
* Navigation Timing API
* User Timing API
* Resource Timing API
* Paint Timing API

有关这些规范的更多信息以及新增的性能相关规范，可以关注 W3C 性能工作组的 Github 项目页面。

>注意
>
>浏览器通常支持被废弃的 Level 1 和作为替代的 Level 2。本节尽量介绍 Level 2 级规范。

## 1. High Resolution Time API

Date.now() 方法只适用于日期时间相关操作，而且是不要求计时精度的操作。在下面的例子中，函数 foo() 调用前后分别记录了一个时间戳：

```javascript
const t0 = Date.now();
foo();
const t1 = Date.now();

const duration = t1 - t0;

console.log(duration);
```

考虑如下 duration 会包含意外值的情况。

* duration 是 0。Date.now() 只有毫秒级精度，如果 foo() 执行足够快，则两个时间戳的值会相等。
* duration 是负值或极大值。如果在 foo() 执行时，系统时钟被向后或向前调整了（如切换到夏令时），则捕获的时间戳不会考虑这种情况，因此时间差中会包含这些调整。

为此，必须使用不同的计时 API 来精确且准确地度量时间的流逝。High Resolution Time API 定义了 window.performance.now()，这个方法返回一个微秒精度的浮点值。因此，使用这个方法先后捕获的时间戳更不可能出现相等的情况。而且这个方法可以保证时间戳单调增长。

```javascript
const t0 = performance.now();
const t1 = performance.now();

console.log(t0); // 
console.log(t1);

const duration = t1 - t0;

console.log(duration);
```

performance.now() 计时器采用相对度量。这个计时器在执行上下文创建时从 0 开始计时。例如，打开页面或创建工作线程时，performance.now() 就会从 0 开始计时。由于这个计时器在不同上下文初始化时可能存在时间差，因此不同上下文之间如果没有共享参照点则不能直接比较 performance.now()。performance.timeOrigin 属性返回计时器初始化时全局系统时钟的值。

```javascript
const relativeTimestamp = performance.now();

const absoluteTimestamp = performance.timeOrigin + relativeTimestamp;

console.log(relativeTimestamp); // 244.43500000052154
console.log(absoluteTimestamp); // 1567926208892.4001
```

>注意
>
>通过使用 performance.now() 测量 L1 缓存与主内存的延迟差，幽灵漏洞可以执行缓存推断攻击。为弥补这个安全漏洞，所有的主流浏览器有的选择降低 performance.now() 的精度，有的选择在时间戳里混入一些随机性。Webkit 博客上有一篇相关主题的不错的文章 "What Spectre and Meltdown Mean For Webkit", 作者是 Filip Pizlo。

## 2. Performance Timeline API

Performance Timeline API 使用一套用于度量客户端延迟的工具扩展了 Performance 接口。性能度量会采用计算结束与开始时间差的形式。这些开始和结束时间会被记录为 DOMHighResTimeStamp 值，而封装这个时间戳的对象是 PerformanceEntry 的实例。

浏览器会自动记录各种 PerformanceEntry 对象，而使用 performance.mark() 也可以记录自定义的 PerformanceEntry 对象。在一个执行上下文种被记录的所有性能条目可以通过 performance.getEntries() 获取：

```javascript
console.log(performance.getEntries());

// [PerformanceNavigationTiming, PerformanceResourceTiming, ...]
```

这个返回的集合代表浏览器的性能时间线（performance timeline）。每个 PerformanceEntry 对象都有 name、entryType、startTime 和 duration 属性：

```javascript
const entry = performance.getEntries()[0];

console.log(entry.name); // "https://example.com"
console.log(entry.entryType); // navigation
console.log(entry.startTime); // 0
console.log(entry.duration); // 182.36500001512468
```

不过，PerformanceEntry 实际上是一个抽象基类。所有记录条目虽然都继承 PerformanceEntry，但最终还是如下某个具体类的实例：

* PerformanceMark
* PerformanceMeasure
* PerformanceFrameTiming
* PerformanceNavigationTiming
* PerformanceResourceTiming
* PerformancePaintTiming

上面每个类都会增加大量属性，用于描述与相应条目有关的元数据。每个实例的 name 和 entryType 属性会因为各自的类不同而不同。

### 1. User Timing API

User Timing API 用于记录和分析自定义性能条目。如前所述，记录自定义性能条目要使用 performance.mark() 方法：

```javascript
performance.mark('foo');

console.log(performance.getEntriesByType('mark')[0]);
// PerformanceMark {
// 	name: "foo",
//  entryType: "mark",
// 	startTime: 269.8800000362098,
// 	duration: 0
// }
```

在计算开始前和结束后各创建一个自定义性能条目可以计算时间差。最新的标记（mark）会被推到 getEntriesByType() 返回数组的开始：

```javascript
performance.mark('foo');
for (let i = 0; i < 1E6; ++i) {}
performance.mark('bar');

const [endMark, startMark] = performance.getEntriesType('mark');
console.log(startMark.startTime - endMark.startTime); // 1.3299999991431832
```

除了自定义性能条目，还可以生成 PerformanceMeasure（性能度量）条目，对应由名字作为标识的两个标记之间的持续时间。PerformanceMeasure 的实例由 performance.measure() 方法生成：

```javascript
performance.mark('foo');
for (let i = 0; i < 1E6; ++i) {}
performance.mark('bar');

performance.measure('baz', 'foo', 'bar');

const [differenceMark] = performance.getEntriesByType('measure');

console.log(differenceMark);
// PerformanceMeasure {
// 	name: "baz"
// 	entryType: "measure"
// 	startTime: 298.9800000214018,
// 	duration: 1.349999976810068
// }
```

### 2. Navigation Timing API

Navigation Timing API 提供了高精度时间戳，用于度量当前页面加载速度。浏览器会在导航事件发生时自己记录 PerformanceNavigationTiming 条目。这个对象会捕获大量时间戳，用于描述页面是何时以及如何加载的。

下面的例子计算了 loadEventStart 和 loadEventEnd 时间戳之间的差：

```javascript
const [performanceNavigationTimingEntry] = performance.getEntriesByType('navigation');

console.log(performanceNavigationTimingEntry);
// PerformanceNaivigationTiming {
// 	connectEnd: 2.259999979287386
// 	connectStart: 2.259999979287386
// 	decodedBodySize: 122314
// 	domComplete: 631.9899999652989
// 	domContentLoadedEventEnd: 300.92499998863786
// ...
// }

console.log(performanceNavigationTimingEntry.loadEventEnd - performanceNavigationTimingEntry.loadEventStart);
// 0.805000017862767
```

### 3. Resource Timing API

Resource Timing API 提供了高精度时间戳，用于度量当前页面加载时请求资源的速度。浏览器会在加载资源时自动记录 PeformanceResourceTiming。这个对象会捕获大量时间戳，用于描述资源加载的速度。

下面的例子计算了加载一个特定资源所花的时间：

```javascript
const performanceResourceTimingEntry = performance.getEntriesType('resource')[0];

console.log(performanceResourceTimingEntry);
// PerformanceResourceTiming {
// 	connectEnd: 138.11499997973442
// 	connectStart: 138.11499997973442
// 	decodedBodySize: 33808
// 	domainLookupEnd: 138.11499997973442
// 	domainLookupStart: 138.11499997973442
// ...
// 	workerStart: 0
// }

console.log(performanceResourceTimingEntry.responseEnd - performanceResourceTimingEntry.requestStart);
// 493.9600000507198
```

通过计算并分析不同时间差，可以更全面地审视浏览器加载页面的过程，发现可能存在的性能瓶颈。

# 15. Web 组件

这里所说的 Web 组件指的是一套用于增强 DOM 行为的工具，包括影子 DOM、自定义元素和 HTML 模板。这一套浏览器 API 特别混乱。

* 并没有统一的 Web Components 规范：每个 Web 组件都在一个不同的规范中定义
* 有些 Web 组件如影子 DOM 和自定义元素，已经出现了向后不兼容的版本问题
* 浏览器实现极其不一致

由于存在这些问题，因此使用 Web 组件通常需要引入一个 Web 组件库，比如 Polymer。这种库可以作为腻子脚本，模拟浏览器中缺失的 Web 组件。

>注意
>
>本章只介绍 Web 组件的最新版本。

## 1. HTML 模板

在 Web 组件之前，一直缺少基于 HTML 解析构建 DOM 子树，然后在需要时再把这个子树渲染出来的机制。一种间接方案是使用 innerHTML 把标记字符串转换为 DOM 元素，但这种方式存在严重的安全隐患。另一种间接方案是使用 document.createElement() 构建每个元素，然后逐个把它们添加到孤儿根节点（不是添加到 DOM），但这样做特别麻烦，完全与标记无关。

相反，更好的方式是提前在页面中写出特殊标记，让浏览器自动将其解析为 DOM 子树，但跳过渲染。这正是 HTML 模板的核心思想，而 `<template>` 标签正是为这个目的而生的。下面是一个简单的 HTML 模板的例子：

```html
<template id="foo">
    <p>I'm inside a template!</p>
</template>
```

### 1. 使用 DocumentFragment

在浏览器中渲染时，上面例子中的文本不会被渲染到页面上。因为 `<template>` 的内容不属于活动文档，所以 document.querySelector() 等 DOM 查询方法不会发现其中的 `<p>` 标签。这是因为 `<p>` 存在于一个包含在 HTML 模板中的 DocumentFragment 节点内。

在浏览器中通过开发者工具检查网页内容时，可以看到 `<template>` 中的 DocumentFragment：

```html
<template id="foo">
    #document-fragment
    <p>I'm inside a template!</p>
</template>
```

通过 `<template>` 元素的 content 属性可以获取这个 DocumentFragment 的引用：

```javascript
console.log(document.querySelector('#foo').content); // #document-fragment
```

此时的 DocumentFragment 就像一个对应子树的最小化 document 对象。换句话说，DocumentFragment 上的 DOM 匹配方法可以查询其子树中的节点：

```javascript
const fragment = document.querySelector('#foo').content;

console.log(document.querySelector('p')); // null
console.log(fragment.querySelector('p')); // <p>...</p>
```

DocumentFragment 也是批量向 HTML 中添加元素的高效工具。比如，我们想以最快的方式给某个 HTML 元素添加多个子元素。如果连续调用 document.appendChild()，则不仅费事，还会导致多次布局重排。而使用 DocumentFragment 可以一次性添加所有子节点，最多只会有一次布局重排：

```javascript
// 开始状态：
// <div id="foo"></div>
//
// 期待的最终状态
// <div id="foo">
// 	<p></p>
//	<p></p>
// 	<p></p>
// </div>
// 也可以使用 document.createDocumentFragment()
const fragment = new DocumentFragment();

const foo = document.querySelector('#foo');

// 为 DocumentFragment 添加子元素不会导致布局重排
fragment.appendChild(document.createElement('p'));
fragment.appendChild(document.createElement('p'));
fragment.appendChild(document.createElement('p'));

console.log(fragment.children.length); // 3

foo.appendChild(fragment);

console.log(fragment.children.length); // 0

console.log(document.body.innerHTML);
// <div id="foo">
// 	<p></p>
// 	<p></p>
// 	<p></p>
// </div>
```

### 2. 使用 `<template>` 标签

注意，在前面的例子中，DocumentFragment 的所有子节点都高效地转移到了 foo 元素上，转移之后 DocumentFragment 变空了。同样地过程也可以使用 `<template>` 标签重现：

```javascript
const fooElement = document.querySelector('#foo');
const barTemplate = document.queyrSelector('#bar');
const barFragment = barTemplate.content;

console.log(document.body.innerHTML);
// <div id="foo">
// </div>s
// <template id="bar">
// 	<p></p>
// 	<p></p>
// 	<p></p>
// </template>

fooElement.appendChild(barFragment);

console.log(document.body.innerHTML);
// <div id="foo">
// 	<p></p>
// 	<p></p>
// 	<p></p>
// </div>
// <template id="bar"></template>j
```

如果想要复制模板，可以使用 importNode() 方法克隆 DocumentFragment：

```javascript
const fooElement = document.querySelector('#foo');
const barTemplate = document.querySelector('#bar');
const barFragment = barTemplate.content;

console.log(document.body.innerHTML);
// <div id="foo">
// </div>
// <template id="bar">
// 	<p></p>
// 	<p></p>
// 	<p></p>
// </template>

fooElement.appendChild(document.importNode(barFragment, true));

console.log(document.body.innerHTML);
// <div id="foo">
// 	<p></p>
// 	<p><p>
// 	<p></p>
// </div>
// <template id="bar">
//	<p></p>
// 	<p></p>
// 	<p></p>
// </template>
```

### 3. 模板脚本

脚本指定可以推迟到将 DocumentFragment 的内容实际添加到 DOM 树。下面的例子演示了这个过程：

```javascript
// 页面 HTML
//
// <div id="foo"></div>
// <template id="bar">
//	<script>console.log('Template script executed');</script>
// </template>

const fooElement = document.querySelector('#foo');
const barTemplate = document.querySelector('#bar');
const barFragment = barTemplate.content;

console.log('About to add template');
fooElement.appendChild(barFragment);
console.log('Added template');

// About to add template
// Template script executed
// Added template
```

如果新添加的元素需要进行某些初始化，这种延迟执行是有用的。

## 2. 影子 DOM

### attachShadow()

### shadowRoot

概念上讲，影子 DOM（shadow DOM）Web 组件相当直观，通过它可以将一个完整的 DOM 树作为节点添加到父 DOM 树。这样可以实现 DOM 封装，意味着 CSS 样式和 CSS 选择符可以限制在影子 DOM 子树和不是整个顶级 DOM 树中。

影子 DOM 与 HTML 模板很相似，因为它们都是类似 document 的结构，并允许与顶级 DOM 有一定程度的分离。不过，影子 DOM 与 HTML 模板还是有区别的，主要表现在在影子 DOM 的内容会实际渲染到页面上，而 HTML 模板的内容不会。

### 1. 理解影子 DOM

假设有以下 HTML 标记，其中包含多个类似的 DOM 子树：

```html
<div>
    <p>Make me red!</p>
</div>
<div>
    <p>Make me blue!</p>
</div>
<div>
    <p>Make me green!</p>
</div>
```

从其中的文本节点可以推断出，这 3 个 DOM 子树会分别渲染为不同的颜色。常规情况下，为了给每个子树应用唯一的样式，又不使用 style 属性，就需要给每个子树添加一个唯一的类名，然后通过相应的选择符为它们添加样式：

```html
<div class="red-text">
    <p>Make me red!</p>
</div>
<div class="green-text">
    <p>Make me green!</p>
</div>
<div>
    <p>Make me blue!</p>
</div>

<style>
    .red-text {
        color: red;
    }
    .green-text {
        color: green;
    }
    .blue-text {
        color: blue;
    }
</style>
```

当然，这个方案也不是十分理想，因为这跟在全局命名空间中定义变量没有太大区别。尽管知道这些样式与其他地方无关，所有 CSS 样式还会应用到整个 DOM。为此，就要保持 CSS 选择符足够特别，以防这些样式渗透到其他地方。但这也是仅是一个折中的办法而已。理想情况下，应该能够把 CSS 限制在使用它们的 DOM 上：这正是影子 DOM 最初的使用场景。

### 2. 创建影子 DOM

考虑到安全及避免影子 DOM 冲突，并非所有元素都可以包含影子 DOM。尝试给无效元素或者已经有了影子 DOM 的元素添加影子 DOM 会导致抛出错误。

以下是可以容纳影子 DOM 的元素。

* 任何以有效名称创建的自定义元素（参见 HTML 规范中相关的定义）
* `<article>`
* `<aside>`
* `<blockquote>`
* `<body>`
* `<div>`
* `<footer>`
* `<h1>`
* `<h2>`
* `<h3>`
* `<h4>`
* `<h5>`
* `<h6>`
* `<header>`
* `<main>`
* `<nav>`
* `<p>`
* `<section>`
* `<span>`

影子 DOM 是通过 attachShadow() 方法创建并添加给有效 HTML 元素的。容纳影子 DOM 的元素被称为影子宿主（shadow host）。影子 DOM 的根节点被称为影子根（shadow root）。

attachShadow() 方法需要一个 shadowRootInit 对象，返回影子 DOM 的实例。shadowRootInit 对象必须包含一个 mode 属性，值为 "open" 或 "closed"。对 "open" 影子 DOM 的引用可以通过 shadowRoot 属性在 HTML 元素上获得，而对 "closed" 影子 DOM 的引用无法这样获取。

下面的代码演示了不同 mode 的区别：

```javascript
document.body.innerHTML = `
	<div id="foo"></div>
	<div id="bar"></div>
`;

const foo = document.querySelector('#foo');
const bar = document.querySelector('#bar');

const openShadowDOM = foo.attachShadow({ mode: 'open' });
const closedShadowDOM = bar.attachShadow({ mode: 'closed' });

console.log(openShadowDOM); // #shadow-root（open）
console.log(closedShadowDOM); // #shadow-root（closed）

console.log(foo.shadowRoot); // #shadow-root（open）
console.log(bar.shadowRoot); // null
```

一般来说，需要创建保密（closed）影子 DOM 的场景更少。虽然这可以限制通过影子宿主访问影子 DOM，但恶意代码有很多方法绕过这个限制，恢复对影子 DOM 的访问。简言之，不能为了安全而创建保密影子 DOM。

>注意
>
>如果想保护独立的 DOM 树不受未信任代码影响，影子 DOM 并不适合这个需求，对 `<iframe>` 施加的跨源限制更可靠。

### 3. 使用影子 DOM

把影子 DOM 添加到元素之后，可以像使用常规 DOM 一样使用影子 DOM。来看下面的例子，这里重新创建了前面红/绿/蓝子树的示例：

```javascript
for (let color of ['red', 'green', 'blue']) {
    const div = document.createElement('div');
    const shadowDOM = div.atttachShadow({ mode: 'open' });
    
    document.body.appendChild(div);
    shadowDOM.innerHTML = `
    	<p>Make me ${color}</p>
    	
    	<style>
        p {
			color: ${color};
        }
        </style>
    `;
}
```

虽然这里使用相同的选择符应用了 3 种不同的颜色，但每个选择符只会把样式应用到它们所在的影子 DOM 上。为此，3 个 `<p>` 元素会出现 3 种不同的颜色。

可以这样验证这些元素分别位于它们自己的影子 DOM 中：

```javascript
for (let color of ['red', 'green', 'blue']) {
    const div = document.createElement('div');
    const shadowDOM = div.attachShadow({ mode: 'open' });
    
    document.body.appendChild(div);
    
    shadowDOM.innerHTML = `
    	<p>Make me ${color}</p>
    	
    	<style>
    	p {
    		color: ${color};
    	}
    	</style>
    `;
}

function countP(node) {
    console.log(node.querySelectorAll('p').length);
}

countP(document); // 0

for (let element of document.querySelectorAll('div')) {
    countP(element.shadowRoot);
}

// 1
// 1
// 1
```

在浏览器开发者工具中可以更清楚地看到影子 DOM。例如，前面的例子在浏览器检查窗口中会显示成这样：

```html
<body>
<div>
    #shadow-root（open）
    <p>Make me red!</p>
    <style>
    p {
        color: red;
    }
    </style>
</div>
<div>
    #shadow-root（open）
    <p>Make me green!</p>
    <style>
    p {
        color: green;
    }
    </style>
</div>
<div>
    #shadow-root（open）
    <p>Make me blue!</p>
    
    <style>
    p {
        color: blue;
    }
    </style>
</div>
</body>
```

影子 DOM 并非铁板一块。HTML 元素可以在 DOM 树间无限制移动：

```javascript
document.body.innerHTML = `
<div></div>
<p id="foo">Move me</p>
`;

const divElement = document.querySelector('div');
const pElement = document.querySelector('p');

const shadowDOM = divElement.attachShadow({ mode: 'open' });

// 从父 DOM 中移除元素
divElement.parentElement.removeChild(pElement);

// 把元素添加到影子 DOM
shadowDOM.appendChild(pElement);

// 检查元素是否移动到了影子 DOM
console.log(shadowDOM.innerHTML); // <p id="foo">Move me</p>
```

### 4. 合成与影子 DOM 槽位

影子 DOM 是为自定义 Web 组件设计的，为此需要支持嵌套 DOM 片段。从概念上讲，可以这么说：位于影子宿主中的 HTML 需要一种机制以渲染到影子 DOM 中去，但这些 HTML 又不必属于影子 DOM 树。

默认情况下，嵌套内容会隐藏。来看下面的例子，其中的文本在 1000 毫秒后会被隐藏：

```javascript
document.body.innerHTML = `
<div>
	<p>Foo</p>
</div>
`;

setTimeout(() => document.querySelector('div').attachShadow({ mode: 'open' }), 1000);
```

影子 DOM 一添加到元素中，浏览器就会赋予它最高优先级，优先渲染它的内容而不是原来的文本。在这个例子中，由于影子 DOM 是空的，因此 `<div>` 会在 1000 毫秒后变成空的。

为了显示文本内容，需要使用 `<slot>` 标签指示浏览器在哪里放置原来的 HTML。下面的代码修改了前面的例子，让影子宿主中的文本出现在了影子 DOM 中：

```javascript
document.body.innerHTML = `
<div id="foo">
	<p>Foo</p>
</div>
`;

document.querySelector('div')
	.attachShadow({ mode: 'open' })
	.innerHTML = `<div id="bar">
					<slot></slot>
				  </div>`;
```

现在，投射进去的内容就像自己存在于影子 DOM 中一样。检查页面会发现原来的内容实际上替代了 `<slot>`：

```html
<body>
<div id="foo">
    #shadow-root（open）
    <div id="bar">
        <p>Foo</p>
    </div>
</div>
</body>
```

注意，虽然在页面检查窗口中看到内容在影子 DOM 中，但这实际上只是 DOM 内容的投射（projection）。实际的元素仍然处于外部 DOM 中：

```javascript
document.body.innerHTML = `
<div id="foo">
	<p>Foo</p>
</div>
`;

document.querySelector('div')
	.attachShadow({ mode: 'open' })
	.innerHTML = `
		<div id="bar">
			<slot></slot>
		</div>
	`;

console.log(document.querySelector('p').parentElement);
// <div id="foo"></div>
```

下面是使用槽位（slot）改写的前面红/绿/蓝子树的例子：

```javascript
for (let color of ['red', 'green', 'blue']) {
    const divElement = document.createElement('div');
    divElement.innerText = `Make me ${color}`;
    document.body.appendChild(divElement);
    
    divElement
        .attachShadow({ mode: 'open' })
    	.innerHTML = `
        <p><slot></slot></p>
        
        <style>
        p {
        	coor: ${color};
        }
        </style>
    	`;
}
```

除了默认槽位，还可以使用命名槽位（named slot）实现多个投射。这是通过匹配的 slot/name 属性对实现的。带有 slot="foo" 属性的元素会被投射到带有 name="foo" 的 `<slot>` 上。下面的例子演示了如何改变影子宿主子元素的渲染顺序：

```javascript
document.body.innerHTML = `
<div>
	<p slot="foo">Foo</p>
	<p slot="bar">Bar</p>
</div>
`;

document.querySelector('div')
	.attachShadow({ mode: 'open' })
	.innerHTML = `
	<slot name="bar"></slot>
	<slot name="foo"></slot>
	`;

// Renders:
// Bar
// Fook
```

### 5. 事件重定向

如果影子 DOM 中发生了浏览器事件（如 click），那么浏览器需要一种方式以父 DOM 处理事件。不过，实现也必须考虑影子 DOM 的边界。为此，事件会逃出影子 DOM 并经过事件重定向（event retarget）在外部被处理。逃出后，事件就好像是由影子宿主本身而非真正的包装元素触发的一样。下面的代码演示了这个过程：

```javascript
// 创建一个元素作为影子宿主
document.body.innerHTML = `
<div onclick="console.log('Handled outside:', event.target)"></div>
`;

// 添加影子 DOM 并向其中插入 HTML
document.querySelector('div')
	.attachShadow({ mode: 'open' })
	.innerHTML = `
	<button onclick="console.log('Handled inside:', event.target)">Foo</button>
	`;

// 点击按钮时：
// Handled inside: <button onclick="..."></button>
// Handled outside: <div onclick="..."></div>
```

注意，事件重定向只会发生在影子 DOM 中实际存在的元素上。使用 `<slot>` 标签从外部投射进来的元素不会发生事件重定向，因为从技术上讲，这些元素仍然存在于影子 DOM 外部。

## 3. 自定义元素

如果你使用 JavaScript 框架，那么很熟悉自定义元素的概念。这是因为所有主流框架都以某种形式提供了这个特性。自定义元素为 HTML 元素引入了面向对象编程的风格。基于这种风格，可以创建自定义、复杂的和可重用的元素，而且只要使用简单的 HTML 标签或属性就可以创建相应的的实例。

### 1. 创建自定义元素

浏览器会尝试讲无法识别的元素作为通用元素整合进 DOM。当然，这些元素默认也不会做任何通用 HTML 元素不能做的事。来看下面的例子，其中胡乱编的 HTML 标签会变成一个 HTMLElement 实例：

```javascript
document.body.innerHTML = `
<x-foo >I'm inside a nonsense element.</x-foo >
`;

console.log(document.querySelector('x-foo') instanceof HTMLElement); // true
```

自定义元素在此基础上更进一步。利用自定义元素，可以在 `<x-foo>` 标签出现时为它定义复杂的行为，同样也可以在 DOM 中将其纳入元素生命周期管理。自定义元素要使用全局属性 customElements，这个属性会返回 CustomElementRegistry 对象。

```javascript
console.log(customElements); // CustomElementRegistry {}
```

调用 customElements.define() 方法可以创建自定义元素。下面的代码创建了一个简单的自定义元素，这个元素继承 HTMLElement：

```javascript
class FooElement extends HTMLElement {}
customElements.define('x-foo', FooElement);

document.body.innerHTML = `
<x-foo>I'm inside a nonsense element.</x-foo>
`;

console.log(document.querySelector('x-foo') instanceof FooElement); // true
```

>注意
>
>自定义元素名必须至少包含一个不在名称开头和末尾的连字符，而且元素标签不能自关闭。

自定义元素的威力源自类定义。例如，可以通过调用自定义元素的构造函数来控制这个类在 DOM 中每个实例的行为：

```javascript
class FooElement extends HTMLElement {
    constructor() {
        super();
        console.log('x-foo');
    }
}
customElements.define('x-foo', FooElement);

document.body.innerHTML = `
<x-foo></x-foo>
<x-foo></x-foo>
<x-foo></x-foo>
`;

// x-foo
// x-foo
// x-foo
```

>注意
>
>在自定义元素的构造函数中必须始终先调用 super()。如果元素继承了 HTMLElement 或相似类型而不会覆盖构造函数，则没有必要调用 super()，因为原型构造函数默认会做这件事。很少有创建自定义元素而不继承 HTMLElement 的情况。

如果自定义元素继承了一个元素类，那么可以使用 is 属性和 extends 选项将标签指定为该自定义元素的实例：

```javascript
class FooElement extends HTMLDivElement {
    constructor() {
        super();
        console.log('x-foo');
    }
}
customElements.define('x-foo', FooElement, { extends: 'div' });

document.body.innerHTML = `
<div is="x-foo"></div>
<div is="x-foo"></div>
<div is="x-foo"></div>
`;

// x-foo
// x-foo
// x-foo
```

### 2. 添加 Web 组件内容

因为每次将自定义元素添加到 DOM 中都会调用其类构造函数，所以很容易自动给自定义元素添加子 DOM 内容。虽然不能在构造函数中添加子 DOM（会抛出 DOMException），但可以为自定义元素添加影子 DOM 并将内容添加到这个影子 DOM 中：

```javascript
class FooElement extends HTMLElement {
    constructor() {
        super();
        
        // this 引用 Web 组件节点
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
        	<p>I'm inside a custom element!</p>
        `;
    }
}
customElements.define('x-foo', FooElement);

document.body.innerHTML += `<x-foo></x-foo>`;

// 结果 DOM
// <body>
// <x-foo>
// 	#shadow-root（open）
// 	<p>I;m inside a custom element!</p>
// <x-foo>
// </body>
```

为避免字符串模板和 innerHTML 不干净，可以使用 HTML 模板和 document.createElement() 重构这个例子：

```javascript
//（初始的 HTML）
// <template id="x-foo-tpl">
// 	<p>I'm inside a custom element template!</p>
// </template>

const template = document.querySelector('#x-foo=tpl');

class FooElement extends HTMLElement {
    constructor() {
        super();
        
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('x-foo', FooElement);

document.body.innerHTML += `<x-foo></x-foo>`;

// 结果 DOM：
// <body>
// <template id="x-foo-tpl">
// 	<p>I'm inside a custom element template!</p>
// </template>
// <x-foo>
//  #shadow-root（open）
// 		<p>I'm inside a custom element template!</p>
// <x-foo>
// </body>
```

这样可以在自定义元素中实现高度的 HTML 的代码重用，以及 DOM 封装。使用这种模式能够自由创建可重用的组件而不必担心外部 CSS 污染组件的样式。

### 3. 使用自定义元素生命周期方法

可以在自定义元素的不同生命周期执行代码。带有相应名称的自定义元素类的实例方法会在不同生命周期阶段被调用。自定义元素有以下 5 个生命周期方法。

* constructor()：在创建元素实例或将已有 DOM 元素升级为自定义元素时调用
* connectedCallback()：在每次将这个自定义元素实例添加到 DOM 中时调用
* disconnectedCallback()：在每次将这个自定义元素实例从 DOM 中移除时调用
* attributeChangedCallback()：在每次可观测属性的值发生变化时调用。在元素实例初始化时，初始值的定义也算一次变化
* adoptedCallback()：在通过 document.adoptNode() 将这个自定义元素实例移动到新文档对象时调用

下面的例子演示了这些构建、连接和断开连接的回调：

```javascript
class FooElement extends HTMLElement {
    constructor() {
        super();
        console.log('ctor');
    }
    
    connectedCallback() {
        console.log('connected');
    }
    
    disconnectedCallback() {
        console.log('disconnected');
    }
}
customElements.define('x-foo', FooElement);

const fooElement = document.createElement('x-foo');
// ctor

document.body.appendChild(fooElement);
// connected

document.body.removeChild(fooElement);
// disconnnected
```

### 4. 反射自定义元素属性

自定义元素既是 DOM 实体又是 JavaScript 对象，因此两者之间应该同步变化。换句话说，对 DOM 的修改应该反映到 JavaScript 对象，反之亦然。要从 JavaScript 对象反射到 DOM，常见的方式是使用获取函数和设置函数。下面的例子演示了在 JavaScript 对象和 DOM 之间反射 bar 属性的过程：

```javascript
document.body.innerHTML = `<x-foo></x-foo>`;

class FooElement extends HTMLElement {
    constructor() {
        super();
        
        this.bar = true;
    }
    
    get bar() {
        return this.getAttribute('bar');
    }
    
    set bar(value) {
        this.setAttribute('bar', value);
    }
}
customElements.define('x-foo', FooElements);

console.log(document.body.innerHTML);
// <x-foo bar="true"></x-foo>
```

另一方向的反射（从 DOM 到 JavaScript 对象）需要给相应的属性添加监听器。为此，可以使用 observedAttributes() 获取函数让自定义元素的属性值每次改变时都调用 attributeChangedCallback()：

```javascript
class FooElement extends HTMLElement {
    static get observedAttributes() {
        // 返回应该触发 attributeChangedCallback() 执行的属性
        return ['bar'];
    }
    
    get bar() {
        return this.getAttribute('bar');
    }
    
    set bar(value) {
        this.setAttribute('bar', value);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            console.log(`${oldValue} -> ${newValue}`);
            
            this[name] = newValue;
        }
    }
}
customElements.define('x-foo', FooElement);

document.body.innerHTML = `<x-foo bar="false"><x-foo>`;
// null -> false

document.querySelector('x-foo').setAttrbiute('bar', true);
// false -> true
```

### 5. 升级自定义元素

并非始终可以先自定义元素，然后再在 DOM 中使用相应的元素标签。为解决这个先后次序问题，Web 组件在 CustomElementRegistry 上额外暴露了一些方法。这些方法可以用来检测自定义元素是否定义完成，然后可以用它来升级已有元素。

如果自定义元素已经有定义，那么 CustomElementRegistry.get() 方法会返回相应自定义元素的类。类似地，CustomElementRegistry.whenDefined() 方法会返回一个期约，当相应自定义元素有定义之后解决：

```javascript
customElements.whenDefined('x-foo').then(() => console.log('defined!'));

console.log(customElements.get('x-foo'));
// undefined

customElements.define('x-foo', class {});
// defined!

console.log(customElements.get('x-foo'));
// class FooElement {}
```

连接到 DOM 的元素在自定义元素有定义时会自动升级。如果想在元素连接到 DOM 之前强制升级，可以使用 CustomElementRegistry.upgrade() 方法：

```javascript
// 在自定义元素有定义之前会创建 HTMLUnknownElement 对象
const fooElement = document.createElement('x-foo');

// 创建自定义元素
class FooElement extends HTMLElement {}
customElements.define('x-foo', FooElement);

console.log(fooElement instanceof FooElement); // false

// 强制升级
customElements.upgrade(fooElement);

console.log(fooElement instanceof FooElement); // true
```

>注意
>
>还有一个 HTML Imports Web 组件，但这个规范目前还是草案，没有主要浏览器支持。浏览器最终是否会支持这个规范目前还是未知数。













































































