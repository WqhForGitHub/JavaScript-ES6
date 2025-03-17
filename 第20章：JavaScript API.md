​                                                                                                                                                                                                                                                                                                                                                                                                                         



# 20.2 跨上下文消息



**`假设有两个 HTML 文件，分别位于不同的域：https://origin1.com/index.html 和 https://origin2.com/frame.html。`**

* **`index.html（https://origin1.com）`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Origin 1</title>
</head>
<body>
    <iframe src="https://origin2.com/frame.html" id="myFrame"></iframe>
    
    <script>
        const frame = document.getElementById("myFrame").contentWindow;
        
        function sendMessage() {
            const message = "Hello from Origin 1!";
            frame.postMessage(message, "https://origin2.com");
        }
        
        window.addEventListener("message", function(event) {
            if (event.origin === "https://origin2.com") {
                console.log("Received message: " + event.data);
            }
        }, false);
    </script>
    
    <button onclick="sendMessage()">Send Message</button>
</body>
</html>
```



* **`frame.html（https://origin2.com）`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Origin 2</title>
</head>
<body>
    <script>
        window.addEventListener("message", function(event) {
            if (event.origin === "https://origin1.com") {
                console.log("Recevied message: " + event.data);
                event.source.postMessage("Hello from Origin 2!", event.origin);
            }
        }, false);
    </script>
</body>
</html>
```













# 20.3 Encoding API

**`Encoding API 主要用于实现字符串与定型数组之间的转换。规范新增了 4 个用于执行转换的全局类：TextEncoder、TextEncoderStream、TextDecoder 和 TextDecoderStream。`**



## 1. 文本编码



### 1. 批量编码

**`所谓批量，指的是 JavaScript 引擎会同步编码整个字符串。对于非常长的字符串，可能会花较长时间。批量编码是通过 TextEncoder 的实例完成的：`**

```javascript
const textEncoder = new TextEncoder();
```

**`这个实例上有一个 encode() 方法，该方法接收一个字符串参数，并以 Uint8Array 格式返回每个字符的 UTF-8 编码：`** 

```javascript
const encoder = new TextEncoder();
const text = "Hello, World!";
const uint8Array = encoder.encode(text);

console.log(uint8Array);
// 输出: Uint8Array(13) [72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]
```



**`encodeInto() 方法`**

```javascript
const encoder = new TextEncoder();
const text = "Hello, World!";
const uint8Array = new Uint8Array(13); // 确保数组足够大

const { read, written } = encoder.encodeInto(text, uint8Array);

console.log("Read:", read);      // 输出: Read: 13
console.log("Written:", written);  // 输出: Written: 13
console.log(uint8Array);
// 输出: Uint8Array(13) [72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]
```





## 2. 文本解码

```javascript
const utf8Decoder = new TextDecoder(); // 默认使用 UTF-8
const uint8Array = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
const text = utf8Decoder.decode(uint8Array);
console.log(text); // 输出: Hello, World!                             
```









# 20.4 File API 与 Blob API



## 1. File 类型

**`File API 仍然以表单中的文件输入字段为基础，但是增加了直接访问文件信息的能力。HTML5 在 DOM 上为文件输入元素添加了 files 集合。当用户在文件字段中选择一个或多个文件时，这个 files 集合中会包含一组 File 对象，表示被选中的文件。每个 File 对象都有一些只读属性。`**

* **`name：本地系统中的文件名。`**
* **`size：以字节计的文件大小。`** 
* **`type：包含文件 MIME 类型的字符串。`** 
* **`lastModifiedDate：表示文件最后修改时间的字符串。这个属性只有 Chrome 实现了。`** 

**`例如，通过监听 change 事件然后遍历 files 集合可以取得每个选中文件的信息：`**

```javascript
let filesList = document.getElementById("files-list");
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





## 2. FileReader 类型

**`FileReader 类型表示一种异步文件读取机制。可以把 FileReader 想象成类似于 XMLHttpRequest，只不过是用于从文件系统读取文件，而不是从服务器读取数据。FileReader 类型提供了几个读取文件数据的方法。`**

* **`readAsText (file，encoding)：从文件中读取纯文本内容并保存在 result 属性中。第二个参数表示编码，是可选的。`** 
* **`readAsDataURL(file)：读取文件并将内容的数据 URI 保存在 result 属性中。`** 
* **`readAsBinaryString(file)：读取文件并将每个字符的二进制数据保存在 result 属性中。`** 
* **`readAsArrayBuffer(file)：读取文件并将文件内容以 ArrayBuffer 形式保存在 result 属性中。`**  

```javascript
let filesList = document.getElementById("files-list");

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
        output.innerHTML = "Could not read file, error code is " + reader.error.code; 
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
                html = `<img src="${reader.result}">`;
                break;
            case "text":
                html = reader.result;
                break;
        }
        
        output.innerHTML = html;
    }
})
```





