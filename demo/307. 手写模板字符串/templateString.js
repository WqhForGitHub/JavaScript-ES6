/**
 * 手写模板字符串
 *
 * 模板字符串 `Hello ${name}, you are ${age}` 使用 ${} 进行变量插值。
 * 这里通过三种方式模拟：
 * 1. tagged template 函数（接收 strings 和 values）
 * 2. 基于上下文对象的正则替换
 * 3. 支持简单表达式求值的插值
 */

// 方式一：tagged template 函数（与原生用法一致）
function template(strings) {
  var values = Array.prototype.slice.call(arguments, 1);
  var result = "";
  for (var i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

// 方式二：基于上下文对象的正则替换（支持嵌套属性）
function interpolate(tpl, context) {
  return tpl.replace(/\$\{([^}]+)\}/g, function (match, expr) {
    expr = expr.trim();
    var keys = expr.split(".");
    var val = context;
    for (var i = 0; i < keys.length; i++) {
      val = val[keys[i]];
      if (val === undefined) return "";
    }
    return val;
  });
}

// 方式三：支持简单表达式求值的插值（使用 Function 构造器）
function interpolateEval(tpl, context) {
  var keys = Object.keys(context);
  var values = keys.map(function (k) {
    return context[k];
  });
  return tpl.replace(/\$\{([^}]+)\}/g, function (match, expr) {
    try {
      var fn = new Function.apply(null, keys.concat("return " + expr + ";"));
      return String(fn.apply(null, values));
    } catch (e) {
      return "";
    }
  });
}

// 方式四：支持多行字符串的模板
function multiLine(tpl, context) {
  return interpolate(tpl, context);
}

// 测试
var name = "Alice";
var age = 25;

// tagged template
var msg1 = template`Hello ${name}, you are ${age} years old`;
console.log(msg1); // Hello Alice, you are 25 years old

// 上下文对象插值
var msg2 = interpolate("Hello ${name}, you are ${age} years old", {
  name: "Bob",
  age: 30,
});
console.log(msg2); // Hello Bob, you are 30 years old

// 支持嵌套属性
var msg3 = interpolate("City: ${user.address.city}", {
  user: { address: { city: "Beijing" } },
});
console.log(msg3); // City: Beijing

// 支持表达式
var msg4 = interpolateEval("Sum: ${a + b}, Double: ${a * 2}", { a: 3, b: 4 });
console.log(msg4); // Sum: 7, Double: 6

// 多行字符串
var msg5 = multiLine("Name: ${name}\nAge: ${age}\nStatus: ${status}", {
  name: "Carol",
  age: 28,
  status: "active",
});
console.log(msg5);
// Name: Carol
// Age: 28
// Status: active
