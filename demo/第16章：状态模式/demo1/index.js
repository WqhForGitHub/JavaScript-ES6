// ==============================
// 第16章：状态模式 - 电灯程序
// ==============================

console.log('========== 1. 糟糕的版本：用 if-else 管理状态 ==========');

var Light = function(){
  this.state = 'off';
  this.button = null;
};

Light.prototype.buttonWasPressed = function(){
  if (this.state === 'off') {
    console.log('开灯');
    this.state = 'on';
  } else if (this.state === 'on') {
    console.log('关灯');
    this.state = 'off';
  }
};

var light1 = new Light();
light1.buttonWasPressed();
light1.buttonWasPressed();

console.log('');
console.log('--- 如果要扩展超强光状态，需要修改 buttonWasPressed ---');

var LightBad = function(){
  this.state = 'off';
};

LightBad.prototype.buttonWasPressed = function(){
  if (this.state === 'off') {
    console.log('弱光');
    this.state = 'weak';
  } else if (this.state === 'weak') {
    console.log('强光');
    this.state = 'strong';
  } else if (this.state === 'strong') {
    console.log('关灯');
    this.state = 'off';
  }
  // 每次新增状态都要修改这个方法，违反开放-封闭原则
};

var lightBad = new LightBad();
lightBad.buttonWasPressed();
lightBad.buttonWasPressed();
lightBad.buttonWasPressed();

console.log('');
console.log('========== 2. 状态模式版本 ==========');

var OffLightState = function(light){
  this.light = light;
};
OffLightState.prototype.buttonWasPressed = function(){
  console.log('弱光');
  this.light.setState(this.light.weakLightState);
};

var WeakLightState = function(light){
  this.light = light;
};
WeakLightState.prototype.buttonWasPressed = function(){
  console.log('强光');
  this.light.setState(this.light.strongLightState);
};

var StrongLightState = function(light){
  this.light = light;
};
StrongLightState.prototype.buttonWasPressed = function(){
  console.log('关灯');
  this.light.setState(this.light.offLightState);
};

var Light2 = function(){
  this.offLightState = new OffLightState(this);
  this.weakLightState = new WeakLightState(this);
  this.strongLightState = new StrongLightState(this);
  this.currState = this.offLightState;
};

Light2.prototype.setState = function(newState){
  this.currState = newState;
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
console.log('========== 3. 扩展新状态：超强光 ==========');

var SuperStrongLightState = function(light){
  this.light = light;
};
SuperStrongLightState.prototype.buttonWasPressed = function(){
  console.log('超强光');
  this.light.setState(this.light.superStrongLightState);
};

// 修改 StrongLightState 的下一个状态为超强光
StrongLightState.prototype.buttonWasPressed = function(){
  console.log('超强光');
  this.light.setState(this.light.superStrongLightState);
};

var SuperStrongLightState2 = function(light){
  this.light = light;
};
SuperStrongLightState2.prototype.buttonWasPressed = function(){
  console.log('关灯');
  this.light.setState(this.light.offLightState);
};

var Light3 = function(){
  this.offLightState = new OffLightState(this);
  this.weakLightState = new WeakLightState(this);
  this.strongLightState = new StrongLightState(this);
  this.superStrongLightState = new SuperStrongLightState2(this);
  this.currState = this.offLightState;
};

Light3.prototype.setState = function(newState){
  this.currState = newState;
};

Light3.prototype.buttonWasPressed = function(){
  this.currState.buttonWasPressed();
};

var light3 = new Light3();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
light3.buttonWasPressed();
