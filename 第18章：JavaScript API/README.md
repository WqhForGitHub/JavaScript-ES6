随着浏览器能力的增加，其复杂性也在迅速增加。从很多方面看，现代浏览器已经成为构建于诸多规范之上、集各种 API 于一身的瑞士军刀。浏览器规范的生态在某种程序上是混乱而无序的。一些 规范如 HTML5，定义了一批增强已有标准的 API 和浏览器特性。而另一些规范如 Web Cryptography API 和 Notifications API，只为一个特性定义了一个 API。不同浏览器实现这些新 API 的情况也不同，有的会实现其中一部分，有的则干脆尚未实现。

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
tjjconst t0 = performance.now();
const t1 = performance.now();

console.log(t0); // 
console.log(t1);

const duration = t1 - t0;

console.log(duration);
```






















































































