

**`JSON 是 JavaScript 的严格子集，利用 JavaScript 中的几种模式来      表示结构化数据。理解 JSON 最关键的一点是要把它当成一种数据格式，而不是编程语言。JSON 不属于 JavaScript，它们只是拥有相同的语法而已。JSON 也不是只能在 JavaScript 中使用，它是一种通用数据格式。很多语言都有解析和序列化 JSON 的内置能力。`**



# 23.1 语法

**`JSON 语法支持表示 3 种类型的值。`** 

* **`简单值：字符串、数值、布尔值和 null 可以在 JSON 中出现，就像在 JavaScript 中一样。特殊值 undefined 不可以。`** 
* **`对象：第一种复杂数据类型，对象表示有序键值对。每个值可以是简单值，也可以是复杂类型。`** 
* **`数组：第二种复杂数据类型，数组表示可以通过数值索引访问的值的有序列表。数组的值可以是任意类型，包括简单值、对象，甚至其他数组。`** 





## 1. 简单值

**`最简单的 JSON 可以是一个数值。例如，下面这个数值是有效的 JSON：`** 

```json
5
```

**`这个 JSON 表示数值 5。类似地，下面这个字符串也是有效的 JSON：`** 

```json
"Hello world!"
```

**`JavaScript 字符串与 JSON 字符串的主要区别是，JSON 字符串必须使用双引号（单引号会导致语法错误）。布尔值和 null 本身也是有效的 JSON 值。不过，实践中更多使用 JSON 表示比较复杂的数据结构，其中会包含简单值。`**  





## 2. 对象

**`对象使用与 JavaScript 对象字面量略为不同的方式表示。以下是 JavaScript 中的对象字面量：`** 

```javascript
let person = {
    name: "Nicholas",
    age: 29
};
```

**`虽然这对 JavaScript 开发者来说是标准的对象字面量，但 JSON 中的对象必须使用双引号把属性名包围起来。下面的代码与前面的代码是一样的：`** 

```javascript
let object = {
    "name": "Nicholas",
    "age": 29
};
```

**`而用 JSON 表示相同的对象的语法是：`** 

```json
{
    "name": "Nicholas",
    "age": 29
}
```

**`与 JavaScript 对象字面量相比，JSON 主要有两处不同。首先，没有变量声明（JSON 中没有变量）。其次，最后没有分号（不需要，因为不是 JavaScript 语句）。同样，用引号将属性名包围起来才是有效的 JSON。属性的值可以是简单值或复杂数据类型值，后者可以在对象中再嵌入对象，比如：`** 

```json
{
    "name": "Nicholas",
    "age": 29,
    "school": {
        "name": "Merrimack College",
        "location": "North Andover, MA"
    }
}
```

**`这个例子在顶级对象中又嵌入了学校相关的信息。即使整个 JSON 对象中有两个属性都叫 "name"，但它们属于两个不同的对象，因此是允许的。同一个对象中不允许出现两个相同的属性。与 JavaScript 不同，JSON 中的对象属性名必须始终带双引号。手动编写 JSON 时漏掉这些双引号或使用单引号是常见的错误。`** 





## 3. 数组

**`JSON 的第二种复杂数据类型是数组。数组在 JSON 中使用 JavaScript 的数组字面量形式表示。例如，以下是一个 JavaScript 数组：`** 

```javascript
let values = [25, "hi", true];
```

**`在 JSON 中可以使用类似语法表示相同的数组：`**

```json
[25, "hi", true]
```

**`同样，这里没有变量，也没有分号。数组和对象可以组合使用，以表示更加复杂的数据结构，比如：`**

```json
[
    {
        "title": "Professional JavaScript",
        "authors": [
            "Nicholas C. Zakas",
            "Matt Frisbie"
        ],
        "edition": 4,
        "year": 2017
    },
    {
        "title": "Professional JavaScript",
        "authors": [
            "Nicholas C. Zakas"
        ],
        "edition": 3,
        "year": 2011
    },
    {
        "title": "Professional JavaScript",
        "authors": [
            "Nicholas C. Zakas"
        ],
        "edition": 2,
        "year": 2009
    },
    {
        "title": "Professional Ajax",
        "authors": [
            "Nicholas C. Zakas",
            "Jeremy McPeak",
            "Joe Fawcett"
        ],
        "edition": 2,
        "year": 2008
    },
    {
        "title": "Professional Ajax",
        "authors": [
            "Nicholas C. Zakas",
            "Jeremy McPeak",
            "Joe Fawcett"
        ],
        "edition": 1,
        "year": 2007
    },
    {
        "title": "Professional JavaScript",
        "authors": [
            "Nicholas C. Zakas"
        ],
        "edition": 1,
        "year": 2006
    }
]
```







# 23.2 解析与序列化



## 1. JSON 对象

