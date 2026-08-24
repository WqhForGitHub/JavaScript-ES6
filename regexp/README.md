下面为你整理了 **JavaScript 正则表达式相关 8 个方法** 的 **80 个简单清晰易懂的例子**，每个方法各 10 个，编号 1–80。

类别 方法
RegExp 对象自身的方法（2个） test() · exec()
String 对象上接受正则的方法（6个） search() · match() · matchAll() · replace() · replaceAll() · split()

---

## 一、RegExp 对象自身的方法（2 个）

### 1. `test()` —— 检测字符串是否匹配正则，返回 `true` / `false`（例子 1–10）

```javascript
// 1. 检查字符串是否包含数字
console.log(/\d/.test("abc123")); // true

// 2. 检查字符串是否全为数字
console.log(/^\d+$/.test("12345")); // true

// 3. 检查是否包含 "hello"
console.log(/hello/.test("say hello")); // true

// 4. 检查是否以 "A" 开头
console.log(/^A/.test("Apple")); // true

// 5. 检查是否以 ".com" 结尾
console.log(/\.com$/.test("site.com")); // true

// 6. 检查是否包含大写字母
console.log(/[A-Z]/.test("JavaScript")); // true

// 7. 检查是否包含 @ 符号
console.log(/@/.test("a@b.com")); // true

// 8. 检查是否包含空格
console.log(/\s/.test("hello world")); // true

// 9. 检查是否是中国手机号（1开头11位数字）
console.log(/^1\d{10}$/.test("13812345678")); // true

// 10. 检查是否包含特殊字符
console.log(/[!@#$%]/.test("p@ss!")); // true
```

---

### 2. `exec()` —— 在字符串中执行匹配，返回结果数组或 `null`（例子 11–20）

```javascript
// 11. 基本匹配
console.log(/dog/.exec("hotdog")); // ["dog", index: 3, ...]

// 12. 带捕获组的匹配
console.log(/(\d{4})-(\d{2})/.exec("2024-01"));
// ["2024-01", "2024", "01", index: 0, ...]

// 13. 无匹配时返回 null
console.log(/xyz/.exec("abcdef")); // null

// 14. 全局模式下的多次匹配（lastIndex 会变化）
const reg14 = /\d+/g;
console.log(reg14.exec("1 2 3")); // ["1", index: 0]
console.log(reg14.exec("1 2 3")); // ["2", index: 2]

// 15. 匹配日期
console.log(/\d{4}\/\d{2}\/\d{2}/.exec("日期：2024/01/15")[0]); // "2024/01/15"

// 16. 匹配时间（时:分）
console.log(/(\d{2}):(\d{2})/.exec("时间09:30")[0]); // "09:30"

// 17. 匹配双引号内的内容
console.log(/"([^"]*)"/.exec('He said "hi"')[1]); // "hi"

// 18. 匹配 HTML 标签名
console.log(/<(\w+)>/.exec("<div>")[1]); // "div"

// 19. 使用命名捕获组
const result19 = /(?<year>\d{4})-(?<month>\d{2})/.exec("2024-01");
console.log(result19.groups); // {year: "2024", month: "01"}

// 20. 匹配邮箱前缀和域名
console.log(/(\w+)@(\w+\.\w+)/.exec("test@example.com")[1]); // "test"
```

---

## 二、String 对象上接受正则的方法（6 个）

### 3. `search()` —— 返回匹配位置的索引，无匹配返回 `-1`（例子 21–30）

```javascript
// 21. 查找第一个数字的位置
console.log("abc123".search(/\d/)); // 3

// 22. 查找第一个字母的位置
console.log("123abc".search(/[a-z]/)); // 3

// 23. 查找空格的位置
console.log("hello world".search(/\s/)); // 5

// 24. 查找 "world" 的位置
console.log("hello world".search(/world/)); // 6

// 25. 忽略大小写查找
console.log("Hello JS".search(/js/i)); // 6

// 26. 查找特殊字符 $ 的位置
console.log("price: $100".search(/\$/)); // 7

// 27. 查找连续数字的位置
console.log("id: 2024".search(/\d+/)); // 4

// 28. 查找第一个元音字母（rhythm 中没有元音）
console.log("rhythm".search(/[aeiou]/)); // -1

// 29. 查找文件扩展名的位置
console.log("image.png".search(/\.png/)); // 5

// 30. 查找 URL 协议部分
console.log("https://x.com".search(/^https?:\/\//)); // 0
```

---

### 4. `match()` —— 返回匹配结果的数组（例子 31–40）

