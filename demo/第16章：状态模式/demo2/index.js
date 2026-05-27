// ==============================
// 第16章：JavaScript 版本的状态机
// ==============================

console.log('========== 1. 用对象字面量实现状态机 ==========');

var FSM = {
  off: {
    buttonWasPressed: function(){
      console.log('弱光');
      this.currState = FSM.weak;
    }
  },
  weak: {
    buttonWasPressed: function(){
      console.log('强光');
      this.currState = FSM.strong;
    }
  },
  strong: {
    buttonWasPressed: function(){
      console.log('关灯');
      this.currState = FSM.off;
    }
  }
};

var Light = function(){
  this.currState = FSM.off;
};

Light.prototype.buttonWasPressed = function(){
  this.currState.buttonWasPressed.call(this);
};

var light = new Light();
light.buttonWasPressed();
light.buttonWasPressed();
light.buttonWasPressed();
light.buttonWasPressed();

console.log('');
console.log('========== 2. 用 delegate 函数简化 this 绑定 ==========');

var delegate = function(client, delegation){
  return {
    buttonWasPressed: function(){
      return delegation.buttonWasPressed.apply(client, arguments);
    }
  };
};

var FSM2 = {
  off: {
    buttonWasPressed: function(){
      console.log('弱光');
      this.currState = this.weakState;
    }
  },
  weak: {
    buttonWasPressed: function(){
      console.log('强光');
      this.currState = this.strongState;
    }
  },
  strong: {
    buttonWasPressed: function(){
      console.log('关灯');
      this.currState = this.offState;
    }
  }
};

var Light2 = function(){
  this.offState = delegate(this, FSM2.off);
  this.weakState = delegate(this, FSM2.weak);
  this.strongState = delegate(this, FSM2.strong);
  this.currState = this.offState;
};

Light2.prototype.buttonWasPressed = function(){
  this.currState.buttonWasPressed();
};

var light2 = new Light2();
light2.buttonWasPressed();
light2.buttonWasPressed();
light2.buttonWasPressed();
light2.buttonWasPressed();

console.log('');
console.log('========== 3. 扩展超强光状态（对象字面量版本）==========');

var FSM3 = {
  off: {
    buttonWasPressed: function(){
      console.log('弱光');
      this.currState = FSM3.weak;
    }
  },
  weak: {
    buttonWasPressed: function(){
      console.log('强光');
      this.currState = FSM3.strong;
    }
  },
  strong: {
    buttonWasPressed: function(){
      console.log('超强光');
      this.currState = FSM3.superStrong;
    }
  },
  superStrong: {
    buttonWasPressed: function(){
      console.log('关灯');
      this.currState = FSM3.off;
    }
  }
};

var Light3 = function(){
  this.currState = FSM3.off;
};

Light3.prototype.buttonWasPressed = function(){
  this.currState.buttonWasPressed.call(this);
};

var light3 = new Light3();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
