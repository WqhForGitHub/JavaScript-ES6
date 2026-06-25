/**
 * 手写 static 方法（ES5 模拟）
 *
 * ES6 的 static 方法是直接挂在类（构造函数）上的方法，而不是原型上。
 * 静态方法通过 类名.方法名() 调用，不能通过实例调用。
 * 子类可以继承父类的静态方法。
 * 这里在 ES5 中模拟 static 方法的定义、调用和继承。
 */

// ES6 写法（用于对比）：
// class MathUtil {
//   static square(x) { return x * x; }
//   static cube(x) { return x * x * x; }
// }

// ES5 实现：静态方法直接挂在构造函数上
function MathUtil() {
  throw new TypeError("MathUtil is a utility class, cannot be instantiated");
}

// 静态方法
MathUtil.square = function (x) {
  return x * x;
};

MathUtil.cube = function (x) {
  return x * x * x;
};

MathUtil.sum = function () {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
};

MathUtil.max = function () {
  return Math.max.apply(null, arguments);
};

// 工具函数：批量添加静态方法
function addStaticMethods(Constructor, methods) {
  Object.keys(methods).forEach(function (name) {
    Constructor[name] = methods[name];
  });
}

// 使用工具函数添加静态方法
function StringUtils() {}

addStaticMethods(StringUtils, {
  capitalize: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  reverse: function (str) {
    return str.split("").reverse().join("");
  },
  repeat: function (str, n) {
    var result = "";
    for (var i = 0; i < n; i++) result += str;
    return result;
  },
  isBlank: function (str) {
    return str == null || str.trim().length === 0;
  },
});

// 静态方法的继承：子类继承父类静态方法
function Animal() {}
Animal.staticMethod = function () {
  return "Animal static";
};
Animal.create = function (name) {
  return { name: name, type: "animal" };
};

function Dog() {}
// 继承实例方法（寄生组合继承）
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
// 继承静态方法（手动复制）
Object.keys(Animal).forEach(function (key) {
  Dog[key] = Animal[key];
});
// 子类自己的静态方法
Dog.createDog = function (name, breed) {
  return { name: name, type: "dog", breed: breed };
};

// 测试 1：MathUtil 静态方法
console.log("--- MathUtil static methods ---");
console.log(MathUtil.square(5)); // 25
console.log(MathUtil.cube(3)); // 27
console.log(MathUtil.sum(1, 2, 3)); // 6
console.log(MathUtil.max(3, 7, 2)); // 7

try {
  new MathUtil(); // 抛错
} catch (e) {
  console.log(e.message); // MathUtil is a utility class, cannot be instantiated
}

// 测试 2：StringUtils 静态方法
console.log("--- StringUtils static methods ---");
console.log(StringUtils.capitalize("hello")); // Hello
console.log(StringUtils.reverse("abc")); // cba
console.log(StringUtils.repeat("ab", 3)); // ababab
console.log(StringUtils.isBlank("   ")); // true
console.log(StringUtils.isBlank("text")); // false

// 测试 3：静态方法继承
console.log("--- Static inheritance ---");
console.log(Animal.staticMethod()); // Animal static
console.log(Dog.staticMethod()); // Animal static（继承）
console.log(Dog.create("Rex")); // { name: 'Rex', type: 'animal' }（继承）
console.log(Dog.createDog("Buddy", "Lab")); // { name: 'Buddy', type: 'dog', breed: 'Lab' }

// 验证静态方法不在实例上
console.log("--- Not on instance ---");
var d = new Dog();
console.log(typeof d.staticMethod); // undefined（实例上没有）
console.log(typeof d.createDog); // undefined（实例上没有）
console.log(typeof Dog.staticMethod); // function（类上有）
