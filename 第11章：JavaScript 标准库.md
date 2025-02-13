# 11.3 正则表达式与模式匹配

## **1. 定义正则表达式**

```javascript
let pattern = /s$/; 
```

```javascript
let pattern = new RegExp("s$");
```

```javascript
let pattern = /s$/i;
```



### **字面量字符**

| 字符         | 匹配目标                                                     |
| ------------ | :----------------------------------------------------------- |
| 字母数字字符 | 自身                                                         |
| \0           | NUL 字符（\u0000）                                           |
| \t           | 制表符（\u0009）                                             |
| \n           | 换行符（\000A）                                              |
| \v           | 垂直制表符（\u000B）                                         |
| \f           | 进纸符（\u000C）                                             |
| \r           | 回车符（\u000D）                                             |
| \xnn         | 十六进制数值 nn 指定的拉丁字符。例如，\x0A 等同于 \n         |
| \uxxxx       | 十六进制数值 xxxx 指定的 Unicode 字符。例如，\u0009 等同于 \t |
| \u{n}        | 码点 n 指定的 Unicode 字符，其中 n 是介于 0 到 10FFFF 之间的 1 到 6 个十六进制数字。注意，这种语法仅在使用 u 标志的正则表达式中支持 |
| \cX          | 控制字符 ^X。例如，\cJ 等价于换行符 \n                       |

有一些英文标点符号在正则表达式中具有特殊含义，它们是：

^ $ . * + ? = ! : | \ / (  )  [   ]  {    }         

​                                                                                                                                                                                                                                        

### **字符类**

| 字符   | 匹配目标                                                     |
| ------ | ------------------------------------------------------------ |
| [...]  | 方括号中的任意一个字符                                       |
| [^...] | 不在方括号中的任意一个字符                                   |
| .      | 除换行符或其他 Unicode 行终止符之外的任意字符。如果 RegExp 使用 s 标志，则句点匹配任意字符，包括行终止符 |
| \w     | 任意 ASCII 单词字符。等价于 [a-zA-Z0-9_]                     |
| \W     | 任意非 ASCII 单词字符。等价于 `[^a-zA-Z0-9_]`                |
| \s     | 任意 Unicode 空白字符                                        |
| \S     | 任意非 Unicode 空白字符                                      |
| \d     | 任意 ASCII 数字字符。等价于 [0-9]                            |
| \D     | 任意非 ASCII 数字字符。等价于 `[^0-9]`                       |
| [\b]   | 退格字符字面值                                               |



### **重复**

| 字符  | 含义                                                    |
| ----- | ------------------------------------------------------- |
| {n,m} | 匹配前项至少 n 次，但不超过 m 次                        |
| {n,}  | 匹配前项 n 或更多次                                     |
| {n}   | 匹配前项恰好 n 次                                       |
| ?     | 匹配前项零或一次。换句话说，前项是可选的。等价于 {0, 1} |
| +     | 匹配前项一或多次。等价于 {1,}                           |
| *     | 匹配前项零或多次。等价于 {0,}                           |

下面的代码展示了几个例子：

```javascript
let r = /\d{2,4}/; // 匹配 2 到 4 位数字

r = /\w{3}\d?/; // 匹配 3 个字母后跟 1 个可选的数字	
r = /\s+java\s+/; // 匹配 “java" 且前后有一个或多个空格
r = /[^(]*/; // 匹配零或多个非开始圆括号字符                
```

 



### **指定匹配位置**

| 字符  | 含义                                                         |
| ----- | ------------------------------------------------------------ |
| ^     | 匹配字符串开头，或者在使用 m 标志时，匹配一行的开头          |
| $     | 匹配字符串末尾，或者在使用 m 标志时，匹配一行的末尾          |
| \b    | 匹配单词边。换句话说，匹配 \w 字符和 \W 字符之间或 \w 与字符串开头或末尾之间的位置（但要注意，[\b] 匹配退格字符） |
| \B    | 匹配非单词边界的位置                                         |
| (?=p) | 肯定式向前查找断言。要求后面的字符匹配模式 p，但匹配结果不包含为之匹配的字符 |
| (?!p) | 否定式向前查找断言。要求后面的字符不匹配模式 p               |



### 标志

| 字符 | 含义                                                         |
| ---- | ------------------------------------------------------------ |
| g    | 全局性的                                                     |
| i    | i 标志表示模式匹配应该不区分大小写                           |
| m    | m 标志表示匹配应该以多行模式进行                             |
| s    | s 标志同样可以用在要哦搜索的文本包含换行符的时候             |
| u    | u 标志代表 Unicode，可以让正则表达式匹配完整的码点而不是匹配 16 位值 |
| y    | 有粘性的                                                     |





## 2. 模式匹配的字符串方法



### search()

