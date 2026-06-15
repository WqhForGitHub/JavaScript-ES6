/*
 *
 */
// 实现数组的 push 方法
Array.prototype.myPush = function (...elements) {
  let length = this.length; // 保存当前数组的长度

  // 遍历传入的元素，并添加到数组末尾
  for (let i = 0; i < elements.length; i++) {
    this[length + i] = elements[i];
  }

  // 更新数组的 length 属性
  this.length = length + elements.length;

  // 返回数组的新长度
  return this.length;
};

// 实现数组的 filter 方法
Array.prototype.myFilter = function (callback) {
  // 检查 callback 是否为函数
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  // 创建一个新的数组，用于存储通过测试的元素
  const result = [];

  // 遍历数组的每一个元素
  for (let i = 0; i < this.length; i++) {
    // 检查当前元素是否通过测试
    if (callback(this[i], i, this)) {
      // 如果通过测试，则将元素添加到结果数组中
      result.push(this[i]);
    }
  }

  // 返回结果数组
  return result;
};

// 实现数组的 map 方法
Array.prototype.myMap = function (callback) {
  // 检查传入的callback是否是一个函数
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  // 创建一个空数组用于存储处理后的元素
  const result = [];

  // 使用 for 循环遍历调用该方法的数组
  for (let i = 0; i < this.length; i++) {
    // 对每个元素调用回调函数，并将结果存储到 result 数组中
    result.push(callback(this[i], i, this));
  }

  // 返回 result 数组
  return result;
};

// 实现字符串的 repeat 方法
function repeatString(str, count) {
  // 检查输入的次数是否为有效的正整数
  if (count < 0 || !Number.isInteger(count)) {
    throw new Error("必须输入有效正整数!");
  }

  // 初始化一个空字符串，用于存储结果
  let result = '';

  // 使用循环将原字符串重复拼接到结果字符串中
  for (let i = 0; i < count; i++) {
    result += str;
  }

  return result;
}

// 字符串反转
function reverseString(str) {
  return str.split('').reverse().join('');
}






/*
 *
 */
// 日期格式化
function formatDate(date, format) {
  // 获取日期的各个部分
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // 定义格式化规则
  const formatMap = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
  };

  // 替换格式字符串中的占位符
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formatMap[match]);
}

// Promise.race 方法
Promise.myRace = function (promises) {
  return new Promise((resolve, reject) => {
    for (let promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
};

// call 方法
Function.prototype.myCall = function (thisArg, ...args) {
  // 确保 this 是一个函数
  if (typeof this !== 'function') {
    throw new TypeError(this + ' is not a function');
  }

  // 处理 thisArg，如果为 null 或 undefined，则指向全局对象（在浏览器中是 window）
  thisArg = thisArg || globalThis;

  // 创建一个唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol();

  // 将函数作为 thisArg 的属性
  thisArg[fnSymbol] = this;

  // 调用函数并传入参数列表
  const result = thisArg[fnSymbol](...args);

  // 删除临时属性
  delete thisArg[fnSymbol];

  return result;
};

// apply 方法
Function.prototype.myApply = function (thisArg, argsArray) {
  // 确保 this 是一个函数
  if (typeof this !== 'function') {
    throw new TypeError(this + ' is not a function');
  }

  // 处理 thisArg，如果为 null 或 undefined，则指向全局对象（在浏览器中是 window）
  thisArg = thisArg || globalThis;

  // 创建一个唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol();

  // 将函数作为 thisArg 的属性
  thisArg[fnSymbol] = this;

  // 调用函数并传入参数数组
  const result = thisArg[fnSymbol](...argsArray);

  // 删除临时属性
  delete thisArg[fnSymbol];

  return result;
};

// bind 方法
Function.prototype.myBind = function (context, ...args) {
  // 保存原函数
  const fn = this;

  // 返回一个新的函数
  return function (...newArgs) {
    // 使用 apply 调用原函数，并传入保存的 this 和参数
    return fn.apply(context, args.concat(newArgs));
  };
};

// typeof
function myTypeof(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

// 模拟 new 操作
function myNew(constructor, ...args) {
  // 1. 创建一个空的简单 JavaScript 对象
  const obj = {};

  // 2. 将这个空对象的原型指向构造函数的 prototype 属性
  Object.setPrototypeOf(obj, constructor.prototype);

  // 3. 将这个空对象作为 this 的上下文执行构造函数
  const result = constructor.apply(obj, args);

  // 4. 如果构造函数返回一个对象，则返回该对象；否则，返回这个新创建的对象
  return result !== null && (typeof result === 'object' || typeof result === 'function') ? result : obj;
}

// 模拟 instanceof 
function myInstanceof(left, right) {
  // 获取右侧构造函数的原型
  const prototype = right.prototype;

  // 获取左侧对象的原型
  let proto = Object.getPrototypeOf(left);

  // 遍历左侧对象的原型链
  while (proto !== null) {
    // 如果找到相同的原型，返回 true
    if (proto === prototype) {
      return true;
    }
    // 继续向上查找原型链
    proto = Object.getPrototypeOf(proto);
  }

  // 如果遍历到原型链的末端仍未找到，返回 false
  return false;
}

// Object.create 方法
function createObject(proto) {
  // 1. 检查传入的参数是否为对象
  if (typeof proto !== 'object' || proto === null) {
    throw new TypeError('Object prototype may only be an Object or null');
  }

  // 2. 创建一个临时的构造函数
  function F() { }

  // 3. 将传入的对象赋值给这个构造函数的原型
  F.prototype = proto;

  // 4. 使用这个构造函数创建一个新对象
  return new F();
}

// 数据的 flat 方法
Array.prototype.myFlat = function (depth = 1) {
  // 创建一个空数组用于存储展开后的元素
  const result = [];

  // 定义递归函数
  const flatten = (arr, depth) => {
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i]) && depth > 0) {
        // 如果元素是数组且深度大于 0，递归展开
        flatten(arr[i], depth - 1);
      } else {
        // 否则将元素添加到结果数组中
        result.push(arr[i]);
      }
    }
  };

  // 调用递归函数
  flatten(this, depth);

  // 返回结果数组
  return result;
};


