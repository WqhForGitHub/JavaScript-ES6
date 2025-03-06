













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



