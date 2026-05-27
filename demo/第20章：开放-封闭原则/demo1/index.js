// ============================================
// 第20章：开放-封闭原则 - demo1
// 开放-封闭原则 - 高阶函数
// ============================================

// ============================================
// 反例：违反开放-封闭原则的面积计算
// ============================================

console.log('=== 反例：每次新增形状都要修改函数 ===');

var calculateAreaBad = function(shape) {
  if (shape.type === 'circle') {
    return Math.PI * shape.radius * shape.radius;
  } else if (shape.type === 'rectangle') {
    return shape.width * shape.height;
  } else if (shape.type === 'triangle') {
    return 0.5 * shape.base * shape.height;
  }
  // 新增形状时必须修改这个函数，违反开放-封闭原则
  throw new Error('不支持的形状类型: ' + shape.type);
};

var circle = { type: 'circle', radius: 5 };
var rectangle = { type: 'rectangle', width: 4, height: 6 };
var triangle = { type: 'triangle', base: 3, height: 8 };

console.log('圆形面积: ' + calculateAreaBad(circle));
console.log('矩形面积: ' + calculateAreaBad(rectangle));
console.log('三角形面积: ' + calculateAreaBad(triangle));
console.log('问题: 新增形状时必须修改 calculateAreaBad，违反开放-封闭原则');
console.log('');

// ============================================
// 修复1：使用对象多态性，添加新形状无需修改计算函数
// ============================================

console.log('=== 修复1：使用对象多态性 ===');

var shapes = {
  circle: {
    area: function(shape) {
      return Math.PI * shape.radius * shape.radius;
    }
  },
  rectangle: {
    area: function(shape) {
      return shape.width * shape.height;
    }
  },
  triangle: {
    area: function(shape) {
      return 0.5 * shape.base * shape.height;
    }
  }
};

var calculateArea = function(shape) {
  var shapeObj = shapes[shape.type];
  if (!shapeObj) {
    throw new Error('不支持的形状类型: ' + shape.type);
  }
  return shapeObj.area(shape);
};

console.log('圆形面积: ' + calculateArea(circle));
console.log('矩形面积: ' + calculateArea(rectangle));
console.log('三角形面积: ' + calculateArea(triangle));
console.log('');

// 新增形状只需添加新的策略对象，不需要修改 calculateArea
shapes.trapezoid = {
  area: function(shape) {
    return 0.5 * (shape.topBase + shape.bottomBase) * shape.height;
  }
};

var trapezoid = { type: 'trapezoid', topBase: 3, bottomBase: 5, height: 4 };
console.log('新增梯形（无需修改 calculateArea）: ' + calculateArea(trapezoid));
console.log('');

// ============================================
// 修复2：使用高阶函数，回调方式实现扩展
// ============================================

console.log('=== 修复2：使用高阶函数 ===');

// 让每个形状自带计算方法
var circle2 = {
  type: 'circle',
  radius: 5,
  area: function() {
    return Math.PI * this.radius * this.radius;
  }
};

var rectangle2 = {
  type: 'rectangle',
  width: 4,
  height: 6,
  area: function() {
    return this.width * this.height;
  }
};

var triangle2 = {
  type: 'triangle',
  base: 3,
  height: 8,
  area: function() {
    return 0.5 * this.base * this.height;
  }
};

// 高阶函数：接受一个计算面积的回调
var calculateAreaWith = function(shape, areaFn) {
  return areaFn(shape);
};

// 或者更简洁：直接委托
var calculateArea2 = function(shape) {
  if (typeof shape.area === 'function') {
    return shape.area();
  }
  throw new Error('形状对象必须提供 area 方法');
};

console.log('圆形面积: ' + calculateArea2(circle2));
console.log('矩形面积: ' + calculateArea2(rectangle2));
console.log('三角形面积: ' + calculateArea2(triangle2));
console.log('');

// 新增形状只需定义自己的 area 方法
var ellipse = {
  type: 'ellipse',
  semiMajor: 5,
  semiMinor: 3,
  area: function() {
    return Math.PI * this.semiMajor * this.semiMinor;
  }
};

console.log('新增椭圆（无需修改 calculateArea2）: ' + calculateArea2(ellipse));
console.log('');

// ============================================
// 对比说明
// ============================================

console.log('=== 对比说明 ===');
console.log('反例 calculateAreaBad:');
console.log('  - 用 if-else 判断形状类型');
console.log('  - 新增形状必须修改函数体');
console.log('  - 对修改开放，对扩展不开放');
console.log('');
console.log('修复1 对象多态性:');
console.log('  - calculateArea 委托给 shapes[type].area()');
console.log('  - 新增形状只需添加 shapes 的新属性');
console.log('  - calculateArea 本身无需修改');
console.log('');
console.log('修复2 高阶函数:');
console.log('  - 每个形状自带 area 方法');
console.log('  - calculateArea2 只需调用 shape.area()');
console.log('  - 新增形状只需定义自己的 area 方法');
console.log('  - 遵循开放-封闭原则：对扩展开放，对修改封闭');