// 实现数组的扁平化
function flattenArray(arr) {
  const result = [];
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      result.push(...flattenArray(item));
    } else {
      result.push(item);
    }
  });
  return result;
}

// 实现 JSONP
function jsonp(url, params, callback, callbackName = 'callback') {
  // 创建 script 标签
  const script = document.createElement('script');
  // 构造请求 URL
  let queryString = '';
  const callbackFuncName = 'jsonpCallback_' + Date.now(); // 唯一的回调函数名
  params[callbackName] = callbackFuncName;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      queryString += `${key}=${params[key]}&`;
    }
  }
  const fullUrl = `${url}?${queryString.slice(0, -1)}`;
  // 为回调函数创建全局函数
  window[callbackFuncName] = function (data) {
    callback(data);
    // 请求完成后，删除 script 标签和全局函数
    document.body.removeChild(script);
    delete window[callbackFuncName];
  };

  // 设置 script 标签的 src 属性
  script.src = fullUrl;

  // 将 script 标签添加到文档中
  document.body.appendChild(script);
}

function handleResponse(data) {
  console.log(data);
}

// 使用 XHR 和 Promise 封装 AJAX 请求
function ajaxRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // 请求完成
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText); // 请求成功，解析响应数据
        } else {
          reject(
            new Error(
              `Request failed with status code ${xhr.status}`
            )
          ); // 请求失败，返回错误信息
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error('Network error')); // 网络错误
    };

    if (method === 'POST' && data) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data)); // 发送 POST 请求数据
    } else {
      xhr.send(); // 发送 GET 请求
    }
  });
}

// XHR 实现 AJAX 请求
function ajaxRequest(url, method = 'GET', data = null, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      // 请求完成
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.responseText); // 请求成功，解析响应数据
      } else {
        callback(
          new Error(`Request failed with status code ${xhr.status}`)
        ); // 请求失败，返回错误信息
      }
    }
  };

  xhr.onerror = function () {
    callback(new Error('Network error')); // 网络错误
  };

  if (method === 'POST' && data) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data)); // 发送 POST 请求数据
  } else {
    xhr.send(); // 发送 GET 请求
  }
}

// setTimeout 模拟 setInterval
function customSetInterval(callback, interval) {
  function intervalFunction() {
    callback();
    setTimeout(intervalFunction, interval);
  }
  setTimeout(intervalFunction, interval);
}

// 防抖
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 设置一个新的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(func, delay) {
  let lastExecutionTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastExecutionTime >= delay) {
      lastExecutionTime = now;
      func.apply(this, args);
    }
  };
}

// 实现发布订阅
let eventEmitter = {
  events: {},

  // 订阅事件
  on: function (event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  },

  // 发布事件
  emit: function (event, ...args) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((listener) => listener(...args));
  },

  // 取消订阅事件
  off: function (event, listener) {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((l) => l !== listener);
  },
};

// ES6 语法对函数所有参数求和
function sum(...args) {
  return args.reduce((acc, curr) => acc + curr, 0);
}