```javascript
// 31. 匹配所有数字
console.log("a1b2c3".match(/\d/g)); // ["1", "2", "3"]

// 32. 匹配所有小写字母
console.log("a1b2c3".match(/[a-z]/g)); // ["a", "b", "c"]

// 33. 匹配所有单词
console.log("hello, world!".match(/\w+/g)); // ["hello", "world"]

// 34. 匹配所有邮箱
console.log("a@b.com c@d.com".match(/\w+@\w+\.\w+/g));
// ["a@b.com", "c@d.com"]

// 35. 匹配所有 URL
console.log("https://a.com http://b.com".match(/https?:\/\/\w+\.\w+/g));
// ["https://a.com", "http://b.com"]

// 36. 匹配所有 HTML 标签
console.log("<div><p></p></div>".match(/<[^>]+>/g));
// ["<div>", "<p>", "</p>", "</div>"]

// 37. 匹配所有中文字符
console.log("你好hello世界".match(/[\u4e00-\u9fa5]/g)); // ["你", "好", "世", "界"]

// 38. 匹配所有首字母大写的单词
console.log("Hello World foo".match(/\b[A-Z]\w*/g)); // ["Hello", "World"]

// 39. 匹配所有十六进制颜色码
console.log("#fff #123abc".match(/#[0-9a-f]{3,6}/gi)); // ["#fff", "#123abc"]

// 40. 匹配所有空行
console.log("line1\n\nline2".match(/^\s*$/gm)); // ["", ""]
```

---

### 5. `matchAll()` —— 返回所有匹配（含捕获组）的迭代器（例子 41–50）

```javascript
// 41. 匹配所有标签及内容
const str41 = "<div>box</div><p>text</p>";
console.log(
  [...str41.matchAll(/<(\w+)>([^<]*)<\/\1>/g)].map((m) => [m[1], m[2]]),
);
// [["div", "box"], ["p", "text"]]

// 42. 匹配所有链接的 href 和文本
const str42 = "<a href='x.com'>X</a><a href='y.com'>Y</a>";
console.log(
  [...str42.matchAll(/<a href='([^']*)'>([^<]*)<\/a>/g)].map((m) => ({
    href: m[1],
    text: m[2],
  })),
);

// 43. 匹配所有日期及年/月/日
const str43 = "2024-01-15 2025-02-20";
console.log(
  [...str43.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)].map((m) => ({
    year: m[1],
    month: m[2],
    day: m[3],
  })),
);

// 44. 匹配所有价格及货币符号
const str44 = "Price: $100, Cost: €50";
console.log([...str44.matchAll(/([$€¥])(\d+)/g)].map((m) => [m[1], m[2]]));
// [["$", "100"], ["€", "50"]]

// 45. 匹配所有 @ 提及的用户名
const str45 = "Hello @alice and @bob";
console.log([...str45.matchAll(/@(\w+)/g)].map((m) => m[1])); // ["alice", "bob"]

// 46. 匹配所有函数名和参数
const str46 = "function foo() {} function bar(x) {}";
console.log(
  [...str46.matchAll(/function\s+(\w+)\s*\(([^)]*)\)/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

// 47. 匹配所有键值对
const str47 = "name=Tom&age=18";
console.log([...str47.matchAll(/(\w+)=(\w+)/g)].map((m) => [m[1], m[2]]));
// [["name", "Tom"], ["age", "18"]]

// 48. 匹配所有 div 的 id 和内容
const str48 = "<div id='a'>1</div><div id='b'>2</div>";
console.log(
  [...str48.matchAll(/<div id='([^']*)'>([^<]*)<\/div>/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

// 49. 匹配所有双引号内的字符串
const str49 = 'He said "hi" and "bye"';
console.log([...str49.matchAll(/"([^"]*)"/g)].map((m) => m[1])); // ["hi", "bye"]

// 50. 遍历 matchAll 的结果
const str50 = "test1 test2 test3";
for (const m of str50.matchAll(/(\w+)/g)) {
  console.log(m[0]); // 依次输出 test1, test2, test3
}
```

---

### 6. `replace()` —— 替换匹配的部分（例子 51–60）

