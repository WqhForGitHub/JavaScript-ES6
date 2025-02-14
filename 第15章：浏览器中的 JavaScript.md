# 15.1 Web 编程基础



## **`1. HTML <script> 标签中的 JavaScript`**

```html
<!DOCTYPE html>
<html>
<head>
<title>Digital Clock</title>
<style>
    #clock {
        font: bold 24px sans-serif;
        background: #ddf;
        border: solid black 2px;
        border-radius: 10px;
    }
</style>
</head>
<body>
<h1>Digital Clock</h1>
<span id="clock"></span>
</body>

<script>
function displayTime() {
    let clock = document.querySelector("#clock");
    let now = new Date();
    clock.textContent = new.toLocaleTimeString();
}
    
displayTime();
setInterval(displayTime, 1000);
</script>
</html>
```



### 脚本运行时机：async 或 defer

```                                                     html
<script defer src="deferred.js"></script>
<script async src="async.js"></script>
```



### 按需加载脚本

```javascript
function importScript(url) {
    return new Promise((resolve, reject) => {
        let s = document.createElement("script");
        s.onload = () => { resolve(); };
        s.onerror = (e) => { reject(e) };
        s.src = url;
        document.head.append(s);
    })
}
```

​                                                                     