**`search() 方法接收一个正则表达式参数，返回第一个匹配项起点字符的位置，如果没有找到匹配项，则返回 -1。 不支持全局搜索`**

```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  javascript
"JavaScript".search(/script/ui); // 4   
"Python".search(/script/ui); // -1
```



### replace()  

```javascript
text.replace(/javascript/gi, "JavaScript");
```



### match() 

**`有 g 全局标志`**

```javascript
const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const regexp = /[A-E]/gi;
const matches = str.match(regexp);

console.log(matches);
// ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e']
```



**`没有 g 全局标志`**

```javascript
const str = "For more information, see Chapter 3.4.5.1";
const re = /see (chapter \d+(\.\d)*)/i;
const found = str.match(re);

console.log(found);
// [
//   'see Chapter 3.4.5.1',
//   'Chapter 3.4.5.1',
//   '.1',
//   index: 22,
//   input: 'For more information, see Chapter 3.4.5.1',
//   groups: undefined
// ]
```





## 3. RegExp 类

```javascript
let zipcode = new RegExp("\\d{5}", "g");
```



### RegExp 属性





### test()

```javascript
const regex = /hello/i;
const string = "Hello World";

regex.test(string); // true
```



### exec()

```       javascript
const regex = /hello/;
const string = "hello world";
const result = regex.exec(string);

if (result) {
    console.log(result[0]); // "hello"
    console.log(result.index) // 0
    console.log(result.input); // "hello world"
} else {
    console.log("No match");
}
```



```javascript
let regex = /(\d{4})-(\d{2})-(\d{2})/;
const string = "2024-03-15";
const result = regex.exec(string);

if (result) {
    console.log(result[0]); // "2024-03-15"
    console.log(result[1]); // "2024"
    console.log(result[2]); // "03"
    console.log(result[3]); // "15"
}
```





# 11.4 日期与时间

```javascript
let now = new Date();

let epoch = new Date(0);

let century = new Date(2100, 0, 1, 2, 3, 4, 5);
```



```javascript
let century = new Date(Date.UTC(2100, 0, 1));
```

```javascript
let century = new Date("2100-01-01T00:00:00Z");
```



```javascript
let d = new Date();

d.setFullYear(d.getFullYear() + 1);
```



## 1. 时间戳

```javascript
d.setTime(d.getTime() + 30000);
```



## 2. 日期计算

```javascript
let d = new Date();

d.setMonth(d.getMonth() + 3, d.getDate() + 14);
```





## 3. 格式化与解析日期字符串

```javascript
let d = new Date(2020, 0, 1, 17, 10, 30);
d.toString();
d.toUTCString();
d.toLocaleDateString(); 
d.toLocaleTimeString();
d.toISOString();
```





# 11.5 Error 类

```javascript
class HTTPError extends Error {
    constructor(status, statusText, url) {
        super(`${status} ${statusText}: ${url}`);
        this.status = status;
        this.statusText = statusText;
        this.url = url;
    }
    
    get name() { return "HTTPError" }
}

let error = new HTTPError(404, "Not Found", "http://example.com/");
error.status; // 404
error.message; // "404 Not Found: http://example.com/"
error.name; // "HTTPError"
```





# 11.6  JSON 序列化与解析





# 11.7 国际化 API





# 11.8 控制台 API

控制台 API 定义了以下函数。

## console.log()

## console.debug()

## console.info()

## console.warn()

## console.error()

## console.assert()

## console.clear()

## console.table()

## console.trace()

## console.count()

## console.countReset()

## console.group()

## console.groupCollapsed()

## console.groupEnd()

## console.time()

## console.timeLog()

## console.timeEnd()





# 11.9 URL API

```javascript
let url = new URL("https://example.com:8000/path/name?q=term#fragment");

url.href; // https://example.com:8000/path/name?q=term#fragment
url.origin; // https://example.com:8000
url.protocol; // https:
url.host; // example.com:8000
url.hostname; // example.com
url.port; // "8000"
url.pathname; // "/path/name"
url.search; // ?q=term
url.hash; // "#fragment"
```



```javascript
let url = new URL("ftp://admin:1337!@ftp.example.com/");

url.href; // "ftp://admin:1337!@ftp.example.com/"
url.origin; // "ftp://ftp.example.com"
url.username; // "admin"
url.password; // "1337!"
```



```javascript
let url = new URL("https://example.com");

url.pathname = "api/search";
url.search = "q=test";
url.toString(); // "https://example.com/api/search?q=test"
```



## 1. 遗留 URL 函数



### encodeURI()



### decodeURI()



### encodeURIComponent()



### decodeURIComponent()





# 11.10 计时器



```javascript
let clock = setInterval(() => {
    console.clear();
    console.log(new Date().toLocaleTimeString());
}, 1000);

setTimeout(() => { clearInterval(clock); }, 10000);
```

