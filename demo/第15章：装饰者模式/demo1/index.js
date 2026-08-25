// ==============================
// 第15章：装饰者模式 - 飞机大战
// ==============================

console.log('========== 1. 传统面向对象的装饰者 ==========');

const Plane = function () {};
Plane.prototype.fire = function () {
  console.log('发射普通子弹');
};

const MissileDecorator = function (plane) {
  this.plane = plane;
};
MissileDecorator.prototype.fire = function () {
  this.plane.fire();
  console.log('发射导弹');
};

const AtomDecorator = function (plane) {
  this.plane = plane;
};
AtomDecorator.prototype.fire = function () {
  this.plane.fire();
  console.log('发射原子弹');
};

let plane = new Plane();
plane = new MissileDecorator(plane);
plane = new AtomDecorator(plane);
plane.fire();

console.log('');
console.log('========== 2. JavaScript 风格的装饰者 ==========');

const plane1 = {
  fire: function () {
    console.log('发射普通子弹');
  },
};

const missileDecorator1 = function () {
  console.log('发射导弹');
};

const atomDecorator1 = function () {
  console.log('发射原子弹');
};

const fire1 = plane1.fire;
plane1.fire = function () {
  fire1();
  missileDecorator1();
};

const fire2 = plane1.fire;
plane1.fire = function () {
  fire2();
  atomDecorator1();
};

plane1.fire();

console.log('');
console.log('========== 3. AOP 装饰函数 ==========');

Function.prototype.before = function (beforefn) {
  const __self = this;
  return function () {
    if (beforefn.apply(this, arguments) === false) {
      return;
    }
    return __self.apply(this, arguments);
  };
};

Function.prototype.after = function (afterfn) {
  const __self = this;
  return function () {
    const ret = __self.apply(this, arguments);
    if (ret === false) {
      return false;
    }
    afterfn.apply(this, arguments);
    return ret;
  };
};

const plane2 = {
  fire: function () {
    console.log('发射普通子弹');
  },
};

plane2.fire = plane2.fire.after(function () {
  console.log('发射导弹');
});

plane2.fire = plane2.fire.after(function () {
  console.log('发射原子弹');
});

plane2.fire();

console.log('');
console.log('========== 4. 用 before 也能达到同样的效果 ==========');

const plane3 = {
  fire: function () {
    console.log('发射普通子弹');
  },
};

plane3.fire = plane3.fire.before(function () {
  console.log('发射导弹');
});

plane3.fire = plane3.fire.before(function () {
  console.log('发射原子弹');
});

plane3.fire();
