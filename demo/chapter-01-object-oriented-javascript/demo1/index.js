// ==============================
// 鸭子类型与多态
// ==============================

console.log('=== 鸭子类型 ===');

const duck = {
  duckSinging: function () {
    console.log('嘎嘎嘎');
  },
};

const chicken = {
  duckSinging: function () {
    console.log('嘎嘎嘎');
  },
};

const choir = []; // 合唱团

const joinChoir = function (animal) {
  if (animal && typeof animal.duckSinging === 'function') {
    choir.push(animal);
    console.log('恭喜加入合唱团');
  }
};

joinChoir(duck); // 恭喜加入合唱团
joinChoir(chicken); // 恭喜加入合唱团

console.log('合唱团已有成员数量:', choir.length); // 2

// 鸭子类型：如果它走起路来像鸭子，叫起来像鸭子，那么它就是鸭子
// chicken 也可以加入合唱团，因为它也有 duckSinging 方法

// ==============================
// 多态
// ==============================

console.log('\n=== 多态 ===');

// 多态的思想：将"做什么"和"谁去做"分开
const makeSound = function (animal) {
  animal.sound();
};

const Duck = function () {};
Duck.prototype.sound = function () {
  console.log('嘎嘎嘎');
};

const Chicken = function () {};
Chicken.prototype.sound = function () {
  console.log('咯咯咯');
};

const Dog = function () {};
Dog.prototype.sound = function () {
  console.log('汪汪汪');
};

makeSound(new Duck()); // 嘎嘎嘎
makeSound(new Chicken()); // 咯咯咯
makeSound(new Dog()); // 汪汪汪

// 新增动物类型时，不需要修改 makeSound 函数
// 只需要给新的动物类型添加 sound 方法即可

// ==============================
// 地图渲染多态
// ==============================

console.log('\n=== 地图渲染多态 ===');

const googleMap = {
  show: function () {
    console.log('开始渲染谷歌地图');
  },
};

const baiduMap = {
  show: function () {
    console.log('开始渲染百度地图');
  },
};

const sosoMap = {
  show: function () {
    console.log('开始渲染搜搜地图');
  },
};

const renderMap = function (map) {
  if (map && typeof map.show === 'function') {
    map.show();
  }
};

renderMap(googleMap); // 开始渲染谷歌地图
renderMap(baiduMap); // 开始渲染百度地图
renderMap(sosoMap); // 开始渲染搜搜地图

// renderMap 函数不需要关心具体是哪种地图
// 只要地图对象提供了 show 方法，就可以正确渲染
// 这就是多态的魅力：同一指令，不同表现