```javascript
// 51. 替换第一个数字
console.log("a1b2c3".replace(/\d/, "#")); // "a#b2c3"

// 52. 替换所有数字（加 g 标志）
console.log("a1b2c3".replace(/\d/g, "#")); // "a#b#c#"

// 53. 隐藏手机号中间四位
console.log("13812345678".replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")); // "138****5678"

// 54. 交换姓名（姓, 名 → 名 姓）
console.log("Doe, John".replace(/(\w+),\s(\w+)/, "$2 $1")); // "John Doe"

// 55. 驼峰命名转短横线命名
console.log("backgroundColor".replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())); // "background-color"

// 56. 短横线命名转驼峰命名
console.log("background-color".replace(/-([a-z])/g, (_, c) => c.toUpperCase())); // "backgroundColor"

// 57. 首字母大写
console.log("hello".replace(/^\w/, (c) => c.toUpperCase())); // "Hello"

// 58. 替换日期格式（YYYY-MM-DD → MM/DD/YYYY）
console.log("2024-01-15".replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")); // "01/15/2024"

// 59. 去除多余空格
console.log("too   many    spaces".replace(/\s+/g, " ")); // "too many spaces"

// 60. 替换敏感词
console.log("this is bad".replace(/bad/g, "***")); // "this is ***"
```

---

### 7. `replaceAll()` —— 替换所有匹配（例子 61–70）

```javascript
// 61. 替换所有 "js" 为 "JavaScript"
console.log("js is js".replaceAll("js", "JavaScript")); // "JavaScript is JavaScript"

// 62. 替换所有数字为 *
console.log("abc123".replaceAll(/\d/g, "*")); // "abc***"

// 63. 替换所有空格为下划线
console.log("a b c".replaceAll(" ", "_")); // "a_b_c"

// 64. 替换所有逗号为竖线
console.log("a,b,c".replaceAll(",", "|")); // "a|b|c"

// 65. 替换所有 <script> 标签为空
console.log(
  "<script>alert(1)</script>".replaceAll(/<script.*?<\/script>/gi, ""),
); // ""

// 66. 替换所有换行符为 <br>
console.log("line1\nline2".replaceAll("\n", "<br>")); // "line1<br>line2"

// 67. 替换所有 "foo" 为 "bar"
console.log("foo foo foo".replaceAll("foo", "bar")); // "bar bar bar"

// 68. 替换所有 Emoji 为 [emoji]
console.log("I 😊 you 🎉".replaceAll(/[\p{Emoji}]/gu, "[emoji]")); // "I [emoji] you [emoji]"

// 69. 替换重复字母为单个字母
console.log("ppython".replaceAll(/(.)\1+/g, "$1")); // "python"

// 70. 替换所有 @ 为 (at)
console.log("a@b.com".replaceAll("@", "(at)")); // "a(at)b.com"
```

---

### 8. `split()` —— 用正则或字符串分割为数组（例子 71–80）

```javascript
// 71. 用逗号分割
console.log("a,b,c".split(",")); // ["a", "b", "c"]

// 72. 用空格分割
console.log("a b c".split(" ")); // ["a", "b", "c"]

// 73. 用多个空格分割
console.log("a  b   c".split(/\s+/)); // ["a", "b", "c"]

// 74. 用数字分割
console.log("a1b2c3".split(/\d/)); // ["a", "b", "c", ""]

// 75. 用字母分割
console.log("123abc456".split(/[a-z]+/)); // ["123", "456"]

// 76. 限制返回数组的长度
console.log("a,b,c,d".split(",", 2)); // ["a", "b"]

// 77. 分割时保留分隔符（正则带捕获组）
console.log("a,b,c".split(/(,)/)); // ["a", ",", "b", ",", "c"]

// 78. 用多种标点分割
console.log("a;b,c.d".split(/[;,.]/)); // ["a", "b", "c", "d"]

// 79. 用空字符串分割为字符数组
console.log("abc".split("")); // ["a", "b", "c"]

// 80. 用特殊字符分割
console.log("a-b_c=d".split(/[-_=]/)); // ["a", "b", "c", "d"]
```

---

## 目录：按函数分文件详解（每个函数 20 个例子）

| 文件 | 函数 | 一句话说明 |
| --- | --- | --- |
| [常用例子.md](<常用例子.md>) | 综合 | 10 个常用实战正则 |
| [01. test().md](<01. test().md>) | `test()` | 布尔校验、常用表单验证 |
| [02. exec().md](<02. exec().md>) | `exec()` | 提取匹配内容、捕获组、lastIndex |
| [03. match().md](<03. match().md>) | `match()` | 批量提取（g 标志行为差异） |
| [04. matchAll().md](<04. matchAll().md>) | `matchAll()` | 迭代器 + 捕获组完整信息 |
| [05. search().md](<05. search().md>) | `search()` | 查找匹配位置索引 |
| [06. replace().md](<06. replace().md>) | `replace()` | 替换、格式转换、$1/$& 引用 |
| [07. replaceAll().md](<07. replaceAll().md>) | `replaceAll()` | 全量替换、Unicode 属性 |
| [08. split().md](<08. split().md>) | `split()` | 正则分割、捕获组保留分隔符 |