// 对象数组转换为树形结构
function arrayToTree(items) {
  const map = new Map();
  const result = [];

  // 创建一个 map，方便后续查找节点
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach(item => {
    const node = map.get(item.id);
    if (item.parentId === null) {
      // 如果是根节点，直接添加到 result
      result.push(node);
    } else {
      // 如果有父节点，找到父节点并将当前节点加入其 children 数组
      const parentNode = map.get(item.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return result;
}





/*
  *  
*/
// 深拷贝
function deepCopy(obj, hash = new WeakMap()) {
  // 基本数据类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);
    obj.forEach((item, index) => {
      arrCopy[index] = deepCopy(item, hash);
    });
    return arrCopy;
  }

  // 处理对象
  const objCopy = {};
  hash.set(obj, objCopy);
  Object.keys(obj).forEach((key) => {
    objCopy[key] = deepCopy(obj[key], hash);
  });
  return objCopy;
}

// 实现 Promise.all
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    let resolvedCount = 0;
    const results = new Array(promises.length);

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value;
          resolvedCount += 1;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  });
};


// JSON.stringify
function stringifyJSON(value) {
  
  // 对字符串中的反斜杠和双引号进行了转义，确保生成的 JSON 字符串符合规范
  if (typeof value === 'string') {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  // 使用 isFinite 函数检查数字是否为有限值，如果不是有限值，则返回 null
  if (typeof value === 'number') {
    return isFinite(value) ? value.toString() : 'null';
  }

  if (typeof value === 'boolean' || value === null) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    const arrayStr = value.map((item) => stringifyJSON(item)).join(',');
    return `[${arrayStr}]`;
  }

  if (typeof value === 'object') {
    if (value === null) return 'null';

    const keys = Object.keys(value);
    const objectStr = keys
      .map((key) => {
        const val = stringifyJSON(value[key]);
        return `"${key}":${val}`;
      })
      .join(',');

    return `{${objectStr}}`;
  }

  return 'null'; // For functions and undefined
}


// JSON.parse
function parseJSON(json) {
  let index = 0;

  function parseValue() {
    skipWhitespace();
    const char = json[index];

    if (char === '{') return parseObject();
    if (char === '[') return parseArray();
    if (char === '"') return parseString();
    if (char === '-' || (char >= '0' && char <= '9')) return parseNumber();
    if (json.startsWith('true', index)) return parseTrue();
    if (json.startsWith('false', index)) return parseFalse();
    if (json.startsWith('null', index)) return parseNull();

    throw new Error('Unexpected token');
  }

  function skipWhitespace() {
    while (index < json.length && /\s/.test(json[index])) {
      index++;
    }
  }

  function parseObject() {
    const obj = {};
    index++; // Skip '{'
    skipWhitespace();

    if (json[index] === '}') {
      index++;
      return obj;
    }

    while (true) {
      skipWhitespace();
      const key = parseString();
      skipWhitespace();
      if (json[index] !== ':') throw new Error('Expected colon');
      index++;
      const value = parseValue();
      obj[key] = value;
      skipWhitespace();
      if (json[index] === '}') {
        index++;
        break;
      }
      if (json[index] !== ',') throw new Error('Expected comma');
      index++;
    }
    return obj;
  }

  function parseArray() {
    const arr = [];
    index++; // Skip '['
    skipWhitespace();

    if (json[index] === ']') {
      index++;
      return arr;
    }

    while (true) {
      const value = parseValue();
      arr.push(value);
      skipWhitespace();
      if (json[index] === ']') {
        index++;
        break;
      }
      if (json[index] !== ',') throw new Error('Expected comma');
      index++;
    }
    return arr;
  }

  function parseString() {
    index++; // Skip '"'
    let str = '';
    while (index < json.length && json[index] !== '"') {
      if (json[index] === '\\') {
        index++;
        const esc = json[index];
        if (esc === '"' || esc === '\\') {
          str += esc;
        } else if (esc === 'u') {
          const code = json.substring(index + 1, index + 5);
          str += String.fromCharCode(parseInt(code, 16));
          index += 4;
        } else {
          throw new Error('Invalid escape character');
        }
      } else {
        str += json[index];
      }
      index++;
    }
    index++; // Skip '"'
    return str;
  }

  function parseNumber() {
    let start = index;
    while (index < json.length && /[0-9.-]/.test(json[index])) {
      index++;
    }
    const num = json.substring(start, index);
    return parseFloat(num);
  }

  function parseTrue() {
    index += 4; // Skip 'true'
    return true;
  }

  function parseFalse() {
    index += 5; // Skip 'false'
    return false;
  }

  function parseNull() {
    index += 4; // Skip 'null'
    return null;
  }

  return parseValue();
}


