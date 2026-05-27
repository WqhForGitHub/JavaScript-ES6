// 第09章：命令模式 - 宏命令

// ==================== 基础命令 ====================

var closeDoorCommand = {
  execute: function() {
    console.log('关门');
  }
};

var openPcCommand = {
  execute: function() {
    console.log('开电脑');
  }
};

var openQQCommand = {
  execute: function() {
    console.log('登录QQ');
  }
};

// ==================== 宏命令 ====================

var MacroCommand = function() {
  this.commandsList = [];
};

MacroCommand.prototype.add = function(command) {
  this.commandsList.push(command);
};

MacroCommand.prototype.execute = function() {
  for (var i = 0; i < this.commandsList.length; i++) {
    this.commandsList[i].execute();
  }
};

// ==================== 简单宏命令演示 ====================

console.log('=== 宏命令演示 ===');

console.log('\n--- 简单宏命令：晚上回家 ---');
var macroCommand = new MacroCommand();
macroCommand.add(closeDoorCommand);
macroCommand.add(openPcCommand);
macroCommand.add(openQQCommand);
macroCommand.execute();

// ==================== 嵌套宏命令演示 ====================

console.log('\n--- 嵌套宏命令：超级命令 ---');

var openAcCommand = {
  execute: function() {
    console.log('打开空调');
  }
};

var openTvCommand = {
  execute: function() {
    console.log('打开电视');
  }
};

var openSoundCommand = {
  execute: function() {
    console.log('打开音响');
  }
};

// 创建"打开家电"宏命令
var openElectronicsMacro = new MacroCommand();
openElectronicsMacro.add(openAcCommand);
openElectronicsMacro.add(openTvCommand);
openElectronicsMacro.add(openSoundCommand);

// 创建"晚上回家"宏命令，包含基础命令和嵌套宏命令
var nightHomeMacro = new MacroCommand();
nightHomeMacro.add(closeDoorCommand);
nightHomeMacro.add(openPcCommand);
nightHomeMacro.add(openQQCommand);
nightHomeMacro.add(openElectronicsMacro); // 嵌套宏命令

nightHomeMacro.execute();

// ==================== 更深层的嵌套 ====================

console.log('\n--- 更深层嵌套：全部自动化 ---');

var openLightCommand = {
  execute: function() {
    console.log('打开灯光');
  }
};

var openWindowCommand = {
  execute: function() {
    console.log('打开窗户');
  }
};

// 创建"开灯开窗"宏命令
var openEnvironmentMacro = new MacroCommand();
openEnvironmentMacro.add(openLightCommand);
openEnvironmentMacro.add(openWindowCommand);

// 创建"超级自动化"宏命令，包含两个子宏命令
var superAutomationMacro = new MacroCommand();
superAutomationMacro.add(openEnvironmentMacro);
superAutomationMacro.add(nightHomeMacro);

superAutomationMacro.execute();