**`JSON 对象有两个方法：stringify() 和 parse()。在简单的情况下，这两个方法分别可以将 JavaScript 序列化为 JSON 字符串，以及将 JSON 解析为原生 JavaScript 值。例如：`**

```javascript
// 转换一个简单的对象
const obj = {
  name: "张三",
  age: 30,
  city: "北京",
};


const jsonString = JSON.stringify(obj);
console.log(jsonString); // 输出: {"name":"张三","age":30,"city":"北京"}
```





## 2. 序列化选项



### 1. 过滤结果

**`如果第二个参数是一个数组，那么 JSON.stringify() 返回的结果只会包含该数组中列出的对象属性。比如下面的例子：`**

```javascript
const obj3 = {
  name: "王五",
  age: 35,
  city: "深圳",
  profession: "工程师",
};


const jsonString3 = JSON.stringify(obj3, ["name", "age"]);
console.log(jsonString3); // 输出: {"name":"王五","age":35}                              
```



**`如果第二个参数是一个函数，则行为又有不同。提供的函数接收两个参数：属性名和属性值。为了改变对象的序列化，返回的值就是相应 key 应该包含的结果。注意，返回 undefined 会导致属性被忽略。下面看一个例子：`**

```              javascript
const obj2 = {
  name: "李四",
  age: 25,
  city: "上海",
  salary: 8000,
};


const jsonString2 = JSON.stringify(obj2, (key, value) => {
  if (key === "salary") {
    return undefined; // 移除 salary 属性
  }
  return value;
});


console.log(jsonString2); // 输出: {"name":"李四","age":25,"city":"上海"}
```





### 2. 字符串缩进

**`JSON.stringify() 方法的第三个参数控制缩进和空格。在这个参数是数值时，表示每一级缩进的空格数。例如，每级缩进 4 个空格，可以这样：`**

**`最大缩进值为 10，大于 10 的值会自动设置为 10。`**

```javascript
const obj4 = {
  name: "赵六",
  age: 40,
  city: "广州",
};


const jsonString4 = JSON.stringify(obj4, null, 2); // 使用 2 个空格缩进
console.log(jsonString4);

// 输出:
// {
//   "name": "赵六",
//   "age": 40,
//   "city": "广州"
// }
```



**`如果缩进参数是一个字符串而非数值，那么 JSON 字符串中就会使用这个字符串而不是空格来缩进。使用字符串，也可以将缩进字符设置为 Tab 或任意字符，如两个连字符：`**

**`使用字符串同样有 10 个字符的长度限制。如果字符串长度超过 10，则会在第 10 个字符处截断。`**

```javascript
const obj = {
  name: "张三",
  age: 30,
  address: {
    city: "北京",
    street: "长安街"
  },
  hobbies: ["reading", "coding"]
};


const jsonStringWithString = JSON.stringify(obj, null, "---");
console.log("使用字符串作为 space 参数:");
console.log(jsonStringWithString);

// 输出:
// {
// ---"name": "张三",
// ---"age": 30,
// ---"address": {
// ------"city": "北京",
// ------"street": "长安街"
// ---},
// ---"hobbies": [
// ------"reading",
// ------"coding"
// ---]
// }
```



### 3. toJSON() 方法

**`有时候，对象需要在 JSON.stringify() 之上自定义 JSON 序列化。`**

```javascript
const person = {
  name: "张三",
  age: 30,
  salary: 50000,
  toJSON: function() {
    // 返回一个新对象，排除 salary 属性
    return {                                                                       
      name: this.name,
      age: this.age
    };
  }
};


console.log(JSON.stringify(person));
// 输出: {"name":"张三","age":30}
```



**`toJSON() 方法可以与过滤函数一起使用，因此理解不同序列化流程的顺序非常重要。在把对象传给 JSON.stringify() 时会执行如下步骤。`**

**`(1) 如果可以获取实际的值，则调用 toJSON() 方法获取实际的值，否则使用默认的序列化。`**

**`(2) 如果提供了第二个参数，则应用过滤。传入过滤函数的值就是第 1 步返回的值。`**

**`(3) 第 2 步返回的每个值都会相应地进行序列化`**

**`(4) 如果提供了第三个参数，则相应地进行缩进。`**

**`理解了这个顺序有助于决定是创建 toJSON() 方法，还是使用过滤函数，抑或是两者都用。`** 





## 3. 解析选项

```javascript
const jsonString = '{"name":"李四", "age":"25", "birthdate":"1998-05-10"}';

const obj = JSON.parse(jsonString, (key, value) => {
  if (key === "age") {
    return parseInt(value, 10); // 将年龄转换为数字
  }
  if (key === "birthdate") {
    return new Date(value); // 将生日字符串转换为 Date 对象
  }
  return value;
});


console.log(obj.name);        // 输出: 李四
console.log(obj.age);         // 输出: 25 (number)
console.log(obj.birthdate);   // 输出: Date 对象
console.log(obj.birthdate.getFullYear()); // 输出: 1998
```





​                                                                                                              



