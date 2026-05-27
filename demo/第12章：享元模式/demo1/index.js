// 第12章：享元模式 - demo1：内衣模特

// ============================================================
// 一、不好的方式：每个模特都创建一个对象
// ============================================================

var Model = function(sex, underwear) {
  this.sex = sex;
  this.underwear = underwear;
};

Model.prototype.takePhoto = function() {
  console.log('sex=' + this.sex + ' underwear=' + this.underwear);
};

console.log('--- 不好的方式：创建100个对象 ---');

var models = [];
for (var i = 1; i <= 50; i++) {
  var maleModel = new Model('male', 'underwear' + i);
  maleModel.takePhoto();
  models.push(maleModel);
}
for (var j = 1; j <= 50; j++) {
  var femaleModel = new Model('female', 'underwear' + j);
  femaleModel.takePhoto();
  models.push(femaleModel);
}

console.log('不好的方式共创建对象数：' + models.length);
console.log('');

// ============================================================
// 二、好的方式：享元模式，只有2个共享对象
// ============================================================

// 内部状态：sex（男 / 女）
// 外部状态：underwear（不同的内衣）

var FlyweightModel = function(sex) {
  this.sex = sex;
};

FlyweightModel.prototype.takePhoto = function(underwear) {
  console.log('sex=' + this.sex + ' underwear=' + underwear);
};

console.log('--- 享元模式：只创建2个共享对象 ---');

// 享元工厂，只创建2个对象
var modelFactory = (function() {
  var cached = {};
  return {
    create: function(sex) {
      if (cached[sex]) {
        return cached[sex];
      }
      cached[sex] = new FlyweightModel(sex);
      return cached[sex];
    }
  };
})();

// 外部状态管理器
var modelManager = (function() {
  var modelDatabase = {};
  return {
    add: function(id, sex, underwear) {
      var flyweight = modelFactory.create(sex);
      modelDatabase[id] = {
        flyweight: flyweight,
        underwear: underwear
      };
    },
    takePhoto: function(id) {
      var record = modelDatabase[id];
      record.flyweight.takePhoto(record.underwear);
    }
  };
})();

// 添加50个男模特和50个女模特的记录
for (var m = 1; m <= 50; m++) {
  modelManager.add('male_' + m, 'male', 'underwear' + m);
}
for (var f = 1; f <= 50; f++) {
  modelManager.add('female_' + f, 'female', 'underwear' + f);
}

// 拍照
for (var k = 1; k <= 50; k++) {
  modelManager.takePhoto('male_' + k);
}
for (var l = 1; l <= 50; l++) {
  modelManager.takePhoto('female_' + l);
}

console.log('享元模式共创建对象数：2（1个男 + 1个女）');
console.log('');

// ============================================================
// 三、内部状态 vs 外部状态
// ============================================================

console.log('--- 内部状态 vs 外部状态 ---');
console.log('内部状态（共享）：sex，可以共享，存储在享元对象内部');
console.log('外部状态（不共享）：underwear，随场景变化，由管理器在外部管理');
console.log('');

// 验证共享
var maleA = modelFactory.create('male');
var maleB = modelFactory.create('male');
console.log('两次 create("male") 返回同一对象：' + (maleA === maleB));

var femaleA = modelFactory.create('female');
var femaleB = modelFactory.create('female');
console.log('两次 create("female") 返回同一对象：' + (femaleA === femaleB));
