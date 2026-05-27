// 第12章：享元模式 - demo2：对象池

// ============================================================
// 通用对象池工厂
// ============================================================

var objectPoolFactory = function(createObjFn) {
  var objectPool = [];

  return {
    // 从对象池中获取对象，如果池为空则创建新对象
    create: function() {
      var obj = objectPool.length === 0
        ? createObjFn.apply(this, arguments)
        : objectPool.shift();
      return obj;
    },
    // 将对象归还到对象池中
    recover: function(obj) {
      objectPool.push(obj);
    },
    // 查看对象池中可用对象数量
    size: function() {
      return objectPool.length;
    }
  };
};

// ============================================================
// 示例：DOM 元素对象池
// ============================================================

console.log('--- 对象池示例 ---');

var iframePool = objectPoolFactory(function() {
  var obj = {
    id: Math.random().toString(36).substring(2, 8),
    status: 'active'
  };
  console.log('  创建新对象：' + obj.id);
  return obj;
});

// 第一次创建3个对象
console.log('第一次：创建3个对象');
var obj1 = iframePool.create();
var obj2 = iframePool.create();
var obj3 = iframePool.create();
console.log('  obj1.id=' + obj1.id + ', obj2.id=' + obj2.id + ', obj3.id=' + obj3.id);
console.log('  对象池中可用对象数：' + iframePool.size());
console.log('');

// 回收2个对象
console.log('回收 obj1 和 obj2');
iframePool.recover(obj1);
iframePool.recover(obj2);
console.log('  对象池中可用对象数：' + iframePool.size());
console.log('');

// 再次创建3个对象，其中2个应该从对象池中复用
console.log('第二次：再创建3个对象');
var obj4 = iframePool.create();
var obj5 = iframePool.create();
var obj6 = iframePool.create();
console.log('  obj4.id=' + obj4.id + '（应复用obj1或obj2）');
console.log('  obj5.id=' + obj5.id + '（应复用obj1或obj2）');
console.log('  obj6.id=' + obj6.id + '（应新创建）');
console.log('  对象池中可用对象数：' + iframePool.size());
console.log('');

// ============================================================
// 验证复用
// ============================================================

console.log('--- 验证对象复用 ---');
console.log('obj4 === obj1: ' + (obj4 === obj1));
console.log('obj5 === obj2: ' + (obj5 === obj2));
console.log('obj6 是新创建的对象: ' + (obj6 !== obj1 && obj6 !== obj2 && obj6 !== obj3));
console.log('');

// ============================================================
// 另一个示例：简单的数值对象池
// ============================================================

console.log('--- 数值对象池示例 ---');

var counter = 0;
var numberPool = objectPoolFactory(function(value) {
  counter++;
  console.log('  创建新数值对象 #' + counter);
  return { value: value, serial: counter };
});

console.log('创建2个数值对象');
var n1 = numberPool.create(10);
var n2 = numberPool.create(20);
console.log('  n1: { value=' + n1.value + ', serial=' + n1.serial + ' }');
console.log('  n2: { value=' + n2.value + ', serial=' + n2.serial + ' }');
console.log('  池中可用：' + numberPool.size());
console.log('');

console.log('回收 n1 和 n2');
numberPool.recover(n1);
numberPool.recover(n2);
console.log('  池中可用：' + numberPool.size());
console.log('');

console.log('再创建3个数值对象（2个复用 + 1个新建）');
var n3 = numberPool.create(30);
var n4 = numberPool.create(40);
var n5 = numberPool.create(50);
console.log('  n3: { value=' + n3.value + ', serial=' + n3.serial + ' } (复用)');
console.log('  n4: { value=' + n4.value + ', serial=' + n4.serial + ' } (复用)');
console.log('  n5: { value=' + n5.value + ', serial=' + n5.serial + ' } (新建)');
console.log('  n3 === n1: ' + (n3 === n1));
console.log('  n4 === n2: ' + (n4 === n2));
