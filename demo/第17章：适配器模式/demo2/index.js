// ==============================
// 第17章：适配器模式 - 数据格式转换
// ==============================

console.log('========== 适配器模式：数据格式转换 ==========');

// 旧的数据格式：数组，每个元素是 {name, id} 对象
var oldData = [
  { name: 'shenzhen', id: 11 },
  { name: 'guangzhou', id: 12 },
  { name: 'beijing', id: 13 },
  { name: 'shanghai', id: 14 }
];

console.log('旧数据格式：');
console.log(JSON.stringify(oldData, null, 2));

// 新的数据格式：对象，键是 name，值是 id
// 期望格式：{ shenzhen: 11, guangzhou: 12, beijing: 13, shanghai: 14 }

var render = function(data){
  console.log('');
  console.log('渲染数据：');
  for (var key in data) {
    console.log('  ' + key + ': ' + data[key]);
  }
};

// 适配器函数：将旧格式转换为新格式
var addressAdapter = function(oldData){
  var newData = {};
  for (var i = 0, len = oldData.length; i < len; i++) {
    var item = oldData[i];
    newData[item.name] = item.id;
  }
  return newData;
};

var adaptedData = addressAdapter(oldData);

console.log('');
console.log('转换后的新数据格式：');
console.log(JSON.stringify(adaptedData, null, 2));

console.log('');
render(adaptedData);

console.log('');
console.log('--- 直接用新格式数据也可以渲染 ---');

var newData = {
  chengdu: 15,
  wuhan: 16
};

render(newData);