## 3. FileReaderSync 类型

```javascript
 function processFiles(files, cb) {
  var syncWorker = new Worker('worker.js');
  syncWorker.onmessage = function(e) {
    cb(e.data.result);
  };
  Array.prototype.forEach.call(files, function(file) {
    syncWorker.postMessage(file);
  });
}

function handleFileSelect() {
  var files = document.getElementById('files').files;
  processFiles(files, function(src) {
    var img = new Image();
    img.src = src;
    document.body.appendChild(img);
  });
}
```





## 4. Blob 与部分读取

**`某些情况下，可能需要读取部分文件而不是整个文件。为此，File 对象提供了一个名为 slice() 的方法。slice() 方法接收两个参数：起始字节和哟啊读取的字节数。这个方法返回一个 Blob 的实例，而 Blob 实际上是 File 的超类。`** 

**`blob 表示二进制大对象，是 JavaScript 对不可修改二进制数据的封装类                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                型。包含字符串的数组、ArrayBuffer、ArrayBufferViews，甚至其他 Blob 都可以用来创建 blob。Blob 构造函数可以接收一个 options 参数，并在其中指定 MIME 类型：`** 

```javascript
console.log(new Blob(["foo"]));
// Blob { size: 3, type: "" }



console.log(new Blob(["{ 'a': 'b' }"], { type: "application/json" }));
// { size: 10, type: "application/json" }



console.log(new Blob(["<p> Foo </p>", "<p>Bar</p>"], { type: "text/html" }));
// { size: 20, type: "text/html" }                                                                         
```



**`Blob 对象有一个 size 属性和一个 type 属性，还有一个 slice() 方法用于进一步切分数据。另外也可以使用 FileReader 从 Blob 中读取数据。下面的例子只会读取文件的前 32 字节：`**

```javascript
let filesList = document.getElementById("files-list");

filesList.addEventListener("change", (event) => {
    let info = "",
        output = document.getElementById("output"),
        progress = document.getElementById("progress"),
        files = event.target.files,
        reader = new FileReader(),
        blob = blobSlice(files[0], 0, 32);
    
    if (blob) {
        reader.readAsText(blob);
        
        reader.onerror = function () {
            output.innerHTML = "Could not read file, error code is " + reader.error.code;
        };
        
        reader.onload = function () {
            output.innerHTML = reader.result;
        };
    } else {
        console.log("Your browser doesn't support slice().");
    }
});
```





## 5. 对象 URL 与 Blob

**`对象 URL 有时候也称作 Blob URL，是指引用存储在 File 或 Blob 中数据的 URL。对象 URL 的优点是不用把文件内容读取到 JavaScript 也可以使用文件。只要在适当位置提供对象 URL 即可。要创建对象 URL，可以使用 window.URL.createObjectURL() 方法并传入 File 或 Blob 对象。这个函数返回的值是一个指向内存中地址的字符串。因为这个字符串是 URL，所以可以在 DOM 中直接使用。例如，以下代码使用对象 URL 在页面中显示了一张图片：`**

```                             javascript
let filesList = document.getElementById("files-list");

filesList.addEventListener("change", (event) => {
    let info = "",
        output = document.getElementById("output"),
        progress = document.getElementById("progress"),
        files = event.target.files,
        reader = new FileReader(),
        url = window.URL.createObjectURL(files[0]);
                     
    if (url) {
        if (/image/.test(files[0].type)) {
            output.innerHTML = `<img src="${url}"`;
        } else {
            output.innerHTML = "Not an image."
        }
    } else {
        output.innerHTML = "Your browser doesn't support object URLs.";
    }
})
```

**`如果把对象 URL 直接放到 <img> 标签，就不需要把数据先读到 JavaScript 中了。<img> 标签可以直接从相应的内存中位置把数据读取到页面上。使用完数据之后，最好能释放与之关联的内存。只要对象 URL 在使用中，就不能释放内存。如果想表明不再使用某个对象 URL，则可以把它传给 window.URL.revokeObjectURL()。页面卸载时，所有对象 URL 占用的内存都会被释放。不过，最好不使用时就立即释放内存，以便尽可能保持页面占用最少资源。`**





## 6. 读取拖放文件

**`组合使用 HTML5 拖放 API 与 File API 可以创建读取文件信息的有趣功能。在页面上创建放置目标后，可以从桌面上把文件拖动并放到放置目标。这样会像拖放图片或链接一样触发 drop 事件。被放置的文件可以通过事件的 event.dataTransfer.files 属性读到，这                                                                                                                      个属性保存着一组 File 对象，就像文本输入字段一样。下面的例子会把拖放到页面放置目标上的文件信息打印出来：`**

```javascript
let droptarget = document.getElementById("droptarget");

function handleEvent(event) {
    let info = "",
        output = document.getElementById("output"),
        files, i, len;
    event.preventDefault();
    
    if (event.type === "drop") {
        files = event.dataTransfer.files;
        i = 0;
        len = files.length;
        
        while (i < len) {
            info += `${files[i].name} (${files[i].type}, ${files[i].size} bytes) <br>`;
            i++;
        }
        
        output.innerHTML = info;
    }
}

droptarget.addEventListener("dragenter", handleEvent);
droptarget.addEventListener("dragover", handleEvent);
droptarget.addEventListener("drop", handleEvent);
```

**`与后面要介绍的拖放的例子一样，必须取消 dragenter、dragover 和 drop 的默认行为。在 drop 事件处理程序中，可以通过 event.dataTransfer.files 读到文件，此时可以获取文件的相关信息。`** 





# 20.5 媒体元素

**`随着嵌入音频和视频元素在 Web 应用上的流行，大多数内容提供商会强迫使用 Flash 以便达到最佳的跨浏览器兼容性。HTML5 新增了两个与媒体相关的元素，即<audio> 和 <video>，从而为浏览器提供了嵌入音频和视频的统一解决方案。这两个元素既可以支持 Web 开发者在页面中嵌入媒体文件，也支持 JavaScript 实现对媒体的自定义控制。以下是它们的用法：`**

```html
<!-- 嵌入视频 -->
<video src="conference.mpg" id="myVideo">Video player not available.</video>

<!-- 嵌入音频 -->
<audio src="song.mp3" id="myAudio">Audio player not available.</audio>
```

**`每个元素至少要求有一个 src 属性，以表示要加载的媒体文件。我们也可以指定表示视频播放器大小的 width 和 height 属性，以及在视频加载期间显示图片 URI 的 poster 属性。另外，controls 属性如果存在，则表示浏览器应该显示播放界面，让用户可以直接控制媒体。开始和结束标签之间的内容是在媒体播放器不可用时显示的替代内容。由于浏览器支持的媒体格式不同，因此可以指定多个不同的媒体源。为此，需要从元素中删除 src 属性，使用一个或多个 <source> 元素代替，如下面的例子所示：`**

```html
<!-- 嵌入视频 -->
<video id="myVideo">
    <source src="conference.webm" type="video/webm; codesc='vp8, vorbis'"></source>
	<source src="conference.ogv" type="video/ogg; codesc='vp8, vorbis'"></source>
	<source src="conference.mpg"></source>
	Video player not available
</video>

<!-- 嵌入音频 -->
<audio id="myAudio">
    <source src="song.ogg" type="audio/ogg"></source>
	<source src="song.mp3" type="audio/mpeg"></source>
	Audio player not available
</audio>
```



​                                                                                                                         





# 20.10 计时 API



**`Performance 接口由多个 API 构成：`** 

* **`High Resolution Time API`**
* **`Performance Timeline API`**
* **`Navigation Timing API`**
* **`User Timing API`**
* **`Resource Timing API`**
* **`Paint Timing API`**





## 1. High Resolution Time API

**`Date.now() 方法只适用于日期时间相关操作，而且是不要求计时精度的操作。在下面的例子中，函数 foo() 调用前后分别记录了一个时间戳：`**

```javascript
const t0 = Date.now();

foo();

const t1 = Date.now();

const duration - t1 - t0;

console.log(duration);
```



**`考虑如下 duration 会包含意外值的情况。`**

* **`duration                                是 0。Date.now() 只有毫秒级精度，如果 foo() 执行足够快，则两个时间戳的值会相等。`** 
* **`duration 是负值或极大值。如果在 foo() 执行时，系统时钟被向后或向前调整了（如切换到夏令时），则捕获的时间戳不会考虑这种情况，因此时间差中会包含这些调整。`** 

**`为此，必须使用不同的计时 API 来精确且准确地度量时间的流逝。High Resolution Time API 定义了 window.performance.now()，这个方法返回一个微秒精度的浮点值。因此，使用这个方法先后捕获的时间戳更不可能出现相等的情况。而且这个方法可以保证时间戳单调增长。`**

```javascript
const t0 = performance.now();
const t1 = performance.now();

console.log(t0);
console.log(t1);

const duration = t1 - t0;

console.log(duration);
```



**`performance.now() 与 Date.now() 的区别`** 

- **`performance.now() 返回的是高精度的时间戳，可以达到微秒级别，而 Date.now() 返回的是毫秒级别的时间戳。`** 
- **`performance.now() 返回的时间戳是相对于 Performance.timeOrigin 的，不受系统时钟调整的影响，而 Date.now() 返回的时间戳是相对于 Unix epoch 的，可能会受到系统时钟调整的影响。`** 
- **`出于安全原因，performance.now() 返回的时间可能被四舍五入，使其不那么可预测。`** 

**`因此，在需要高精度和稳定性的场景下，建议使用 performance.now()。`** 



  
